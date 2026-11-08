#!/usr/bin/env bash
set -euo pipefail

if [[ "${FABULARC_TEST_DATABASE:-}" != "disposable-ci-postgres" ]]; then
  echo "Refusing to test RLS outside disposable CI database" >&2
  exit 2
fi

psql -X -v ON_ERROR_STOP=1 <<'SQL'
CREATE SCHEMA auth;
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;

CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

CREATE TABLE public.senaryolar (
  id bigint PRIMARY KEY,
  user_id uuid,
  paylasim_acik boolean DEFAULT false,
  gizli boolean DEFAULT false
);
CREATE TABLE public.senaryo_versiyonlar (
  id bigint PRIMARY KEY,
  senaryo_id bigint,
  user_id uuid
);
CREATE TABLE public.storyler (
  id bigint PRIMARY KEY,
  user_id uuid,
  metin text
);

ALTER TABLE public.senaryolar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.senaryo_versiyonlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storyler ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kendi senaryolarını görebilir" ON public.senaryolar
  FOR SELECT TO PUBLIC
  USING ((SELECT auth.uid()) = user_id OR paylasim_acik IS TRUE);
CREATE POLICY "versiyonlar_okuma" ON public.senaryo_versiyonlar
  FOR SELECT TO PUBLIC USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "senaryo_versiyonlar_public" ON public.senaryo_versiyonlar
  FOR SELECT TO PUBLIC USING (true);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT USAGE ON SCHEMA auth TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated;
GRANT SELECT ON public.senaryolar, public.senaryo_versiyonlar TO anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.storyler TO anon, authenticated;

INSERT INTO public.senaryolar(id,user_id,paylasim_acik,gizli) VALUES
  (1,'11111111-1111-4111-8111-111111111111',false,false),
  (2,'11111111-1111-4111-8111-111111111111',true,false),
  (3,'11111111-1111-4111-8111-111111111111',true,true);
INSERT INTO public.senaryo_versiyonlar(id,senaryo_id,user_id) VALUES
  (10,1,'11111111-1111-4111-8111-111111111111'),
  (20,2,'11111111-1111-4111-8111-111111111111'),
  (30,3,'11111111-1111-4111-8111-111111111111');
INSERT INTO public.storyler(id,user_id,metin) VALUES
  (11,'11111111-1111-4111-8111-111111111111','Public story');
SQL

psql -X -v ON_ERROR_STOP=1 -f supabase/migrations/202611080002_story_and_version_rls.sql

result="$(psql -X -q -v ON_ERROR_STOP=1 -tA <<'SQL'
SET ROLE anon;
SELECT COUNT(*) FROM public.senaryo_versiyonlar;
SELECT COUNT(*) FROM public.storyler;
RESET ROLE;
SET ROLE authenticated;
SET request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
SELECT COUNT(*) FROM public.senaryo_versiyonlar;
RESET ROLE;
SQL
)"
expected=$'1\n1\n3'
if [[ "$result" != "$expected" ]]; then
  echo "Unexpected policy visibility (got $result; expected $expected)" >&2
  exit 1
fi

# A different authenticated account cannot delete a story it does not own.
psql -X -q -v ON_ERROR_STOP=1 <<'SQL'
SET ROLE authenticated;
SET request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
DELETE FROM public.storyler WHERE id=11;
RESET ROLE;
SQL
remaining="$(psql -X -q -v ON_ERROR_STOP=1 -tA -c 'SELECT count(*) FROM public.storyler WHERE id=11;')"
test "$remaining" = "1"

# The owner can delete their own story.
psql -X -q -v ON_ERROR_STOP=1 <<'SQL'
SET ROLE authenticated;
SET request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
DELETE FROM public.storyler WHERE id=11;
RESET ROLE;
SQL
remaining="$(psql -X -q -v ON_ERROR_STOP=1 -tA -c 'SELECT count(*) FROM public.storyler WHERE id=11;')"
test "$remaining" = "0"

echo "PASS story/version RLS: public only, private drafts owned, owner-only delete."
