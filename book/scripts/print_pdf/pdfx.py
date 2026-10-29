"""Project-owned PDF/X-1a:2001 conformance checks for the print interior.

This is not a certified validator. It checks the rules listed in RULES, which cover
design section 7.4 item 5 plus fonts, boxes, and a few further PDF/X-1a requirements.
A certified preflight (IngramSpark's upload checks, Acrobat, or callas pdfToolbox)
remains the final gate before files go to the printer.
"""

from __future__ import annotations

import re
from collections import OrderedDict
from dataclasses import dataclass, field

import pikepdf
from pikepdf import Array, Name, Stream

from .pdfwalk import INLINE_SPACE_ABBREVS, Interpreter, Visitor, colour_space_family

TRIM_SIZE = (432.0, 648.0)
BOX_TOLERANCE = 0.01
FORBIDDEN_SPACES = {'/DeviceRGB', '/CalRGB', '/CalGray', '/Lab', '/ICCBased'}
ALLOWED_ANNOTATIONS = {'/PrinterMark', '/TrapNet'}
MAX_MESSAGES_PER_RULE = 8

RULES = OrderedDict([
    ('pdf-version', 'file header and catalog declare PDF 1.3 or earlier'),
    ('pdfx-version', 'Info GTS_PDFXVersion is "PDF/X-1:2001" and GTS_PDFXConformance is "PDF/X-1a:2001"'),
    ('output-intent', 'one GTS_PDFX OutputIntent with an identifier and an embedded CMYK output ICC profile'),
    ('colour-spaces', 'no RGB, Lab, CalGray or ICC-based colour in content, resources, images or shadings'),
    ('transparency', 'no soft masks, non-Normal blend modes, alpha below 1, or transparency groups'),
    ('transfer-functions', 'no transfer functions in graphics states'),
    ('postscript', 'no PostScript XObjects'),
    ('fonts-embedded', 'every font used or declared is embedded'),
    ('encryption', 'the file is not encrypted'),
    ('info', 'Info has a Title, CreationDate and ModDate'),
    ('trapped', 'Info Trapped is /True or /False'),
    ('document-id', 'the trailer has a file identifier (/ID)'),
    ('boxes', 'every page has MediaBox and TrimBox equal to 432 x 648 pt and no ArtBox'),
    ('annotations', 'no annotations inside the TrimBox other than PrinterMark or TrapNet'),
    ('text-k-only', 'house rule: text is painted in K only (gray or CMYK with C=M=Y=0), never rich black'),
])


@dataclass
class Result:
    failures: dict = field(default_factory=lambda: OrderedDict((rule, []) for rule in RULES))

    def add(self, rule, message):
        if message not in self.failures[rule]:
            self.failures[rule].append(message)

    @property
    def failed_rules(self):
        return [rule for rule, messages in self.failures.items() if messages]

    @property
    def ok(self):
        return not self.failed_rules


def _text(value):
    return str(value) if value is not None else None


def _number(value, default=None):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _box(value):
    if value is None:
        return None
    try:
        x0, y0, x1, y1 = (float(v) for v in value)
    except (TypeError, ValueError):
        return None
    return (min(x0, x1), min(y0, y1), max(x0, x1), max(y0, y1))


def _fmt(box):
    return '[' + ' '.join(f'{v:g}' for v in box) + ']'


def _inherited(obj, key):
    node, hops = obj, 0
    while node is not None and hops < 64:
        if key in node:
            return node[key]
        node = node.get('/Parent')
        hops += 1
    return None


def check_version(pdf, result, header_version):
    for label, version in (('header', header_version), ('catalog', _text(pdf.Root.get('/Version')))):
        if version is None:
            continue
        version = version.lstrip('/')
        if tuple(int(p) for p in version.split('.')[:2]) > (1, 3):
            result.add('pdf-version', f'{label} declares PDF {version}; PDF/X-1a:2001 requires 1.3 or earlier')


def check_pdfx_keys(info, result):
    version = _text(info.get('/GTS_PDFXVersion')) if info is not None else None
    conformance = _text(info.get('/GTS_PDFXConformance')) if info is not None else None
    if version != 'PDF/X-1:2001':
        result.add('pdfx-version', f'GTS_PDFXVersion is {version!r}, expected "PDF/X-1:2001"')
    if conformance != 'PDF/X-1a:2001':
        result.add('pdfx-version', f'GTS_PDFXConformance is {conformance!r}, expected "PDF/X-1a:2001"')


