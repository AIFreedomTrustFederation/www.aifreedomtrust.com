"""Black-box regression checks: Pages repair must be read-only by default."""
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
  case " $* " in *" -X "*) exit 0 ;; esac
  case " $* " in *" --jq "*) printf 'public\n'; exit 0 ;; esac
  case " $* " in *"/branches/"*) exit 0 ;; esac
  case " $* " in *" --include "*)
    if [ "$PROBE_STATUS" != 0 ]; then
      if [ "$PROBE_STATUS" != none ]; then printf 'HTTP/2.0 %s Error\n\n' "$PROBE_STATUS"; fi
      exit 1
    fi
    if [ "$MISSING_PAGES" = 1 ]; then
      case " $* " in *"booksmith-ai/pages"*) printf 'HTTP/2.0 404 Not Found\n\n'; exit 1 ;; esac
    fi
    printf 'HTTP/2.0 200 OK\n\n'
    branch=gh-pages
    case " $* " in
      *"aifreedomtrustfederation.github.io/pages"*|*"AI-Freedom-Trust/pages"*) branch=main ;;
    esac
    printf '{"html_url":"https://example.invalid","status":"built","source":{"branch":"%s","path":"/"},"cname":"preserve.example"}\n' "$branch"
    exit 0 ;;
  esac
  case " $* " in *"/pages "*)
    if [ "$MISSING_PAGES" = 1 ]; then
      case " $* " in *"booksmith-ai/pages"*) exit 1 ;; esac
    fi
    branch=gh-pages
    case " $* " in
      *"aifreedomtrustfederation.github.io/pages"*|*"AI-Freedom-Trust/pages"*) branch=main ;;
    esac
    printf '{"html_url":"https://example.invalid","status":"built","source":{"branch":"%s","path":"/"},"cname":"preserve.example"}\n' "$branch"
    exit 0 ;;
  esac
fi
exit 3
'''

class PagesRepairSafetyTests(unittest.TestCase):
    def invoke(self, *args, missing_pages=False, probe_status='0'):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            bindir = root / 'bin'
            bindir.mkdir()
            gh = bindir / 'gh'
            gh.write_text(GH_STUB)
            gh.chmod(0o755)
            curl = bindir / 'curl'
            curl.write_text('#!/bin/sh\nprintf 200\n')
            curl.chmod(0o755)
            sleep = bindir / 'sleep'
            sleep.write_text('#!/bin/sh\nexit 0\n')
            sleep.chmod(0o755)
            calls = root / 'calls.jsonl'
            env = dict(os.environ, HOME=str(root), GH_CALLS=str(calls),
                       PATH=str(bindir) + os.pathsep + os.environ['PATH'],
                       MISSING_PAGES='1' if missing_pages else '0', PROBE_STATUS=probe_status)
            result = subprocess.run(['bash', str(SCRIPT), *args], env=env,
                                    capture_output=True, text=True, timeout=15)
            lines = calls.read_text().splitlines() if calls.exists() else []
            return result, [line.split() for line in lines], (root / 'aift-pages-repair-report.txt').read_text() if (root / 'aift-pages-repair-report.txt').exists() else ''

    @staticmethod
    def mutations(calls):
        return [args for args in calls if args[:1] == ['api'] and '-X' in args]

    def test_default_audit_never_mutates_pages_or_domains(self):
        result, calls, report = self.invoke(missing_pages=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.mutations(calls), [])
        self.assertIn('READ-ONLY AUDIT', report)
        self.assertIn('would enable Pages', report)
        self.assertIn('custom domain preserved', report)
        self.assertNotIn(['auth', 'login', '--hostname', 'github.com', '--web'], calls)

    def test_apply_can_update_sources_but_preserves_custom_domains(self):
        result, calls, report = self.invoke('--apply', missing_pages=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        mutations = self.mutations(calls)
        self.assertTrue(any('PUT' in args for args in mutations))
        self.assertTrue(any('POST' in args for args in mutations))
        self.assertFalse(any('DELETE' in args for args in mutations))
        self.assertIn('custom domain preserved', report)

    def test_custom_domain_removal_requires_both_explicit_flags(self):
        denied, calls, _ = self.invoke('--remove-custom-domains')
        self.assertEqual(denied.returncode, 2)
        self.assertEqual(calls, [])
        allowed, calls, _ = self.invoke('--apply', '--remove-custom-domains')
        self.assertEqual(allowed.returncode, 0, allowed.stderr)
        self.assertTrue(any('DELETE' in args for args in self.mutations(calls)))

    def test_invalid_option_fails_before_auth_or_mutation(self):
        result, calls, _ = self.invoke('--unexpected')
        self.assertEqual(result.returncode, 2)
        self.assertEqual(calls, [])

    def test_pages_probe_denied_or_unavailable_fails_closed(self):
        for status in ('401', '403', '429', '500', 'none'):
            with self.subTest(status=status):
                result, calls, report = self.invoke('--apply', '--remove-custom-domains', probe_status=status)
                self.assertNotEqual(result.returncode, 0)
                self.assertEqual(self.mutations(calls), [])
                self.assertIn('refusing changes', report)

    def test_read_only_audit_does_not_report_permission_error_as_missing_pages(self):
        result, calls, report = self.invoke(probe_status='403')
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(self.mutations(calls), [])
        self.assertNotIn('would enable Pages', report)
        self.assertIn('HTTP 403', report)

if __name__ == '__main__':
    unittest.main()
