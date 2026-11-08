#!/usr/bin/env bash
set -euo pipefail
if [[ "${FABULARC_TEST_DATABASE:-}" != "disposable-ci-postgres" ]]; then
  echo "Refusing archive test outside disposable CI database" >&2
  exit 2
fi
psql -X -q -v ON_ERROR_STOP=1 <<'SQL'
CREATE SCHEMA auth;
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
CREATE TABLE auth.users (id uuid PRIMARY KEY);
INSERT INTO auth.users(id) VALUES
 ('11111111-1111-4111-8111-111111111111'),
 ('22222222-2222-4222-8222-222222222222');
GRANT USAGE ON SCHEMA public TO anon,authenticated;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated;
SQL
psql -X -v ON_ERROR_STOP=1 -f supabase/migrations/202611080003_private_writing_archive.sql
# INSERT by the first user. Keep a real user ID for FK enforcement.
psql -X -q -v ON_ERROR_STOP=1 <<'SQL'
SET ROLE authenticated;
SET request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
INSERT INTO public.yazar_arsivi(user_id,baslik,veri)
VALUES ('11111111-1111-4111-8111-111111111111','Personal draft','{"senaryo":{"baslik":"Draft"}}'::jsonb);
RESET ROLE;
SQL
# A second user sees nothing.
visible="$(psql -X -q -tA -v ON_ERROR_STOP=1 <<'SQL'
SET ROLE authenticated;
SET request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
SELECT count(*) FROM public.yazar_arsivi;
SQL
)"
test "$visible" = "0"
# Anonymous clients have no SELECT privilege.
if psql -X -q -v ON_ERROR_STOP=1 -c 'SET ROLE anon; SELECT * FROM public.yazar_arsivi;' >/dev/null 2>&1; then
  echo "Anonymous archive read unexpectedly succeeded" >&2
  exit 1
fi
# Other users cannot remove records.
psql -X -q -v ON_ERROR_STOP=1 <<'SQL'
SET ROLE authenticated;
SET request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
DELETE FROM public.yazar_arsivi;
RESET ROLE;
SQL
count="$(psql -X -q -tA -v ON_ERROR_STOP=1 -c 'SELECT count(*) FROM public.yazar_arsivi;')"
test "$count" = "1"
echo "PASS: archive access is owner-only and anonymous reads fail."
