"""Generates small PDF fixtures for the PDF/X checker tests.

conforming() is a minimal one-page PDF/X-1a-shaped file. Each entry in VIOLATIONS
breaks exactly one checker rule, so a test can require that it fails that rule and
only that rule. Run directly to write every fixture to a directory for inspection:

    python book/test/print/pdfx_fixtures.py <out-dir>
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

import pikepdf
from pikepdf import Array, Dictionary, Name, String

TEXT_K = b'0 0 0 1 k BT /F1 12 Tf 72 300 Td (A) Tj ET\n'
RICH_BLACK_RECT = b'0.6 0.4 0.4 1 k 100 100 50 50 re f\n'


def icc_profile(device_class=b'prtr', colour_space=b'CMYK'):
    header = bytearray(128)
    header[0:4] = (132).to_bytes(4, 'big')
    header[8:12] = bytes([2, 0x10, 0, 0])
    header[12:16] = device_class
    header[16:20] = colour_space
    header[20:24] = b'Lab '
    header[36:40] = b'acsp'
    return bytes(header) + (0).to_bytes(4, 'big')


class Fixture:
    """A conforming document under construction; mutations edit it before saving."""

    def __init__(self):
        self.pdf = pikepdf.new()
        pdf = self.pdf
        glyph = pdf.make_stream(b'1000 0 0 0 1000 1000 d1 0 0 1000 1000 re f')
        self.font = pdf.make_indirect(Dictionary(
            Type=Name.Font, Subtype=Name.Type3, FontBBox=Array([0, 0, 1000, 1000]),
            FontMatrix=Array([0.001, 0, 0, 0.001, 0, 0]), CharProcs=Dictionary(a=glyph),
            Encoding=Dictionary(Type=Name.Encoding, Differences=Array([65, Name.a])),
            FirstChar=65, LastChar=65, Widths=Array([1000]), Resources=Dictionary()))
        self.resources = Dictionary(Font=Dictionary(F1=self.font))
        self.content = [TEXT_K, RICH_BLACK_RECT]
        self.page = Dictionary(
            Type=Name.Page, MediaBox=Array([0, 0, 432, 648]), TrimBox=Array([0, 0, 432, 648]),
            Resources=self.resources)
        self.info = Dictionary(
            Title=String('Fixture'), CreationDate=String('D:20261029000000Z'),
            ModDate=String('D:20261029000000Z'), Trapped=Name('/False'),
            GTS_PDFXVersion=String('PDF/X-1:2001'), GTS_PDFXConformance=String('PDF/X-1a:2001'))
        profile = pdf.make_stream(icc_profile(), N=4)
        self.intent = Dictionary(
            Type=Name.OutputIntent, S=Name.GTS_PDFX, OutputConditionIdentifier=String('Custom'),
            OutputCondition=String('fixture'), DestOutputProfile=profile)
        self.version = '1.3'
        self.encryption = None
        self.strip_id = False

    def add_resource(self, category, name, value):
        if category not in self.resources:
            self.resources[category] = Dictionary()
        self.resources[category][name] = value

    def image(self, colour_space, components, **extra):
        return self.pdf.make_stream(bytes(components), Type=Name.XObject, Subtype=Name.Image, Width=1,
                                    Height=1, BitsPerComponent=8, ColorSpace=colour_space, **extra)

    def save(self, path):
        pdf = self.pdf
        self.page.Contents = pdf.make_stream(b''.join(self.content))
        pdf.pages.append(pikepdf.Page(self.page))
        if self.info is not None:
            pdf.trailer.Info = pdf.make_indirect(self.info)
        if self.intent is not None:
            pdf.Root.OutputIntents = Array([pdf.make_indirect(self.intent)])
        pdf.save(path, force_version=self.version, object_stream_mode=pikepdf.ObjectStreamMode.disable,
                 encryption=self.encryption or False)
        if self.strip_id:
            data = Path(path).read_bytes()
            stripped, count = re.subn(rb'/ID \[<[0-9a-fA-F]*><[0-9a-fA-F]*>\]', b'', data)
            if count != 1:
                raise RuntimeError('could not remove the trailer /ID')
            Path(path).write_bytes(stripped)


def _gs(fixture, **entries):
    return fixture.pdf.make_indirect(Dictionary(Type=Name.ExtGState, **entries))


def _use_gs(fixture, gs):
    fixture.add_resource('/ExtGState', '/GS1', gs)
    fixture.content.append(b'/GS1 gs 10 10 5 5 re f\n')


def _form(fixture, content=b'0 0 0 1 k 0 0 10 10 re f', **entries):
    form = fixture.pdf.make_stream(content, Type=Name.XObject, Subtype=Name.Form,
                                   BBox=Array([0, 0, 10, 10]), Resources=Dictionary(), **entries)
    fixture.add_resource('/XObject', '/Fm1', form)
    fixture.content.append(b'/Fm1 Do\n')
    return form


def _use_image(fixture, image):
    fixture.add_resource('/XObject', '/Im1', image)
    fixture.content.append(b'q 20 0 0 20 200 200 cm /Im1 Do Q\n')


def _shading(fixture, space, c0, c1):
    function = Dictionary(FunctionType=2, Domain=Array([0, 1]), C0=Array(c0), C1=Array(c1), N=1)
    shading = fixture.pdf.make_indirect(Dictionary(ShadingType=2, ColorSpace=space,
                                                   Coords=Array([0, 0, 10, 0]), Function=function))
    fixture.add_resource('/Shading', '/Sh1', shading)
    fixture.content.append(b'q 0 0 10 10 re W n /Sh1 sh Q\n')


def _set(fixture, attr, value):
    setattr(fixture, attr, value)


def _del_info(fixture, key):
    del fixture.info[key]


def _del_page(fixture, key):
    del fixture.page[key]


def _del_intent(fixture, key):
    del fixture.intent[key]


def _tint_transform(fixture, outputs):
    return Dictionary(FunctionType=2, Domain=Array([0, 1]), C0=Array([0] * outputs), C1=Array([1] * outputs), N=1)


VIOLATIONS = {
    'pdf-version/header-1.4': ('pdf-version', lambda f: _set(f, 'version', '1.4')),
    'pdfx-version/missing': ('pdfx-version', lambda f: _del_info(f, '/GTS_PDFXVersion')),
    'pdfx-version/x3-conformance': ('pdfx-version', lambda f: f.info.__setitem__(
        '/GTS_PDFXConformance', String('PDF/X-3:2002'))),
    'output-intent/missing': ('output-intent', lambda f: _set(f, 'intent', None)),
    'output-intent/pdfa-subtype': ('output-intent', lambda f: f.intent.__setitem__('/S', Name('/GTS_PDFA1'))),
    'output-intent/no-embedded-profile': ('output-intent', lambda f: _del_intent(f, '/DestOutputProfile')),
    'output-intent/rgb-profile': ('output-intent', lambda f: f.intent.__setitem__(
        '/DestOutputProfile', f.pdf.make_stream(icc_profile(b'mntr', b'RGB '), N=3))),
    'output-intent/no-identifier': ('output-intent', lambda f: _del_intent(f, '/OutputConditionIdentifier')),
    'colour-spaces/rgb-fill': ('colour-spaces', lambda f: f.content.append(b'1 0 0 rg 10 10 5 5 re f\n')),
    'colour-spaces/rgb-stroke': ('colour-spaces', lambda f: f.content.append(b'0 0 1 RG 10 10 m 20 20 l S\n')),
    'colour-spaces/icc-based-cs': ('colour-spaces', lambda f: (
        f.add_resource('/ColorSpace', '/CS1', Array([Name.ICCBased, f.pdf.make_stream(icc_profile(), N=4)])),
        f.content.append(b'/CS1 cs 0 0 0 1 sc 10 10 5 5 re f\n'))),
    'colour-spaces/lab-cs': ('colour-spaces', lambda f: (
        f.add_resource('/ColorSpace', '/CS1', Array([Name.Lab, Dictionary(WhitePoint=Array([0.9505, 1, 1.089]))])),
        f.content.append(b'/CS1 cs 50 0 0 sc 10 10 5 5 re f\n'))),
    'colour-spaces/rgb-image': ('colour-spaces', lambda f: _use_image(f, f.image(Name.DeviceRGB, [255, 0, 0]))),
    'colour-spaces/indexed-rgb-base': ('colour-spaces', lambda f: _use_image(f, f.image(
        Array([Name.Indexed, Name.DeviceRGB, 0, String(b'\xff\x00\x00')]), [0]))),
    'colour-spaces/separation-rgb-alternate': ('colour-spaces', lambda f: (
        f.add_resource('/ColorSpace', '/CS1', Array([Name.Separation, Name.Spot, Name.DeviceRGB,
                                                     _tint_transform(f, 3)])),
        f.content.append(b'/CS1 cs 1 sc 10 10 5 5 re f\n'))),
    'colour-spaces/rgb-shading': ('colour-spaces', lambda f: _shading(f, Name.DeviceRGB, [1, 0, 0], [0, 0, 1])),
    'colour-spaces/rgb-inline-image': ('colour-spaces', lambda f: f.content.append(
        b'q 10 0 0 10 300 300 cm BI /W 1 /H 1 /BPC 8 /CS /RGB ID \xff\x00\x00 EI Q\n')),
    'colour-spaces/rgb-in-form': ('colour-spaces', lambda f: _form(f, b'1 0 0 rg 0 0 10 10 re f')),
    'transparency/fill-alpha': ('transparency', lambda f: _use_gs(f, _gs(f, ca=0.5))),
    'transparency/stroke-alpha': ('transparency', lambda f: _use_gs(f, _gs(f, CA=0.5))),
    'transparency/blend-mode': ('transparency', lambda f: _use_gs(f, _gs(f, BM=Name.Multiply))),
    'transparency/soft-mask': ('transparency', lambda f: _use_gs(f, _gs(f, SMask=Dictionary(
        Type=Name.Mask, S=Name.Luminosity, G=f.pdf.make_stream(
            b'0 g 0 0 10 10 re f', Type=Name.XObject, Subtype=Name.Form, BBox=Array([0, 0, 10, 10])))))),
    'transparency/group': ('transparency', lambda f: _form(f, Group=Dictionary(
        Type=Name.Group, S=Name.Transparency))),
    'transparency/image-soft-mask': ('transparency', lambda f: _use_image(f, f.image(
        Name.DeviceGray, [128], SMask=f.image(Name.DeviceGray, [255])))),
    'transfer-functions/tr': ('transfer-functions', lambda f: _use_gs(f, _gs(f, TR=Dictionary(
        FunctionType=2, Domain=Array([0, 1]), C0=Array([0]), C1=Array([1]), N=1)))),
    'postscript/ps-xobject': ('postscript', lambda f: (
        f.add_resource('/XObject', '/PS1', f.pdf.make_stream(b'% ps', Type=Name.XObject, Subtype=Name('/PS'))),
        f.content.append(b'/PS1 Do\n'))),
    'fonts-embedded/type1-not-embedded': ('fonts-embedded', lambda f: (
        f.add_resource('/Font', '/F2', f.pdf.make_indirect(Dictionary(
            Type=Name.Font, Subtype=Name.Type1, BaseFont=Name.Helvetica))),
        f.content.append(b'0 g BT /F2 10 Tf 72 200 Td (B) Tj ET\n'))),
    'fonts-embedded/truetype-descriptor-only': ('fonts-embedded', lambda f: (
        f.add_resource('/Font', '/F2', f.pdf.make_indirect(Dictionary(
            Type=Name.Font, Subtype=Name.TrueType, BaseFont=Name.Arial, FirstChar=65, LastChar=65,
            Widths=Array([600]), FontDescriptor=Dictionary(
                Type=Name.FontDescriptor, FontName=Name.Arial, Flags=32,
                FontBBox=Array([0, 0, 1000, 1000]), ItalicAngle=0, Ascent=900, Descent=-200,
                CapHeight=700, StemV=80)))),
        f.content.append(b'0 g BT /F2 10 Tf 72 200 Td (B) Tj ET\n'))),
    'encryption/rc4-40': ('encryption', lambda f: _set(f, 'encryption', pikepdf.Encryption(
        owner='owner', user='', R=2, aes=False, metadata=False))),
    'info/no-title': ('info', lambda f: _del_info(f, '/Title')),
    'info/no-moddate': ('info', lambda f: _del_info(f, '/ModDate')),
    'trapped/missing': ('trapped', lambda f: _del_info(f, '/Trapped')),
    'trapped/unknown': ('trapped', lambda f: f.info.__setitem__('/Trapped', Name.Unknown)),
    'document-id/missing': ('document-id', lambda f: _set(f, 'strip_id', True)),
    'boxes/no-trimbox': ('boxes', lambda f: _del_page(f, '/TrimBox')),
    'boxes/trimbox-inset': ('boxes', lambda f: f.page.__setitem__('/TrimBox', Array([9, 9, 423, 639]))),
    'boxes/letter-size': ('boxes', lambda f: (f.page.__setitem__('/MediaBox', Array([0, 0, 612, 792])),
                                              f.page.__setitem__('/TrimBox', Array([0, 0, 612, 792])))),
    'boxes/artbox-and-trimbox': ('boxes', lambda f: f.page.__setitem__('/ArtBox', Array([0, 0, 432, 648]))),
    'annotations/link-in-trim': ('annotations', lambda f: f.page.__setitem__('/Annots', Array([
        f.pdf.make_indirect(Dictionary(Type=Name.Annot, Subtype=Name.Link, Rect=Array([72, 72, 144, 90]),
                                       Border=Array([0, 0, 0])))]))),
    'text-k-only/rich-black-text': ('text-k-only', lambda f: f.content.append(
        b'0.6 0.4 0.4 1 k BT /F1 12 Tf 72 400 Td (A) Tj ET\n')),
    'text-k-only/cyan-text': ('text-k-only', lambda f: f.content.append(
        b'1 0 0 0 k BT /F1 12 Tf 72 400 Td (A) Tj ET\n')),
    'text-k-only/rich-black-stroked-text': ('text-k-only', lambda f: f.content.append(
        b'0.5 0.5 0.5 1 K 1 Tr BT /F1 12 Tf 72 400 Td (A) Tj ET 0 Tr\n')),
}

CONFORMING_VARIANTS = {
    'conforming/base': lambda f: None,
    'conforming/gray-and-k-text': lambda f: f.content.append(b'0 g BT /F1 12 Tf 72 400 Td (A) Tj ET\n'),
    'conforming/opaque-gstate': lambda f: _use_gs(f, _gs(f, ca=1, CA=1, BM=Name.Normal, SMask=Name('/None'))),
    'conforming/cmyk-image-and-shading': lambda f: (
        _use_image(f, f.image(Name.DeviceCMYK, [0, 0, 0, 255])),
        _shading(f, Name.DeviceCMYK, [0, 0, 0, 0], [0, 0, 0, 1])),
    'conforming/separation-cmyk-alternate': lambda f: (
        f.add_resource('/ColorSpace', '/CS1', Array([Name.Separation, Name.Spot, Name.DeviceCMYK,
                                                     _tint_transform(f, 4)])),
        f.content.append(b'/CS1 cs 1 sc 10 10 5 5 re f\n')),
    'conforming/invisible-text-ignored': lambda f: f.content.append(
        b'0.6 0.4 0.4 1 k 3 Tr BT /F1 12 Tf 72 400 Td (A) Tj ET 0 Tr\n'),
}


def build(path, mutation=None):
    fixture = Fixture()
    if mutation is not None:
        mutation(fixture)
    fixture.save(path)
    return path


def write_all(out_dir):
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    written = {}
    for name, mutation in CONFORMING_VARIANTS.items():
        written[name] = build(out / (name.replace('/', '--') + '.pdf'), mutation)
    for name, (_, mutation) in VIOLATIONS.items():
        written[name] = build(out / (name.replace('/', '--') + '.pdf'), mutation)
    return written


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print(__doc__.strip(), file=sys.stderr)
        sys.exit(2)
    for name, path in write_all(sys.argv[1]).items():
        print(f'{name}: {path}')
