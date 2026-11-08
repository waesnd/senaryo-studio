-- Fabularc / 2026-11-08
-- Additive, forward-only atomic AI quota reservation.
-- PREREQUISITE: inspect public.kullanim_log schema, RLS, column types and grants
-- on the REAL database before applying. Do not run against unknown production data.
--
-- Assumed legacy columns verified from application usage:
--   user_id uuid, islem text, created_at timestamptz, meta jsonb
--
-- All AI request reservations for one authenticated user are serialized in a
-- single PostgreSQL transaction. No direct application count-then-insert remains.
CREATE OR REPLACE FUNCTION public.reserve_generate_quota(p_meta jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_now timestamptz := transaction_timestamp();
  v_used integer := 0;
  v_earliest timestamptz;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authenticated user required'
      USING ERRCODE = '28000';
  END IF;
  IF p_meta IS NULL OR pg_catalog.jsonb_typeof(p_meta) <> 'object'
     OR pg_catalog.pg_column_size(p_meta) > 2048 THEN
    RAISE EXCEPTION 'Invalid quota metadata'
      USING ERRCODE = '22023';
  END IF;

  -- Authenticate from JWT, never accept an owner_id or a client-supplied limit.
  -- Serializing per user blocks concurrent requests racing the 50/day cap.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_uid::text || ':generate', 0)
  );

  SELECT count(*)::integer, min(created_at)
    INTO v_used, v_earliest
    FROM public.kullanim_log
    WHERE user_id = v_uid
      AND islem = 'generate'
      AND created_at >= v_now - interval '24 hours';

  IF v_used >= 50 THEN
    RETURN pg_catalog.jsonb_build_object(
      'allowed', false,
      'kalan', 0,
      'limit', 50,
      'reset_at', v_earliest + interval '24 hours'
    );
  END IF;

  INSERT INTO public.kullanim_log (user_id, islem, meta)
  VALUES (v_uid, 'generate', p_meta);

  RETURN pg_catalog.jsonb_build_object(
    'allowed', true,
    'kalan', 49 - v_used,
    'limit', 50,
    'reset_at', NULL
  );
END
$function$;

-- SECURITY DEFINER functions receive EXECUTE by PUBLIC by default.
REVOKE ALL ON FUNCTION public.reserve_generate_quota(jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reserve_generate_quota(jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.reserve_generate_quota(jsonb) TO authenticated;

COMMENT ON FUNCTION public.reserve_generate_quota(jsonb)
IS 'Reserve one AI generation under a serializable per-user 24-hour cap. Uses auth.uid(); authenticated only.';
