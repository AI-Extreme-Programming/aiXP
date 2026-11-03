#!/usr/bin/env python3
"""Helper steps for build-print.sh.

Usage:
  print-helper.py diagrams <diagram.pdf>...      make Mermaid PDFs PDF/X-safe, in place
  print-helper.py icc <manifest.json>            print the pinned output-intent profile path
  print-helper.py pdfx-def <template> <icc> <out> KEY=VALUE...
                                                 write the Ghostscript PDF/X definition file
  print-helper.py trimbox <file.pdf>             turn Ghostscript's ArtBox into a TrimBox
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from print_pdf import boxes, diagrams, icc, pdfxdef  # noqa: E402
from print_pdf.tools import find_gs  # noqa: E402


def cmd_diagrams(args):
    for path in args:
        try:
            report = diagrams.normalise_file(path)
        except diagrams.DiagramError as error:
            print(f'print-helper: {Path(path).name}: {error}', file=sys.stderr)
            return 1
        print(f'print-helper: diagram {Path(path).name}: {report.summary()}')
    return 0


def cmd_icc(args):
    if len(args) != 1:
        return usage()
    manifest = icc.load_manifest(args[0])
    try:
        gs = find_gs()
    except FileNotFoundError:
        gs = None
    try:
        profile = icc.resolve_profile(manifest, os.environ.get('AIXP_ICC_PROFILE'), gs)
    except icc.ProfileError as error:
        print(f'print-helper: {error}', file=sys.stderr)
        return 1
    if not profile.pinned:
        print(f'print-helper: WARNING: AIXP_ICC_PROFILE is not the pinned profile (sha256 {profile.sha256})',
              file=sys.stderr)
    print(profile.path)
    return 0


def cmd_pdfx_def(args):
    if len(args) < 3:
        return usage()
    template, icc_path, out = args[:3]
    values = {}
    for pair in args[3:]:
        key, sep, value = pair.partition('=')
        if not sep:
            return usage()
        values[key] = value
    try:
        text = pdfxdef.render(Path(template).read_text(encoding='utf-8'), values, str(Path(icc_path).resolve().as_posix()))
    except ValueError as error:
        print(f'print-helper: pdfx-def: {error}', file=sys.stderr)
        return 1
    Path(out).write_text(text, encoding='ascii')
    return 0


def cmd_trimbox(args):
    if len(args) != 1:
        return usage()
    try:
        moved = boxes.art_to_trim_file(args[0])
    except boxes.BoxError as error:
        print(f'print-helper: trimbox: {error}', file=sys.stderr)
        return 1
    print(f'print-helper: trimbox: set TrimBox from ArtBox on {moved} page(s)')
    return 0


def usage():
    print(__doc__.strip(), file=sys.stderr)
    return 2


COMMANDS = {'diagrams': cmd_diagrams, 'icc': cmd_icc, 'pdfx-def': cmd_pdfx_def, 'trimbox': cmd_trimbox}

if __name__ == '__main__':
    if len(sys.argv) < 2 or sys.argv[1] not in COMMANDS:
        sys.exit(usage())
    sys.exit(COMMANDS[sys.argv[1]](sys.argv[2:]))
