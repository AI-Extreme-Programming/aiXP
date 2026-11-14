"""Shared helpers for the print tests."""

import os
import shutil
import sys
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
BOOK = HERE.parents[1]
ROOT = BOOK.parent
SCRIPTS = BOOK / 'scripts'
for entry in (str(SCRIPTS), str(HERE)):
    if entry not in sys.path:
        sys.path.insert(0, entry)


def require_tool(*names):
    """Returns the first tool found. CI sets AIXP_REQUIRE_PRINT_TOOLS=1 so a missing
    tool fails the suite there instead of silently skipping the test."""
    for name in names:
        if shutil.which(name):
            return name
    message = f'{" or ".join(names)} not installed'
    if os.environ.get('AIXP_REQUIRE_PRINT_TOOLS') == '1':
        raise AssertionError(message)
    raise unittest.SkipTest(message)
