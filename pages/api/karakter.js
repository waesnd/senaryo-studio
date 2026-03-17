import { withAuth } from "../../lib/withAuth";
import { callGroq } from "../../lib/groq";

function sendError(res, status, error, code) {
  return res.status(status).json({ error, code });
}

function sanitizeText(value, maxLength = 4000) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function normalizeResult(result) {
  const keys = ["gecmis","motivasyon","guclu","zayif","ic_catisma","arc"];
  const safe = result && typeof result === "object" && !Array.isArray(result) ? result : {};
  keys.forEach((key)=>{
    if (typeof safe[key] !== "string") safe[key] = safe[key] ? String(safe[key]) : "";
  });
  return safe;
}

async function handler(req, res) {
  if (req.method !== "POST") return sendError(res, 405, "Method not allowed", "METHOD_NOT_ALLOWED");

  var concept = req.body?.concept;
  var tip = sanitizeText(req.body?.tip, 100);
  var tur = sanitizeText(req.body?.tur, 100);

  if (!concept || typeof concept !== "object") return sendError(res, 400, "concept zorunlu", "VALIDATION_ERROR");

  var prompt = `Sen psikoloji ve dramatik yapı konusunda uzman bir karakter analistisin. Aşağıdaki ${tip} senaryosunun ana karakterini derinlemesine analiz et.

Başlık: ${sanitizeText(concept.baslik, 300)}
Karakter: ${sanitizeText(concept.karakter, 2500)}
Ana Fikir: ${sanitizeText(concept.ana_fikir, 2500)}
Tür: ${tur}

SADECE aşağıdaki JSON formatında yanıt ver, hiçbir açıklama ekleme:
{
  "gecmis": "Karakterin geçmişi, kökeni ve bunu şekillendiren olaylar — 2-3 cümle",
  "motivasyon": "Karakteri harekete geçiren temel motivasyon ve arzular — 2-3 cümle",
  "guclu": "Güçlü yanları ve sahip olduğu beceriler — 2-3 cümle",
  "zayif": "Zayıf yanları, zaafiyetleri ve kör noktaları — 2-3 cümle",
  "ic_catisma": "Karakterin içsel çatışması ve ruhsal düğümü — 1-2 cümle",
  "arc": "Hikaye boyunca geçireceği dönüşüm ve karakter yayı — 2 cümle"
}`;

  try {
    var sonuc = await callGroq(prompt, {
      temperature: 0.85,
      max_tokens: 1024,
      systemPrompt: "Sadece geçerli JSON üret. Markdown ve açıklama yazma.",
    });
    return res.status(200).json(normalizeResult(sonuc));
  } catch (e) {
    console.error("[karakter]", e);
    return sendError(res, 500, "Karakter analizi oluşturulamadı.", "KARAKTER_FAILED");
  }
}

export default withAuth(handler);
