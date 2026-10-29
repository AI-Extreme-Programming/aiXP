# aiXP DevOps Publishing Pipeline Design Document

**Status:** Draft  
**Date:** 2026-10-28  
**Author:** aiXP Project Team  
**Deliverables:** Public VitePress Website, Gated EPUB3, Print-Ready Interior PDF/X-1a (6" x 9")

---

## 1. Executive Summary

This document specifies the automated publishing and DevOps architecture for the aiXP project. The pipeline maintains `docs/` as the single source of truth for the core manuscript, compiling it into three distinct publication targets:

1. **Public Web:** Live documentation site built with VitePress and deployed automatically to GitHub Pages.
2. **Digital Book (EPUB3):** Fully formatted electronic book for digital readers and e-commerce distribution.
3. **Print-on-Demand Interior (PDF/X):** A 6" x 9" print-ready interior PDF meeting strict IngramSpark and Amazon KDP preflight specifications (PDF/X-1a:2001 or PDF/X-3, CMYK color space, 100% embedded fonts, exact trim geometry).

Commercial binaries (EPUB and print PDF) remain gated from public distribution, built via GitHub Actions and delivered to private storage, while the public VitePress site deploys continuously.

---

## 2. Architectural Overview

```
                                [ docs/aixp/ ] (Source of Truth)
                                       |
                                       v
                     +-----------------------------------+
                     |  Stage 1: Pre-Processing Pipeline |
                     |  - Resolve <!--@include: ...-->   |
                     |  - Normalize Cross-References     |
                     |  - Compile Mermaid to Vector Imgs |
                     |  - Inject Version, Date, Metadata |
                     +-----------------------------------+
                                       |
        +------------------------------+------------------------------+
        |                                                             |
        v                                                             v
+-------------------------------+                             +-------------------------------+
| Stage 2A: EPUB3 Compiler      |                             | Stage 2B: Print PDF/X Engine  |
| - Pandoc (EPUB3)              |                             | - Pandoc + XeLaTeX            |
| - book/styles/epub.css        |                             | - book/templates/interior.tex |
| - Embedded Front Cover        |                             | - 6" x 9" Trim & Gutter       |
| - NCX & Nav Table of Contents |                             | - CMYK / Embedded Vector Art  |
+-------------------------------+                             +-------------------------------+
        |                                                             |
        v                                                             v
+-------------------------------+                             +-------------------------------+
| Stage 3A: EPUB Preflight      |                             | Stage 3B: PDF/X Preflight     |
| - epubcheck (W3C Validation)  |                             | - pdffonts (100% embedded)    |
| - HTML5 / CSS linting         |                             | - pdfinfo (trim & bleed check)|
|                               |                             | - Ghostscript PDF/X Validator |
+-------------------------------+                             +-------------------------------+
        |                                                             |
        +------------------------------+------------------------------+
                                       |
                                       v
                     +-----------------------------------+
                     | Stage 4: Artifact Distribution    |
                     | - Gated / Private Storage Delivery|
                     |   (Cloudflare R2 / Private Host)  |
                     | - GitHub Releases: Clean (No      |
                     |   public binary book downloads)   |
                     +-----------------------------------+
```

---

## 3. Core Requirements & Constraints

### 3.1 Content & Single Source of Truth
- **Manuscript Source:** All content resides under `docs/aixp/`.
- **Book-Specific Elements:** Cover art, colophon/copyright pages, dedication, and padding pages reside under a dedicated `book/` directory.
- **VitePress Directives:** Markdown files make extensive use of VitePress `<!--@include: ./file.md-->` directives. These must be resolved and assembled recursively before passing to Pandoc.
- **Cross-References:** Web-style URLs (e.g., `/aixp/01.00-manifesto`) must be converted to internal anchor identifiers for both EPUB and PDF builds.

### 3.2 Typography & Fonts
- **Constraint:** Use a 100% open-source, commercially permissive font stack with complete vector glyph outlines to guarantee license safety and seamless PDF/X embedding.
- **Body Serif:** TeX Gyre Pagella (or EB Garamond).
- **Headings (Sans):** TeX Gyre Heros (or Inter / Source Sans 3).
- **Code (Monospace):** JetBrains Mono or Fira Code.

