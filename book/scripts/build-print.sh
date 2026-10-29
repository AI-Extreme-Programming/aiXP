#!/usr/bin/env bash
# Builds the 6 x 9 in paperback interior as PDF/X-1a:2001 and runs the print preflight.
#
# Usage (from anywhere; paths resolve from the repository root):
#   book/scripts/build-print.sh [--version vX.Y.Z] [--date YYYY-MM-DD] [--git-sha SHA] [--gutter 0.75in]
#
# Output: dist/aixp-<version>-print-6x9.pdf. Intermediates and tool logs go to dist/print/.
# The console only ever shows step summaries; tool logs that can quote the manuscript
# (LaTeX, Pandoc, Ghostscript) stay in dist/print/logs/.
#
# Environment: PYTHON (default python3), GS (default gs, then gswin64c),
# AIXP_MONO_FONT_DIR (JetBrains Mono NL TTFs), AIXP_ICC_PROFILE (override, logged).
set -euo pipefail

# Git Bash on Windows would otherwise rewrite these Ghostscript options as paths.
export MSYS2_ARG_CONV_EXCL='-dAutoRotatePages=;-dColorImageFilter=;-dGrayImageFilter='

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT"

log() { printf 'build-print: %s\n' "$*"; }
fail() { printf 'build-print: ERROR: %s\n' "$*" >&2; exit 1; }

PRE_ARGS=()
GUTTER=0.75in
while [ $# -gt 0 ]; do
  case "$1" in
    --version|--date|--git-sha) [ $# -ge 2 ] || fail "$1 needs a value"; PRE_ARGS+=("$1" "$2"); shift 2 ;;
    --gutter) [ $# -ge 2 ] || fail "--gutter needs a value"; GUTTER=$2; shift 2 ;;
    -h|--help) sed -n '2,13p' "$0"; exit 0 ;;
    *) fail "unknown option $1" ;;
  esac
done

if ! [[ $GUTTER =~ ^([0-9]+(\.[0-9]+)?)in$ ]]; then fail "--gutter must be inches, e.g. 0.75in (got $GUTTER)"; fi
awk -v g="${BASH_REMATCH[1]}" 'BEGIN { exit !(g >= 0.5) }' || fail "--gutter $GUTTER is below the 0.5in safe zone"

PYTHON=${PYTHON:-python3}
GS=${GS:-}
if [ -z "$GS" ]; then
  for candidate in gs gswin64c gswin32c; do
    if command -v "$candidate" >/dev/null 2>&1; then GS=$candidate; break; fi
  done
fi
[ -n "$GS" ] || fail "Ghostscript not found (install it or set GS)"
export GS
for tool in node pandoc xelatex pdfinfo pdffonts pdfimages "$PYTHON"; do
  command -v "$tool" >/dev/null 2>&1 || fail "$tool not found; see book/scripts/ci/install-print-tools.sh"
done

native_path() { if command -v cygpath >/dev/null 2>&1; then cygpath -m "$1"; else printf '%s' "$1"; fi; }

MONO_DIR=${AIXP_MONO_FONT_DIR:-$HOME/.local/share/fonts/aixp/jetbrains-mono}
[ -f "$MONO_DIR/JetBrainsMonoNL-Regular.ttf" ] || fail "JetBrains Mono NL not found in $MONO_DIR (set AIXP_MONO_FONT_DIR)"
MONO_DIR=$(native_path "$MONO_DIR")/

WORK=dist/print
LOGS=$WORK/logs
TEX_DIR=$WORK/latex

log "step 1/6: preprocess (print target)"
node book/scripts/preprocess.js --target print "${PRE_ARGS[@]}"
MANUSCRIPT=$WORK/unified-manuscript.md
mkdir -p "$LOGS" "$TEX_DIR"

meta() { sed -n "s/^$1: \"\(.*\)\"\$/\1/p" "$MANUSCRIPT" | head -n 1; }
VERSION=$(meta book-version); DATE=$(meta date); SHA=$(meta git-commit); STAMP=$(meta build-timestamp)
[ -n "$VERSION" ] && [ -n "$SHA" ] && [ -n "$STAMP" ] || fail "manuscript metadata block lacks version, commit or timestamp"
OUT=dist/aixp-$VERSION-print-6x9.pdf
log "version $VERSION, date $DATE, commit $SHA, gutter $GUTTER"

