"""Black-box regression: a failed final Pages GET must stop an approved run.

The GitHub CLI is stubbed; no live Pages settings or DNS are modified.
"""
import os
from pathlib import Path
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
    *" -X PUT "*|*" -X POST "*) exit 0 ;;
    *"/branches/"*) exit 0 ;;
    *" --include "*) printf 'HTTP/2.0 200 OK\n\n'; exit 0 ;;
    *"aifreedomtrustfederation.github.io/pages "*)
      count=$(cat "$GH_GET_COUNT" 2>/dev/null || echo 0)
      count=$((count + 1))
      printf '%s\n' "$count" > "$GH_GET_COUNT"
      if [ "$count" -eq 3 ]; then
        printf 'synthetic final GET failure\n' >&2
        exit 22
      fi
      printf '{"source":{"branch":"main","path":"/"},"cname":null}\n'
      exit 0 ;;
    *"/pages "*)
      printf '{"source":{"branch":"gh-pages","path":"/"},"cname":null}\n'
      exit 0 ;;
    *" --jq "*) printf 'public\n'; exit 0 ;;
  esac
fi
exit 3
'''


class PagesFinalStatusTests(unittest.TestCase):
    def test_failed_final_get_stops_before_next_repository(self):
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
            calls_file = root / "calls.txt"
            env = dict(os.environ, HOME=str(root), GH_CALLS=str(calls_file),
                       GH_GET_COUNT=str(root / "get-count"),
                       PATH=str(bindir) + os.pathsep + os.environ["PATH"])
            result = subprocess.run(
                ["bash", str(SCRIPT), "--apply"],
                env=env, capture_output=True, text=True, timeout=20,
            )
            calls = calls_file.read_text().splitlines() if calls_file.exists() else []
            report = (root / "aift-pages-repair-report.txt").read_text()
            writes = [call for call in calls if " -X " in f" {call} "]
            self.assertNotEqual(result.returncode, 0, result.stderr)
            self.assertEqual(len(writes), 1, writes)
            self.assertIn("-X PUT", writes[0])
            self.assertFalse(any("www.aifreedomtrust.com/pages" in call for call in calls), calls)
            self.assertIn("Final Pages status lookup failed", report)
            self.assertNotIn("enabled: no", report)


if __name__ == "__main__":
    unittest.main()
