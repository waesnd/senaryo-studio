-- Fabularc RLS hardening / 2026-11-08
-- Forward migration: restores story access and removes public access to private draft versions.
-- No existing rows are updated, deleted, or rewritten.
BEGIN;

-- Story content is publicly displayed in the existing home-page story bar.
-- Creation and deletion belong exclusively to the authenticated owner.
ALTER TABLE public.storyler ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fabularc_story_read" ON public.storyler
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "fabularc_story_create_own" ON public.storyler
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "fabularc_story_delete_own" ON public.storyler
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- An earlier permissive SELECT policy exposed all draft versions (including
-- those whose parent scenarios were unpublished or unrelated to the caller).
-- The existing "versiyonlar_okuma" owner policy is retained.
DROP POLICY IF EXISTS "senaryo_versiyonlar_public" ON public.senaryo_versiyonlar;

CREATE POLICY "fabularc_published_scenario_versions" ON public.senaryo_versiyonlar
  FOR SELECT TO anon, authenticated
  USING (
    senaryo_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.senaryolar parent
      WHERE parent.id = senaryo_versiyonlar.senaryo_id
        AND parent.paylasim_acik IS TRUE
        AND COALESCE(parent.gizli, false) IS FALSE
    )
  );

COMMIT;
