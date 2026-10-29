"""Finds the CMYK output-intent profile recorded in book/assets/icc/output-intent.json.

The profile is not committed: it ships with Ghostscript. The manifest pins its SHA-256
so that every build host embeds the same bytes, and a host whose Ghostscript ships a
different file fails instead of silently changing the output intent.
"""

from __future__ import annotations

import hashlib
import json
import shutil
from dataclasses import dataclass
from pathlib import Path


class ProfileError(Exception):
    pass


@dataclass
class Profile:
    path: Path
    sha256: str
    pinned: bool
    manifest: dict


def sha256_of(path) -> str:
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def load_manifest(path) -> dict:
    manifest = json.loads(Path(path).read_text(encoding='utf-8'))
    for key in ('file', 'sha256', 'search', 'output_condition'):
        if key not in manifest:
            raise ProfileError(f'{path}: manifest has no "{key}"')
    return manifest


def gs_relative_candidates(gs_executable, file_name):
    found = shutil.which(gs_executable) if gs_executable else None
    if not found:
        return []
    bin_dir = Path(found).resolve().parent
    return [bin_dir.parent / 'iccprofiles' / file_name, bin_dir.parent / 'share' / 'ghostscript' / 'iccprofiles' / file_name]


def resolve_profile(manifest, override=None, gs_executable=None) -> Profile:
    if override:
        path = Path(override)
        if not path.is_file():
            raise ProfileError(f'AIXP_ICC_PROFILE points to a missing file: {path}')
        digest = sha256_of(path)
        return Profile(path, digest, digest in manifest['sha256'], manifest)
    candidates = [Path(p) for p in manifest['search']] + gs_relative_candidates(gs_executable, manifest['file'])
    seen_other = []
    for path in candidates:
        if not path.is_file():
            continue
        digest = sha256_of(path)
        if digest in manifest['sha256']:
            return Profile(path, digest, True, manifest)
        seen_other.append(f'{path} (sha256 {digest})')
    if seen_other:
        raise ProfileError('found ' + manifest['file'] + ' but not the pinned version: ' + '; '.join(seen_other)
                           + '. Add its hash to book/assets/icc/output-intent.json only after checking it.')
    raise ProfileError(f'{manifest["file"]} not found; looked in: ' + ', '.join(str(p) for p in candidates))
