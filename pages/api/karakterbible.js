import { withAuth } from "../../lib/withAuth";
import { callGroq } from "../../lib/groq";

function sendError(res, status, error, code) {
  return res.status(status).json({ error, code });
}

function sanitizeText(value, maxLength = 5000) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function normalizeResult(result) {
  const safe = result && typeof result === "object" && !Array.isArray(result) ? result : {};
  if (!Array.isArray(safe.karakterler)) safe.karakterler = [];
  safe.karakterler = safe.karakterler.map((item) => ({
    ad: typeof item?.ad === "string" ? item.ad : "",
    yas: typeof item?.yas === "string" ? item.yas : "",
    meslek: typeof item?.meslek === "string" ? item.meslek : "",
    hedef: typeof item?.hedef === "string" ? item.hedef : "",
    korku: typeof item?.korku === "string" ? item.korku : "",
    sir: typeof item?.sir === "string" ? item.sir : "",
    guc: typeof item?.guc === "string" ? item.guc : "",
    zayiflik: typeof item?.zayiflik === "string" ? item.zayiflik : "",
    arc: typeof item?.arc === "string" ? item.arc : "",
    diyalog_tonu: typeof item?.diyalog_tonu === "string" ? item.diyalog_tonu : "",
  }));
  return safe;
}

async function handler(req, res) {
  if (req.method !== "POST") return sendError(res, 405, "Method not allowed", "METHOD_NOT_ALLOWED");

  var senaryo = req.body?.senaryo;
  var tur = sanitizeText(req.body?.tur, 100);
  if (!senaryo || typeof senaryo !== "object") return sendError(res, 400, "senaryo zorunlu", "VALIDATION_ERROR");

  var prompt = `Sen Türk televizyon ve sinema sektöründe uzman bir karakter yazarısın. Aşağıdaki senaryodaki en önemli 3 ana karakter için kapsamlı Karakter Dosyası oluştur.

ZORUNLU: Tüm karakter isimleri Türkçe olmalı, yabancı isim kullanma.

Senaryo: ${sanitizeText(senaryo.baslik, 300)}
Tür: ${tur}
Karakterler: ${sanitizeText(senaryo.karakter, 2500)}
Ana Fikir: ${sanitizeText(senaryo.ana_fikir, 2500)}
Açılış: ${sanitizeText(senaryo.acilis_sahnesi, 2500)}

SADECE aşağıdaki JSON formatında yanıt ver, hiçbir açıklama ekleme:
{
  "karakterler": [
    {
      "ad": "Türkçe isim",
      "yas": "yaş aralığı",
      "meslek": "mesleği veya rolü",
      "hedef": "hikayedeki temel hedefi ve arzusu",
      "korku": "en derin korkusu ve kaygısı",
      "sir": "sakladığı büyük sır veya utanç",
      "guc": "en güçlü özelliği veya becerisi",
      "zayiflik": "en belirgin zaafiyeti veya kör noktası",
      "arc": "hikaye boyunca geçireceği karakter dönüşümü",
      "diyalog_tonu": "nasıl konuşur — dili, üslubu, ağzından düşmeyen sözler"
    }
  ]
}`;

  try {
    var sonuc = await callGroq(prompt, {
      temperature: 0.85,
      max_tokens: 2048,
      systemPrompt: "Sadece geçerli JSON üret. Markdown ve açıklama yazma.",
    });
    return res.status(200).json(normalizeResult(sonuc));
  } catch (e) {
    console.error("[karakterbible]", e);
    return sendError(res, 500, "Karakter dosyası oluşturulamadı.", "KARAKTER_BIBLE_FAILED");
  }
}

export default withAuth(handler);
