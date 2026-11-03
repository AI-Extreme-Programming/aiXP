#!/usr/bin/env python3
"""Checks a print interior against the project's PDF/X-1a:2001 rules.

Usage: check-pdfx.py [--list-rules] <file.pdf>

Exit status: 0 when every rule passes, 1 when any rule fails, 2 on usage or read errors.
This is not a certified validator; see book/scripts/print_pdf/pdfx.py.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from print_pdf.pdfx import RULES, check_pdf, report_lines  # noqa: E402


def main(argv):
    if argv == ['--list-rules']:
        for rule, description in RULES.items():
            print(f'{rule}: {description}')
        return 0
    if len(argv) != 1 or argv[0].startswith('-'):
        print(__doc__.strip(), file=sys.stderr)
        return 2
    path = argv[0]
    try:
        result = check_pdf(path)
    except Exception as error:  # an unreadable file must fail the gate, with the reason
        print(f'check-pdfx: cannot check {path}: {type(error).__name__}: {error}', file=sys.stderr)
        return 2
    print(f'check-pdfx: {path}')
    for line in report_lines(result):
        print(line)
    failed = result.failed_rules
    if failed:
        print(f'check-pdfx: FAILED {len(failed)} of {len(RULES)} rules: {", ".join(failed)}')
        return 1
    print(f'check-pdfx: passed all {len(RULES)} rules (not a certified preflight)')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
