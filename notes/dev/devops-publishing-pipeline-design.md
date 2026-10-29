# aiXP DevOps Publishing Pipeline Design Document

**Status:** Draft v4 (implemented, interim mode)  
**Date:** 2026-10-28  
**Publisher (placeholder):** Sptifyre Publishing  
**Deliverables:** Public VitePress site, private EPUB3, private print-ready interior PDF/X-1a (paperback, 6" x 9")

---

## 1. Executive Summary

This document specifies the automated publishing pipeline for the aiXP manuscript. `docs/aixp/` is the single source of truth for the manuscript. The pipeline compiles it into three outputs:

1. **Public web:** the VitePress site, deployed from `main` to GitHub Pages on every push. It does not depend on tags or releases.
2. **Digital book (EPUB3):** built for ebook distribution. Built binaries are private.
3. **Print interior (PDF/X-1a:2001):** a 6" x 9" paperback interior, built for IngramSpark. Built binaries are private.

**Public-output rule:** built binaries (EPUB, print PDF) never appear in a public location. That means no GitHub Actions artifacts, no GitHub Release assets, and no logs that print manuscript content. The public GitHub Release created by release-please contains release notes and changelog only.

**Interim mode (in effect from 2026-10-28):** until the build moves to the private self-hosted runner, the book builds on GitHub-hosted runners and the EPUB and print PDF are attached to the public release-please GitHub Release. This is an explicit, temporary exception to the public-output rule above, decided by the author. Actions artifacts stay off in interim mode. Section 9 lists what changes when the build moves.

---

## 2. Decisions Recorded

| Topic | Decision |
|---|---|
| Public outputs | VitePress site from `main`. GitHub Releases with notes only. |
| Built binaries | Private only. Never in Actions artifacts or Release assets. Interim: attached to the public GitHub Release (section 9). |
| Build host | Private self-hosted runner on the author's machine. Interim: GitHub-hosted `ubuntu-latest` (section 9). |
| Book build trigger | release-please release on `main` (`release_created == 'true'`), plus `workflow_dispatch` for manual rebuilds. |
| Print format | Paperback only. Hardcover is out of scope and will be revisited separately. |
| Trim | 6.0" x 9.0" (432 x 648 pt), exact trim, no bleed. |
| Print standard | PDF/X-1a:2001. |
| Color | CMYK for images. Text in 100% black. |
| Print validator | Project-owned PDF/X-1a check script. veraPDF validates PDF/A, PDF/UA, and WTPDF only, and has no PDF/X profile. Ghostscript generates the PDF/X output and is not used as the validator. |
| Printer | IngramSpark. No outreach yet. |
| Margins | Inside (gutter) 0.75" to 0.875" depending on page count. Outside 0.625". Top and bottom 0.75". |
| Imprint | Sptifyre Publishing (placeholder, confirmed spelling). |
| ISBN | Publisher-owned ISBNs. |
| CIP data | Not included for now. |
| EPUB targets | Amazon KDP (Kindle), Leanpub, and direct sales. |
| Direct sales | Ko-fi shop, which delivers files to buyers on purchase. |
| Direct-sales PDF | A reading PDF, separate from the print PDF. The print PDF is never sold to readers. |
| IngramSpark print wholesale | Deferred. Print-on-demand orders only for now. |

---

## 3. Architectural Overview

```
                                [ docs/aixp/ ] (Source of Truth)
                                       |
                                       v
                     +-----------------------------------+
                     |  Stage 1: Pre-Processing          |
                     |  - Resolve <!--@include: ...-->   |
                     |  - Normalize cross-references     |
                     |  - Compile Mermaid to vector/PNG  |
                     |  - Inject version, date, metadata |
                     +-----------------------------------+
                                       |
        +------------------------------+------------------------------+
        |                                                             |
        v                                                             v
+-------------------------------+                             +-------------------------------+
| Stage 2A: EPUB3 Compiler      |                             | Stage 2B: Print PDF/X-1a      |
| - Pandoc (EPUB3)              |                             | - Pandoc + XeLaTeX (RGB PDF)  |
| - book/styles/epub.css        |                             | - Ghostscript: CMYK + PDF/X-1a|
| - Embedded front cover        |                             | - book/templates/latex/*.tex  |
| - Nav table of contents       |                             | - 6" x 9" trim, no bleed      |
+-------------------------------+                             +-------------------------------+
        |                                                             |
        v                                                             v
+-------------------------------+                             +-------------------------------+
| Stage 3A: EPUB Preflight      |                             | Stage 3B: PDF/X Preflight     |
| - epubcheck                   |                             | - pdffonts (all embedded)     |
|                               |                             | - pdfinfo -box (trim check)   |
|                               |                             | - PDF/X-1a check script       |
+-------------------------------+                             +-------------------------------+
        |                                                             |
        +------------------------------+------------------------------+
                                       |
                                       v
                     +-----------------------------------+
                     | Stage 4: Private Delivery         |
                     | - Destination TBD (section 8)     |
                     | - Never public                    |
                     +-----------------------------------+
```

