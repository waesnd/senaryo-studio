# Fabularc — AI generation locale contract

Endpoint: `POST /api/generate` (authenticated).

## Request

Required fields remain `tip` and `tur`. Optional:
- `dil`: BCP-47-style language code (`tr`, `en`, `fr`, `pt-br`), lowercase after normalization. Default: `tr`.
- `ulke`: two-letter ISO-style country code (`TR`, `US`, `FR`), uppercase after normalization. Default: `TR`.

Example:
```json
{
  "tip": "feature film",
  "tur": "thriller",
  "dil": "en",
  "ulke": "US",
  "ozelIstek": "Set the story in Chicago."
}
```

Locale codes are format-validated, **not** a guarantee that a specific AI model reliably produces every language.

## Compatibility

Existing callers omitting locale fields retain `tr` / `TR` defaults. No database migration or new paid dependency is required.

## Failure behavior

- Malformed locale: HTTP 400 / `INVALID_LOCALE`; no AI call.
- Quota verification unavailable: HTTP 503 / `USAGE_CHECK_UNAVAILABLE`; no AI call.
- Quota exhausted: HTTP 429 / `DAILY_LIMIT_EXCEEDED`; no AI call.

## Remaining work

- Expose independent story-language and country controls in Creative Workspace.
- Replace count-then-insert quota logging with atomic reservation and proper server-authorized accounting after Supabase becomes available.
- Expand model-level multilingual quality tests and prompt-injection resistance.
- Run full-stack integration tests against isolated test databases; isolated node tests alone do not verify external services.
