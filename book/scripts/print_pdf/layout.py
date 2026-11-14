"""Printer-facing layout checks run with poppler and Ghostscript, as design section 7.4
items 3 and 4 specify, plus IngramSpark's even page count and 0.5 in safe zone.

The parsers read only tool output that describes structure (font table, boxes, page
bounding boxes); nothing here reads or prints page text.
"""

from __future__ import annotations

import re
from collections import OrderedDict

TRIM = (0.0, 0.0, 432.0, 648.0)
SAFE_ZONE_PT = 36.0
TOLERANCE = 0.01

RULES = OrderedDict([
    ('pdffonts-embedded', 'pdffonts reports emb = yes for every font'),
    ('pdfinfo-boxes', 'pdfinfo -box reports MediaBox and TrimBox as 0 0 432 648 on every page'),
    ('even-pages', 'the page count is even'),
    ('safe-zone', 'every mark on every page is at least 0.5 in (36 pt) inside the trim'),
])


def parse_pdffonts(text):
    """Returns [(name, embedded)]. Long font names push pdffonts' fixed columns right,
    so each row is read from its end: emb sub uni object-number generation."""
    lines = text.splitlines()
    for index, line in enumerate(lines):
        if line.startswith('---'):
            header = lines[index - 1].split() if index else []
            if header[-5:] != ['emb', 'sub', 'uni', 'object', 'ID']:
                raise ValueError('pdffonts output has an unexpected header')
            rows = []
            for row in lines[index + 1:]:
                tokens = row.split()
                if not tokens:
                    continue
                if len(tokens) < 6:
                    raise ValueError('pdffonts row has too few columns')
                rows.append((tokens[0], tokens[-5]))
            return rows
    raise ValueError('pdffonts output has no column header')


def check_pdffonts(text):
    rows = parse_pdffonts(text)
    if not rows:
        return ['pdffonts lists no fonts']
    return [f'font {name or "(unnamed)"} is not embedded' for name, emb in rows if emb != 'yes']


BOX_LINE = re.compile(r'^Page\s+(\d+)\s+(MediaBox|TrimBox|CropBox|BleedBox|ArtBox):\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)')


def parse_pdfinfo_boxes(text):
    pages = {}
    count = None
    for line in text.splitlines():
        match = BOX_LINE.match(line)
        if match:
            pages.setdefault(int(match.group(1)), {})[match.group(2)] = tuple(float(match.group(i)) for i in range(3, 7))
        elif line.startswith('Pages:'):
            count = int(line.split()[1])
    return count, pages


def check_pdfinfo_boxes(text):
    count, pages = parse_pdfinfo_boxes(text)
    problems = []
    if count is None:
        return ['pdfinfo reported no page count']
    for number in range(1, count + 1):
        boxes = pages.get(number, {})
        for name in ('MediaBox', 'TrimBox'):
            box = boxes.get(name)
            if box is None:
                problems.append(f'page {number}: pdfinfo reports no {name}')
            elif any(abs(a - b) > TOLERANCE for a, b in zip(box, TRIM)):
                problems.append(f'page {number}: {name} is {" ".join(f"{v:g}" for v in box)}, expected 0 0 432 648')
    return problems


def check_even(count):
    return [] if count % 2 == 0 else [f'page count is {count}, which is odd']


HIRES = re.compile(r'^%%HiResBoundingBox:\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)')


def parse_bbox(text):
    return [tuple(float(m.group(i)) for i in range(1, 5)) for m in map(HIRES.match, text.splitlines()) if m]


def check_safe_zone(boxes, expected_pages=None):
    problems = []
    if expected_pages is not None and len(boxes) != expected_pages:
        problems.append(f'Ghostscript bbox reported {len(boxes)} pages, expected {expected_pages}')
    low_x, low_y = TRIM[0] + SAFE_ZONE_PT, TRIM[1] + SAFE_ZONE_PT
    high_x, high_y = TRIM[2] - SAFE_ZONE_PT, TRIM[3] - SAFE_ZONE_PT
    for number, (x0, y0, x1, y1) in enumerate(boxes, start=1):
        if x0 == y0 == x1 == y1 == 0:
            continue
        sides = []
        if x0 < low_x - TOLERANCE:
            sides.append(f'left {x0:.2f} pt')
        if y0 < low_y - TOLERANCE:
            sides.append(f'bottom {y0:.2f} pt')
        if x1 > high_x + TOLERANCE:
            sides.append(f'right {TRIM[2] - x1:.2f} pt')
        if y1 > high_y + TOLERANCE:
            sides.append(f'top {TRIM[3] - y1:.2f} pt')
        if sides:
            problems.append(f'page {number}: marks closer than 36 pt to the trim ({", ".join(sides)} from the edge)')
    return problems
