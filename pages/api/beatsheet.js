import { withAuth } from "../../lib/withAuth";
import { callGroq } from "../../lib/groq";

function sendError(res, status, error, code) {
  return res.status(status).json({ error, code });
}

function sanitizeText(value, maxLength = 4000) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function normalizeBeatSheet(result) {
  const keys = ["opening","theme","setup","catalyst","debate","break1","bstory","fun","midpoint","badguys","alllost","soul","break2","finale","closing"];
  const safe = result && typeof result === "object" && !Array.isArray(result) ? result : {};
  keys.forEach((key) => {
    if (typeof safe[key] !== "string") safe[key] = safe[key] ? String(safe[key]) : "";
  });
  return safe;
}

async function handler(req, res) {
  if (req.method !== "POST") return sendError(res, 405, "Method not allowed", "METHOD_NOT_ALLOWED");

  var senaryo = req.body?.senaryo;
  var tip = sanitizeText(req.body?.tip, 100);
  var tur = sanitizeText(req.body?.tur, 100);

  if (!senaryo || typeof senaryo !== "object") {
    return sendError(res, 400, "senaryo zorunlu", "VALIDATION_ERROR");
  }

  var prompt = `Sen Blake Snyder'ın "Save the Cat" yönteminde uzman bir senaryo danışmanısın. Aşağıdaki senaryo için 15 beat'i detaylı şekilde Türkçe doldur. Her beat için 2-3 cümle yaz — somut, sahneye dökülebilir içerik ol.

Senaryo: ${sanitizeText(senaryo.baslik, 300)}
Tür: ${tur} ${tip}
Ana Fikir: ${sanitizeText(senaryo.ana_fikir, 2500)}
Karakterler: ${sanitizeText(senaryo.karakter, 2500)}
Açılış Sahnesi: ${sanitizeText(senaryo.acilis_sahnesi, 2500)}
Büyük Soru: ${sanitizeText(senaryo.buyuk_soru, 800)}

SADECE aşağıdaki JSON formatında yanıt ver, hiçbir açıklama ekleme:
{
  "opening": "Açılış görüntüsü — filmin tonu ve dünyasını kurar",
  "theme": "Tema sunumu — hikayenin ana mesajı ima edilir",
  "setup": "Kurulum — karakterler, statüko, eksik olan şey",
  "catalyst": "Katalizör — her şeyi değiştiren olay",
  "debate": "Tartışma — kahraman tereddüt eder, içsel çatışma",
  "break1": "2. Perde geçişi — kahramanın yeni dünyaya adımı",
  "bstory": "B hikayesi — alt hikaye veya romantik ilişki başlar",
  "fun": "Eğlence ve oyun — yeni dünyanın keşfi",
  "midpoint": "Orta nokta — sahte zafer ya da sahte ölüm",
  "badguys": "Kötüler geri döner — baskı yoğunlaşır",
  "alllost": "Her şey kayıp — en karanlık an, tüm umutlar tükeniyor",
  "soul": "Ruhun karanlık gecesi — kahraman yıkılır, sorgulanır",
  "break2": "3. Perde geçişi — yeni karar, yeni güç kaynağı",
  "finale": "Final — son çatışma, zirve, çözüm",
  "closing": "Kapanış görüntüsü — dönüşüm tamamlandı, açılışla karşılaştırma"
}`;

  try {
    var sonuc = await callGroq(prompt, {
      temperature: 0.8,
      max_tokens: 2048,
      systemPrompt: "Sadece geçerli JSON üret. Markdown ve açıklama yazma.",
    });
    return res.status(200).json(normalizeBeatSheet(sonuc));
  } catch (e) {
    console.error("[beatsheet]", e);
    return sendError(res, 500, "Beat sheet oluşturulamadı.", "BEATSHEET_FAILED");
  }
}

export default withAuth(handler);
