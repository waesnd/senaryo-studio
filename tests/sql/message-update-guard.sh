#!/usr/bin/env bash
set -euo pipefail
if [[ "${FABULARC_TEST_DATABASE:-}" != "disposable-ci-postgres" ]]; then
  echo "Refusing message RLS tests outside disposable CI database" >&2
  exit 2
fi

psql -X -q -v ON_ERROR_STOP=1 <<'SQL'
CREATE SCHEMA auth;
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
 SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
CREATE TABLE public.mesajlar (
 id bigint PRIMARY KEY,
 gonderen uuid NOT NULL,
 alan uuid NOT NULL,
 icerik text,
 fotograf_url text,
 medya_url text,
 ses_url text,
 okundu boolean DEFAULT false,
 created_at timestamptz DEFAULT now()
);
ALTER TABLE public.mesajlar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mesajlar_select_own" ON public.mesajlar
 FOR SELECT TO authenticated USING ((SELECT auth.uid())=gonderen OR (SELECT auth.uid())=alan);
CREATE POLICY "mesajlar_update_receiver" ON public.mesajlar
 FOR UPDATE TO authenticated USING ((SELECT auth.uid())=alan)
 WITH CHECK ((SELECT auth.uid())=alan);
CREATE POLICY "mesajlar_guncelleme" ON public.mesajlar
 FOR UPDATE TO PUBLIC USING ((SELECT auth.uid())=alan OR (SELECT auth.uid())=gonderen);
GRANT USAGE ON SCHEMA public,auth TO authenticated;
GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated;
GRANT SELECT,UPDATE ON public.mesajlar TO authenticated;
INSERT INTO public.mesajlar(id,gonderen,alan,icerik) VALUES
 (1,'11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','Original content');
SQL
psql -X -v ON_ERROR_STOP=1 -f supabase/migrations/202611080004_guard_message_updates.sql

# Sender cannot change message content or read status through public RLS.
psql -X -q -v ON_ERROR_STOP=1 <<'SQL'
SET ROLE authenticated;
SET request.jwt.claim.sub='11111111-1111-4111-8111-111111111111';
UPDATE public.mesajlar SET icerik='Unauthorized change' WHERE id=1;
UPDATE public.mesajlar SET okundu=true WHERE id=1;
RESET ROLE;
SQL
before="$(psql -X -q -tA -v ON_ERROR_STOP=1 -c "SELECT icerik || '|' || okundu::text FROM public.mesajlar WHERE id=1;")"
test "$before" = "Original content|false"

# Recipient can mark a message read.
psql -X -q -v ON_ERROR_STOP=1 <<'SQL'
SET ROLE authenticated;
SET request.jwt.claim.sub='22222222-2222-4222-8222-222222222222';
UPDATE public.mesajlar SET okundu=true WHERE id=1;
RESET ROLE;
SQL
after="$(psql -X -q -tA -v ON_ERROR_STOP=1 -c "SELECT icerik || '|' || okundu::text FROM public.mesajlar WHERE id=1;")"
test "$after" = "Original content|true"

# Recipient cannot rewrite message text despite having UPDATE privileges.
if psql -X -q -v ON_ERROR_STOP=1 <<'SQL' >/dev/null 2>&1
SET ROLE authenticated;
SET request.jwt.claim.sub='22222222-2222-4222-8222-222222222222';
UPDATE public.mesajlar SET icerik='Tampered' WHERE id=1;
SQL
then
  echo "Recipient was able to tamper with message text" >&2
  exit 1
fi
echo "PASS: owner cannot rewrite, receiver only acknowledges read, immutable content enforced."
