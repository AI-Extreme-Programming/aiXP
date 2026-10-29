#!/usr/bin/env bash
# Installs the print interior toolchain on GitHub-hosted ubuntu-latest (Ubuntu 24.04).
# Safe to run repeatedly: each step checks what is already present.
#
# Node 22 comes from actions/setup-node; Mermaid's Chromium is set up by the
# preprocessor's own npm install (book/config/puppeteer.json).
set -euo pipefail

PANDOC_VERSION=3.8.2.1
PANDOC_DEB_SHA256=5d4ecbf9c616360a9046e14685389ff2898088847e5fb260eedecd023453995a
JBM_VERSION=2.304
JBM_ZIP_SHA256=6f6376c6ed2960ea8a963cd7387ec9d76e3f629125bc33d1fdcd7eb7012f7bbf
MONO_DIR=${AIXP_MONO_FONT_DIR:-$HOME/.local/share/fonts/aixp/jetbrains-mono}

APT_PACKAGES=(
  texlive-xetex texlive-latex-recommended texlive-latex-extra tex-gyre lmodern
  ghostscript poppler-utils python3-pikepdf unzip curl ca-certificates
)

log() { printf 'install-print-tools: %s\n' "$*"; }
start=$(date +%s)
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

missing=()
for package in "${APT_PACKAGES[@]}"; do
  dpkg-query -W -f='${Status}' "$package" 2>/dev/null | grep -q 'install ok installed' || missing+=("$package")
done
if [ ${#missing[@]} -gt 0 ]; then
  log "apt: installing ${missing[*]}"
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq --no-install-recommends "${missing[@]}" >/dev/null
else
  log "apt: all packages present"
fi

if command -v pandoc >/dev/null 2>&1 && [ "$(pandoc --version | head -n 1)" = "pandoc $PANDOC_VERSION" ]; then
  log "pandoc $PANDOC_VERSION present"
else
  log "pandoc: installing $PANDOC_VERSION"
  curl -fsSL -o "$tmp/pandoc.deb" \
    "https://github.com/jgm/pandoc/releases/download/$PANDOC_VERSION/pandoc-$PANDOC_VERSION-1-amd64.deb"
  echo "$PANDOC_DEB_SHA256  $tmp/pandoc.deb" | sha256sum -c --quiet -
  sudo dpkg -i "$tmp/pandoc.deb" >/dev/null
fi

if [ -f "$MONO_DIR/JetBrainsMonoNL-Regular.ttf" ] && [ -f "$MONO_DIR/.version-$JBM_VERSION" ]; then
  log "JetBrains Mono $JBM_VERSION present in $MONO_DIR"
else
  log "fonts: installing JetBrains Mono $JBM_VERSION to $MONO_DIR"
  curl -fsSL -o "$tmp/jbm.zip" \
    "https://github.com/JetBrains/JetBrainsMono/releases/download/v$JBM_VERSION/JetBrainsMono-$JBM_VERSION.zip"
  echo "$JBM_ZIP_SHA256  $tmp/jbm.zip" | sha256sum -c --quiet -
  mkdir -p "$MONO_DIR"
  for face in Regular Bold Italic BoldItalic; do
    unzip -o -j -q "$tmp/jbm.zip" "fonts/ttf/JetBrainsMonoNL-$face.ttf" -d "$MONO_DIR"
  done
  unzip -o -j -q "$tmp/jbm.zip" OFL.txt -d "$MONO_DIR"
  touch "$MONO_DIR/.version-$JBM_VERSION"
fi

for file in texgyrepagella-regular.otf texgyreheros-regular.otf fvextra.sty titlesec.sty truncate.sty \
    emptypage.sty footnotehyper.sty xurl.sty fancyhdr.sty microtype.sty fontspec.sty; do
  kpsewhich "$file" >/dev/null || { log "ERROR: $file not found after install"; exit 1; }
done

log "pandoc: $(pandoc --version | head -n 1)"
log "xelatex: $(xelatex --version | head -n 1)"
log "ghostscript: $(gs --version)"
log "poppler: $(pdfinfo -v 2>&1 | head -n 1)"
log "pikepdf: $(python3 -c 'import pikepdf; print(pikepdf.__version__)')"
log "done in $(( $(date +%s) - start ))s"
