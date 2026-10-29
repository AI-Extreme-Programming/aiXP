"""Content-stream interpreter shared by the print checks and the diagram normaliser.

It follows what each page actually paints: page content, the Form XObjects and tiling
patterns it invokes, and Type 3 glyph procedures, carrying the colour and text state
that PDF/X colour and text checks need. It reports structure only, never text content.
"""

from __future__ import annotations

from dataclasses import dataclass, field, replace

import pikepdf
from pikepdf import Dictionary, Name, Stream

DEVICE_SPACES = {'/DeviceGray': 1, '/DeviceRGB': 3, '/DeviceCMYK': 4}
INLINE_SPACE_ABBREVS = {'/G': '/DeviceGray', '/RGB': '/DeviceRGB', '/CMYK': '/DeviceCMYK', '/I': '/Indexed'}
MAX_DEPTH = 32


@dataclass(frozen=True)
class Colour:
    space: object = Name.DeviceGray
    values: tuple = (0.0,)

    @property
    def family(self) -> str:
        return colour_space_family(self.space)


@dataclass
class GState:
    fill: Colour = field(default_factory=Colour)
    stroke: Colour = field(default_factory=Colour)
    render_mode: int = 0


def entries(dictionary) -> list:
    """Values of a PDF dictionary; pikepdf 8 (Ubuntu 24.04) has no Dictionary.values()."""
    return [] if dictionary is None else [dictionary[key] for key in dictionary.keys()]


def colour_space_family(space) -> str:
    if isinstance(space, pikepdf.Array):
        return str(space[0]) if len(space) else '/Unknown'
    return str(space)


def resolve_colour_space(name, resources):
    key = str(name)
    if key in DEVICE_SPACES or key == '/Pattern':
        return Name(key)
    spaces = resources.get('/ColorSpace') if resources is not None else None
    if spaces is not None and key in spaces:
        return spaces[key]
    return Name(key)


def initial_values(space) -> tuple:
    family = colour_space_family(space)
    if family == '/DeviceCMYK':
        return (0.0, 0.0, 0.0, 1.0)
    if family in ('/DeviceRGB', '/CalRGB', '/Lab'):
        return (0.0, 0.0, 0.0)
    return (0.0,)


def numbers(operands) -> tuple:
    out = []
    for value in operands:
        try:
            out.append(float(value))
        except (TypeError, ValueError):
            continue
    return tuple(out)


def inherited(page_obj, key):
    node = page_obj
    seen = 0
    while node is not None and seen < 64:
        if key in node:
            return node[key]
        node = node.get('/Parent')
        seen += 1
    return None


class Visitor:
    """Callbacks for the interpreter. Each receives a short location string."""

    def colour_space(self, space, where):  # any colour space selected or declared
        pass

    def colour(self, colour: Colour, where):  # a colour set by an operator
        pass

    def text(self, state: GState, where):  # a text-showing operator
        pass

    def ext_gstate(self, gs, where):
        pass

    def image(self, image, where):  # an Image XObject (Stream)
        pass

    def inline_image(self, image, where):  # a pikepdf.PdfInlineImage
        pass

    def shading(self, shading, where):
        pass

    def font(self, font, where):
        pass

    def form(self, form, where):
        pass


