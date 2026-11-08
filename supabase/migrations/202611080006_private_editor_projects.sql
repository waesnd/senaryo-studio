-- Fabularc professional writing editor: independent private workspaces/scenes
-- Additive and forward-only. Does not alter legacy senaryolar or its versions.
BEGIN;

CREATE TABLE IF NOT EXISTS public.yazarlik_projeleri (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  baslik text NOT NULL DEFAULT 'Başlıksız Proje' CHECK (char_length(baslik) BETWEEN 1 AND 200),
  format text NOT NULL DEFAULT 'screenplay'
    CHECK (format IN ('screenplay','novel','story','poetry')),
  dil text NOT NULL DEFAULT 'tr' CHECK (dil ~ '^[a-z]{2}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.yazarlik_sahneleri (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proje_id uuid NOT NULL REFERENCES public.yazarlik_projeleri(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sira integer NOT NULL DEFAULT 0 CHECK (sira >= 0),
  baslik text NOT NULL DEFAULT '' CHECK (char_length(baslik) <= 400),
  icerik text NOT NULL DEFAULT '' CHECK (char_length(icerik) <= 200000),
  versiyon integer NOT NULL DEFAULT 1 CHECK (versiyon > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS fabularc_projects_owner_date_idx
  ON public.yazarlik_projeleri(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS fabularc_scenes_project_order_idx
  ON public.yazarlik_sahneleri(proje_id, sira, created_at);

ALTER TABLE public.yazarlik_projeleri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yazarlik_sahneleri ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fabularc_project_select_own" ON public.yazarlik_projeleri
  FOR SELECT TO authenticated USING (user_id=(SELECT auth.uid()));
CREATE POLICY "fabularc_project_insert_own" ON public.yazarlik_projeleri
  FOR INSERT TO authenticated WITH CHECK (user_id=(SELECT auth.uid()));
CREATE POLICY "fabularc_project_update_own" ON public.yazarlik_projeleri
  FOR UPDATE TO authenticated USING (user_id=(SELECT auth.uid()))
  WITH CHECK (user_id=(SELECT auth.uid()));
CREATE POLICY "fabularc_project_delete_own" ON public.yazarlik_projeleri
  FOR DELETE TO authenticated USING (user_id=(SELECT auth.uid()));

CREATE POLICY "fabularc_scene_select_own" ON public.yazarlik_sahneleri
  FOR SELECT TO authenticated USING (user_id=(SELECT auth.uid()));
CREATE POLICY "fabularc_scene_insert_own" ON public.yazarlik_sahneleri
  FOR INSERT TO authenticated WITH CHECK (
    user_id=(SELECT auth.uid())
    AND EXISTS (SELECT 1 FROM public.yazarlik_projeleri p
      WHERE p.id=proje_id AND p.user_id=(SELECT auth.uid()))
  );
CREATE POLICY "fabularc_scene_update_own" ON public.yazarlik_sahneleri
  FOR UPDATE TO authenticated USING (user_id=(SELECT auth.uid()))
  WITH CHECK (user_id=(SELECT auth.uid()));
CREATE POLICY "fabularc_scene_delete_own" ON public.yazarlik_sahneleri
  FOR DELETE TO authenticated USING (user_id=(SELECT auth.uid()));

CREATE OR REPLACE FUNCTION public.fabularc_scene_revision_guard()
RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path=''
AS $fn$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id
    OR NEW.proje_id IS DISTINCT FROM OLD.proje_id
    OR NEW.user_id IS DISTINCT FROM OLD.user_id
    OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Scene identity and ownership cannot change' USING ERRCODE='42501';
  END IF;
  NEW.versiyon := OLD.versiyon+1;
  NEW.updated_at := now();
  RETURN NEW;
END
$fn$;

CREATE TRIGGER fabularc_scene_revision_before_update
  BEFORE UPDATE ON public.yazarlik_sahneleri
  FOR EACH ROW EXECUTE FUNCTION public.fabularc_scene_revision_guard();

REVOKE ALL ON public.yazarlik_projeleri,public.yazarlik_sahneleri FROM anon;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.yazarlik_projeleri,public.yazarlik_sahneleri TO authenticated;
REVOKE ALL ON FUNCTION public.fabularc_scene_revision_guard() FROM PUBLIC,anon,authenticated;

COMMIT;
