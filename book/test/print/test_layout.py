"""Tests for the layout preflight (book/scripts/check-print-layout.py)."""

import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

import pikepdf
from pikepdf import Array, Dictionary, Name

from support import SCRIPTS, require_tool
from print_pdf import layout

PDFFONTS = """name                                 type              encoding         emb sub uni object ID
------------------------------------ ----------------- ---------------- --- --- --- ---------
DPBGAP+TeXGyreHeros-Regular-Identity-H CID Type 0C       Identity-H       yes yes yes      6  0
Helvetica                            Type 1            Standard         no  no  no       9  0
"""

PDFINFO = """Pages:           2
Page    1 MediaBox:      0.00     0.00   432.00   648.00
Page    1 TrimBox:       0.00     0.00   432.00   648.00
Page    2 MediaBox:      0.00     0.00   432.00   648.00
Page    2 TrimBox:       9.00     9.00   423.00   639.00
"""

BBOX = """%%BoundingBox: 54 51 334 471
%%HiResBoundingBox: 54.449998 51.821998 333.755990 470.465986
%%BoundingBox: 0 0 0 0
%%HiResBoundingBox: 0.000000 0.000000 0.000000 0.000000
%%BoundingBox: 20 38 387 620
%%HiResBoundingBox: 20.0 38.069999 386.963988 620.0
"""


class Parsers(unittest.TestCase):
    def test_pdffonts_reads_emb_even_when_long_names_shift_columns(self):
        self.assertEqual(layout.parse_pdffonts(PDFFONTS),
                         [('DPBGAP+TeXGyreHeros-Regular-Identity-H', 'yes'), ('Helvetica', 'no')])
        self.assertEqual(layout.check_pdffonts(PDFFONTS), ['font Helvetica is not embedded'])

    def test_pdffonts_with_no_fonts_fails(self):
        self.assertEqual(layout.check_pdffonts(PDFFONTS.split('\n', 2)[0] + '\n' + PDFFONTS.split('\n')[1]),
                         ['pdffonts lists no fonts'])

    def test_pdfinfo_boxes(self):
        problems = layout.check_pdfinfo_boxes(PDFINFO)
        self.assertEqual(len(problems), 1)
        self.assertIn('page 2: TrimBox', problems[0])

    def test_pdfinfo_missing_page_box(self):
        problems = layout.check_pdfinfo_boxes(PDFINFO.replace('Pages:           2', 'Pages:           3'))
        self.assertIn('page 3: pdfinfo reports no MediaBox', problems)

    def test_even_pages(self):
        self.assertEqual(layout.check_even(70), [])
        self.assertEqual(len(layout.check_even(71)), 1)

    def test_safe_zone_skips_blank_pages_and_names_the_offending_sides(self):
        problems = layout.check_safe_zone(layout.parse_bbox(BBOX), expected_pages=3)
        self.assertEqual(len(problems), 1)
        self.assertIn('page 3', problems[0])
        self.assertIn('left 20.00 pt', problems[0])
        self.assertIn('top 28.00 pt', problems[0])

    def test_safe_zone_page_count_mismatch(self):
        self.assertTrue(layout.check_safe_zone(layout.parse_bbox(BBOX), expected_pages=4))


def two_page_pdf(path, rect=b'72 72 100 100 re f', pages=2, embedded=True):
    pdf = pikepdf.new()
    glyph = pdf.make_stream(b'1000 0 0 0 1000 1000 d1 0 0 1000 1000 re f')
    font = pdf.make_indirect(Dictionary(
        Type=Name.Font, Subtype=Name.Type3, FontBBox=Array([0, 0, 1000, 1000]),
        FontMatrix=Array([0.001, 0, 0, 0.001, 0, 0]), CharProcs=Dictionary(a=glyph),
        Encoding=Dictionary(Type=Name.Encoding, Differences=Array([65, Name.a])),
        FirstChar=65, LastChar=65, Widths=Array([1000])) if embedded else Dictionary(
        Type=Name.Font, Subtype=Name.Type1, BaseFont=Name.Helvetica))
    for _ in range(pages):
        content = b'0 g BT /F1 12 Tf 72 300 Td (A) Tj ET ' + rect
        pdf.pages.append(pikepdf.Page(Dictionary(
            Type=Name.Page, MediaBox=Array([0, 0, 432, 648]), TrimBox=Array([0, 0, 432, 648]),
            Resources=Dictionary(Font=Dictionary(F1=font)), Contents=pdf.make_stream(content))))
    pdf.save(path)
    return path


class Cli(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        require_tool('pdfinfo')
        require_tool('pdffonts')
        require_tool('gs', 'gswin64c')
        cls.tmp = tempfile.TemporaryDirectory()

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def run_cli(self, name, **kwargs):
        path = two_page_pdf(Path(self.tmp.name) / f'{name}.pdf', **kwargs)
        return subprocess.run([sys.executable, str(SCRIPTS / 'check-print-layout.py'), str(path)],
                              capture_output=True, text=True)

    def test_green(self):
        run = self.run_cli('green')
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)

    def test_red_odd_pages(self):
        run = self.run_cli('odd', pages=1)
        self.assertEqual(run.returncode, 1)
        self.assertIn('FAIL even-pages', run.stdout)

    def test_red_mark_in_margin(self):
        run = self.run_cli('margin', rect=b'5 5 20 20 re f')
        self.assertEqual(run.returncode, 1)
        self.assertIn('FAIL safe-zone', run.stdout)

    def test_red_unembedded_font(self):
        run = self.run_cli('font', embedded=False)
        self.assertEqual(run.returncode, 1)
        self.assertIn('FAIL pdffonts-embedded', run.stdout)


if __name__ == '__main__':
    unittest.main()
