#!/usr/bin/env python3
"""Export approved Fabularc PWA and favicon rasters from the committed SVG masters.

Requires CairoSVG 2.8.2. Never edits SVG geometry or the site's data.
"""
from pathlib import Path
import hashlib
import cairosvg

ROOT = Path(__file__).resolve().parents[1]
SOURCES = (
    ("public/brand/fabularc-app-icon.svg", "public/icon-192.png", 192),
    ("public/brand/fabularc-app-icon.svg", "public/icon-512.png", 512),
    ("public/brand/fabularc-favicon.svg", "public/favicon-16.png", 16),
    ("public/brand/fabularc-favicon.svg", "public/favicon-32.png", 32),
    ("public/brand/fabularc-favicon.svg", "public/favicon-48.png", 48),
)

for source, destination, size in SOURCES:
    src = ROOT / source
    dst = ROOT / destination
    if not src.is_file():
        raise SystemExit(f"Missing approved SVG source: {src}")
    dst.parent.mkdir(parents=True, exist_ok=True)
    result = cairosvg.svg2png(url=str(src), output_width=size, output_height=size)
    dst.write_bytes(result)
    digest = hashlib.sha256(result).hexdigest()
    print(f"{destination}: {size}x{size}, sha256={digest}")
