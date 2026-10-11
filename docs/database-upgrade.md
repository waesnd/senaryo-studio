# Veritabanı kurulumu ve güvenli geçiş

Bu paket canlı veritabanında çalıştırılmadı. SQL, Supabase PostgreSQL (`auth.users`, `auth.uid()`, `auth.role()`, `anon`, `authenticated`, `service_role`) için hazırlanmıştır. Depodaki testler gerçek PostgreSQL motorunun PGlite sürümünde çalışır; Supabase proje ayarları, provider bağlantıları ve bağımsız sunucu bağlantılarının eşzamanlılığı için staging kontrolü ayrıca gerekir.

## Önce mevcut veriyi koruyun

1. Tam veritabanı yedeği alın ve yedeğin ayrı bir staging ortamına geri yüklenebildiğini doğrulayın. SQL, tablo sıfırlama veya veri silerek migration temizleme kullanmaz.
2. `supabase/preflight.sql` dosyasını **önce staging kopyasında** çalıştırın. Salt okunur rapor yalnız sayıları ve trigger adlarını gösterir; senaryo veya mesaj içeriklerini yazdırmaz.
3. Belirsiz ilişkileri açık bir eşleme planıyla çözün. `gonderiler.id` ile `senaryolar.id` aynı kimlik türü değildir; yalnız sayı eşitliğine dayanarak bağlamayın. UUID içerik kimlikleri varsa sayısal kimliklere ayrı bir mapping migration hazırlayın; bu paket otomatik tip dönüşümü yapmaz.
4. `202610110001_platform_foundation.sql` dosyasını uygulayın; ardından `supabase/validate.sql` ile mevcut veriyi constraint'lere karşı doğrulayın.
5. İki kullanıcı ve anonim oturumla aşağıdaki erişim kontrollerini staging'de tamamlayın. Uygulama sürümü ve migration birlikte dağıtılmalıdır; eski istemcilerin doğrudan tablo güncellemeleri yeni kurallarla reddedilir.

