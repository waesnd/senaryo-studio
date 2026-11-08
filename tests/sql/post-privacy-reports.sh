#!/usr/bin/env bash
set -euo pipefail
if [[ "${FABULARC_TEST_DATABASE:-}" != "disposable-ci-postgres" ]]; then
  echo "Refusing post security test outside disposable database" >&2
  exit 2
fi
psql -X -q -v ON_ERROR_STOP=1 <<'SQL'
CREATE SCHEMA auth;
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
 SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
CREATE TABLE public.gonderiler (
 id bigint PRIMARY KEY,
 user_id uuid NOT NULL,
 paylasim_acik boolean DEFAULT false
);
CREATE TABLE public.raporlar (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 icerik_turu text,
 icerik_id text,
 rapor_eden uuid
);
ALTER TABLE public.gonderiler ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gönderileri herkes görebilir" ON public.gonderiler
 FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Begeni sayısı güncelle" ON public.gonderiler
 FOR UPDATE TO PUBLIC USING (true);
CREATE POLICY "raporlar_insert" ON public.raporlar FOR INSERT TO authenticated
 WITH CHECK ((SELECT auth.uid())=rapor_eden);
GRANT USAGE ON SCHEMA public,auth TO anon,authenticated;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon,authenticated;
GRANT SELECT,UPDATE ON public.gonderiler TO anon,authenticated;
GRANT INSERT ON public.raporlar TO authenticated;
INSERT INTO public.gonderiler(id,user_id,paylasim_acik) VALUES
 (1,'11111111-1111-4111-8111-111111111111',false),
 (2,'11111111-1111-4111-8111-111111111111',true);
SQL
psql -X -v ON_ERROR_STOP=1 -f supabase/migrations/202611080005_post_privacy_and_reports.sql

# Public cannot read unpublished posts.
visible="$(psql -X -q -tA -v ON_ERROR_STOP=1 <<'SQL'
SET ROLE anon;
SELECT COUNT(*) FROM public.gonderiler;
SQL
)"
test "$visible" = "1"

# An unrelated authenticated user cannot change the public post.
psql -X -q -v ON_ERROR_STOP=1 <<'SQL'
SET ROLE authenticated;
SET request.jwt.claim.sub='22222222-2222-4222-8222-222222222222';
UPDATE public.gonderiler SET paylasim_acik=false WHERE id=2;
RESET ROLE;
SQL
status="$(psql -X -q -tA -v ON_ERROR_STOP=1 -c 'SELECT paylasim_acik FROM public.gonderiler WHERE id=2;')"
test "$status" = "t"

# Four distinct reporters, including a duplicate report, must not hide post.
psql -X -q -v ON_ERROR_STOP=1 <<'SQL'
INSERT INTO public.raporlar(icerik_turu,icerik_id,rapor_eden) VALUES
 ('gonderi','2','22222222-2222-4222-8222-222222222222'),
 ('gonderi','2','22222222-2222-4222-8222-222222222222'),
 ('gonderi','2','33333333-3333-4333-8333-333333333333'),
 ('gonderi','2','44444444-4444-4444-8444-444444444444'),
 ('gonderi','2','55555555-5555-4555-8555-555555555555');
SQL
status="$(psql -X -q -tA -v ON_ERROR_STOP=1 -c 'SELECT paylasim_acik FROM public.gonderiler WHERE id=2;')"
test "$status" = "t"

# Fifth distinct account triggers the same moderation threshold as legacy UI.
psql -X -q -v ON_ERROR_STOP=1 <<'SQL'
INSERT INTO public.raporlar(icerik_turu,icerik_id,rapor_eden)
VALUES ('gonderi','2','66666666-6666-4666-8666-666666666666');
SQL
status="$(psql -X -q -tA -v ON_ERROR_STOP=1 -c 'SELECT paylasim_acik FROM public.gonderiler WHERE id=2;')"
test "$status" = "f"
echo "PASS private posts invisible, foreign updates denied, 5 distinct reports enforced."
