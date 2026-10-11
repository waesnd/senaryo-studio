# Kalite ve doğrulama

Bu belge testlerin kapsamını ve tekrar çalıştırma yöntemini açıklıyor. Tarayıcı
kontrolleri canlı Supabase, Groq veya Cloudinary hesaplarına istek göndermiyor.

11 Ekim 2026 yerel doğrulaması: Chromium üretim derlemesinde 22/22 tarayıcı
testi geçti (50,4 saniye). Dışa aktarma testleri 7/7 geçti; Poppler ile Türkçe
PDF metni ve sayfa sınırları da doğrulandı. Export/Playwright dosyalarının lint
kontrolünde hata veya uyarı yoktu.

## Yerel komutlar

Node.js 22 veya 24 kullanın. Bağımlılıklar lockfile ile sabitlenmiştir.

```bash
npm ci
npm run lint
npm test
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

Sistemde Chromium kuruluysa tekrar indirmek yerine çalıştırılabilir yolu verin:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e
```

Playwright kendi üretim derlemesini oluşturur ve `127.0.0.1:3100` adresinde
sunucu başlatır. Aynı `.next` dizininde eşzamanlı `next dev` veya başka bir
derleme çalıştırmayın. Bu test sunucusu gerçek ortam değişkenlerini kullanmaz;
Supabase adresi `http://supabase.test`, anahtar sahte, ücretli servis ve servis
rolü sırları boştur. Başka bir doğrulanmış test sunucusu için
`PLAYWRIGHT_BASE_URL` ve `PLAYWRIGHT_REUSE_SERVER=1` kullanılabilir. Bu durumda
sunucunun da aynı sahte public Supabase değerleriyle derlenmiş olması gerekir.

## Dışa aktarma

`tests/exports.test.mjs` aşağıdaki davranışları doğrular:

- TXT dosyasında Türkçe karakterler, proje notları ve karakter adları korunur.
- Fountain dosyasında Türkçe sahne başlıkları ve karakter/diyalog blokları
  ayrıştırıcının tanıyacağı biçimde yazılır.
- FDX dosyasında gerçek `TitlePage`, `Scene Heading`, `Action`, `Character` ve
  `Dialogue` öğeleri vardır; XML özel karakterleri yalnız bir kere kaçışlanır.
- Eski veri formatındaki eserler dışa aktarılabilir.
- PDF dosyasında Unicode yazı tipleri gömülür. Başlık, senaryo ve proje notları
  ayrı sayfalarda yazılır; uzun aksiyon/diyaloglar sayfalara bölünür.
- Poppler `pdftotext` varsa PDF içindeki Türkçe metin tekrar okunur ve metin
  koordinatlarının yazdırılabilir sayfa sınırlarında kaldığı denetlenir.

Poppler olmayan ortamlarda yalnız bu son sistem testi atlanır; font gömme ve
çok sayfalı PDF testleri her ortamda çalışır. İstenirse Linux üzerinde
`sudo apt-get install poppler-utils` ile ek kontrol etkinleştirilebilir.

PDF yazı tipleri `public/fonts` içinde yerel olarak sunulan, değiştirilmemiş
DejaVu Sans Mono ve DejaVu Sans Mono Bold dosyalarıdır. Kaynak ve dağıtım
lisansı aynı dizindeki `LICENSE.txt` dosyasında bulunur. Dış CDN kullanılmaz.

## Tekrarlanabilir tarayıcı kontrolleri

`tests/e2e/fixtures.js` test kullanıcısını, oturumunu, taslağını, RPC yanıtlarını
ve AI sonuçlarını bellek içinde oluşturur. Bütün dış HTTP/WebSocket trafiği
açılmadan engellenir; her yerel AI API isteği açık bir taklit yanıtıyla
karşılanır. Bilinmeyen API istekleri testi başarısız yapar.

`tests/e2e/studio.spec.js` şu akışları doğrular:

- Misafir taslağı yenilemede korunur, buluta yazılmaz.
- Başarısız bulut kaydı başarılı olarak gösterilmez; taslak korunur.
- Kayıt devam ederken yapılan düzenleme, sunucudan dönen revizyonla yeniden
  kaydedilir; ilk sürüm ilk kaydın eser kimliğini bekler.
- Hesaplar arasında yerel taslak okunmaz ve yanlış eser sahipliği reddedilir.
- Revizyon çakışmasında metin korunur; yeni özel eser olarak kaydedilebilir.
- Başarısız AI üretimi mevcut eseri korur.
- Üretim sonucu ancak yazar kabul ettikten sonra editöre alınır; önceki eser
  kurtarma arşivinde kalır.
- Yayınlama ve yayından kaldırma kalıcı bir RPC çağrısına dönüşür.
- Seçili metin önerisi kendiliğinden uygulanmaz; kaynak değişince eski öneri
  uygulanamaz.
- AI analizleri kaynak bilgileriyle birlikte taslakta korunur; yenilemede
  tekrar ücretli istek yapılmadan açılır ve kaynak değişince eski işaretlenir.
- TXT, Fountain, FDX ve PDF indirmeleri tarayıcıdan çalışır.
- 390 piksel mobil görünümde yatay taşma olmaz; içerik atlama bağlantısı,
  klavyeyle sekme değişimi, modal odağı ve Escape davranışı çalışır.
- Açık/koyu tema çalışır ve yenilemeden sonra korunur.
- Hesap/topluluk sayfaları erişilebilir başlıklarla açılır; JavaScript
  istisnası veya yatay taşma oluşmaz.
- Kurtarma arşivi üzerindeki ikinci onay penceresi klavye odağını korur;
  Escape doğru pencereyi kapatır ve önceki odağa döner.

`tests/e2e/social.spec.js` geciken sohbet yanıtının başka sohbete karışmamasını,
özel notların sahibi ve hedef kişiyle sorgulanıp sahibi sunucuda belirlenen
bir RPC üzerinden kaydedilmesini, yalnız görünen bildirim
kimliklerinin otomatik okunmasını, açık tümünü okundu eylemini, challenge
tesliminin yenilemede korunmasını ve oturum doğrulamalı yerel medya yükleme
akışının mesajda yalnız doğrulanmış asset kimliği olarak saklanmasını
denetler. Provider sırları istemciye verilmez; yükleme sunucu üzerinden
yürütülür. Bütün servis yanıtları taklit edilir.

Mobil, açık ve koyu stüdyo ekran görüntüleri Playwright HTML raporuna eklenir.
Hata durumunda ekran görüntüsü ve trace dosyaları `test-results` altında
saklanır. `npx playwright show-report` ile rapor açılır. CI başarısızlık
artefaktlarını otomatik yükler.

## Kanıtın sınırı

Tarayıcı taklitleri istemci davranışını doğrular. Gerçek Supabase politikaları,
transaction fonksiyonları ve iki kullanıcının yetkileri veritabanı testleriyle
ayrıca doğrulanmalıdır; tarayıcıda taklit edilen RPC tek başına RLS kanıtı
değildir. Ücretli servislerle canlı üretim, gerçek OAuth yönlendirmesi ve
medya upload/silme entegrasyonunun kabul kontrolleri yapılandırılmış bir
staging ortamında yapılır. Yerel doğrulamada canlı maliyet oluşturulmamıştır.
