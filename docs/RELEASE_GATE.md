# FABULARC — Release verification and Supabase migration status

## Database rollout record (2026-11-08)
- Supabase project: `jwqfseqywhwtdrgxjtkg` (Frankfurt, PostgreSQL 17).
- Verified production database was `ACTIVE_HEALTHY`, had 2 auth users and 2 profiles; `public.kullanim_log` initially contained zero rows.
- Applied the **additive** migration `supabase/migrations/202611080001_atomic_ai_quota.sql` using Supabase's migration mechanism, named `atomic_ai_quota`.
- Verified function `public.reserve_generate_quota(jsonb)` exists and is `SECURITY DEFINER` with an empty search path.
- Verified `authenticated` has EXECUTE privilege; `anon` does not.
- Verified existing quota rows remained at zero after the migration.
- No other tables were dropped or truncated. No users or profiles were changed.

## Verification boundaries
- GitHub Actions isolated PostgreSQL job verifies simultaneous reservations and role privileges against a **disposable test database**.
- The real Supabase deployment was checked with read-only catalog/privilege queries. No generation was executed against a real account.
- The new API handler is staged in this branch. The default branch and production Vercel deployment must be checked before any rollout.
- The existing memory-based rate limit in `lib/withAuth.js` is **not yet distributed** and is not a substitute for the atomic usage RPC.
- Existing media uploads remain in Cloudinary. Signed profile uploads are staged, but end-to-end Cloudinary uploads/deletions with real credentials are unverified.

## Release blockers
1. Review the migration's actual rollout effect and authenticate API calls with a dedicated test user.
2. Complete role-based RLS audit for all `public` tables; do not broaden grants without a threat model.
3. Verify Cloudinary signed uploads and deletion ownership against a nonproduction media account.
4. Finish UX, editor, community, and localization work; verify original features are retained.
5. Audit all dependencies, complete browser E2E tests, and run real-device PWA tests.
6. Merge into `main` only after passing CI and securing a recovery/rollback plan.
7. Configure Vercel preview and production environments separately and verify before promoting production.

## CI references
- Integrated PR: https://github.com/waesnd/senaryo-studio/pull/5
- Next.js security and media-upload trial: https://github.com/waesnd/senaryo-studio/pull/6
- Last confirmed green combined workflow: https://github.com/waesnd/senaryo-studio/actions/runs/42449121949

## Read-only RLS inventory
A catalog query confirmed RLS is enabled across the application's public tables. Two tables, `public.storyler` and `public.medya_silme`, currently have **no RLS policies**. This usually means normal browser roles cannot read or write rows even if grants exist; confirm their intended server-side usage before creating permissions. No policy was altered in this audit. The `public.kullanim_log` INSERT policy explicitly rejects client inserts; the authenticated quota RPC uses controlled SECURITY DEFINER access instead.
