"""Black-box checks for private pre-write Pages recovery snapshots.

No real GitHub API calls or publishing mutations are performed.
"""
import json
import os
from pathlib import Path
import stat
import subprocess
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "aift-pages-repair.sh"

GH_STUB = r'''#!/bin/sh
printf '%s\n' "$*" >> "$GH_CALLS"
if [ "$1" = auth ] && [ "$2" = status ]; then exit 0; fi
if [ "$1" = repo ] && [ "$2" = view ]; then exit 0; fi
if [ "$1" = api ]; then
  case " $* " in
    *" -X "*) exit 22 ;;
    *"/branches/"*) exit 0 ;;
    *" --include "*)
      if [ "$GH_MODE" = absent ]; then
        printf 'HTTP/2.0 404 Not Found\n\n'
        exit 1
      fi
      printf 'HTTP/2.0 200 OK\n\n'
      exit 0 ;;
    *"aifreedomtrustfederation.github.io/pages "*)
      if [ "$GH_MODE" = malformed ]; then printf '{invalid json}\n'; else
        printf '{"source":{"branch":"original-branch","path":"/docs"},"cname":"original.example"}\n'
      fi
      exit 0 ;;
  esac
fi
exit 3
'''

class PagesRecoverySnapshotTests(unittest.TestCase):
    def invoke(self, mode):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            bindir = root / "bin"
            bindir.mkdir()
            for name, source in (
                ("gh", GH_STUB),
                ("curl", "#!/bin/sh\nprintf 200\n"),
                ("sleep", "#!/bin/sh\nexit 0\n"),
            ):
                path = bindir / name
                path.write_text(source)
                path.chmod(0o755)
            calls = root / "calls.txt"
            env = dict(os.environ, HOME=str(root), GH_CALLS=str(calls),
                       GH_MODE=mode, PATH=str(bindir) + os.pathsep + os.environ["PATH"])
            result = subprocess.run(
                ["bash", str(SCRIPT), "--apply"],
                env=env, capture_output=True, text=True, timeout=15,
            )
            files = list(root.glob("aift-pages-before.*.jsonl"))
            records = [json.loads(line) for path in files for line in path.read_text().splitlines()]
            commands = calls.read_text().splitlines() if calls.exists() else []
            report = (root / "aift-pages-repair-report.txt").read_text()
            permissions = [stat.S_IMODE(path.stat().st_mode) for path in files]
            return result, files, records, commands, report, permissions

    def test_existing_pages_snapshot_precedes_failed_put(self):
        result, files, records, calls, report, permissions = self.invoke("existing")
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(len(files), 1)
        self.assertEqual(permissions, [0o600])
        self.assertEqual(len(records), 1)
        record = records[0]
        self.assertEqual(record["schema_version"], 1)
        self.assertEqual(record["repository"], "aifreedomtrustfederation.github.io")
        self.assertTrue(record["existed"])
        self.assertEqual(record["previous"]["source"], {"branch": "original-branch", "path": "/docs"})
        self.assertEqual(record["previous"]["cname"], "original.example")
        self.assertTrue(record["previous"]["cname_observed"])
        self.assertEqual(record["intended_source"], {"branch": "main", "path": "/"})
        self.assertIn("-X PUT", "\n".join(calls))
        self.assertIn("Pre-change recovery snapshots:", report)

    def test_absent_pages_snapshot_precedes_failed_post(self):
        result, files, records, calls, _, _ = self.invoke("absent")
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(len(files), 1)
        self.assertEqual(len(records), 1)
        self.assertFalse(records[0]["existed"])
        self.assertIsNone(records[0]["previous"])
        self.assertIn("-X POST", "\n".join(calls))

    def test_invalid_prechange_response_blocks_all_writes(self):
        result, files, records, calls, report, _ = self.invoke("malformed")
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(len(files), 1)
        self.assertEqual(records, [])
        self.assertFalse(any(" -X " in f" {call} " for call in calls))
        self.assertIn("Invalid Pages pre-change state", report)

if __name__ == "__main__":
    unittest.main()
