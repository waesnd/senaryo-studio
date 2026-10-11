# Senaryo Studio kurulumu

Bu rehber geliştirme dalındaki platformu Supabase, Groq, Cloudinary ve Vercel ile çalıştırır. Değişiklikler canlı veritabanına otomatik uygulanmaz. Mevcut proje için önce [veritabanı geçiş rehberi](database-upgrade.md) ve preflight sorgularını çalıştırın; yedek ve staging doğrulamasını tamamlayın.

## Ortam değişkenleri

`.env.example` değişken isimlerinin kaynağıdır. `.env.local` sürüm kontrolüne girmez. Vercel'de Preview ve Production kapsamlarını ayrı tanımlayın; Preview için staging servisi kullanın.

| Değişken | Kullanım |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase proje adresi |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/publishable istemci anahtarı; veri yetkisini RLS sınırlar |
| `NEXT_PUBLIC_SITE_URL` | `https://...` kalıcı uygulama adresi, sonunda `/` olmadan |
| `SUPABASE_SERVICE_ROLE_KEY` | Yalnız sunucu: AI rezervasyonu sonuçlandırma ve medya kaydı |
| `GROQ_API_KEY` | Yalnız sunucu: model sağlayıcısı |
| `GROQ_MODEL` | Varsayılan `llama-3.3-70b-versatile`; değiştirilirse şema ve nitelik kontrolü tekrarlanmalı |
| `CLOUDINARY_CLOUD_NAME` | Sunucu medya yapılandırması |
| `CLOUDINARY_API_KEY` | İmzalı yükleme anahtarı |
| `CLOUDINARY_API_SECRET` | Yalnız sunucu: imza ve silme |

Servis rolü, Groq ve Cloudinary secret değerlerine `NEXT_PUBLIC_` öneki eklemeyin. Hizmet rolünün yokluğu AI ve medya işlemlerini kontrollü 503 hatasıyla durdurur; kota doğrulaması atlanmaz. Kayıt veya API hatalarında gizli anahtar, bearer token, özel mesaj ve senaryo içeriği loglanmaz.

## Supabase ve OAuth

1. Staging projesine `supabase/migrations/202610110001_platform_foundation.sql` migration'ını uygulayın. Eski veriler varsa geçiş rehberini takip edin.
2. Authentication → Providers bölümünde Google OAuth'u etkinleştirin. Google Console callback adresi Supabase'in verdiği `/auth/v1/callback` adresidir.
3. Supabase Authentication → URL Configuration alanında Site URL'yi kalıcı domain yapın; Redirect URLs listesine `https://DOMAIN/auth/callback` ve geliştirme için `http://localhost:3000/auth/callback` ekleyin. Preview domainlerini dar kapsamla ayrıca izinlendirin.
4. Mesaj ve bildirim tablosunun Realtime publication kapsamını doğrulayın. Migration desteklenen kurulumda bu tabloları publication'a ekler. Realtime olmasa da sayfa yüklemesi ve yenileme veri getirir.
5. İki farklı test hesabıyla özel senaryo, sürüm, not ve mesaj erişimini doğrulayın. Anon kullanıcı yalnız yayımlanmış, görünür senaryoları görebilmelidir.

## Cloudinary

Uygulama yükleme imzasını tarayıcıya vermez. `/api/media/sign` kullanım amacı, dosya türü ve boyutunu doğrulayıp atomik bir yükleme rezervasyonu oluşturur. Tarayıcı dosyayı bearer oturumuyla `/api/media/upload` adresine gönderir. Sunucu multipart isteğinin ve dosyanın boyutunu sınırlar, sahibini kontrol eder, Cloudinary'ye imzalı olarak yükler ve sağlayıcı yanıtını doğrular. İstemcinin bildirdiği boyuta güvenilmez.

Dosya sınırı 3 MiB'dir; bu sınır Vercel function giriş boyutu sınırının altında kalır. Kullanıcı başına aynı anda 10 bekleyen, saatte 30 yükleme rezervasyonu açılabilir. Avatar/banner herkese açık olabilir; DM görseli ve ses kaydı authenticated delivery ile saklanır ve mesajın tarafları için süreli erişim URL'si üretilir. Cloudinary'de eski unsigned upload presetlerini kapatın. Büyük dosyalar gerekirse boyut kısıtı gerçekten uygulanabilen bir nesne deposu veya ayrı bir upload servisi tasarlanmalıdır.

Eski public mesaj URL'leri kendiliğinden özel olmaz. Veritabanı rehberindeki legacy medya geçişini ayrı tamamlayın. Cloudinary hesabında kullanım/harcama alarmı ve dönüşüm kotaları tanımlayın. Başarısız/yarım kalan yüklemeleri registry üzerinden izleyin; provider varlıklarını registry ile karşılaştırıp yalnız kesin sahipsiz kayıtları temizleyin.

## Yapay zekâ

Bütün AI araçları aynı kullanıcı kotasını kullanır: UTC gününde 50 rezervasyon, dakikada 20 ve aynı anda en fazla 3 işlem. Başarılı kullanım bütçesine ek olarak, başarısız ve süresi dolmuş işlemleri de sayan mutlak günlük 100 deneme sınırı vardır. Limitler `reserve_ai_usage` RPC'sinde tanımlıdır. İstek kimliği tekrar kullanılırsa ikinci provider çağrısı başlamaz. Authenticated istemci yalnız rezervasyon yapar; sonuçlandırma ve başarısız işlem iadesi servis rolüyle sunucuda yapılır.

AI yanıtı şemaya uymuyorsa editördeki çalışma korunur; çıktı sessizce uygulanmaz. Groq deadline ve seçici retry kullanır. Anahtar ekledikten sonra sentetik içerikle küçük bir smoke testi çalıştırın; insan değerlendirmesi için [AI kalite rehberini](ai-quality.md) izleyin. Şema testinin geçmesi yaratıcı kalite garantisi değildir.

## Vercel

1. GitHub reposunu Vercel'e bağlayın; Node.js 22, install `npm ci`, build `npm run build` kullanın.
2. Yukarıdaki değerleri ilgili ortamda tanımlayın. `NEXT_PUBLIC_` değerleri build sırasında gömülür; değiştirildiğinde yeniden deploy edin.
3. Preview üzerinde OAuth, bulut kaydı, iki hesapla yetkilendirme, imzalı medya, AI hata/iade ve Türkçe PDF akışını kontrol edin.
4. Üretim veritabanı migration'ı ve smoke kontrolleri tamamlandıktan sonra production sürümünü açın.

Özel veriler service worker cache'ine yazılmaz. Service worker yalnız uygulama kabuğunu ve aynı kaynaktaki statik dosyaları saklar. Eski cache sürümü aktivasyonda silinir.

## İşletim ve geri dönüş

- Hata kodu ve request ID üzerinden API arızalarını izleyin; loglara kullanıcı içeriği eklemeyin.
- Rezervasyon/sonuçlandırma başarısızlıklarını ve Groq/Cloudinary 429/5xx artışını izleyin.
- Veritabanı yedeği/PITR politikasını, RLS değişiklik incelemesini ve migration sırasını belirleyin.
- Önceki Vercel deployment'a dönmek şema değişikliğini geri almaz. Migration eski sütunları korur; veri silen otomatik down migration yoktur. Geri dönüş staging'de ayrıca doğrulanmalı, gerekirse yedekten yeni proje açılmalıdır.

CI başarılı olsa da gerçek sağlayıcı imzaları, OAuth redirect ve canlı RLS'yi staging ile doğrulamak gerekir. Yerel testler canlı hesaba bağlı değildir.
