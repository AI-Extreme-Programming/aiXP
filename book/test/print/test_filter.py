"""Tests for the print Pandoc filter (book/templates/latex/print.lua)."""

import subprocess
import unittest

from support import BOOK, require_tool

FILTER = BOOK / 'templates' / 'latex' / 'print.lua'

COLOPHON_MD = """::: {.colophon}
# Colophon {.unnumbered .unlisted}

Version: v1
:::
"""

BOOK_MD = """::: {.title-page}
# Book Title {.unnumbered .unlisted}

A Subtitle

An Author

A Publisher
:::

""" + COLOPHON_MD + """
# Preface {#pre}

Front matter text.

# Chapter 1 - First Things: Why {#ch1}

See [the site](https://example.com/a_b%20c) and <https://example.com/x> and [back](#pre).

Use `--flag=value/path_name` here.[^n]

[^n]: A note with [a link](https://example.com/n).

> [!WARNING]
> Careful.

---

## Section

![](diagram.pdf)

```text
a	b
```

---

Closing.
"""


def to_latex(markdown):
    pandoc = require_tool('pandoc')
    run = subprocess.run([pandoc, '-f', 'markdown', '-t', 'latex', '--top-level-division=chapter',
                          '--lua-filter', str(FILTER)], input=markdown, capture_output=True,
                         text=True, encoding='utf-8')
    if run.returncode != 0:
        raise AssertionError(run.stderr)
    return run.stdout


class PrintFilter(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tex = to_latex(BOOK_MD)

    def test_structure_order(self):
        tex = self.tex
        order = [tex.index(s) for s in ('\\frontmatter', '\\aixptitlepage', '\\aixpcolophon',
                                         '\\aixpcontents', '{Preface}', '\\mainmatter', '{Chapter 1}')]
        self.assertEqual(order, sorted(order))

    def test_contents_follow_title_page_without_colophon(self):
        tex = to_latex(BOOK_MD.replace(COLOPHON_MD, ''))
        self.assertNotIn('\\aixpcolophon', tex)
        self.assertLess(tex.index('\\aixptitlepage'), tex.index('\\aixpcontents'))
        self.assertLess(tex.index('\\aixpcontents'), tex.index('{Preface}'))

    def test_title_page_fields(self):
        self.assertIn('\\aixptitlepage{Book Title}{A Subtitle}{An Author}{A Publisher}', self.tex)

    def test_chapter_label_number_title_running_head(self):
        self.assertIn('\\aixpchapter{Chapter 1}{1}{First Things: Why}{First Things}{ch1}{1}', self.tex)
        self.assertIn('\\aixpchapter{}{}{Preface}{Preface}{pre}{1}', self.tex)

    def test_external_link_gets_url_footnote_and_internal_link_keeps_text(self):
        self.assertIn('the site\\footnote{\\url{https://example.com/a_b\\%20c}}', self.tex)
        self.assertIn('\\url{https://example.com/x}', self.tex)
        self.assertNotIn('\\hyperref', self.tex)
        self.assertIn('and back.', self.tex)

    def test_link_inside_footnote_is_inline(self):
        self.assertIn('a link (\\url{https://example.com/n})', self.tex)

    def test_inline_code_can_break(self):
        self.assertIn('\\texttt{-\\allowbreak{}-\\allowbreak{}flag=\\allowbreak{}value/\\allowbreak{}'
                      'path\\_\\allowbreak{}name}', self.tex)

    def test_code_block_is_wrapping_verbatim_without_tabs(self):
        self.assertRegex(self.tex, r'\\begin\{aixpcode\}\na +b\n\\end\{aixpcode\}')
        self.assertNotIn('\t', self.tex)

    def test_alert_marker_becomes_label(self):
        self.assertIn('\\begin{aixpalert}{Warning}', self.tex)
        self.assertNotIn('[!WARNING]', self.tex)

    def test_rule_before_heading_dropped_other_rule_kept(self):
        self.assertEqual(self.tex.count('\\aixpbreak'), 1)
        self.assertNotIn('\\rule', self.tex)

    def test_sole_image_is_bounded(self):
        self.assertIn('\\aixpimage{diagram.pdf}', self.tex)


if __name__ == '__main__':
    unittest.main()
