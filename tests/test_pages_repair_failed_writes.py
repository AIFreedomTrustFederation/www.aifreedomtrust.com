"""Black-box regressions: failed Pages writes must halt before domain mutation."""
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts' / 'aift-pages-repair.sh'
GH_STUB = r'''#!/bin/sh
printf '%s\n' "$*" >> "$GH_CALLS"
if [ "$1" = auth ] && [ "$2" = status ]; then exit 0; fi
if [ "$1" = repo ] && [ "$2" = view ]; then exit 0; fi
if [ "$1" = api ]; then
  case " $* " in
    *" -X "*)
      if [ "$3" = "$FAIL_METHOD" ]; then
        printf '%s failed (synthetic)\n' "$3" >&2
        exit 22
      fi
      if [ "$3" = DELETE ]; then touch "$GH_DOMAIN_DELETED"; fi
      exit 0 ;;
  esac
  case " $* " in *" --jq "*) printf 'public\n'; exit 0 ;; esac
  case " $* " in *"/branches/"*) exit 0 ;; esac
  case " $* " in *" --include "*)
    case " $* " in
      *"booksmith-ai/pages"*) printf 'HTTP/2.0 404 Not Found\n\n'; exit 1 ;;
    esac
    printf 'HTTP/2.0 200 OK\n\n'
    branch=gh-pages
    case " $* " in
      *"aifreedomtrustfederation.github.io/pages"*|*"AI-Freedom-Trust/pages"*) branch=main ;;
    esac
    printf '{"html_url":"https://example.invalid","status":"built","source":{"branch":"%s","path":"/"},"cname":"example.invalid"}\n' "$branch"
    exit 0 ;;
  esac
  case " $* " in *"/pages "*)
    branch=gh-pages
    case " $* " in
      *"aifreedomtrustfederation.github.io/pages"*|*"AI-Freedom-Trust/pages"*) branch=main ;;
    esac
    cname='"example.invalid"'
    [ -f "$GH_DOMAIN_DELETED" ] && cname='null'
    printf '{"html_url":"https://example.invalid","status":"built","source":{"branch":"%s","path":"/"},"cname":%s}\n' "$branch" "$cname"
    exit 0 ;;
  esac
fi
exit 3
'''

class PagesWriteFailureTests(unittest.TestCase):
    def invoke(self, method):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            bin_dir = root / 'bin'
            bin_dir.mkdir()
            gh = bin_dir / 'gh'
            gh.write_text(GH_STUB)
            gh.chmod(0o755)
            for name, source in [('curl', '#!/bin/sh\nprintf 200\n'),
                                 ('sleep', '#!/bin/sh\nexit 0\n')]:
                path = bin_dir / name
                path.write_text(source)
                path.chmod(0o755)
            calls_file = root / 'calls.txt'
            env = dict(os.environ, HOME=str(root), GH_CALLS=str(calls_file),
                       GH_DOMAIN_DELETED=str(root / 'domain-deleted'),
                       FAIL_METHOD=method, PATH=str(bin_dir) + os.pathsep + os.environ['PATH'])
            result = subprocess.run(['bash', str(SCRIPT), '--apply', '--remove-custom-domains'],
                                    env=env, capture_output=True, text=True, timeout=20)
            calls = calls_file.read_text().splitlines() if calls_file.exists() else []
            report_file = root / 'aift-pages-repair-report.txt'
            report = report_file.read_text() if report_file.exists() else ''
            return result, calls, report

    def test_failed_put_aborts_before_custom_domain_deletion(self):
        result, calls, report = self.invoke('PUT')
        self.assertNotEqual(result.returncode, 0, 'A failed PUT must fail the run')
        writes = [call for call in calls if ' -X ' in f' {call} ']
        self.assertEqual(len(writes), 1, writes)
        self.assertIn('-X PUT', writes[0])
        self.assertNotIn('-X DELETE', '\n'.join(calls))
        self.assertIn('PUT Pages source failed', report)

    def test_failed_post_aborts_before_subsequent_domain_deletion(self):
        result, calls, report = self.invoke('POST')
        self.assertNotEqual(result.returncode, 0, 'A failed POST must fail the run')
        writes = [call for call in calls if ' -X ' in f' {call} ']
        self.assertIn('-X POST', writes[-1])
        self.assertIn('booksmith-ai/pages', writes[-1])
        self.assertFalse(any('booksmith-ai/pages/cname' in call for call in writes), writes)
        self.assertFalse(any('AI-Freedom-Trust/pages' in call for call in writes), writes)
        self.assertIn('POST Pages enable failed', report)


    def test_failed_delete_aborts_before_next_repository(self):
        result, calls, report = self.invoke('DELETE')
        self.assertNotEqual(result.returncode, 0, 'A failed DELETE must fail the run')
        writes = [call for call in calls if ' -X ' in f' {call} ']
        self.assertEqual(len(writes), 2, writes)
        self.assertIn('-X PUT', writes[0])
        self.assertIn('-X DELETE', writes[1])
        self.assertIn('aifreedomtrustfederation.github.io/pages/cname', writes[1])
        self.assertFalse(any('www.aifreedomtrust.com/pages' in call for call in calls), calls)
        self.assertIn('DELETE custom domain failed', report)

if __name__ == '__main__':
    unittest.main()
