"""Makes Mermaid diagram PDFs safe to place in a PDF/X-1a interior.

Chromium writes diagrams in DeviceRGB with transparency groups and a half-transparent
white label background. PDF/X-1a forbids transparency, and Ghostscript rasterises any
page that has it, so this pass removes it before LaTeX places the diagrams. Neutral RGB
(r = g = b) is rewritten as DeviceGray so that black diagram text stays 100% K after the
CMYK conversion instead of turning into four-colour black. Chromium on Linux also writes
near-zero numbers such as 1.9E-16, and older xdvipdfmx (TeX Live 2023) re-emits any
tiny value in that exponent form, which PDF syntax does not allow. Such values are
rewritten as plain decimals and anything below a millionth of a point becomes 0.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from decimal import Decimal

import pikepdf
from pikepdf import Array, Name, Stream

from .pdfwalk import entries

NEUTRAL_TOLERANCE = 0.002


class DiagramError(Exception):
    pass


@dataclass
class Report:
    neutral_colours: int = 0
    rgb_colours_left: int = 0
    alpha_removed: int = 0
    groups_removed: int = 0
    shadings_converted: int = 0
    shadings_left: int = 0
    exponents_rewritten: int = 0
    tiny_numbers_zeroed: int = 0

    def summary(self) -> str:
        return (f'neutral-rgb->gray={self.neutral_colours} rgb-left={self.rgb_colours_left} '
                f'alpha-removed={self.alpha_removed} groups-removed={self.groups_removed} '
                f'shadings->gray={self.shadings_converted} rgb-shadings-left={self.shadings_left} '
                f'exponents-rewritten={self.exponents_rewritten} tiny-numbers-zeroed={self.tiny_numbers_zeroed}')


def is_neutral(values) -> bool:
    return len(values) == 3 and max(values) - min(values) <= NEUTRAL_TOLERANCE


def _floats(values):
    return [float(v) for v in values]


EXPONENT_NUMBER = re.compile(r'[-+]?(?:\d+\.?\d*|\.\d+)[eE][-+]?\d+')


def merge_exponent_numbers(operations, report: Report):
    """qpdf does not read 1.9E-16 as a number: it yields it as an operator, splitting the
    operands of the real operator that follows. Fold those back in as plain decimals."""
    out, pending = [], []
    for operands, operator in operations:
        if EXPONENT_NUMBER.fullmatch(str(operator)):
            pending.extend(operands)
            pending.append(Decimal(f'{float(str(operator)):.6f}'))
            report.exponents_rewritten += 1
            continue
        out.append((pending + list(operands), operator))
        pending = []
    if pending:
        raise DiagramError('content stream ends with dangling numbers')
    return out


TINY = Decimal('0.000001')


def _no_tiny(value, report):
    if isinstance(value, Decimal) and value != 0 and abs(value) < TINY:
        report.tiny_numbers_zeroed += 1
        return Decimal(0)
    if isinstance(value, pikepdf.Array):
        return pikepdf.Array([_no_tiny(item, report) for item in value])
    return value


def rewrite_colours(operations, report: Report):
    out = []
    for operands, operator in merge_exponent_numbers(operations, report):
        operands = [_no_tiny(value, report) for value in operands]
        op = str(operator)
        if op in ('rg', 'RG'):
            values = _floats(operands)
            if is_neutral(values):
                gray = round(sum(values) / 3, 4)
                out.append(([gray], pikepdf.Operator('g' if op == 'rg' else 'G')))
                report.neutral_colours += 1
                continue
            report.rgb_colours_left += 1
        out.append((operands, operator))
    return out


def _rewrite_stream(stream, report):
    operations = list(pikepdf.parse_content_stream(stream))
    stream.write(pikepdf.unparse_content_stream(rewrite_colours(operations, report)))


def _gray_function(function):
    """Returns True if the (type 2 or stitched) function was neutral and is now 1-output."""
    kind = int(function.get('/FunctionType', -1))
    if kind == 2:
        c0 = _floats(function.get('/C0', [0, 0, 0]))
        c1 = _floats(function.get('/C1', [1, 1, 1]))
        if not (is_neutral(c0) and is_neutral(c1)):
            return False
        function.C0 = Array([round(sum(c0) / 3, 4)])
        function.C1 = Array([round(sum(c1) / 3, 4)])
        return True
    if kind == 3:
        parts = list(function.get('/Functions', []))
        if not parts or not all(_neutral_type2(p) for p in parts):
            return False
        for part in parts:
            _gray_function(part)
        return True
    return False


def _neutral_type2(function):
    if int(function.get('/FunctionType', -1)) != 2:
        return False
    return is_neutral(_floats(function.get('/C0', [0, 0, 0]))) and is_neutral(_floats(function.get('/C1', [1, 1, 1])))


def _convert_shading(shading, report):
    if str(shading.get('/ColorSpace')) != '/DeviceRGB':
        return
    function = shading.get('/Function')
    if function is not None and not isinstance(function, Array) and _gray_function(function):
        shading.ColorSpace = Name.DeviceGray
        if '/Background' in shading:
            del shading['/Background']
        report.shadings_converted += 1
    else:
        report.shadings_left += 1


def _ext_gstate(gs, report):
    smask = gs.get('/SMask')
    if smask is not None and smask != Name('/None'):
        raise DiagramError('diagram uses a soft mask, which cannot be removed without changing it')
    blend = gs.get('/BM')
    modes = [str(m) for m in blend] if isinstance(blend, Array) else ([str(blend)] if blend is not None else [])
    if modes and modes[0] not in ('/Normal', '/Compatible'):
        raise DiagramError(f'diagram uses blend mode {modes[0]}, which PDF/X-1a forbids')
    for key in ('/CA', '/ca'):
        if key in gs and float(gs[key]) < 1:
            gs[key] = 1
            report.alpha_removed += 1


def _resource_dicts(pdf):
    for page in pdf.pages:
        if '/Resources' in page.obj:
            yield page.obj.Resources
    for obj in pdf.objects:
        if isinstance(obj, Stream) and '/Resources' in obj:
            yield obj.Resources


def normalise_pdf(pdf: pikepdf.Pdf) -> Report:
    report = Report()
    for page in pdf.pages:
        page.contents_coalesce()
        _rewrite_stream(page.obj.Contents, report)
        if '/Group' in page.obj:
            del page.obj['/Group']
            report.groups_removed += 1
    for obj in pdf.objects:
        if not isinstance(obj, Stream):
            continue
        subtype = obj.get('/Subtype')
        if subtype == Name.Image and ('/SMask' in obj or int(obj.get('/SMaskInData', 0)) > 0):
            raise DiagramError('diagram contains an image with a soft mask')
        is_form = subtype == Name.Form
        if is_form or obj.get('/PatternType') == 1:
            _rewrite_stream(obj, report)
        if is_form and '/Group' in obj:
            del obj['/Group']
            report.groups_removed += 1
    seen = set()

    def once(obj):
        if not obj.is_indirect:
            return True
        if obj.objgen in seen:
            return False
        seen.add(obj.objgen)
        return True

    for resources in _resource_dicts(pdf):
        for gs in entries(resources.get('/ExtGState')):
            if once(gs):
                _ext_gstate(gs, report)
        for shading in entries(resources.get('/Shading')):
            if once(shading):
                _convert_shading(shading, report)
        for pattern in entries(resources.get('/Pattern')):
            if pattern.get('/PatternType') != 2:
                continue
            if '/Shading' in pattern and once(pattern.Shading):
                _convert_shading(pattern.Shading, report)
            if '/ExtGState' in pattern and once(pattern.ExtGState):
                _ext_gstate(pattern.ExtGState, report)
    return report


def normalise_file(path) -> Report:
    with pikepdf.open(path, allow_overwriting_input=True) as pdf:
        report = normalise_pdf(pdf)
        pdf.save(path)
    return report
