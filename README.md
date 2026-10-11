# Senaryo Studio

Türkçe senaryo yazma, düzenleme ve paylaşma platformu. Yapay zekâ bir öneri üretir; yazar öneriyi inceleyip kabul eder. Sahne, aksiyon ve diyaloglar düzenlenebilir bir belge olarak saklanır.

- Hesaba bağlı yerel taslak, kurtarma geçmişi ve revizyon kontrollü bulut kaydı
- Sürüm oluşturma/geri yükleme, kalıcı yayınlama ve sahneye bağlı geri bildirim
- Senaryo, sahne, karakter, diyalog, dramaturji, beat sheet, logline, pitch ve yapı araçları
- TXT, Fountain, FDX ve Türkçe fontları gömülü PDF dışa aktarımı
- Keşfet, arama, takip, beğeni, koleksiyon, bildirim ve özel mesajlar
- Atomik yapay zekâ kotası, PostgreSQL RLS ve imzalı özel medya
- Responsive açık/koyu tema, klavye erişimi ve bağlantı kesildiğinde yerel çalışma

## Yerel geliştirme

Node.js 22 veya 24 ve npm kullanın.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

`http://localhost:3000/uret` üzerinden yazmaya başlayabilirsiniz. Supabase değişkenleri boşsa hesap, bulut ve sosyal özellikler açıklayıcı bir durum gösterir; yerel editör çalışır. Yapay zekâ ve medya gerçek servis yapılandırması gerektirir.

## Altyapı

Next.js 16 Pages Router, React 19, Supabase/PostgreSQL, Groq, Cloudinary, Zod, jsPDF. Bağımlılıklar ve kilit dosyası sürümlenmiştir. İstemciye yalnızca `NEXT_PUBLIC_` değişkenleri gönderilir; servis anahtarları sunucuda kalır.

Yeni Supabase projesi veya mevcut veritabanı yükseltmesi için [veritabanı rehberini](docs/database-upgrade.md), Vercel ve servis ayarları için [kurulum rehberini](docs/deployment.md) izleyin. Migration, yeni kurulum ile eski belge alanlarının geçişini aynı kaynakta tutar.

## Kontroller

```bash
npm run lint
npm test
npm run build
npm run test:e2e
npm audit --omit=dev --audit-level=high
```

Tarayıcı testleri servisleri taklit eder ve dış bağlantıları engeller. Gerçek Supabase, Cloudinary veya ücretli AI çağrısı yapmaz. AI'nın yaratıcı niteliği ayrıca insan değerlendirmesi gerektirir; [değerlendirme rehberi](docs/ai-quality.md) ve sentetik örnekler bu amaçla bulunur.

## Kod haritası

| Konum | Sorumluluk |
| --- | --- |
| `components/studio`, `pages/uret.js` | Yazarlık alanı ve kayıt durumu |
| `lib/scenario.js`, `lib/drafts.js` | Belge uyumluluğu ve taslak kurtarma |
| `lib/server`, `pages/api` | Auth, doğrulama, kota, AI ve medya |
| `lib/social-client.js`, `pages` | Sosyal akışlar ve özel mesajlar |
| `supabase/migrations` | Şema, RLS, trigger ve atomik RPC'ler |
| `tests`, `.github/workflows` | Birim, veritabanı, tarayıcı ve CI kontrolleri |

Üretime çıkmadan önce staging veritabanında migration ve gerçek OAuth akışı doğrulanmalıdır. Kod değişikliği canlı veritabanını kendiliğinden değiştirmez.
