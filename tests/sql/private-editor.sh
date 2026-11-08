#!/usr/bin/env bash
set -euo pipefail
if [[ "${FABULARC_TEST_DATABASE:-}" != "disposable-ci-postgres" ]]; then
  echo "Refusing editor database tests outside disposable CI database" >&2
  exit 2
fi
psql -X -q -v ON_ERROR_STOP=1 <<'SQL'
CREATE SCHEMA auth;
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE TABLE auth.users(id uuid PRIMARY KEY);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
 SELECT NULLIF(current_setting('request.jwt.claim.sub',true),'')::uuid
$$;
GRANT USAGE ON SCHEMA auth,public TO anon,authenticated;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon,authenticated;
INSERT INTO auth.users(id) VALUES
 ('11111111-1111-4111-8111-111111111111'),
 ('22222222-2222-4222-8222-222222222222');
SQL
psql -X -v ON_ERROR_STOP=1 -f supabase/migrations/202611080006_private_editor_projects.sql

psql -X -q -v ON_ERROR_STOP=1 <<'SQL'
SET ROLE authenticated;
SET request.jwt.claim.sub='11111111-1111-4111-8111-111111111111';
INSERT INTO public.yazarlik_projeleri(id,user_id,baslik) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','Private Project');
INSERT INTO public.yazarlik_sahneleri(id,user_id,proje_id,baslik,icerik) VALUES
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  '11111111-1111-4111-8111-111111111111',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','INT. ROOM - NIGHT','First draft');
UPDATE public.yazarlik_sahneleri SET icerik='Second draft'
 WHERE id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' AND versiyon=1;
-- Stale update is silently rejected, preserving the newer revision.
UPDATE public.yazarlik_sahneleri SET icerik='Stale overwrite'
 WHERE id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' AND versiyon=1;
RESET ROLE;
SQL

result="$(psql -X -q -tA -v ON_ERROR_STOP=1 -c "SELECT icerik || '|' || versiyon::text FROM public.yazarlik_sahneleri LIMIT 1;")"
test "$result" = "Second draft|2"

visible="$(psql -X -q -tA -v ON_ERROR_STOP=1 <<'SQL'
SET ROLE authenticated;
SET request.jwt.claim.sub='22222222-2222-4222-8222-222222222222';
SELECT COUNT(*) FROM public.yazarlik_projeleri;
SELECT COUNT(*) FROM public.yazarlik_sahneleri;
SQL
)"
test "$visible" = $'0\n0'

if psql -X -q -v ON_ERROR_STOP=1 <<'SQL' >/dev/null 2>&1
SET ROLE authenticated;
SET request.jwt.claim.sub='22222222-2222-4222-8222-222222222222';
INSERT INTO public.yazarlik_sahneleri(user_id,proje_id,icerik) VALUES
 ('22222222-2222-4222-8222-222222222222',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Illegal foreign project scene');
SQL
then
 echo "Cross-user scene creation was unexpectedly allowed" >&2
 exit 1
fi

if psql -X -q -v ON_ERROR_STOP=1 -c 'SET ROLE anon; SELECT * FROM public.yazarlik_projeleri;' >/dev/null 2>&1; then
 echo "Anonymous editor read was unexpectedly allowed" >&2
 exit 1
fi

echo "PASS editor ownership, concurrent version guard, foreign-project rejection and anon privacy."
