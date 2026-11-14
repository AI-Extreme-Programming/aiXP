# Changelog

## [0.1.0](https://github.com/AI-Extreme-Programming/aiXP/compare/v0.0.1...v0.1.0) (2026-11-14)


### Features

* add 6x9 print interior LaTeX template and Pandoc filter ([10fe5b4](https://github.com/AI-Extreme-Programming/aiXP/commit/10fe5b4705bea4c1add78fc0942e08e36c2eea89))
* add book preprocessor for EPUB and print builds ([75a9c10](https://github.com/AI-Extreme-Programming/aiXP/commit/75a9c1027b4740b9badee3e790e57aa5347bfc3d))
* add EPUB stylesheet ([f6b0a62](https://github.com/AI-Extreme-Programming/aiXP/commit/f6b0a6231007ef121cec6400bae98e1d84434933))
* add generated placeholder EPUB cover ([fb38637](https://github.com/AI-Extreme-Programming/aiXP/commit/fb3863794ba846ba1899dc7f7002038ec3ff7a0b))
* add print interior build with Ghostscript PDF/X-1a and layout preflight ([45f74a1](https://github.com/AI-Extreme-Programming/aiXP/commit/45f74a18a571673c3b47273bb9ee2bc295b9efec))
* add project-owned PDF/X-1a:2001 checker with generated fixtures ([015fb1d](https://github.com/AI-Extreme-Programming/aiXP/commit/015fb1d9210d3c9fdb29a6fb2a95bf571a68c27b))
* book publishing pipeline (EPUB3 and PDF/X-1a print interior) ([8553699](https://github.com/AI-Extreme-Programming/aiXP/commit/8553699f2e2a20d4636fd7d810a4eff02c439d93))
* build EPUB and print PDF on PRs and attach them to releases ([798cfd7](https://github.com/AI-Extreme-Programming/aiXP/commit/798cfd7f3b13f62e35f248a252cdde33c0bc0b56))
* build the EPUB3 with Pandoc behind an epubcheck gate ([b0652f8](https://github.com/AI-Extreme-Programming/aiXP/commit/b0652f856274c921330b1abc55131e9b1d3bad87))


### Bug Fixes

* add a manual book build with a downloadable artifact ([7e60b17](https://github.com/AI-Extreme-Programming/aiXP/commit/7e60b179b67dda5a8ce86a8720efb8c74e8649d5))
* align manuscript headings, CLAUDE.md file map, and pillar counts with style guide ([86e7275](https://github.com/AI-Extreme-Programming/aiXP/commit/86e7275ef3dc748e452e2509bf4a1205ad7788f7))
* finish the ScooterGitTemplate setup for aiXP ([fca8e35](https://github.com/AI-Extreme-Programming/aiXP/commit/fca8e35901f30717b2076cc593a2f272321b9706))
* give Mermaid diagram images non-empty alt text ([f273a9f](https://github.com/AI-Extreme-Programming/aiXP/commit/f273a9fb6309e76ee020d27736b436fe08ebe61f))
* install TeX Gyre OpenType fonts from fonts-texgyre ([8bb3acf](https://github.com/AI-Extreme-Programming/aiXP/commit/8bb3acf01967baf138b49330eab2d3c6d2a5a4bb))
* install texlive-fonts-recommended for hyperref's XeTeX driver ([5b04223](https://github.com/AI-Extreme-Programming/aiXP/commit/5b04223b0ef88fc6b1f9f26fba47bdff3efa2fda))
* link to the draft at aixp.scottkirvan.com/aiXP ([ca366c5](https://github.com/AI-Extreme-Programming/aiXP/commit/ca366c58c25b9a0bfff5e31ab2248a7e899aa666))
* loosen print line breaking so long code spans don't overflow the margin ([147754f](https://github.com/AI-Extreme-Programming/aiXP/commit/147754ff06baa4257ab357a3608a762cbce963c0))
* make the print build script pass shellcheck ([159cbed](https://github.com/AI-Extreme-Programming/aiXP/commit/159cbed13eadc5ca5bead04c552491d2e89cee0b))
* mark title page and colophon with EPUB structural semantics ([68da4fb](https://github.com/AI-Extreme-Programming/aiXP/commit/68da4fb994179051ed19aec402dc0dcaa27ec5bd))
* pass secrets to shared workflows by name ([f6dcf17](https://github.com/AI-Extreme-Programming/aiXP/commit/f6dcf1760d6f6aa95fd275855ffecb7a608f6f51))
* place the colophon on the verso of the title page ([8de406c](https://github.com/AI-Extreme-Programming/aiXP/commit/8de406cad68e98796fb44f6219d821e796b7ad88))
* point links at AI-Extreme-Programming/aiXP after the org move ([abba4c6](https://github.com/AI-Extreme-Programming/aiXP/commit/abba4c69bde9655ab0776f69a434a779159c16a5))
* point the Pillar 3 links at the anchor VitePress generates ([9d8983d](https://github.com/AI-Extreme-Programming/aiXP/commit/9d8983dadb326285bd851d2037d152b1785e0640))
* read PDF dictionaries without Dictionary.values for pikepdf 8 ([0f2021c](https://github.com/AI-Extreme-Programming/aiXP/commit/0f2021c13c63c9e99fb815565fe88e4d7449d16c))
* rewrite exponent-form numbers in Mermaid diagram PDFs ([a7e4a02](https://github.com/AI-Extreme-Programming/aiXP/commit/a7e4a021a608e5e9d8f519ef0125acccacb1c254))
* run the manuscript link check on every push to main ([99d6e59](https://github.com/AI-Extreme-Programming/aiXP/commit/99d6e599c2ce90a2cbfd2a23e06cab2d15f8d4c1))
* set diagram text in TeX Gyre Heros and gate font fallback in CI ([e1b1f01](https://github.com/AI-Extreme-Programming/aiXP/commit/e1b1f015ab1cce5a4911337ba1dc696661749530))
* show Ghostscript diagnostics and fail the build if it rasterises a page ([6781e55](https://github.com/AI-Extreme-Programming/aiXP/commit/6781e55ffbad9490bb972227beb6c50a0d63e1a1))
* show the detail lines of Ghostscript warnings ([cd410a6](https://github.com/AI-Extreme-Programming/aiXP/commit/cd410a67ebe589ce51b945b93e724acd9b09240e))
* time out and retry stalled apt downloads in the book toolchain installs ([a622016](https://github.com/AI-Extreme-Programming/aiXP/commit/a622016cee33e9450c1f18f551e8f5d413f4c09d))
* zero sub-micro-point numbers in diagram PDFs so xdvipdfmx writes valid reals ([a355e90](https://github.com/AI-Extreme-Programming/aiXP/commit/a355e9036969cd811fa95425571c5af1ec69a9dd))

## [0.0.1](https://github.com/ScottKirvan/aiXP/compare/v0.0.0...v0.0.1) (2026-10-21)


### Bug Fixes

* repoint homepage links and resync CLAUDE.md after third revert by stale vault backup ([#5](https://github.com/ScottKirvan/aiXP/pull/5))
* repoint homepage start-reading/bibliography links to renamed aixp files ([#2](https://github.com/ScottKirvan/aiXP/pull/2))

## 0.0.0 (2026-08-23)


### Bug Fixes

* todo: in these files breaks docs ([953c540](https://github.com/ScottKirvan/aiXP/commit/953c5408f62999e899208c254b7e62e865553dae))

## Changelog
>[!NOTE]
> This file and it's version format is automatically 
> generated by [Please-Release](https://github.com/googleapis/release-please-action), 
> and adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
