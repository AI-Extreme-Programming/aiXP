#!/usr/bin/env bash
# Installs the EPUB build toolchain on GitHub-hosted ubuntu-latest (Ubuntu 24.04):
# pandoc, a Java runtime, epubcheck, and the headless Chromium that mermaid-cli drives.
# Safe to re-run: each step is skipped when the pinned version is already present.
# Expects Node 22 on PATH (actions/setup-node).
set -euo pipefail

PANDOC_VERSION="3.8.2.1"
PANDOC_DEB_SHA256="5d4ecbf9c616360a9046e14685389ff2898088847e5fb260eedecd023453995a"
EPUBCHECK_VERSION="5.4.0"
EPUBCHECK_ZIP_SHA256="33350c61038e71dfb3d45a76aed04bf5481e6d5500cb780f6e98db8bbd15a28c"
EPUBCHECK_HOME="/opt/epubcheck-${EPUBCHECK_VERSION}"
JAVA_MIN_MAJOR=11
CHROME_DEPS=(
  ca-certificates fonts-liberation libasound2t64 libatk-bridge2.0-0t64 libatk1.0-0t64
  libcairo2 libcups2t64 libdbus-1-3 libdrm2 libgbm1 libglib2.0-0t64 libgtk-3-0t64 libnspr4
  libnss3 libpango-1.0-0 libx11-6 libxcb1 libxcomposite1 libxdamage1 libxext6 libxfixes3
  libxkbcommon0 libxrandr2
)

BOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SUDO=""
if [ "$(id -u)" -ne 0 ]; then SUDO="sudo"; fi
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
APT_UPDATED=0

log() { echo "install-epub-tools: $*"; }

apt_install() {
  if [ "$APT_UPDATED" -eq 0 ]; then
    $SUDO apt-get update -qq
    APT_UPDATED=1
  fi
  $SUDO env DEBIAN_FRONTEND=noninteractive apt-get install -y -qq --no-install-recommends "$@"
}

download() {
  local url="$1" sha256="$2" dest="$3"
  curl -fsSL --retry 3 -o "$dest" "$url"
  echo "${sha256}  ${dest}" | sha256sum --check --status || { log "checksum mismatch for $url"; exit 1; }
}

install_pandoc() {
  if command -v pandoc >/dev/null && [ "$(pandoc --version | head -n1)" = "pandoc ${PANDOC_VERSION}" ]; then
    log "pandoc ${PANDOC_VERSION} already installed"
    return
  fi
  local deb="$WORK/pandoc-${PANDOC_VERSION}-1-amd64.deb"
  download "https://github.com/jgm/pandoc/releases/download/${PANDOC_VERSION}/pandoc-${PANDOC_VERSION}-1-amd64.deb" "$PANDOC_DEB_SHA256" "$deb"
  $SUDO dpkg -i "$deb" >/dev/null
  log "installed $(pandoc --version | head -n1)"
}

java_major() {
  java -XshowSettings:properties -version 2>&1 | sed -n 's/^ *java\.specification\.version = \([0-9]*\).*/\1/p' | head -n1
}

install_java() {
  if command -v java >/dev/null && [ "$(java_major || echo 0)" -ge "$JAVA_MIN_MAJOR" ]; then
    log "java $(java_major) already installed"
    return
  fi
  apt_install openjdk-21-jre-headless
  log "installed java $(java_major)"
}

install_epubcheck() {
  if [ -f "$EPUBCHECK_HOME/epubcheck.jar" ] && java -jar "$EPUBCHECK_HOME/epubcheck.jar" --version 2>/dev/null | grep -q "EPUBCheck v${EPUBCHECK_VERSION}"; then
    log "epubcheck ${EPUBCHECK_VERSION} already installed"
  else
    local zip="$WORK/epubcheck-${EPUBCHECK_VERSION}.zip"
    download "https://github.com/w3c/epubcheck/releases/download/v${EPUBCHECK_VERSION}/epubcheck-${EPUBCHECK_VERSION}.zip" "$EPUBCHECK_ZIP_SHA256" "$zip"
    unzip -q "$zip" -d "$WORK/epubcheck"
    $SUDO rm -rf "$EPUBCHECK_HOME"
    $SUDO mv "$WORK/epubcheck/epubcheck-${EPUBCHECK_VERSION}" "$EPUBCHECK_HOME"
    log "installed epubcheck ${EPUBCHECK_VERSION} to $EPUBCHECK_HOME"
  fi
  printf '#!/bin/sh\nexec java -jar "%s/epubcheck.jar" "$@"\n' "$EPUBCHECK_HOME" | $SUDO tee /usr/local/bin/epubcheck >/dev/null
  $SUDO chmod 755 /usr/local/bin/epubcheck
}

install_chromium() {
  local missing=()
  for pkg in "${CHROME_DEPS[@]}"; do
    dpkg-query -W -f='${Status}' "$pkg" 2>/dev/null | grep -q "install ok installed" || missing+=("$pkg")
  done
  if [ "${#missing[@]}" -gt 0 ]; then
    log "installing Chromium libraries: ${missing[*]}"
    apt_install "${missing[@]}"
  fi
  if [ ! -d "$BOOK_DIR/node_modules/puppeteer" ]; then
    (cd "$BOOK_DIR" && npm ci --no-audit --no-fund)
  fi
  # Installs the chrome-headless-shell build pinned by the locked puppeteer; no-op when cached.
  (cd "$BOOK_DIR" && npx --no-install puppeteer browsers install chrome-headless-shell)
}

install_pandoc
install_java
install_epubcheck
install_chromium
log "ready: $(pandoc --version | head -n1); java $(java_major); $(epubcheck --version 2>/dev/null | head -n1)"