Örnek komutlar (bağlantı URL'sini yalnız güvenli ortam değişkeninde tutun):

```bash
pg_dump --format=custom --no-owner "$APP_DATABASE_URL" --file=senaryo-studio-backup.dump
psql -X -v ON_ERROR_STOP=1 "$APP_DATABASE_URL" -f supabase/preflight.sql
psql -X -v ON_ERROR_STOP=1 "$APP_DATABASE_URL" -f supabase/migrations/202610110001_platform_foundation.sql
psql -X -v ON_ERROR_STOP=1 "$APP_DATABASE_URL" -f supabase/validate.sql
```

Supabase SQL Editor da kullanılabilir. Hata alan transaction aynı bağlantıda `ROLLBACK` gerektirir. Dosya tek transaction'dır: belirsiz legacy durumlarda `PRECHECK` ile durur ve tamamı geri alınır. Yedekler Git'e eklenmemelidir.

## Legacy kararları

| Bulgu | Güvenli karar |
| --- | --- |
| `senaryo_id` olmayan gönderi | Gerçek kaynak eseri belirleyip explicit mapping oluşturun. Bağımsız bir sosyal gönderiyse içeriğini koruyan ayrı bir eser/mapping migration hazırlayın. Paket otomatik kimlik tahmini yapmaz. |
| Bir eser için birden çok gönderi | İçeriği ve eski URL'leri yedekleyip hangi gönderinin kanonik olacağını belirleyin. Duplicate satırları bu migration silmez. |
| Tekrar eden beğeni/kayıt/rapor, kullanıcı adı veya sürüm numarası | Migration öncesi kayıtları dışa aktarın ve ayrı, incelenebilir veri düzeltme planı hazırlayın. Otomatik deduplication yoktur. |
| Sahibi olmayan ya da sahibi eserle uyuşmayan kayıt | Gerçek sahipliği auth kayıtlarıyla doğrulayın; yabancı kullanıcının ID'sine otomatik taşıma yapmayın. |
| Bağımsız eski arşiv | Otomatik olarak aynı kullanıcının **özel** eserine bağlanır. Orijinal `veri` metni ve mevcut legacy alanlar korunur. `snapshot` yalnız kanonik belgeyi taşır; eski analizler `veri` içinde kalır. |
| Eski `veri` JSON'u bozuk | Ham değer korunur; metin kolonlarından belge hazırlanır. Staging'de eksik/bozuk arşiv içeriğini inceleyin. |
| Eski kullanıcı adı/website constraint'e uymuyor | Preflight'ta `invalid_username`, `unsafe_website` ve `oversized_profile_text` sayıları sıfır olmalıdır. `NOT VALID` kayıtları silmez; ancak migration'ın sayaç uzlaştırması da UPDATE yaptığından eski hatalı satır aynı transaction'da kontrol edilir ve migration geri alınır. Önce incelenebilir düzeltme planı gerekir. |
| Mevcut trigger'lar | Preflight listesinde eski beğeni/senaryo/hashtag sayaçları ve `auth.users` signup trigger'larını inceleyin. Aynı işi yapan eski trigger'ları ayrı, gözden geçirilmiş migration'da kaldırın; bu paket üçüncü taraf trigger'ları otomatik silmez. |

İlk migration sırasında açık durumdaki senaryolar kanonik gönderilere dönüştürülür; kapalı gönderiler kayıt olarak korunur ve public RLS tarafından gizlenir. Bağlı gönderinin ID'si yayın aç/kapat sırasında değişmez. `senaryo_id` ve sahip uyuşmazlıkları staging'de çözülmelidir. Mevcut foreign key'ler `RESTRICT` kullanıyorsa kanonik `ON DELETE CASCADE` kurallarıyla çakışmadığını doğrulayın.

## Belge ve sürüm sözleşmesi

```json
{
  "schemaVersion": 1,
  "title": "Başlık",
  "tagline": "Kısa vaat",
  "synopsis": "Özet",
  "characters": [{"id": "character-1", "name": "İpek", "description": "Karakter açıklaması"}],
  "scenes": [{"id": "scene-1", "heading": "İÇ. EV — GÜNDÜZ", "action": "Aksiyon", "dialogue": [{"id": "line-1", "character": "İpek", "text": "Diyalog"}]}],
  "dramaticQuestion": "Dramatik soru",
  "metadata": {}
}
```

`metadata` ek üretim/analiz bilgisini koruyabilir. Belge toplam 1 MB; başlık 240 karakter, en fazla 100 karakter ve 500 sahne kabul edilir. Taslak başlığı boş olabilir; liste adı `Başlıksız eser` olur ve yayınlamadan önce başlık istenir. Sahne başına en fazla 1.000 diyalog satırı vardır. Karakter, sahne ve kendi sahnesindeki diyalog ID'leri tekildir. `senaryolar.document` kaynağın kendisidir; `baslik`, `ana_fikir`, `ozet`, `karakter`, `sahne` alanları uyumluluk için trigger tarafından türetilir. `etiketler` NFKC + Türkçe I/İ dönüşümüyle özetten/başlıktan çıkarılır.

Her kayıt `revision` artırır. Mevcut eseri kaydetmek ve geri yüklemek için `p_expected_revision` zorunludur; eşleşmeyince `40001 / REVISION_CONFLICT` döner. Görünürlük değişimi belge revizyonunu değiştirmez. Sürümler `senaryo_versiyonlar.snapshot` içinde saklanır; `tip` ve `tur` da sürüme eklenir. Geri yükleme önce mevcut belgeyi otomatik sürüm olarak arşivler, sonra seçilen sürümü uygular. Sürümler yalnız eser sahibine açıktır.

## RPC'ler

| İşlem | Argümanlar | Sonuç |
| --- | --- | --- |
| `save_scenario` | `p_id`, `p_document`, `p_tip`, `p_tur`, `p_expected_revision` | Tam eser JSON satırı |
| `create_scenario_version` | `p_scenario_id`, `p_label` | `snapshot` içeren sürüm JSON satırı |
| `restore_scenario_version` | `p_version_id`, `p_expected_revision` | Tam eser JSON satırı |
| `set_scenario_visibility` | `p_scenario_id`, `p_public` | Tam eser JSON satırı |
| `delete_scenario` | `p_scenario_id` | `true`; bağlı gönderi/sürüm/yorum/beğeni/kayıt/rapor/başvuru transaction içinde silinir |
| `toggle_scenario_like` | `p_scenario_id` | `{liked,count}` |
| `toggle_scenario_bookmark` | `p_scenario_id` | `{saved}` |
| `follow_profile` | `p_profile_id` | `{following}`; tekrar çağrı takibi kaldırır |
| `block_profile` | `p_profile_id` | `{blocked}`; engelleme iki yönlü takibi kaldırır |
| `save_private_note` | `p_profile_id`, `p_text` | Owner'a ait `{user_id,profile_id,metin,updated_at}` not satırı; ilk ve sonraki kayıtta aynı dar upsert |
| `submit_report` | `p_scenario_id`, `p_reason` | `{submitted,alreadyReported}` |
| `moderate_scenario` | `p_scenario_id`, `p_hidden`, `p_resolution` | Eser JSON satırı; yalnız `platform_roles` admin/moderator |
| `mark_notifications_read` | `p_ids` bigint[] | Yalnız alıcıya ait belirtilen ID'lerin güncellenen sayısı; en fazla 200 ID |
| `submit_challenge` | `p_challenge_id`, `p_scenario_id` | Başvuru JSON satırı; sahiplik, aktiflik ve deadline kontrol edilir |
| `list_conversations` | `p_before_at`, `p_before_id`, `p_limit` | `peer_id,last_id,icerik,created_at,gonderen,medya_asset_id,ses_asset_id,unread_count` satırları; en fazla 100 sohbet |

Yorumlar doğrudan `yorumlar` tablosuna owner RLS ile eklenir; `scene_id` ve `feedback_type` yapılandırılmış eleştiri alanlarıdır. Beğeni/yorum/takip bildirimlerini DB üretir. Sayaçlar atomik artış/azalışlarla tutulur; kullanıcının sayaç, doğrulama veya moderasyon sütunlarını güncelleme yetkisi yoktur. Public profile okumaları açık alan listesiyle sınırlıdır; legacy tabloda kalmış özel sütunlar okunamaz.

## AI ve medya bütçesi

`reserve_ai_usage(p_request_id uuid,p_operation text)` doğrulanmış `auth.uid()` ile çalışır. Bütün 11 AI aracı ortak **UTC takvim günü başına 50 başarılı veya aktif işlem**, **günde en fazla 100 toplam deneme**, **60 saniyede 20 deneme**, **en fazla 3 aktif rezervasyon** sınırını paylaşır. Aynı request ID ikinci kez çalıştırılamaz. İşlem başarısızsa 50 kredilik günlük bütçe geri verilir; dakikalık ve 100 denemelik günlük sayaç korunur. Böylece ücretli servis çağrısından sonra model doğrulaması başarısız olsa da sınırsız ücretsiz tekrar oluşmaz. Rezervasyon 5 dakika sonra süresi dolmuş sayılır. Eski `kullanim_log` kayıtları geçerli günlük bütçeye dahil edilir. Cevap `{allowed,code,remaining,retryAfterMs,limit,resetAt}` alanlarını içerir; kodlar `RESERVED`, `DUPLICATE_REQUEST`, `DAILY_LIMIT`, `DAILY_ATTEMPT_LIMIT`, `RATE_LIMIT`, `CONCURRENCY_LIMIT` olabilir.

`settle_ai_usage(p_request_id,p_success)` **yalnız service role** tarafından çağrılır. Kullanıcıların başarısız olarak işaretleyip kotayı geri almasına izin verilmez. Başarıyla sonuçlanmış veya başarısız olmuş rezervasyon tekrar değiştirilemez. Kullanıcı ID'si bu işleme parametre olarak verilmez; sunucu rezervasyon kimliği üzerinden kaydı bulur. Request ID kayıtlarını kontrolsüz silmek idempotency korumasını kaldırır; arşivleme politikası aynı anahtarların tekrar kullanılmasını engellemelidir.

`register_media_upload(p_id,p_owner_id,p_public_id,p_resource_type,p_intent,p_mime_type,p_bytes,p_delivery_type,p_expires_at)` yalnız service role için atomik yükleme kaydı oluşturur. Backend önce kullanıcının JWT'sini doğrular. Kullanıcı başına **10 açık yükleme**, **saatte 30 kayıt**, dosya başına **3.145.728 byte (3 MiB)** üst sınırı uygulanır; expiry en fazla 15 dakika olabilir. Public ID `senaryo-studio/{owner_id}/{asset_id}` biçimindedir. Dosyayı backend proxy yükler; `upload_started_at` üzerindeki koşullu atomik claim aynı niyetin eşzamanlı iki provider yüklemesine dönüşmesini engeller. Kayıt sahibi, kimliği, kaynak türü ve teslim türü değiştirilemez.

`media_assets` tarayıcıdan eklenemez/değiştirilemez. Sunucu Cloudinary'de gerçek dosya özelliklerini doğruladıktan sonra `ready` yapar. DM dosyaları `authenticated` teslim türünde olmalıdır. `mesajlar.medya_asset_id` ve `ses_asset_id` yalnız gönderene ait, hazır DM dosyasına bağlanabilir. Yeni mesajlarda eski `medya_url`/`ses_url` kullanılmaz; legacy alanlar veri kaybetmemek için tutulur. Eski public DM dosyaları ayrıca private delivery'ye taşınmalıdır; bu migration uzak dosyaları otomatik dönüştürmez.

## Doğrulama ve geri dönüş

`npm run test:db`: tekrar uygulanabilir yeni kurulum, legacy arşiv koruma, migration rollback, anonim/başka kullanıcı erişimi, optimistic lock, sürüm geri yükleme, yayınlama, moderasyon, beğeni/kayıt, DM/engel/not izolasyonu, medya sahipliği, ortak AI bütçesi ve kapasite kontrollerini çalıştırır. PGlite aynı engine'e gelen sorguları sıraya koyar; Promise.all kapasite testi bağımsız PostgreSQL bağlantıları arasındaki yük testi değildir. Staging'de ayrı bağlantılarla aynı kullanıcı için 8 eşzamanlı AI isteği ve 14 medya imzası deneyin: en fazla 3 AI rezervasyonu ve 10 açık medya kaydı oluşmalı; kalan istekler limit yanıtı almalıdır.

Migration `supabase_realtime` publication'ı varsa `mesajlar` ve `bildirimler` tablolarını idempotent biçimde ekler. RLS realtime erişimini de sınırlar. Staging'de alıcı/sender mesaj olayını, üçüncü hesabın olayı alamadığını ve görülen bildirim ID'lerinin işaretlendiğini doğrulayın. Supabase Realtime servisinin etkinliği SQL dışındaki proje ayarıdır.

Yeni sütunları kaldıran otomatik bir down migration yoktur: bu işlem yazılan belgeleri ve sürümleri kaybettirebilir. Başarısız SQL transaction'ı geri alınır. Tamamlanmış dağıtımdan dönüş gerekiyorsa yazmaları durdurun, dağıtımdan sonraki veriyi ayrıca yedekleyin ve test edilmiş yedeği ayrı bir ortama geri yükleyip uygulamayı o doğrulanmış ortama yönlendirin. Eski uygulama kodunu yeni DB'ye bağlamak için geniş RLS açmayın.
