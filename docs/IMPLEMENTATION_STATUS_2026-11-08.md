# Fabularc implementation status — 2026-11-08

## Verified outputs on the cumulative integration branch

The newest cumulative feature branch is `fix/fabularc-post-privacy-moderation`, PR #12.
It includes prior unmerged security, media, brand and editor changes.

### GitHub
- Next.js 16.4.5 foundation; existing Pages Router retained.
- API: server-authenticated atomic AI quota RPC; fail-closed on unavailable quota.
- Generation: independently configurable story language and country.
- Media: user-scoped signed Cloudinary image and audio uploads for profiles and chat.
- Chat security: immutable message content; only the recipient can mark read.
- Posts: unpublished content is not globally visible, update policy is owner-only.
- Reports: five *distinct* reporter accounts cause automatic hide via a DB trigger, not an unauthorized client UPDATE.
- Brand: approved Fabularc SVG/PWA icons, document metadata and visible-screen logo cleanup.
- Writing studio: dedicated owner-private JSONB archive, save/list/load/delete with error handling.
- CI: `npm audit --omit=dev --audit-level=high` is a mandatory gate. Postgres 17
  tests run on disposable services. No live database credentials are used in CI.

### Tests, confirmed from GitHub Actions
- Job: https://github.com/waesnd/senaryo-studio/actions/runs/42451839249
- Node regressions: **36 passed; 0 failed**.
- Production build and real local HTTP smoke: successful.
- PostgreSQL checks: atomic quota, post visibility/moderation, immutable messages,
  story/version RLS and private archive — successful.
- Production dependency audit: **0 vulnerabilities reported** for the tested install.
- Vercel preview for head commit `179fe713aa7623e62427feaf55b4816544d95be5` reported READY,
  but actual logged-in browser flows have NOT been verified.

### Applied to real Supabase (project jwqfseqywhwtdrgxjtkg)
These migrations are recorded in Supabase's migration history:
1. `atomic_ai_quota`
2. `story_and_version_rls`
3. `private_writing_archive`
4. `guard_message_updates`
5. `post_privacy_and_reports`

Read-only checks verified:
- Two existing auth users and profiles were present before changes.
- Existing scenario persisted through archive changes.
- Thirteen existing chat messages survived message RLS update.
- No tables were truncated, profiles removed, or chat messages deleted.
- Active RLS policies/functions/triggers were confirmed after each migration.

## Outstanding release blockers
**Do not declare the full product finished or deploy to production yet.**

1. A professional screenplay editor with structured scenes, autosave, conflict resolution,
   undo/redo, offline durable storage, formats and comprehensive UX remains incomplete.
2. Review all other RLS policies, especially public profile fields (including push tokens),
   cross-user mutations, and messaging/media authorization.
3. Cloudinary dashboard: verify preset configuration; disable retired unsigned upload
   presets only after signed uploads are proven end-to-end against the actual cloud.
4. Verify authenticated AI calls and quota behavior against a dedicated test account,
   including response rollback/accounting when the provider fails.
5. Migrate all UI design tokens, remaining legacy content and OG visuals to Fabularc.
6. Complete multilingual UI and translations outside the generation endpoint.
7. Creator community, rights controls, invitations, collaboration, moderation dashboard,
   and privacy features need implementation and E2E coverage.
8. React 18 is deprecated with Next.js 16; evaluate React 19 migration on a separate
   compatibility branch, and test browser hydration and installed PWA functionality.
9. Verify Vercel preview environment keys, protected deployment access, real-browser
   login, image/audio uploads, offline behavior and E2E user journeys.
10. Confirm backups and rollback approach, then require CI/approvals before
    merging into main and releasing a staged production build.

## Source control and production separation
- Latest integration PR: https://github.com/waesnd/senaryo-studio/pull/12
- Do not merge earlier cumulative drafts independently; they overlap.
- No merge to `main` or production Vercel promotion has been made.
- The browser-facing Vercel production branch is not yet updated.

## Additional verified work — latest cumulative editor branch

Branch: `feat/fabularc-screenplay-editor` (draft PR #14).
Verified GitHub Actions run: https://github.com/waesnd/senaryo-studio/actions/runs/42452343797

- **42 Node tests passed, 0 failed** on the tested commit.
- Next.js 16.4.5 and React 19.3.1 production build passed.
- Dependency audit reported **zero high/critical production vulnerabilities** on the tested install.
- GitHub Actions PostgreSQL isolated database jobs passed for atomic quota, story/version RLS, private archive, immutable messages, private posts/report moderation, and editor project/scene ownership.
- New `/editor` route passed synthetic-config HTTP smoke test.
- Vercel preview deployments report READY on previous feature commits; authenticated browser E2E has NOT been verified.
- Migration `private_editor_projects` was successfully applied to live Supabase, introducing `yazarlik_projeleri` and `yazarlik_sahneleri` with owner-only RLS; anonymous SELECT privilege was verified absent. Existing scenario and archival tables were not rewritten.
- The editor is a functional **initial** project/scene writing workspace with local draft protection, debounced autosave, optimistic revision guard and TXT/FDX export. It is NOT a completed Final Draft replacement.

### Current release blockers (2026-11-08)
- Browser-authenticated E2E tests, true offline/online conflict reconciliation, real Groq request and real Cloudinary signed-upload tests are outstanding.
- Accessibility/a11y, full design-system rollout, community/collaboration feature completion and full internationalization remain outstanding.
- Existing `public.profiles` broad SELECT policy exposes all columns granted to clients; evaluate sensitive `push_token` exposure with a safe, application-compatible data-access design.
- Existing Vercel production branch remains untouched; **no main merge or production promotion**.
