-- Fabularc personal writing archive, additive only.
-- Keeps senaryo_versiyonlar unchanged for existing scenario version history.
BEGIN;

CREATE TABLE IF NOT EXISTS public.yazar_arsivi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tip text,
  tur text,
  baslik text,
  tagline text,
  veri jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS yazar_arsivi_owner_created_idx
  ON public.yazar_arsivi(user_id, created_at DESC);

ALTER TABLE public.yazar_arsivi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fabularc_archive_select_own"
  ON public.yazar_arsivi FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "fabularc_archive_insert_own"
  ON public.yazar_arsivi FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "fabularc_archive_delete_own"
  ON public.yazar_arsivi FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Limit exposed privileges to the three used operations.
REVOKE ALL ON public.yazar_arsivi FROM anon;
GRANT SELECT, INSERT, DELETE ON public.yazar_arsivi TO authenticated;

COMMIT;
