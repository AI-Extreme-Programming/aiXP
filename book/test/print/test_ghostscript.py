"""Ghostscript colour behaviour the print pipeline relies on, checked with the checker.

A naive RGB-to-CMYK conversion turns RGB black text into four-colour black. The
pipeline avoids that by giving Ghostscript only Gray/CMYK text (LaTeX black is gray;
diagram greys are rewritten to gray first). These tests pin both behaviours.
"""

import subprocess
import tempfile
import unittest
from pathlib import Path

import pikepdf
from pikepdf import Array, Dictionary, Name

from support import require_tool
from print_pdf.pdfx import check_pdf
from print_pdf.tools import find_gs
from test_layout import two_page_pdf


def to_cmyk(gs, source, out):
    subprocess.run([gs, '-q', '-dBATCH', '-dNOPAUSE', '-dSAFER', '-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.3',
                    '-sColorConversionStrategy=CMYK', '-sProcessColorModel=DeviceCMYK',
                    '-dAutoRotatePages=/None', f'-sOutputFile={out}', str(source)],
                   check=True, capture_output=True)
    return out


def recolour(path, operator):
    with pikepdf.open(path, allow_overwriting_input=True) as pdf:
        for page in pdf.pages:
            page.obj.Contents = pdf.make_stream(operator + b' BT /F1 12 Tf 72 300 Td (A) Tj ET')
        pdf.save(path)
    return path


class GhostscriptColour(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        require_tool('gs', 'gswin64c')
        cls.gs = find_gs()
        cls.tmp = tempfile.TemporaryDirectory()
        cls.dir = Path(cls.tmp.name)

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def text_k_failures(self, operator, name):
        source = recolour(two_page_pdf(self.dir / f'{name}-in.pdf'), operator)
        out = to_cmyk(self.gs, source, self.dir / f'{name}-out.pdf')
        result = check_pdf(out)
        return result.failures['text-k-only'], result.failures['colour-spaces']

    def test_rgb_black_text_becomes_rich_black(self):
        text_k, spaces = self.text_k_failures(b'0 0 0 rg', 'rgb')
        self.assertEqual(spaces, [])
        self.assertTrue(text_k, 'expected Ghostscript to convert RGB black to four-colour black')

    def test_gray_black_text_stays_k_only(self):
        text_k, spaces = self.text_k_failures(b'0 g', 'gray')
        self.assertEqual((text_k, spaces), ([], []))

    def test_cmyk_k_text_stays_k_only(self):
        text_k, spaces = self.text_k_failures(b'0 0 0 1 k', 'cmyk')
        self.assertEqual((text_k, spaces), ([], []))


if __name__ == '__main__':
    unittest.main()