def check_output_intent(pdf, result):
    intents = [i for i in (pdf.Root.get('/OutputIntents') or []) if i.get('/S') == Name('/GTS_PDFX')]
    if len(intents) != 1:
        result.add('output-intent', f'found {len(intents)} OutputIntent(s) with /S /GTS_PDFX, expected exactly 1')
        return
    intent = intents[0]
    if not _text(intent.get('/OutputConditionIdentifier')):
        result.add('output-intent', 'OutputConditionIdentifier is missing or empty')
    profile = intent.get('/DestOutputProfile')
    if not isinstance(profile, Stream):
        result.add('output-intent', 'DestOutputProfile is missing; an embedded ICC profile is required')
        return
    data = profile.read_bytes()
    if len(data) < 128 or data[36:40] != b'acsp':
        result.add('output-intent', 'DestOutputProfile is not an ICC profile')
        return
    if data[12:16] != b'prtr':
        result.add('output-intent', f'ICC device class is {data[12:16]!r}, expected an output (prtr) profile')
    if data[16:20] != b'CMYK':
        result.add('output-intent', f'ICC colour space is {data[16:20]!r}, expected CMYK')
    if '/N' in profile and int(profile.N) != 4:
        result.add('output-intent', f'ICC stream /N is {int(profile.N)}, expected 4')


class _ColourVisitor(Visitor):
    def __init__(self, result):
        self.result = result

    def _space(self, space, where, depth=0):
        if depth > 8:
            return
        family = colour_space_family(space)
        if family in FORBIDDEN_SPACES:
            self.result.add('colour-spaces', f'{where}: {family[1:]} colour space')
            return
        if not isinstance(space, Array):
            return
        if family == '/Indexed' and len(space) > 1:
            self._space(space[1], where, depth + 1)
        elif family in ('/Separation', '/DeviceN'):
            alternate = space[2] if len(space) > 2 else None
            if alternate is not None:
                self._space(alternate, f'{where} ({family[1:]} alternate)', depth + 1)
        elif family == '/Pattern' and len(space) > 1:
            self._space(space[1], where, depth + 1)

    def colour_space(self, space, where):
        self._space(space, where)

    def colour(self, colour, where):
        self._space(colour.space, where)

    def image(self, image, where):
        if image.get('/ImageMask') is True:
            return
        space = image.get('/ColorSpace')
        if space is None:
            filters = image.get('/Filter')
            names = [str(f) for f in filters] if isinstance(filters, Array) else [str(filters)]
            if '/JPXDecode' in names:
                self.result.add('colour-spaces', f'{where}: JPEG 2000 image without an explicit colour space')
            return
        self._space(space, f'{where} image')
        if '/SMask' in image or int(_number(image.get('/SMaskInData'), 0) or 0) > 0:
            self.result.add('transparency', f'{where}: image with a soft mask')

    def inline_image(self, image, where):
        if image.image_mask:
            return
        try:
            space = image.colorspace
        except Exception:  # pikepdf raises for colour spaces it cannot resolve itself
            space = None
        if space is None:
            return
        name = INLINE_SPACE_ABBREVS.get(str(space), str(space))
        if name in FORBIDDEN_SPACES:
            self.result.add('colour-spaces', f'{where} inline image: {name[1:]} colour space')

    def shading(self, shading, where):
        if '/ColorSpace' in shading:
            self._space(shading.ColorSpace, f'{where} shading')

    def ext_gstate(self, gs, where):
        smask = gs.get('/SMask')
        if smask is not None and smask != Name('/None'):
            self.result.add('transparency', f'{where}: soft mask in graphics state')
        blend = gs.get('/BM')
        modes = [str(m) for m in blend] if isinstance(blend, Array) else ([str(blend)] if blend is not None else [])
        if modes and modes[0] not in ('/Normal', '/Compatible'):
            self.result.add('transparency', f'{where}: blend mode {modes[0][1:]}')
        for key in ('/CA', '/ca'):
            value = _number(gs.get(key))
            if value is not None and value < 1:
                self.result.add('transparency', f'{where}: {key[1:]} {value:g}')
        if '/TR' in gs:
            self.result.add('transfer-functions', f'{where}: TR transfer function')
        if '/TR2' in gs and gs.TR2 != Name('/Default'):
            self.result.add('transfer-functions', f'{where}: TR2 transfer function')

    def form(self, form, where):
        group = form.get('/Group')
        if group is not None and group.get('/S') == Name('/Transparency'):
            self.result.add('transparency', f'{where}: transparency group')

    def font(self, font, where):
        problem = font_embedding_problem(font)
        if problem:
            self.result.add('fonts-embedded', f'{where}: {problem}')

    def text(self, state, where):
        mode = state.render_mode
        painted = []
        if mode in (0, 2, 4, 6):
            painted.append(('fill', state.fill))
        if mode in (1, 2, 5, 6):
            painted.append(('stroke', state.stroke))
        for role, colour in painted:
            problem = k_only_problem(colour)
            if problem:
                self.result.add('text-k-only', f'{where}: text {role} {problem}')


def k_only_problem(colour):
    family = colour.family
    if family == '/DeviceGray':
        return None
    if family == '/DeviceCMYK':
        values = list(colour.values) + [0.0] * (4 - len(colour.values))
        c, m, y, k = values[:4]
        if max(c, m, y) <= 0.0001:
            return None
        kind = 'rich black' if k >= 0.5 else 'four-colour'
        return f'is {kind} CMYK ({c:g} {m:g} {y:g} {k:g})'
    return f'uses {family[1:]}'


