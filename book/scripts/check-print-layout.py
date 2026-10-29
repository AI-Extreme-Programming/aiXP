#!/usr/bin/env python3
"""Printer-facing layout preflight: pdffonts, pdfinfo -box, even page count, safe zone.

Usage: check-print-layout.py <file.pdf>
Exit status: 0 when every rule passes, 1 when any fails, 2 when a tool cannot run.
"""

import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from print_pdf import layout  # noqa: E402
from print_pdf.tools import find_gs  # noqa: E402


def run(args):
    result = subprocess.run(args, capture_output=True, text=True, errors='replace')
    if result.returncode != 0:
        raise RuntimeError(f'{args[0]} exited with {result.returncode}')
    return result.stdout + result.stderr


def main(argv):
    if len(argv) != 1:
        print(__doc__.strip(), file=sys.stderr)
        return 2
    path = argv[0]
    try:
        count, _ = layout.parse_pdfinfo_boxes(run(['pdfinfo', path]))
        if count is None:
            raise RuntimeError('pdfinfo reported no page count')
        problems = {
            'pdffonts-embedded': layout.check_pdffonts(run(['pdffonts', path])),
            'pdfinfo-boxes': layout.check_pdfinfo_boxes(run(['pdfinfo', '-box', '-f', '1', '-l', str(count), path])),
            'even-pages': layout.check_even(count),
            'safe-zone': layout.check_safe_zone(layout.parse_bbox(run(
                [find_gs(), '-dSAFER', '-dBATCH', '-dNOPAUSE', '-dQUIET', '-sDEVICE=bbox', path])), count),
        }
    except (RuntimeError, FileNotFoundError, ValueError) as error:
        print(f'check-print-layout: cannot check {path}: {error}', file=sys.stderr)
        return 2
    print(f'check-print-layout: {path} ({count} pages)')
    for rule, messages in problems.items():
        if not messages:
            print(f'  PASS {rule}')
            continue
        print(f'  FAIL {rule}: {layout.RULES[rule]}')
        for message in messages[:8]:
            print(f'       - {message}')
        if len(messages) > 8:
            print(f'       - ... and {len(messages) - 8} more')
    failed = [rule for rule, messages in problems.items() if messages]
    if failed:
        print(f'check-print-layout: FAILED {", ".join(failed)}')
        return 1
    print(f'check-print-layout: passed all {len(problems)} rules')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
