-- Yedekte/staging'de preflight temizlendikten sonra constraint doğrulaması.
-- Hata halinde bu işlemin tamamı geri alınır; hiçbir kayıt silinmez.
BEGIN;
DO $$ DECLARE c record; BEGIN
 FOR c IN SELECT conname,conrelid::regclass AS table_name FROM pg_constraint
  WHERE NOT convalidated AND connamespace='public'::regnamespace
  AND conrelid::regclass::text IN ('profiles','senaryolar','gonderiler','senaryo_versiyonlar','begeniler','kaydedilenler','yorumlar','takipler','engellemeler','mesajlar','bildirimler','raporlar','challengelar','challenge_katilimlar','media_assets','ozel_notlar','storyler','ai_usage_reservations','kullanim_log','gonderi_hashtagler')
 LOOP
  RAISE NOTICE 'Validating %.%',c.table_name,c.conname;
  EXECUTE format('ALTER TABLE %s VALIDATE CONSTRAINT %I',c.table_name,c.conname);
 END LOOP;
END $$;
COMMIT;