---

## 4. Core Requirements

### 4.1 Content and Single Source of Truth
- **Manuscript source:** `docs/aixp/`. The manuscript is 00.x (front matter), 01.00 to 09.00 (chapters), and 10.x (back matter: appendix and bibliography).
- **Reading order:** taken from the sidebar in `docs/.vitepress/config.mts`, not from filenames or a second list.
- **Book-specific elements:** title page, colophon, cover, styles, and templates live under `book/`.
- **VitePress directives:** `<!--@include: ./file.md-->` is resolved recursively before Pandoc runs.
- **Include directives:** currently used in `00.01` (includes `00.02`, `00.03`) and `00.10` (includes `00.11` to `00.13`). Included files are not in the sidebar and appear only where included.
- **Cross-references:** the manuscript links between chapters with relative links (e.g. `03.00-terminal-loop.md#test-driven-development-tdd`, or a bare `03.00-terminal-loop.md`). Web-style links (e.g. `/aixp/01.00-manifesto`) are also accepted. Both are rewritten to internal anchors for the EPUB and PDF builds. Heading IDs are made unique per chapter so anchors do not collide once chapters are concatenated.

### 4.2 Typography and Fonts
- **Constraint:** open-source fonts with complete vector outlines, licensed for commercial embedding.
- **Body serif:** TeX Gyre Pagella (or EB Garamond).
- **Headings (sans):** TeX Gyre Heros (or Inter / Source Sans 3).
- **Code (monospace):** JetBrains Mono or Fira Code.
- **Build environment:** the TeX Gyre fonts must be installed on the self-hosted runner.

### 4.3 Diagrams
- **Source:** ` ```mermaid ` blocks in any manuscript file. They currently appear in `04.00` and `05.00`.
- **Web site:** VitePress has no Mermaid plugin configured, so these blocks currently render as code on the public site. That is tracked separately from this pipeline.
- **Compilation:** `@mermaid-js/mermaid-cli` (`mmdc`), which needs a headless Chromium on the runner.
- **Targets:** vector PDF for the print interior (300+ DPI equivalent); clean SVG or high-resolution PNG for the EPUB.

### 4.4 Print Interior Specification (IngramSpark)
- **Trim size:** 6.0" x 9.0" (152.4 mm x 228.6 mm), exact trim, no bleed. MediaBox and TrimBox must both be 432 x 648 pt.
- **Standard:** PDF/X-1a:2001. IngramSpark's file creation guide lists PDF/X-1a:2001 or PDF/X-3:2002 as acceptable.
- **Margins:**
  - Inside (gutter): 0.75" to 0.875", set from the page count and the printer's binding table once the page count is known.
  - Outside: 0.625".
  - Top and bottom: 0.75".
  - Check: every margin must be at least 0.5" from trim, which is IngramSpark's recommended safe zone.
- **Color:** CMYK for all images. Text in 100% black. No RGB objects in the final PDF.
- **Fonts:** all embedded. No substitution.
- **Other IngramSpark rules:** no crop, registration, or printer marks. Page count padded to an even number.
- **Scope:** the PDF is the interior manuscript only. The wrap-around cover is a separate file, built against IngramSpark's spine-width template once the page count is locked.

---

## 5. Repository Layout

Existing workflows are kept. `release.yml` is extended, not replaced.

```
aiXP/
├── .github/
│   ├── release-please/               # existing release-please config and manifest
│   └── workflows/
│       ├── docs.yml                  # existing: VitePress deploy to GitHub Pages
│       ├── release.yml               # existing: release-please; extended with build-book job
│       ├── pre-release-staging.yml   # existing: staged release notes
│       ├── update-starline.yml       # existing
│       ├── book-build.yml            # reusable book build (workflow_call)
│       └── book-ci.yml               # PR checks (see section 7.2)
├── book/
│   ├── package.json                  # book tooling, separate from docs/package.json
│   ├── assets/
│   │   ├── cover-front.png           # EPUB cover image (RGB, 1600x2560; placeholder)
│   │   └── icc/output-intent.json    # names and pins the CMYK output-intent profile (see section 8)
│   ├── config/                       # Mermaid and Puppeteer settings for mmdc
│   ├── frontmatter/
│   │   ├── title-page.md             # title page
│   │   └── colophon.template.md      # copyright, ISBN, edition, and version placeholders
│   ├── metadata.yaml                 # Pandoc metadata for EPUB and PDF
│   ├── styles/
│   │   └── epub.css
│   ├── templates/
│   │   └── latex/
│   │       ├── interior.tex          # 6x9 geometry, headers, folios, fonts
│   │       ├── print.lua             # Pandoc filter for print typesetting
│   │       └── pdfx-def.ps.in        # Ghostscript PDF/X definition (output intent, Info keys)
│   ├── scripts/
│   │   ├── preprocess.js (+ lib/)    # sidebar order, includes, links, Mermaid, metadata
│   │   ├── build-epub.js             # EPUB build, epubcheck gate, structure gate
│   │   ├── generate-epub-cover.js    # regenerates the placeholder cover
│   │   ├── build-print.sh            # print interior: LaTeX, Ghostscript PDF/X-1a, preflight
│   │   ├── print-helper.py           # diagram normalisation, ICC, PDF/X def, TrimBox fix-up
│   │   ├── check-pdfx.py             # PDF/X-1a conformance checks (project-owned)
│   │   ├── check-print-layout.py     # fonts embedded, boxes, even pages, safe zone
│   │   ├── print_pdf/                # Python modules behind the print scripts
│   │   └── ci/install-{epub,print}-tools.sh  # pinned toolchain installs for ubuntu-latest
│   └── test/                         # node:test suites; test/print/ holds Python unittest suites
├── docs/
│   ├── .vitepress/
│   │   └── config.mts
│   └── aixp/                         # manuscript source of truth
└── notes/
    └── dev/
        └── devops-publishing-pipeline-design.md