### 3.3 Visuals & Diagrams
- **Mermaid Source:** Diagrams authored in markdown using ```mermaid blocks (Chapters 4 and 5) must be extracted and compiled during pre-processing using `@mermaid-js/mermaid-cli`.
- **Target Formats:**
  - PDF: Vector PDF or SVG for infinite scaling at print resolution (300+ DPI equivalent).
  - EPUB: Clean SVG or high-resolution PNG with dark/light legibility.

### 3.4 Print Interior Specifications (IngramSpark & Amazon KDP)
- **Trim Size:** 6.0" x 9.0" (152.4 mm x 228.6 mm).
- **Standards:** PDF/X-1a:2001 (preferred for flat CMYK) or PDF/X-3.
- **Margins & Gutter:**
  - Inside (Gutter): 0.75" to 0.875" (calculated to accommodate spine binding).
  - Outside: 0.625".
  - Top / Bottom: 0.75".
- **Color Space:** CMYK device color space using standard ICC profile (e.g., US Web Coated SWOP v2 or GRACoL). Zero RGB elements permitted in the final PDF stream.
- **Fonts:** 100% fully embedded (no subsetting failures or system-dependent fallbacks).
- **Cover Separation:** The automated PDF engine generates strictly the **interior manuscript**. The wrap-around cover PDF (front + spine + back) is created separately against the exact spine width template provided by IngramSpark once final page counts are locked.

---

## 4. Repository Layout

Book-specific configuration and assets will live in a dedicated `book/` top-level directory:

```
aiXP/
├── .github/
│   ├── workflows/
│   │   ├── docs.yml                  # Continuous VitePress deployment to GitHub Pages
│   │   ├── book-ci.yml               # PR validation and manual workflow_dispatch test builds
│   │   └── release.yml               # release-please orchestration and production book compilation
├── book/
│   ├── assets/
│   │   ├── cover-front.png           # EPUB cover image (RGB, 1600x2560)
│   │   ├── logo.svg                  # Publisher / imprint vector logo
│   │   └── icc/                      # CMYK color profiles (e.g. USWebCoatedSWOP.icc)
│   ├── frontmatter/
│   │   ├── title-page.md             # Book half-title and full title page
│   │   ├── colophon.template.md      # Copyright, ISBN, edition, and metadata placeholders
│   │   └── dedication.md             # Dedication / epigraph
│   ├── backmatter/
│   │   └── about-the-author.md       # Author bio and project notes
│   ├── styles/
│   │   └── epub.css                  # Custom styling for EPUB3 readers
│   ├── templates/
│   │   └── latex/
│   │       ├── interior.tex          # Master LaTeX template (6x9 geometry, headers, folios)
│   │       └── pdfx.opt              # PDF/X configuration and metadata mapping
│   └── scripts/
│       ├── preprocess.js             # Resolves @include, rewrites links, extracts Mermaid
│       └── preflight-verify.sh       # Runs epubcheck, pdffonts, and Ghostscript validation
├── docs/
│   ├── .vitepress/
│   │   └── config.mts
│   └── aixp/                         # Single source of truth for manuscript content
└── notes/
    └── dev/
        └── devops-publishing-pipeline-design.md
```

---

## 5. Build & Pre-Processing Pipeline

The compilation sequence consists of three tightly integrated steps executed in a reproducible environment:

### Step 1: Pre-Processing (`book/scripts/preprocess.js`)
1. Reads `docs/.vitepress/config.mts` to extract the canonical chapter ordering.
2. Ingests `book/frontmatter/`, followed by the sequenced `docs/aixp/` files, followed by `book/backmatter/`.
3. Recursively parses and resolves all `<!--@include: ./subfile.md-->` directives into a unified document tree.
4. Identifies all ````mermaid` blocks:
   - Invokes `@mermaid-js/mermaid-cli` (`mmdc`) with a clean print configuration.
   - Emits standalone vector PDF files for the LaTeX pipeline and SVG/PNG files for the EPUB pipeline.
   - Replaces the code blocks with markdown image references.
5. Injects metadata:
   - **Printed Page:** Injects human-readable Version (`vX.Y.Z`) and Publication Date into `book/frontmatter/colophon.template.md`.
   - **XMP Metadata:** Writes the Git commit SHA, ISO timestamp, and build environment into document properties without showing it on the printed text.

