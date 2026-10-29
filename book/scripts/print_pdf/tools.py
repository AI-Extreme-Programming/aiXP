"""External tool lookup shared by the print scripts."""

from __future__ import annotations

import os
import shutil


def find_gs() -> str:
    explicit = os.environ.get('GS')
    if explicit:
        return explicit
    for name in ('gs', 'gswin64c', 'gswin32c'):
        if shutil.which(name):
            return name
    raise FileNotFoundError('Ghostscript not found; install it or set GS')