log "step 2/6: prepare diagrams"
shopt -s nullglob
DIAGRAMS=("$WORK"/mermaid/*.pdf)
shopt -u nullglob
if [ ${#DIAGRAMS[@]} -gt 0 ]; then "$PYTHON" book/scripts/print-helper.py diagrams "${DIAGRAMS[@]}"; fi

log "step 3/6: pandoc to LaTeX"
pandoc "$MANUSCRIPT" -f markdown \
  --template book/templates/latex/interior.tex \
  --lua-filter book/templates/latex/print.lua \
  --top-level-division=chapter \
  --metadata-file book/metadata.yaml \
  -V gutter="$GUTTER" -V monofontpath="$MONO_DIR" \
  -o "$TEX_DIR/interior.tex" 2>"$LOGS/pandoc.log" || fail "pandoc failed; see $LOGS/pandoc.log"
log "pandoc warnings: $(grep -c 'WARNING' "$LOGS/pandoc.log" || true)"

log "step 4/6: xelatex"
toc_sum() { if [ -f "$TEX_DIR/interior.toc" ]; then cksum < "$TEX_DIR/interior.toc"; fi; }
for pass in 1 2 3 4 5; do
  before=$(toc_sum)
  if ! xelatex -interaction=batchmode -halt-on-error -no-shell-escape \
      -output-directory="$TEX_DIR" "$TEX_DIR/interior.tex" >"$LOGS/xelatex-pass$pass.out" 2>&1; then
    cp "$TEX_DIR/interior.log" "$LOGS/xelatex.log" 2>/dev/null || true
    grep -E '^! ' "$TEX_DIR/interior.log" | head -n 5 | cut -c1-120 >&2 || true
    fail "xelatex failed on pass $pass (a missing glyph fails here by design); see $LOGS/xelatex.log"
  fi
  if [ "$pass" -ge 2 ] && [ "$before" = "$(toc_sum)" ] && ! grep -q 'Rerun to get' "$TEX_DIR/interior.log"; then break; fi
done
cp "$TEX_DIR/interior.log" "$LOGS/xelatex.log"
log "xelatex passes: $pass; overfull boxes: $(grep -c '^Overfull' "$LOGS/xelatex.log" || true); underfull boxes: $(grep -c '^Underfull' "$LOGS/xelatex.log" || true)"

log "step 5/6: Ghostscript PDF/X-1a:2001"
ICC=$("$PYTHON" book/scripts/print-helper.py icc book/assets/icc/output-intent.json)
ICC_NOTE=$("$PYTHON" -c 'import json,sys; print(json.load(open(sys.argv[1]))["note"])' book/assets/icc/output-intent.json)
ICC_CONDITION=$("$PYTHON" -c 'import json,sys; print(json.load(open(sys.argv[1]))["output_condition"])' book/assets/icc/output-intent.json)
log "output intent profile: $ICC"
log "NOTE: $ICC_NOTE"
ICC=$(native_path "$ICC")
meta_yaml() { sed -n "s/^$1: *\"\{0,1\}\([^\"]*\)\"\{0,1\} *\$/\1/p" book/metadata.yaml | head -n 1; }
TITLE=$(meta_yaml title); SUBTITLE=$(meta_yaml subtitle); AUTHOR=$(meta_yaml author)
"$PYTHON" book/scripts/print-helper.py pdfx-def book/templates/latex/pdfx-def.ps.in "$ICC" "$WORK/pdfx-def.ps" \
  "TITLE=$TITLE" "AUTHOR=$AUTHOR" "SUBJECT=$SUBTITLE" "KEYWORDS=print interior 6x9 PDF/X-1a:2001" \
  "BOOK_VERSION=$VERSION" "GIT_COMMIT=$SHA" "BUILD_TIMESTAMP=$STAMP" \
  "OUTPUT_CONDITION=$ICC_CONDITION" "OUTPUT_INFO=$ICC_CONDITION"

PDFX_FLAG=-dPDFX=1
if ! "$GS" -q -dBATCH -dNOPAUSE -dSAFER -sDEVICE=pdfwrite -dPDFX=1 -sColorConversionStrategy=CMYK \
    -sOutputFile="$WORK/gs-probe.pdf" -c quit >/dev/null 2>&1; then
  PDFX_FLAG=-dPDFX
fi
rm -f "$WORK/gs-probe.pdf"
log "ghostscript $("$GS" --version) with $PDFX_FLAG"

GS_ARGS=(
  -dBATCH -dNOPAUSE -dSAFER --permit-file-read="$ICC"
  -sDEVICE=pdfwrite "$PDFX_FLAG" -dCompatibilityLevel=1.3
  -sColorConversionStrategy=CMYK -sProcessColorModel=DeviceCMYK -sOutputICCProfile="$ICC"
  -dPDFACompatibilityPolicy=2 -dAutoRotatePages=/None
  -dEmbedAllFonts=true -dSubsetFonts=true
  -dDownsampleColorImages=false -dDownsampleGrayImages=false -dDownsampleMonoImages=false
  -dAutoFilterColorImages=false -dColorImageFilter=/FlateEncode
  -dAutoFilterGrayImages=false -dGrayImageFilter=/FlateEncode
  -sOutputFile="$OUT"
  "$WORK/pdfx-def.ps" "$TEX_DIR/interior.pdf"
)
mkdir -p dist
rm -f "$OUT"
printf '%q ' "$GS" "${GS_ARGS[@]}" >"$LOGS/gs-command.txt"
"$GS" "${GS_ARGS[@]}" >"$LOGS/ghostscript.log" 2>&1 || fail "Ghostscript failed; see $LOGS/ghostscript.log"
# Ghostscript's diagnostics name PDF features and fonts, not page text, so they are shown.
if grep -qiE 'error|warning|rasteri' "$LOGS/ghostscript.log"; then
  log "Ghostscript diagnostics:"
  grep -iE -A4 'error|warning|rasteri' "$LOGS/ghostscript.log" | head -n 20 | cut -c1-160
fi
# Ghostscript renders any page it cannot express in PDF 1.3 (e.g. transparency) as an
# image; the result still passes the PDF/X checks, so compare image counts instead.
images() { pdfimages -list "$1" 2>/dev/null | tail -n +3 | wc -l; }
before_images=$(images "$TEX_DIR/interior.pdf"); after_images=$(images "$OUT")
[ "$after_images" -le "$before_images" ] || fail "Ghostscript added $((after_images - before_images)) image(s): a page was rasterised"
log "images before/after Ghostscript: $before_images/$after_images"
"$PYTHON" book/scripts/print-helper.py trimbox "$OUT"

log "step 6/6: preflight"
status=0
"$PYTHON" book/scripts/check-pdfx.py "$OUT" || status=1
"$PYTHON" book/scripts/check-print-layout.py "$OUT" || status=1
[ $status -eq 0 ] || fail "preflight failed for $OUT"
log "done: $OUT ($(pdfinfo "$OUT" | sed -n 's/^Pages: *//p') pages)"
