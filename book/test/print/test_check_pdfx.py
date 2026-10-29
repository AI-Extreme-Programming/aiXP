"""Red/green tests for the PDF/X-1a checker (book/scripts/check-pdfx.py)."""

import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
SCRIPTS = HERE.parents[1] / 'scripts'
sys.path.insert(0, str(SCRIPTS))
sys.path.insert(0, str(HERE))

import pdfx_fixtures  # noqa: E402
from print_pdf.pdfx import RULES, check_pdf  # noqa: E402


class CheckerFixtures(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.paths = pdfx_fixtures.write_all(cls.tmp.name)

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def test_every_rule_has_a_violating_fixture(self):
        covered = {rule for rule, _ in pdfx_fixtures.VIOLATIONS.values()}
        self.assertEqual(covered, set(RULES))

    def test_conforming_fixtures_pass_every_rule(self):
        for name in pdfx_fixtures.CONFORMING_VARIANTS:
            with self.subTest(fixture=name):
                result = check_pdf(self.paths[name])
                self.assertEqual(result.failed_rules, [], result.failures)

    def test_each_violation_fails_only_its_rule(self):
        for name, (rule, _) in pdfx_fixtures.VIOLATIONS.items():
            with self.subTest(fixture=name):
                result = check_pdf(self.paths[name])
                self.assertEqual(result.failed_rules, [rule], result.failures)
                self.assertTrue(result.failures[rule][0])

    def test_cli_exit_status_and_rule_named(self):
        script = str(SCRIPTS / 'check-pdfx.py')
        ok = subprocess.run([sys.executable, script, str(self.paths['conforming/base'])],
                            capture_output=True, text=True)
        self.assertEqual(ok.returncode, 0, ok.stdout + ok.stderr)
        bad = subprocess.run([sys.executable, script, str(self.paths['text-k-only/rich-black-text'])],
                             capture_output=True, text=True)
        self.assertEqual(bad.returncode, 1)
        self.assertIn('FAIL text-k-only', bad.stdout)
        self.assertIn('rich black', bad.stdout)

    def test_cli_unreadable_file_is_an_error(self):
        broken = Path(self.tmp.name) / 'broken.pdf'
        broken.write_bytes(b'not a pdf')
        run = subprocess.run([sys.executable, str(SCRIPTS / 'check-pdfx.py'), str(broken)],
                             capture_output=True, text=True)
        self.assertEqual(run.returncode, 2)


if __name__ == '__main__':
    unittest.main()
