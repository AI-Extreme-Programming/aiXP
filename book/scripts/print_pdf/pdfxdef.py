"""Fills book/templates/latex/pdfx-def.ps.in for Ghostscript."""

from __future__ import annotations

import re

PLACEHOLDER = re.compile(r'@([A-Z_]+)@')
TEXT_KEYS = ('TITLE', 'AUTHOR', 'SUBJECT', 'KEYWORDS', 'BOOK_VERSION', 'GIT_COMMIT', 'BUILD_TIMESTAMP',
             'OUTPUT_CONDITION', 'OUTPUT_INFO')


def ps_text(value: str) -> str:
    """A PDF text string as a PostScript hex string (UTF-16BE with BOM)."""
    return '<FEFF' + value.encode('utf-16-be').hex().upper() + '>'


def ps_bytes(value: str) -> str:
    """A file name as a PostScript hex string of its UTF-8 bytes."""
    return '<' + value.encode('utf-8').hex().upper() + '>'


def render(template: str, text_values: dict, icc_path: str) -> str:
    missing = [key for key in TEXT_KEYS if key not in text_values]
    if missing:
        raise ValueError('no value for ' + ', '.join(missing))
    values = {key: ps_text(str(text_values[key])) for key in TEXT_KEYS}
    values['ICC_PATH'] = ps_bytes(icc_path)

    def substitute(match):
        key = match.group(1)
        if key not in values:
            raise ValueError(f'unknown placeholder @{key}@')
        return values[key]

    return PLACEHOLDER.sub(substitute, template)