class Interpreter:
    def __init__(self, visitor: Visitor):
        self.visitor = visitor
        self._fonts_seen = set()

    def run_document(self, pdf: pikepdf.Pdf):
        for number, page in enumerate(pdf.pages, start=1):
            where = f'page {number}'
            resources = inherited(page.obj, '/Resources') or Dictionary()
            self._declared(resources, where)
            self.run_stream(page, resources, GState(), where, 0)
            for annot in page.obj.get('/Annots', []) or []:
                self._annotation(annot, where)

    def _annotation(self, annot, where):
        appearance = annot.get('/AP')
        if appearance is None:
            return
        for key in ('/N', '/R', '/D'):
            entry = appearance.get(key)
            if entry is None:
                continue
            streams = [entry] if isinstance(entry, Stream) else [entry[k] for k in entry.keys()]
            for stream in streams:
                if isinstance(stream, Stream):
                    self._form(stream, GState(), f'{where} annotation appearance', 1)

    def _declared(self, resources, where):
        """Colour spaces, images and shadings named in resources count even if unused."""
        for space in entries(resources.get('/ColorSpace')):
            self.visitor.colour_space(space, f'{where} resources')
        for shading in entries(resources.get('/Shading')):
            self.visitor.shading(shading, f'{where} resources')
        for gs in entries(resources.get('/ExtGState')):
            self.visitor.ext_gstate(gs, f'{where} resources')
        for font in entries(resources.get('/Font')):
            self._font(font, where)
        for xobject in entries(resources.get('/XObject')):
            if xobject.get('/Subtype') == Name.Image:
                self.visitor.image(xobject, f'{where} resources')

    def _font(self, font, where):
        key = font.objgen if font.is_indirect else id(font)
        if key in self._fonts_seen:
            return
        self._fonts_seen.add(key)
        self.visitor.font(font, where)
        if font.get('/Subtype') == Name.Type3:
            resources = font.get('/Resources') or Dictionary()
            self._declared(resources, f'{where} Type3 font')
            for proc in entries(font.get('/CharProcs')):
                self.run_stream(proc, resources, GState(), f'{where} Type3 glyph', 1)

    def _form(self, form, state, where, depth):
        self.visitor.form(form, where)
        resources = form.get('/Resources') or Dictionary()
        self._declared(resources, where)
        self.run_stream(form, resources, replace(state), where, depth + 1)

    def run_stream(self, source, resources, state: GState, where, depth):
        if depth > MAX_DEPTH:
            return
        stack = []
        for operands, operator in pikepdf.parse_content_stream(source):
            op = str(operator)
            if op == 'q':
                stack.append(replace(state))
            elif op == 'Q':
                if stack:
                    state = stack.pop()
            elif op in ('g', 'G', 'rg', 'RG', 'k', 'K'):
                space = {'g': Name.DeviceGray, 'rg': Name.DeviceRGB, 'k': Name.DeviceCMYK}[op.lower()]
                colour = Colour(space, numbers(operands))
                self.visitor.colour(colour, where)
                if op.islower():
                    state.fill = colour
                else:
                    state.stroke = colour
            elif op in ('cs', 'CS'):
                space = resolve_colour_space(operands[0], resources)
                self.visitor.colour_space(space, where)
                colour = Colour(space, initial_values(space))
                if op == 'cs':
                    state.fill = colour
                else:
                    state.stroke = colour
            elif op in ('sc', 'scn', 'SC', 'SCN'):
                current = state.fill if op.islower() else state.stroke
                colour = Colour(current.space, numbers(operands))
                if operands and isinstance(operands[-1], Name):
                    self._pattern(operands[-1], resources, state, where, depth)
                self.visitor.colour(colour, where)
                if op.islower():
                    state.fill = colour
                else:
                    state.stroke = colour
            elif op == 'Tr':
                state.render_mode = int(numbers(operands)[0]) if numbers(operands) else 0
            elif op in ('Tj', 'TJ', "'", '"'):
                self.visitor.text(replace(state), where)
            elif op == 'Tf':
                fonts = resources.get('/Font') or {}
                if operands and str(operands[0]) in fonts:
                    self._font(fonts[str(operands[0])], where)
            elif op == 'gs':
                states = resources.get('/ExtGState') or {}
                if operands and str(operands[0]) in states:
                    self.visitor.ext_gstate(states[str(operands[0])], where)
            elif op == 'sh':
                shadings = resources.get('/Shading') or {}
                if operands and str(operands[0]) in shadings:
                    self.visitor.shading(shadings[str(operands[0])], where)
            elif op == 'Do':
                xobjects = resources.get('/XObject') or {}
                if not operands or str(operands[0]) not in xobjects:
                    continue
                xobject = xobjects[str(operands[0])]
                subtype = xobject.get('/Subtype')
                if subtype == Name.Form:
                    self._form(xobject, state, f'{where} form', depth)
                elif subtype == Name.Image:
                    self.visitor.image(xobject, where)
            elif op == 'INLINE IMAGE':
                self.visitor.inline_image(operands[0], where)

    def _pattern(self, name, resources, state, where, depth):
        patterns = resources.get('/Pattern') or {}
        if str(name) not in patterns:
            return
        pattern = patterns[str(name)]
        if pattern.get('/PatternType') == 2:
            if '/Shading' in pattern:
                self.visitor.shading(pattern.Shading, f'{where} shading pattern')
            if '/ExtGState' in pattern:
                self.visitor.ext_gstate(pattern.ExtGState, f'{where} shading pattern')
        elif isinstance(pattern, Stream):
            self._form(pattern, state, f'{where} tiling pattern', depth)
