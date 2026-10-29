"""Page-box fix-up after Ghostscript.

Ghostscript's pdfwrite in PDF/X-1 mode (-dPDFX=1, checked with 10.07) writes each page's
trim as an ArtBox and drops the input TrimBox. PDF/X accepts either box, but IngramSpark
and this pipeline require a TrimBox, so an ArtBox-only page gets it renamed.
"""

from __future__ import annotations

import pikepdf


class BoxError(Exception):
    pass


def art_to_trim(pdf: pikepdf.Pdf) -> int:
    moved = 0
    for number, page in enumerate(pdf.pages, start=1):
        obj = page.obj
        if '/TrimBox' in obj:
            if '/ArtBox' in obj:
                del obj['/ArtBox']
            continue
        if '/ArtBox' not in obj:
            raise BoxError(f'page {number} has neither TrimBox nor ArtBox')
        obj.TrimBox = obj.ArtBox
        del obj['/ArtBox']
        moved += 1
    return moved


def art_to_trim_file(path) -> int:
    with pikepdf.open(path, allow_overwriting_input=True) as pdf:
        version = pdf.pdf_version
        moved = art_to_trim(pdf)
        if moved:
            pdf.save(path, min_version=version, object_stream_mode=pikepdf.ObjectStreamMode.disable)
    return moved
