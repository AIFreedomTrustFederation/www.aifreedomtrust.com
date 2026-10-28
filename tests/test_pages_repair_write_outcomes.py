"""Black-box tests for Pages mutation evidence; all GitHub calls are stubs."""
import json
import os
import shutil
from pathlib import Path
import stat
import subprocess
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "aift-pages-repair.sh"
GH = r'''#!/bin/sh
printf '%s\n' "$*" >> "$GH_CALLS"
if [ "$1" = auth ] && [ "$2" = status ]; then exit 0; fi
if [ "$1" = repo ] && [ "$2" = view ]; then exit 0; fi
if [ "$1" = api ]; then
  case " $* " in
    *"/branches/"*) exit 0 ;;
    *" --include "*) printf 'HTTP/2.0 200 OK\n\n'; exit 0 ;;
    *" -X PUT "*)
      case "$GH_MODE:$*" in
        fail_second:*"www.aifreedomtrust.com/pages"*) exit 22 ;;
      esac
      exit 0 ;;
    *" -X POST "*) exit 0 ;;
    *" -X DELETE "*) exit 22 ;;
    *"/pages "*)
      case "$*" in
        *"www.aifreedomtrust.com/pages"*) branch=gh-pages ;;
        *) branch=main ;;
      esac
      printf '{"source":{"branch":"%s","path":"/"},"cname":null,"status":"built"}\n' "$branch"
      exit 0 ;;
  esac
fi
exit 3
'''

class PagesWriteOutcomeTests(unittest.TestCase):
    def invoke(self, mode, *flags, dd_fail_at=None):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            bindir = root / "bin"
            bindir.mkdir()
            for name, body in (
                ("gh", GH),
                ("curl", "#!/bin/sh\nprintf 200\n"),
                ("sleep", "#!/bin/sh\nexit 0\n"),
            ):
                p = bindir / name
                p.write_text(body)
                p.chmod(0o755)
            if dd_fail_at is not None:
                real_dd = shutil.which("dd")
                self.assertIsNotNone(real_dd)
                dd = bindir / "dd"
                dd.write_text("""#!/bin/sh
count=0
[ ! -f "$HOME/dd-count" ] || count=$(cat "$HOME/dd-count")
count=$((count + 1))
printf '%s\\n' "$count" > "$HOME/dd-count"
case " $* " in
  *" oflag=append "*"conv=notrunc,fsync"*) ;;
  *) exit 73 ;;
esac
if [ "$count" -eq "$DD_FAIL_AT" ]; then exit 74; fi
exec "$REAL_DD" "$@"
""")
                dd.chmod(0o755)
            calls_file = root / "calls.txt"
            env = dict(os.environ, HOME=str(root), GH_CALLS=str(calls_file),
                       GH_MODE=mode, DD_FAIL_AT=str(dd_fail_at or 0),
                       REAL_DD=shutil.which("dd") or "",
                       PATH=str(bindir) + os.pathsep + os.environ["PATH"])
            result = subprocess.run(["bash", str(SCRIPT), *flags],
                                    env=env, capture_output=True, text=True, timeout=20)
            journals = list(root.glob("aift-pages-writes.*.jsonl"))
            records = [json.loads(line) for p in journals for line in p.read_text().splitlines()]
            modes = [stat.S_IMODE(p.stat().st_mode) for p in journals]
            calls = calls_file.read_text().splitlines() if calls_file.exists() else []
            report = (root / "aift-pages-repair-report.txt").read_text()
            return result, journals, records, modes, calls, report

    def test_partial_failure_retains_unmatched_attempt(self):
        result, journals, records, modes, calls, report = self.invoke("fail_second", "--apply")
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(len(journals), 1)
        self.assertEqual(modes, [0o600])
        self.assertEqual(
            [(r["repository"], r["operation"], r["phase"]) for r in records],
            [
                ("aifreedomtrustfederation.github.io", "update_pages_source", "attempted"),
                ("aifreedomtrustfederation.github.io", "update_pages_source", "verified"),
                ("www.aifreedomtrust.com", "update_pages_source", "attempted"),
            ],
        )
        self.assertTrue(all(r["schema_version"] == 1 and r["observed_at"] for r in records))
        self.assertEqual(records[2]["intended_source"], {"branch": "gh-pages", "path": "/"})
        self.assertFalse(any("AIFT-Forge/pages" in c for c in calls))
        self.assertIn("Write-outcome journal:", report)

    def test_failed_domain_delete_is_not_marked_verified(self):
        result, _, records, _, calls, _ = self.invoke(
            "delete_fail", "--apply", "--remove-custom-domains"
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(
            [(r["operation"], r["phase"]) for r in records],
            [
                ("update_pages_source", "attempted"),
                ("update_pages_source", "verified"),
                ("remove_custom_domain", "attempted"),
            ],
        )
        self.assertTrue(any(" -X DELETE " in f" {c} " for c in calls))
        self.assertFalse(any("www.aifreedomtrust.com/pages" in c for c in calls))

    def test_snapshot_fsync_failure_blocks_first_write(self):
        result, _, records, _, calls, report = self.invoke(
            "normal", "--apply", dd_fail_at=1
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(records, [])
        self.assertFalse(any(" -X " in f" {c} " for c in calls))
        self.assertIn("Cannot persist Pages pre-change state", report)

    def test_attempt_fsync_failure_blocks_first_write(self):
        result, _, records, _, calls, report = self.invoke(
            "normal", "--apply", dd_fail_at=2
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(records, [])
        self.assertFalse(any(" -X " in f" {c} " for c in calls))
        self.assertIn("Cannot append write outcome", report)

    def test_verification_fsync_failure_retains_unmatched_attempt(self):
        result, _, records, _, calls, report = self.invoke(
            "normal", "--apply", dd_fail_at=3
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(
            [(r["operation"], r["phase"]) for r in records],
            [("update_pages_source", "attempted")],
        )
        self.assertTrue(any(" -X PUT " in f" {c} " for c in calls))
        self.assertFalse(any("www.aifreedomtrust.com/pages" in c for c in calls))
        self.assertIn("Cannot append write outcome", report)

    def test_read_only_has_no_journal_or_writes(self):
        result, journals, records, _, calls, report = self.invoke("read_only")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(journals, [])
        self.assertEqual(records, [])
        self.assertFalse(any(" -X " in f" {c} " for c in calls))
        self.assertIn("READ-ONLY AUDIT", report)

if __name__ == "__main__":
    unittest.main()