### Step 2: Format Compilation
- **EPUB3 Output:**
  ```bash
  pandoc unified-manuscript.md \
    --to epub3 \
    --epub-cover-image=book/assets/cover-front.png \
    --css=book/styles/epub.css \
    --metadata-file=book/metadata.yaml \
    --toc --toc-depth=2 \
    -o dist/aixp-v1.0.0.epub
  ```
- **Print PDF/X-1a Output:**
  ```bash
  pandoc unified-manuscript.md \
    --to latex \
    --template=book/templates/latex/interior.tex \
    --pdf-engine=xelatex \
    --top-level-division=chapter \
    -o dist/aixp-v1.0.0-print-6x9.pdf
  ```

---

## 6. Quality Gates & Preflight Validation (CI)

To prevent rejected ingest by IngramSpark and Amazon KDP, the CI workflow enforces automated preflight checks. Any validation failure terminates the build immediately:

1. **Link & Include Integrity:**
   - Pre-processor verifies that every `<!--@include: ...-->` path exists on disk.
   - Verifies that all internal links resolve to valid chapter anchors.
2. **EPUB Compliance (`epubcheck`):**
   - Official W3C validator checks IDPF compliance, well-formed XML, navigation landmarks, and image references.
   - Command: `epubcheck dist/*.epub`
3. **PDF Font Embedding Check (`pdffonts`):**
   - Asserts that every font utilized in the PDF interior is embedded (column `emb` must be `yes` for all rows).
   - Fails if any system font remains un-embedded or substituted.
4. **PDF Trim & Geometry Check (`pdfinfo`):**
   - Asserts that MediaBox and TrimBox equal exactly 6.00 x 9.00 inches (432 x 648 pt) or the specified bleed dimensions.
5. **Ghostscript PDF/X Compliance Validation:**
   - Runs Ghostscript preflight against the PDF/X definition file (`PDFX_def.ps`) to verify CMYK compliance, absence of forbidden transparency operators, and embedded ICC output intents.

---

## 7. Workflow Lifecycle & Triggers

### 7.1 Web Deployment (`.github/workflows/docs.yml`)
- **Trigger:** Push to `main` affecting `docs/**`.
- **Action:** Runs `npm run docs:build` and deploys static HTML directly to GitHub Pages.
- **Status:** Already active via `reusable-docs-deploy.yml`.

### 7.2 Pull Request & Proofing CI (`.github/workflows/book-ci.yml`)
- **Triggers:**
  - Pull requests modifying `docs/**` or `book/**`.
  - Manual trigger via `workflow_dispatch`.
- **Action:**
  - Executes Markdown linting and dead link checks.
  - Runs the complete pre-processing script.
  - Builds test EPUB and PDF/X artifacts.
  - Executes the full preflight test suite (`epubcheck`, `pdffonts`, `pdfinfo`).
  - Uploads compiled binaries as temporary GitHub Actions run artifacts (retention: 7 days) so the author can download and inspect formatting changes.

### 7.3 Production Release Workflow (`.github/workflows/release.yml`)
- **Trigger:** Push to `main` where `release-please` cuts a new version tag (`release_created == 'true'`).
- **Action:**
  - Extracts the authoritative semantic version (`tag_name`).
  - Executes production build with strict version stamping.
  - Runs all preflight gates.
  - **Modular Delivery Step:** Uploads production EPUB and 6x9 PDF/X to the configured private location (e.g., Cloudflare R2 bucket via S3 API or private server via SSH/SCP).
  - **Release Hygiene:** The public GitHub Release created by `release-please` contains release notes, changelog updates, and documentation links, but **no** commercial book binaries.

---

## 8. Open Items & Future Steps

1. **Storage Credential Provisioning:** Select and configure the private destination secret (`CLOUDFLARE_R2_ACCESS_KEY` or `PRIVATE_HOST_KEY`) when distribution infrastructure is ready.
2. **Colophon Metadata Draft:** Finalize publisher imprint name, cataloging-in-publication text, and ISBN assignment numbers.
3. **IngramSpark Proofing:** Once the interior manuscript reaches page-lock, upload the generated PDF to IngramSpark to obtain the exact spine width template for wrap-around cover artwork.
