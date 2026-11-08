-- Fabularc post privacy and report moderation controls
-- Preserve existing records; restrict reads and unauthorized updates.
BEGIN;

DROP POLICY IF EXISTS "Gönderileri herkes görebilir" ON public.gonderiler;
DROP POLICY IF EXISTS "Begeni sayısı güncelle" ON public.gonderiler;

CREATE POLICY "fabularc_posts_public_or_owner" ON public.gonderiler
  FOR SELECT TO anon, authenticated
  USING (paylasim_acik IS TRUE OR user_id=(SELECT auth.uid()));

CREATE POLICY "fabularc_posts_owner_update" ON public.gonderiler
  FOR UPDATE TO authenticated
  USING (user_id=(SELECT auth.uid()))
  WITH CHECK (user_id=(SELECT auth.uid()));

-- The previous browser-side 5-report counter used a SELECT on reports which
-- has no RLS policy, so it could not reliably enforce moderation.
-- Keep the five-report behavior, but count distinct authenticated reporters.
CREATE INDEX IF NOT EXISTS fabularc_report_post_distinct_idx
  ON public.raporlar(icerik_turu,icerik_id,rapor_eden);

CREATE OR REPLACE FUNCTION public.fabularc_moderate_reported_post()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=''
AS $function$
DECLARE
  v_post_id bigint;
  v_reporters integer;
BEGIN
  IF NEW.icerik_turu IS DISTINCT FROM 'gonderi'
     OR NEW.icerik_id IS NULL
     OR NEW.icerik_id !~ '^[0-9]{1,18}$'
     OR NEW.rapor_eden IS NULL THEN
    RETURN NEW;
  END IF;

  v_post_id := NEW.icerik_id::bigint;

  -- An independent account's repeated reports count only once.
  SELECT COUNT(DISTINCT rapor_eden)::integer
    INTO v_reporters
    FROM public.raporlar
    WHERE icerik_turu='gonderi'
      AND icerik_id=NEW.icerik_id;

  IF v_reporters >= 5 THEN
    UPDATE public.gonderiler
       SET paylasim_acik=false
     WHERE id=v_post_id
       AND paylasim_acik IS TRUE;
  END IF;
  RETURN NEW;
END
$function$;

DROP TRIGGER IF EXISTS fabularc_reports_moderate_post ON public.raporlar;
CREATE TRIGGER fabularc_reports_moderate_post
  AFTER INSERT ON public.raporlar
  FOR EACH ROW EXECUTE FUNCTION public.fabularc_moderate_reported_post();

REVOKE ALL ON FUNCTION public.fabularc_moderate_reported_post() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fabularc_moderate_reported_post() FROM anon;
REVOKE ALL ON FUNCTION public.fabularc_moderate_reported_post() FROM authenticated;

COMMIT;
