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
- These are staged assets, not yet wired into the live `manifest.json` or page metadata.
- Keep `public/icon-192.png` and `public/icon-512.png` unchanged until the matching raster assets can be committed and visually verified.
- Update the title, favicon references, social cards, and PWA icons in a single validated follow-up to prevent mixing Scriptify and Fabularc branding.
- Do not rename database tables or URLs as part of a cosmetic brand change.
- Test contrast, legibility at 16px, maskable icon safe area, and app installation before rollout.

## Legal
Do not claim uniqueness or trademark clearance without a separate search.
