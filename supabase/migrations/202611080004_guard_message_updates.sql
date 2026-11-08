-- Restrict message mutations to read-status acknowledgement by the recipient.
-- Existing rows, messages and attachments are preserved.
BEGIN;

-- This permissive policy previously let either participant update an entire
-- message row, including its author, recipient, content and media URLs.
DROP POLICY IF EXISTS "mesajlar_guncelleme" ON public.mesajlar;

CREATE OR REPLACE FUNCTION public.fabularc_guard_message_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.gonderen IS DISTINCT FROM OLD.gonderen
     OR NEW.alan IS DISTINCT FROM OLD.alan
     OR NEW.icerik IS DISTINCT FROM OLD.icerik
     OR NEW.fotograf_url IS DISTINCT FROM OLD.fotograf_url
     OR NEW.medya_url IS DISTINCT FROM OLD.medya_url
     OR NEW.ses_url IS DISTINCT FROM OLD.ses_url
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Message content and ownership are immutable'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.okundu IS DISTINCT FROM OLD.okundu AND NEW.okundu IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Only marking a message as read is supported'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END
$function$;

DROP TRIGGER IF EXISTS fabularc_immutable_message_content ON public.mesajlar;
CREATE TRIGGER fabularc_immutable_message_content
  BEFORE UPDATE ON public.mesajlar
  FOR EACH ROW
  EXECUTE FUNCTION public.fabularc_guard_message_update();

REVOKE ALL ON FUNCTION public.fabularc_guard_message_update() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fabularc_guard_message_update() FROM anon;
REVOKE ALL ON FUNCTION public.fabularc_guard_message_update() FROM authenticated;

COMMIT;