def font_embedding_problem(font):
    subtype = font.get('/Subtype')
    name = _text(font.get('/BaseFont')) or '(unnamed)'
    if subtype == Name.Type3:
        return None
    if subtype == Name.Type0:
        descendants = font.get('/DescendantFonts')
        if not descendants:
            return f'Type0 font {name} has no descendant font'
        font = descendants[0]
    descriptor = font.get('/FontDescriptor')
    if descriptor is None:
        return f'font {name} is not embedded (no FontDescriptor)'
    if not any(key in descriptor for key in ('/FontFile', '/FontFile2', '/FontFile3')):
        return f'font {name} is not embedded'
    return None


def check_postscript(pdf, result):
    for obj in pdf.objects:
        if isinstance(obj, Stream) and (obj.get('/Subtype') == Name('/PS') or obj.get('/Subtype2') == Name('/PS')):
            result.add('postscript', f'PostScript XObject {obj.objgen[0]} {obj.objgen[1]} R')


def check_info(info, result):
    if info is None:
        result.add('info', 'no document Info dictionary')
        result.add('trapped', 'no document Info dictionary')
        return
    if not _text(info.get('/Title')):
        result.add('info', 'Title is missing or empty')
    for key in ('/CreationDate', '/ModDate'):
        if not _text(info.get(key)):
            result.add('info', f'{key[1:]} is missing')
    trapped = info.get('/Trapped')
    if trapped not in (Name('/True'), Name('/False')):
        result.add('trapped', f'Trapped is {_text(trapped)!r}, expected /True or /False')


def check_id(pdf, result):
    ident = pdf.trailer.get('/ID')
    if not isinstance(ident, Array) or len(ident) != 2:
        result.add('document-id', 'trailer has no /ID array of two strings')


def _same(a, b):
    return all(abs(x - y) <= BOX_TOLERANCE for x, y in zip(a, b))


def check_boxes(pdf, result):
    width, height = TRIM_SIZE
    for number, page in enumerate(pdf.pages, start=1):
        obj = page.obj
        media = _box(_inherited(obj, '/MediaBox'))
        trim = _box(obj.get('/TrimBox'))
        where = f'page {number}'
        if media is None:
            result.add('boxes', f'{where}: MediaBox missing')
        elif not _same((media[2] - media[0], media[3] - media[1]), (width, height)):
            result.add('boxes', f'{where}: MediaBox {_fmt(media)} is not {width:g} x {height:g} pt')
        if trim is None:
            result.add('boxes', f'{where}: TrimBox missing')
        else:
            if not _same((trim[2] - trim[0], trim[3] - trim[1]), (width, height)):
                result.add('boxes', f'{where}: TrimBox {_fmt(trim)} is not {width:g} x {height:g} pt')
            if media is not None and not _same(trim, media):
                result.add('boxes', f'{where}: TrimBox {_fmt(trim)} differs from MediaBox {_fmt(media)} (no bleed)')
        if '/ArtBox' in obj and trim is not None:
            result.add('boxes', f'{where}: both TrimBox and ArtBox are present')


def _overlaps(a, b):
    return a[0] < b[2] and b[0] < a[2] and a[1] < b[3] and b[1] < a[3]


def check_annotations(pdf, result):
    for number, page in enumerate(pdf.pages, start=1):
        trim = _box(page.obj.get('/TrimBox')) or _box(_inherited(page.obj, '/MediaBox'))
        for annot in page.obj.get('/Annots', []) or []:
            subtype = _text(annot.get('/Subtype')) or '/Unknown'
            if subtype in ALLOWED_ANNOTATIONS:
                continue
            rect = _box(annot.get('/Rect'))
            if rect is None or trim is None or _overlaps(rect, trim):
                result.add('annotations', f'page {number}: {subtype[1:]} annotation inside the TrimBox')


def header_version(path):
    with open(path, 'rb') as handle:
        head = handle.read(1024)
    match = re.search(rb'%PDF-(\d+\.\d+)', head)
    return match.group(1).decode() if match else None


def check_pdf(path) -> Result:
    result = Result()
    with pikepdf.open(path) as pdf:
        if pdf.is_encrypted or '/Encrypt' in pdf.trailer:
            result.add('encryption', 'the file is encrypted')
        info = pdf.trailer.get('/Info')
        check_version(pdf, result, header_version(path))
        check_pdfx_keys(info, result)
        check_output_intent(pdf, result)
        Interpreter(_ColourVisitor(result)).run_document(pdf)
        check_postscript(pdf, result)
        check_info(info, result)
        check_id(pdf, result)
        check_boxes(pdf, result)
        check_annotations(pdf, result)
    return result


def report_lines(result: Result):
    lines = []
    for rule, messages in result.failures.items():
        if not messages:
            lines.append(f'  PASS {rule}')
            continue
        lines.append(f'  FAIL {rule}: {RULES[rule]}')
        for message in messages[:MAX_MESSAGES_PER_RULE]:
            lines.append(f'       - {message}')
        if len(messages) > MAX_MESSAGES_PER_RULE:
            lines.append(f'       - ... and {len(messages) - MAX_MESSAGES_PER_RULE} more')
    return lines
