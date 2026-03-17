import { withAuth } from "../../lib/withAuth";
import { callGroq } from "../../lib/groq";

function sendError(res, status, error, code) {
  return res.status(status).json({ error, code });
}

function sanitizeText(value, maxLength = 4000) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function normalizeJourney(result) {
  const keys = ["olagan_dunya","macera_cagrisi","cagriya_ret","akil_hoca","esigi_gecmek","testler","derin_magara","buyuk_sinav","odulu_almak","donus_yolu","dirilis","eliksirle_donus"];
  const safe = result && typeof result === "object" && !Array.isArray(result) ? result : {};
  keys.forEach((key) => {
    if (typeof safe[key] !== "string") safe[key] = safe[key] ? String(safe[key]) : "";
  });
  return safe;
}

async function handler(req, res) {
  if (req.method !== "POST") return sendError(res, 405, "Method not allowed", "METHOD_NOT_ALLOWED");

  var senaryo = req.body?.senaryo;
  var tur = sanitizeText(req.body?.tur, 100);
  var tip = sanitizeText(req.body?.tip, 100);
  if (!senaryo || typeof senaryo !== "object") return sendError(res, 400, "senaryo zorunlu", "VALIDATION_ERROR");

  var prompt = `Sen Joseph Campbell'ın "The Hero's Journey" (Kahramanın Yolculuğu) yönteminde uzman bir mitoloji ve senaryo analistisin. Aşağıdaki senaryoyu 12 aşamalı Hero's Journey yapısına göre Türkçe doldur. Her aşama için 2-3 cümle yaz — bu senaryoya özgü, somut içerik.

Senaryo: ${sanitizeText(senaryo.baslik, 300)} (${tur} ${tip})
Ana Fikir: ${sanitizeText(senaryo.ana_fikir, 2500)}
Karakterler: ${sanitizeText(senaryo.karakter, 2500)}
Açılış: ${sanitizeText(senaryo.acilis_sahnesi, 2500)}
Büyük Soru: ${sanitizeText(senaryo.buyuk_soru, 800)}

12 Aşama:
1. Olağan Dünya (Ordinary World)
2. Maceranın Çağrısı (Call to Adventure)
3. Çağrıyı Reddetme (Refusal of the Call)
4. Akıl Hocasıyla Karşılaşma (Meeting the Mentor)
5. Eşiği Geçmek (Crossing the Threshold)
6. Testler, Müttefikler, Düşmanlar (Tests, Allies, Enemies)
7. En Derin Mağaraya Yaklaşmak (Approach to the Inmost Cave)
8. Büyük Sınav (The Ordeal)
9. Ödülü Almak (Reward / Seizing the Sword)
10. Geri Dönüş Yolu (The Road Back)
11. Diriliş (Resurrection)
12. Eliksirle Dönüş (Return with the Elixir)

SADECE aşağıdaki JSON formatında yanıt ver, başka hiçbir şey yazma:
{
  "olagan_dunya": "...",
  "macera_cagrisi": "...",
  "cagriya_ret": "...",
  "akil_hoca": "...",
  "esigi_gecmek": "...",
  "testler": "...",
  "derin_magara": "...",
  "buyuk_sinav": "...",
  "odulu_almak": "...",
  "donus_yolu": "...",
  "dirilis": "...",
  "eliksirle_donus": "..."
}`;

  try {
    var sonuc = await callGroq(prompt, {
      temperature: 0.82,
      max_tokens: 2048,
      systemPrompt: "Sadece geçerli JSON üret. Markdown ve açıklama yazma.",
    });
    return res.status(200).json(normalizeJourney(sonuc));
  } catch (e) {
    console.error("[herosjourney]", e);
    return sendError(res, 500, "Hero's Journey analizi oluşturulamadı.", "HEROS_JOURNEY_FAILED");
  }
}

export default withAuth(handler);
