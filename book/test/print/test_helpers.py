"""Tests for the ICC lookup, PDF/X definition rendering and TrimBox fix-up."""

import hashlib
import json
import tempfile
import unittest
from pathlib import Path

import pikepdf
from pikepdf import Array, Dictionary, Name

from support import BOOK
from print_pdf import boxes, icc, pdfxdef


class PdfxDef(unittest.TestCase):
    VALUES = {key: f'value {key}' for key in pdfxdef.TEXT_KEYS}

    def test_template_placeholders_all_filled(self):
        template = (BOOK / 'templates' / 'latex' / 'pdfx-def.ps.in').read_text(encoding='utf-8')
        text = pdfxdef.render(template, self.VALUES, '/x/default_cmyk.icc')
        self.assertNotRegex(text, r'@[A-Z_]+@')
        self.assertIn('/GTS_PDFXVersion (PDF/X-1:2001)', text)
        self.assertIn('/GTS_PDFXConformance (PDF/X-1a:2001)', text)
        self.assertIn('/Trapped /False', text)
        self.assertIn(pdfxdef.ps_bytes('/x/default_cmyk.icc'), text)

    def test_text_is_hex_encoded_so_parentheses_cannot_escape(self):
        self.assertEqual(pdfxdef.ps_text('a)'), '<FEFF00610029>')
        self.assertEqual(pdfxdef.ps_text('é'), '<FEFF00E9>')

    def test_missing_value_and_unknown_placeholder_fail(self):
        with self.assertRaises(ValueError):
            pdfxdef.render('@TITLE@', {}, 'x')
        with self.assertRaises(ValueError):
            pdfxdef.render('@NOPE@', self.VALUES, 'x')


class Icc(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self.tmp.name)
        self.profile = self.dir / 'default_cmyk.icc'
        self.profile.write_bytes(b'profile bytes')
        self.digest = hashlib.sha256(b'profile bytes').hexdigest()

    def tearDown(self):
        self.tmp.cleanup()

    def manifest(self, digest):
        return {'file': 'default_cmyk.icc', 'sha256': [digest], 'search': [str(self.profile)],
                'output_condition': 'x'}

    def test_repository_manifest_is_complete(self):
        manifest = icc.load_manifest(BOOK / 'assets' / 'icc' / 'output-intent.json')
        self.assertEqual(manifest['status'], 'interim')
        self.assertTrue(manifest['sha256'])
        self.assertTrue(all(len(h) == 64 for h in manifest['sha256']))

    def test_pinned_profile_found(self):
        profile = icc.resolve_profile(self.manifest(self.digest))
        self.assertEqual((profile.path, profile.pinned), (self.profile, True))

    def test_unpinned_profile_is_refused(self):
        with self.assertRaisesRegex(icc.ProfileError, 'not the pinned version'):
            icc.resolve_profile(self.manifest('0' * 64))

    def test_missing_profile_is_refused(self):
        self.profile.unlink()
        with self.assertRaisesRegex(icc.ProfileError, 'not found'):
            icc.resolve_profile(self.manifest(self.digest))

    def test_override_is_used_and_marked_unpinned(self):
        other = self.dir / 'other.icc'
        other.write_bytes(b'other')
        profile = icc.resolve_profile(self.manifest(self.digest), override=str(other))
        self.assertEqual((profile.path, profile.pinned), (other, False))

    def test_manifest_requires_keys(self):
        path = self.dir / 'm.json'
        path.write_text(json.dumps({'file': 'x'}))
        with self.assertRaises(icc.ProfileError):
            icc.load_manifest(path)


def page_pdf(**page_boxes):
    pdf = pikepdf.new()
    pdf.pages.append(pikepdf.Page(Dictionary(Type=Name.Page, MediaBox=Array([0, 0, 432, 648]),
                                             **{k: Array(v) for k, v in page_boxes.items()})))
    return pdf


class TrimBox(unittest.TestCase):
    def test_artbox_becomes_trimbox(self):
        pdf = page_pdf(ArtBox=[0, 0, 432, 648])
        self.assertEqual(boxes.art_to_trim(pdf), 1)
        page = pdf.pages[0].obj
        self.assertEqual([float(v) for v in page.TrimBox], [0, 0, 432, 648])
        self.assertNotIn('/ArtBox', page)

    def test_existing_trimbox_kept_and_artbox_dropped(self):
        pdf = page_pdf(TrimBox=[0, 0, 432, 648], ArtBox=[1, 1, 2, 2])
        self.assertEqual(boxes.art_to_trim(pdf), 0)
        self.assertNotIn('/ArtBox', pdf.pages[0].obj)

    def test_page_without_either_box_is_an_error(self):
        with self.assertRaises(boxes.BoxError):
            boxes.art_to_trim(page_pdf())

    def test_file_keeps_pdf_13_header(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / 'a.pdf'
            page_pdf(ArtBox=[0, 0, 432, 648]).save(path, force_version='1.3')
            self.assertEqual(boxes.art_to_trim_file(path), 1)
            self.assertTrue(path.read_bytes().startswith(b'%PDF-1.3'))


if __name__ == '__main__':
    unittest.main()
