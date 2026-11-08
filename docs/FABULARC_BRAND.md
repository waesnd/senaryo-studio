# FABULARC — Brand integration (staging)

## Official color tokens
- Forest Green: `#063B32`
- Electric Lime: `#C8F33B`
- Warm Ivory: `#F7F4ED`
- Black: `#000000`
- White: `#FFFFFF`

## Asset provenance
The SVG assets in `public/brand/` reproduce files from the user-supplied `FABULARC_Production_v1.zip`:
- `fabularc-monogram.svg` ← `03_monogram.svg`
- `fabularc-favicon.svg` ← `08_favicon.svg`
- `fabularc-app-icon.svg` ← `07_app_icon.svg`

The original package's wordmark was an approximation based on Comfortaa Bold outlines, **not** a verified master lettering file.

## Deployment rules
- The approved SVG favicon is referenced by staged `_document.js` and `_app.js` metadata; the PWA manifest now carries Fabularc naming and theme colors.
- The approved primary horizontal wordmark file is staged at `public/brand/fabularc-primary.svg`, using the exact provided SVG path data.
- The approved PNG icon exports have replaced `public/icon-192.png` and `public/icon-512.png` on this **feature branch only**.
- Page head title/social metadata, PWA name, theme color, and PNG icons are staged as Fabularc; remaining UI copy is not fully migrated.
- Older Scriptify UI copy, social cover images, and installed-app icons still need a coordinated update.
- Do not rename database tables or URLs as part of a cosmetic brand change.
- Test contrast, legibility at 16px, maskable icon safe area, and app installation before rollout.

## Legal
Do not claim uniqueness or trademark clearance without a separate search.

## Current verification
- The brand branch includes Node.js integrity tests for flat SVG geometry, palette and staged head metadata.
- The official ZIP includes `favicon_16.png`, `favicon_32.png`, `favicon_48.png`, `pwa_192.png`, and `pwa_512.png`. Local regeneration with CairoSVG 2.8.2 was pixel-identical to those supplied images. Matching outputs are now committed on the brand feature branch, and PNG dimensions have a regression test.
- Avoid production releases until Open Graph art, interface copy, layout treatment, and PWA installation behavior are visually validated. The inherited 1200×630 social cover remains legacy.