```

Build output goes to `dist/`, which is git-ignored and never uploaded as an Actions artifact.

---

## 6. Build Pipeline

### Step 1: Pre-Processing (`book/scripts/preprocess.js`)
1. Reads the sidebar in `docs/.vitepress/config.mts` for the chapter order (parsed, not executed).
2. Assembles, in order: `book/frontmatter/title-page.md`, the sidebar-ordered `docs/aixp/` files, then the colophon.
3. Recursively resolves `<!--@include: ...-->` directives. A missing include or an include cycle fails the build.
4. Rewrites internal links to chapter-prefixed heading IDs (`ch-<file-slug>--<vitepress-slug>`). An unresolvable link fails the build.
5. Compiles each ` ```mermaid ` block with `mmdc` (vector PDF for print, SVG for EPUB) and replaces the block with an image reference. Alt text comes from the diagram's `accTitle`/`accDescr` when present; otherwise it names the diagram type and section. Diagram text is set in TeX Gyre Heros.
6. Injects version (`vX.Y.Z`) and publication date into the colophon. The Git SHA and build timestamp go into document metadata, not printed text.
7. Writes `dist/<target>/unified-manuscript.md` per target. `--check` validates includes and links without writing output.

### Step 2A: EPUB3 (`node book/scripts/build-epub.js`)
```bash
pandoc dist/epub/unified-manuscript.md \
  --to epub3 \
  --epub-cover-image=book/assets/cover-front.png \
  --css=book/styles/epub.css \
  --metadata-file=book/metadata.yaml \
  --metadata-file=dist/epub/epub-metadata.yaml \
  --epub-title-page=false --split-level=1 \
  --toc --toc-depth=2 --fail-if-warnings \
  -o dist/aixp-<version>.epub
```
The generated `epub-metadata.yaml` supplies the typed title and subtitle and the identifier. The identifier is `urn:isbn:` when `metadata.yaml` has a valid ISBN-13, and otherwise a stable name-based UUID (open item 9).

### Step 2B: Print PDF/X-1a (`bash book/scripts/build-print.sh [--gutter 0.75in]`)
1. Diagram PDFs are normalised for PDF/X-1a: transparency groups and partial alpha are removed, and neutral RGB becomes Gray. Soft masks and blend modes fail the build.
2. Pandoc writes LaTeX with `book/templates/latex/interior.tex` and `print.lua`. The script runs XeLaTeX itself so LaTeX logs, which can quote the manuscript, stay in `dist/print/logs/`. A missing glyph is a hard error.
3. Ghostscript converts to CMYK PDF/X-1a:2001 (`-dPDFX`, `-dCompatibilityLevel=1.3`, `-sColorConversionStrategy=CMYK`), using `pdfx-def.ps.in` rendered with the output intent and Info keys. Text stays DeviceGray, which is 100% K. If Ghostscript writes ArtBox in place of TrimBox (seen with 10.07 and `-dPDFX=1`), a pikepdf step renames it.
4. Output: `dist/aixp-<version>-print-6x9.pdf`.

