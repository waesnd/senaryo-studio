import { withAuth } from "../../lib/withAuth";
import { callGroq } from "../../lib/groq";

function sendError(res, status, error, code) {
  return res.status(status).json({ error, code });
}

function sanitizeText(value, maxLength = 6000) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

async function handler(req, res) {
  if (req.method !== "POST") return sendError(res, 405, "Method not allowed", "METHOD_NOT_ALLOWED");

  var metin = sanitizeText(req.body?.metin, 6000);
  var tur = sanitizeText(req.body?.tur, 100) || "Drama";

  if (!metin) return sendError(res, 400, "metin zorunlu", "VALIDATION_ERROR");

  var prompt = `Sen Türkiye'nin en iyi diyalog yazarısın. Aşağıdaki diyaloğu güçlendir — daha doğal, daha çarpıcı, karaktere özgü ve sinematik yap. Tür: ${tur}. Orijinalin duygusunu ve anlamını koru ama çok daha iyi yaz.

Orijinal diyalog:
${metin}

SADECE güçlendirilmiş diyaloğu yaz, başka açıklama ekleme.`;

  try {
    var sonuc = await callGroq(prompt, {
      temperature: 0.85,
      max_tokens: 1024,
      raw: true,
      systemPrompt: "Sadece istenen son metni üret. Açıklama, başlık ve markdown yazma.",
    });
    return res.status(200).json({ sonuc: typeof sonuc === "string" ? sonuc.trim() : "" });
  } catch (e) {
    console.error("[diyalog]", e);
    return sendError(res, 500, "Diyalog güçlendirilemedi.", "DIYALOG_FAILED");
  }
}

export default withAuth(handler);
