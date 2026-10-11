-- Salt okunur: satırları veya mevcut şemayı değiştirmez, kişisel içerik yazdırmaz.
BEGIN TRANSACTION READ ONLY;
DO $preflight$
DECLARE spec record; n bigint; missing text[]; c record;
BEGIN
 RAISE NOTICE 'Senaryo Studio preflight: raporlanan sayılar sıfır değilse upgrade kılavuzunu izleyin.';
 FOR c IN SELECT table_name,column_name,data_type FROM information_schema.columns
  WHERE table_schema='public' AND table_name IN ('senaryolar','gonderiler','senaryo_versiyonlar','begeniler','kaydedilenler','yorumlar','mesajlar','bildirimler','raporlar','challengelar','hashtagler') AND column_name='id'
 LOOP
  IF c.data_type NOT IN ('integer','bigint','smallint') THEN RAISE WARNING 'ID_TYPE: %.% = %; explicit ID mapping gerekir.',c.table_name,c.column_name,c.data_type; END IF;
 END LOOP;
 FOR spec IN SELECT * FROM (VALUES
  ('profiles',ARRAY['username'],'username_duplicate','SELECT count(*) FROM (SELECT lower(username) FROM public.profiles WHERE username IS NOT NULL GROUP BY lower(username) HAVING count(*)>1) x'),
  ('profiles',ARRAY['website'],'unsafe_website','SELECT count(*) FROM public.profiles WHERE website IS NOT NULL AND website<>'''' AND NOT (length(website)<=2048 AND website ~* ''^https?://[^[:space:]]+$'')'),
  ('profiles',ARRAY['username'],'invalid_username','SELECT count(*) FROM public.profiles WHERE username IS NOT NULL AND username !~ ''^[A-Za-z0-9_]{3,30}$'''),
  ('profiles',ARRAY['bio','nickname'],'oversized_profile_text','SELECT count(*) FROM public.profiles WHERE length(coalesce(bio,''''))>2000 OR length(coalesce(nickname,''''))>100'),
  ('profiles',ARRAY['id'],'profile_without_auth','SELECT count(*) FROM public.profiles p LEFT JOIN auth.users a ON a.id=p.id WHERE a.id IS NULL'),
  ('gonderiler',ARRAY['senaryo_id'],'post_without_scenario','SELECT count(*) FROM public.gonderiler WHERE senaryo_id IS NULL'),
  ('gonderiler',ARRAY['senaryo_id'],'duplicate_posts','SELECT count(*) FROM (SELECT senaryo_id FROM public.gonderiler WHERE senaryo_id IS NOT NULL GROUP BY senaryo_id HAVING count(*)>1) x'),
  ('gonderiler',ARRAY['senaryo_id'],'post_scenario_orphan','SELECT count(*) FROM public.gonderiler g LEFT JOIN public.senaryolar s ON s.id=g.senaryo_id WHERE g.senaryo_id IS NOT NULL AND s.id IS NULL'),
  ('senaryo_versiyonlar',ARRAY['senaryo_id'],'standalone_archive_will_be_preserved','SELECT count(*) FROM public.senaryo_versiyonlar WHERE senaryo_id IS NULL'),
  ('senaryo_versiyonlar',ARRAY['senaryo_id','versiyon'],'duplicate_versions','SELECT count(*) FROM (SELECT senaryo_id,versiyon FROM public.senaryo_versiyonlar WHERE senaryo_id IS NOT NULL AND versiyon IS NOT NULL GROUP BY senaryo_id,versiyon HAVING count(*)>1) x'),
  ('begeniler',ARRAY['senaryo_id','user_id'],'duplicate_likes','SELECT count(*) FROM (SELECT user_id,senaryo_id FROM public.begeniler WHERE senaryo_id IS NOT NULL GROUP BY user_id,senaryo_id HAVING count(*)>1) x'),
  ('kaydedilenler',ARRAY['senaryo_id','user_id'],'duplicate_bookmarks','SELECT count(*) FROM (SELECT user_id,senaryo_id FROM public.kaydedilenler WHERE senaryo_id IS NOT NULL GROUP BY user_id,senaryo_id HAVING count(*)>1) x'),
  ('raporlar',ARRAY['senaryo_id','rapor_eden'],'duplicate_reports','SELECT count(*) FROM (SELECT rapor_eden,senaryo_id FROM public.raporlar WHERE senaryo_id IS NOT NULL GROUP BY rapor_eden,senaryo_id HAVING count(*)>1) x'),
  ('takipler',ARRAY['takip_eden','takip_edilen'],'duplicate_follows','SELECT count(*) FROM (SELECT takip_eden,takip_edilen FROM public.takipler GROUP BY takip_eden,takip_edilen HAVING count(*)>1) x'),
  ('engellemeler',ARRAY['engelleyen','engellenen'],'duplicate_blocks','SELECT count(*) FROM (SELECT engelleyen,engellenen FROM public.engellemeler GROUP BY engelleyen,engellenen HAVING count(*)>1) x'),
  ('hashtagler',ARRAY['tag'],'duplicate_tags','SELECT count(*) FROM (SELECT tag FROM public.hashtagler GROUP BY tag HAVING count(*)>1) x'),
  ('senaryo_versiyonlar',ARRAY['user_id','senaryo_id'],'archive_owner_mismatch','SELECT count(*) FROM public.senaryo_versiyonlar v JOIN public.senaryolar s ON s.id=v.senaryo_id WHERE v.user_id IS DISTINCT FROM s.user_id'),
  ('gonderiler',ARRAY['user_id','senaryo_id'],'post_owner_mismatch','SELECT count(*) FROM public.gonderiler g JOIN public.senaryolar s ON s.id=g.senaryo_id WHERE g.user_id IS DISTINCT FROM s.user_id')
 ) x(table_name,columns,label,query_sql) LOOP
  IF to_regclass('public.'||spec.table_name) IS NULL THEN
   RAISE NOTICE '%: tablo yok; yeni kurulumda oluşturulacak.',spec.label; CONTINUE;
  END IF;
  SELECT array_agg(col) INTO missing FROM unnest(spec.columns) col WHERE NOT EXISTS(SELECT 1 FROM information_schema.columns i WHERE i.table_schema='public' AND i.table_name=spec.table_name AND i.column_name=col);
  IF missing IS NOT NULL THEN RAISE NOTICE '%: legacy kolonlar eksik (%); upgrade sırasında eklenecek.',spec.label,array_to_string(missing,','); CONTINUE; END IF;
  BEGIN EXECUTE spec.query_sql INTO n;
   RAISE NOTICE '%: %',spec.label,n;
  EXCEPTION WHEN undefined_table OR undefined_column THEN RAISE NOTICE '%: bağlı legacy tablo/kolon henüz yok.',spec.label;
  END;
 END LOOP;
 FOR c IN SELECT ns.nspname,tabcls.relname,t.tgname FROM pg_trigger t JOIN pg_class tabcls ON tabcls.oid=t.tgrelid JOIN pg_namespace ns ON ns.oid=tabcls.relnamespace WHERE NOT t.tgisinternal AND ns.nspname IN ('public','auth') ORDER BY ns.nspname,tabcls.relname,t.tgname LOOP
  RAISE NOTICE 'EXISTING_TRIGGER: %.% / % — eski sayaç ve signup trigger çakışmalarını kontrol edin.',c.nspname,c.relname,c.tgname;
 END LOOP;
END $preflight$;
ROLLBACK;