---

## 7. Quality Gates and CI

### 7.1 Web Deployment (`docs.yml`, existing)
- **Trigger:** push to `main` affecting `docs/**`.
- **Action:** `npm run docs:build`, deployed to GitHub Pages. No tags or releases involved.

### 7.2 Pull Request Checks (`book-ci.yml`)
- **Triggers:** pull requests touching `docs/**`, `book/**`, the book workflows, or `notes/VERSION.md`.
- **Runner:** GitHub-hosted. Self-hosted runners do not run on pull requests, because fork PRs would execute code on the author's machine.
- **Action:** preprocessor unit tests, `@include` path check, and internal link check.
- **Interim:** while the build is GitHub-hosted, PR checks also run the full book build and preflight (via `book-build.yml`) without uploading anything, so a PR that breaks the book fails before merge.
- **Artifacts:** none.

### 7.3 Book Build (`release.yml`, extended)
- **Triggers:**
  - push to `main` where release-please creates a release (`release_created == 'true'`).
  - `workflow_dispatch` with the `book_tag` input for a manual rebuild of an existing tag. This skips release-please and the release-notes jobs.
- **Jobs:**
  - `release-please` (existing) runs on GitHub-hosted `ubuntu-latest` and outputs `release_created` and `tag_name`.
  - `build-book` (new) runs on `[self-hosted, book-builder]`, depends on `release-please`, and is gated on `release_created`. It checks out `tag_name`, runs sections 6 and 8, and delivers to private storage. Interim: it calls `book-build.yml` on `ubuntu-latest` and uploads the EPUB and print PDF to the release for `tag_name`.
  - Existing jobs (`apply-staged-notes`, `improve-release-notes`, `update-changelog-prs`, `discord-notify`) keep their current dependencies. The book build is not a dependency of any of them.
- **Failure behavior:** a failed build leaves the GitHub Release published with notes and no binaries. A manual `workflow_dispatch` run with `book_tag` rebuilds the files for that tag.
- **Public Release contents:** release notes and changelog only. Interim: plus the EPUB and print PDF (section 9).

