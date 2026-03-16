# Scriptify — AI Senaryo Platformu

AI destekli senaryo üretici ve sosyal platform. Türk yazarlar için geliştirilmiş, Groq LLM altyapısıyla çalışan bir "Wattpad + Final Draft + AI" deneyimi.

## Özellikler

- **AI Senaryo Üretimi** — Tür ve format seçerek saniyeler içinde profesyonel senaryo
- **Beat Sheet** — Save the Cat yöntemiyle 15 adımlı sahne planı
- **Karakter Dosyası** — Psikolojik derinlikte karakter profilleri
- **Dramaturg Analizi** — Farklı perspektiflerden dramatik analiz
- **Yapımcı Puanı** — Ticari potansiyel ve kalite değerlendirmesi
- **Logline Üreticisi** — 3 farklı güçlü logline seçeneği
- **Pitch Deck** — Yapımcı sunumuna hazır 8 bölümlü pitch
- **Hero's Journey** — Joseph Campbell'ın 12 aşamalı analizi
- **Diyalog Güçlendirici** — Zayıf diyaloğu sinematik seviyeye taşı
- **Export** — TXT, FDX (Final Draft) ve PDF formatında indirme
- **Sosyal Platform** — Paylaş, takip et, beğen, yorum yap
- **Topluluk & Challenge** — Senaryo challengeları ve liderboard
- **PWA** — Mobil uyumlu, offline destekli

## Teknoloji

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Next.js 14 (Pages Router), React 18 |
| Auth + DB | Supabase (PostgreSQL + Row Level Security) |
| AI | Groq API — `llama-3.3-70b-versatile` |
| Medya | Cloudinary (avatar, banner, gönderi görselleri) |
| Deploy | Vercel |
| PWA | Custom Service Worker |

## Kurulum

### Gereksinimler

- Node.js 18+
- npm 9+
- Supabase hesabı
- Groq API hesabı (ücretsiz)
- Cloudinary hesabı (ücretsiz tier yeterli)

### 1. Repoyu klonla

```bash
git clone https://github.com/waesnd/senaryo-studio.git
cd senaryo-studio
npm install
```

### 2. Environment değişkenlerini ayarla

```bash
cp .env.example .env.local
```

`.env.local` dosyasını aşağıdaki bilgilerle doldur (bkz. [Environment Değişkenleri](#environment-değişkenleri)).

### 3. Supabase'i hazırla

Supabase SQL Editor'ında sırayla çalıştır:

```sql
-- Gerekli kolonlar
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nickname text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS takip_sayisi integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banner_url text;
```

Supabase'de Google OAuth'u etkinleştir:
- Authentication → Providers → Google → Enable

### 4. Geliştirme sunucusunu başlat

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) adresini aç.

## Environment Değişkenleri

`.env.local` dosyasında aşağıdaki değişkenler gereklidir:

```env
# Supabase — Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://PROJE_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Groq — console.groq.com > API Keys
GROQ_API_KEY=gsk_...

# Cloudinary — cloudinary.com > Dashboard
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> ⚠️ `GROQ_API_KEY`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` değerleri sunucu tarafında kalır, **asla `NEXT_PUBLIC_` prefixi ekleme.**

## Proje Yapısı

```
senaryo-studio/
├── lib/
│   ├── supabase.js        # Supabase client
│   ├── useAuth.js         # Auth context + AuthProvider
│   └── withAuth.js        # API route auth middleware
├── pages/
│   ├── api/               # Backend endpoint'leri
│   │   ├── generate.js    # Senaryo üretimi
│   │   ├── beatsheet.js   # Beat sheet
│   │   ├── karakter.js    # Karakter analizi
│   │   ├── karakterbible.js
│   │   ├── dramaturg.js
│   │   ├── puan.js
│   │   ├── logline.js
│   │   ├── pitch.js
│   │   ├── herosjourney.js
│   │   ├── diyalog.js
│   │   └── medya-sil.js   # Cloudinary silme
│   ├── _app.js            # Global CSS + AuthProvider
│   ├── _document.js       # HTML head, meta
│   ├── index.js           # Ana sayfa / Feed
│   ├── uret.js            # AI üretim stüdyosu
│   ├── kesfet.js          # Keşfet
│   ├── profil.js          # Kullanıcı profili
│   ├── mesajlar.js        # Mesajlaşma
│   ├── bildirimler.js     # Bildirimler
│   ├── topluluk.js        # Topluluk & Challenge
│   ├── arama.js           # Arama
│   ├── senaryo/[id].js    # Senaryo detay
│   ├── @username/index.js # Kullanıcı profil sayfası
│   └── hashtag/[tag].js   # Hashtag sayfası
└── public/
    ├── sw.js              # Service Worker
    ├── manifest.json      # PWA manifest
    ├── logo.png
    ├── icon-192.png
    └── icon-512.png
```

## Supabase Tabloları

| Tablo | Açıklama |
|-------|----------|
| `profiles` | Kullanıcı profilleri (auth.users ile bağlantılı) |
| `senaryolar` | Üretilen ve kaydedilen senaryolar |
| `gonderiler` | Sosyal platform paylaşımları |
| `storyler` | Story (24 saat görünür) |
| `takipler` | Takip ilişkileri |
| `begeniler` | Beğeniler |
| `yorumlar` | Yorumlar |
| `kaydedilenler` | Kaydedilen gönderiler |
| `mesajlar` | DM mesajlar |
| `bildirimler` | Bildirim sistemi |
| `challengelar` | Topluluk challengeları |
| `hashtagler` | Hashtag sayaçları |
| `gonderi_hashtagler` | Gonderi-hashtag ilişkisi |
| `engellemeler` | Engelleme listesi |
| `raporlar` | İçerik raporlama |
| `senaryo_versiyonlar` | Senaryo versiyon geçmişi |

> RLS policy'leri Supabase dashboard'ından ayarlanmalıdır. Her tablo için minimum: authenticated kullanıcılar kendi verilerini okuyup yazabilir.

## Deploy (Vercel)

```bash
# Vercel CLI ile
npm i -g vercel
vercel --prod
```

Vercel dashboard'ında Environment Variables bölümüne `.env.local` içindeki tüm değişkenleri ekle.

## Güvenlik

- Tüm `/api/*` endpoint'leri `withAuth` middleware ile korunmaktadır
- API çağrıları rate limiting ile sınırlandırılmıştır (IP başına dakikada 20 istek)
- Medya silme işlemi owner kontrolü yapılmaktadır
- Kullanıcı website alanları `http/https` dışındaki şemalar için sanitize edilmektedir
- Sunucu secret'ları (`GROQ_API_KEY`, `CLOUDINARY_API_SECRET`) asla client'a sızdırılmamaktadır

## Lisans

Bu proje özel bir projedir. Tüm hakları saklıdır.