### 7.4 Preflight Checks (run inside `book-build.yml`)
1. **Include and link integrity:** every `@include` path exists, and every internal link resolves to a chapter anchor.
2. **EPUB:** epubcheck 5.4.0 with `--failonwarnings`; any fatal error, error, or warning fails the build. A structure gate also requires: TOC chapters in sidebar order, every internal link resolving, non-empty alt text on every image, a cover image, and title page and colophon sections marked with `epub:type`.
3. **Fonts:** `pdffonts` reports `emb` as `yes` for every row.
4. **Trim:** `pdfinfo -box dist/aixp-<version>-print-6x9.pdf` reports MediaBox and TrimBox as 432 x 648 pt. Plain `pdfinfo` does not print TrimBox, so `-box` is required.
5. **Layout:** even page count, and every mark on every page at least 0.5" (36 pt) inside the trim (Ghostscript bounding boxes). The build also fails if Ghostscript rasterises a page (more images after conversion than before).
6. **PDF/X-1a conformance:** the project-owned checker (`book/scripts/check-pdfx.py`). Any failure stops the build. Rules: PDF 1.3 or earlier; `GTS_PDFXVersion` is `PDF/X-1:2001` and `GTS_PDFXConformance` is `PDF/X-1a:2001`; exactly one `GTS_PDFX` OutputIntent with an identifier and an embedded CMYK output ICC profile; no RGB, CalRGB, CalGray, Lab, or ICC-based colour anywhere (content, images, inline images, shadings, forms, Indexed bases, Separation/DeviceN alternates); no transparency (soft masks, non-Normal blend modes, alpha below 1, transparency groups); no transfer functions; no PostScript XObjects; all fonts embedded; no encryption; Info has Title, CreationDate, and ModDate; `Trapped` is `True` or `False`; the trailer has an `/ID`; MediaBox and TrimBox equal 432 x 648 pt with no ArtBox; no annotations inside the TrimBox except PrinterMark or TrapNet. House rule beyond PDF/X: text is painted in K only, never rich black. Each rule has a fixture PDF that violates only that rule and must fail, plus conforming fixtures that must pass.
   - **Not checked:** overprint and OPM, ink coverage, image resolution, hairline widths, halftones, font licensing flags, JavaScript and actions, PDF syntax beyond what qpdf parses, XMP, and whether the output intent suits the press. Whether ISO 15930-1 itself forbids ArtBox alongside TrimBox has not been checked against the standard.
   - This is not a certified validator. Before files go to IngramSpark, a certified preflight (IngramSpark's own upload checks, or Acrobat/callas) remains the final check.

---

## 8. Open Items

1. **Private delivery destination.** Ko-fi is the direct-sales channel, but the build still needs a private store to upload to, and Ko-fi needs the files uploaded to its shop. Whether the store is Cloudflare R2, a private host over SSH, or a manual upload to Ko-fi is still open. Interim: files go to the public GitHub Release (section 9).
2. **CMYK ICC profile.** Choose the output intent profile (e.g. US Web Coated SWOP v2 or GRACoL) and confirm that IngramSpark accepts it. Interim: the build uses Ghostscript's bundled `default_cmyk.icc` (pinned by SHA-256 in `book/assets/icc/output-intent.json`) and says so in the build log.
3. **Gutter value.** Set the gutter from the page count and IngramSpark's binding guidance once the manuscript is laid out. The build takes `--gutter` (default 0.75") and rejects values under 0.5".
4. **IngramSpark cover template.** Once the page count is locked, upload the interior to IngramSpark to get the spine-width template for the wrap-around cover. The cover is not part of this pipeline.
5. **EPUB retailer checks.** Targets are KDP, Leanpub, and Ko-fi (direct). Their specific upload and metadata rules still need checking against each platform's current docs before the metadata and preflight are final. Also check whether KDP and IngramSpark ebook distribution can both list the same ebook, and how KDP's conversion renders the SVG diagrams (Kindle Previewer). Print wholesale through IngramSpark is deferred.
6. **PR checks on GitHub-hosted runners.** Confirmed 2026-10-28 (section 7.2).
7. **Hardcover.** Out of scope. Revisit the procedure separately.
8. **CIP data.** Out of scope for now. Library and Archives Canada handles CIP for Canadian publishers if you add it later.
9. **Colophon details.** The ISBN, edition, rights statement, and any final imprint wording are placeholders until the book is ready for print. Until a valid ISBN-13 is in `book/metadata.yaml`, the EPUB identifier is a stable name-based UUID.
10. **Verify before implementation:** IngramSpark's margin figures come from search snippets of their August 2026 file creation guide, not a full read. Check the full guide before the margin values are final.
11. **Cover.** `book/assets/cover-front.png` is a generated placeholder until the real cover exists.
12. **Reading PDF for Ko-fi.** Deferred by the author on 2026-10-28; not part of the first build.
13. **Diagram alt text.** Neither diagram has `accTitle`/`accDescr` yet, so both use generated alt text ("Flowchart: <section>"). Descriptive alt text is the author's to write.
14. **Colophon position.** The colophon is at the end of the book, as section 4.1 specifies. Print books commonly put the copyright page on the verso of the title page.
15. **Print typographic interpretations to confirm:** "Chapter N - Title" headings render as a "Chapter N" label above the title; `> [!NOTE]` alerts become labelled asides (print only; the EPUB does not convert them yet); external links print their URL as a footnote; horizontal rules directly before a heading are dropped.

---

## 9. Interim Mode and Migration to the Self-Hosted Runner

Interim mode (section 1) differs from the target design in three places. Moving to the private runner reverses each:

1. `build-book` in `release.yml` changes `runs-on` from `ubuntu-latest` to `[self-hosted, book-builder]`, and the toolchain install steps are replaced by a provisioned runner.
2. The release upload step is replaced by private delivery (open item 1). Release assets already published stay public unless deleted by hand.
3. `book-ci.yml` stops running the full book build, because self-hosted runners do not run PR code (section 7.2).

---

## 10. Sources

- IngramSpark File Creation Guide (Aug 2026): https://www.ingramspark.com/hubfs/downloads/file-creation-guide.pdf
- IngramSpark, File Requirements for Print Books: https://www.ingramspark.com/blog/file-requirements-for-print-books
- IngramSpark Trim Size Matrix: https://www.ingramspark.com/hubfs/downloads/trim-sizes.pdf
