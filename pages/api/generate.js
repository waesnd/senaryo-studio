import { withAuth } from "../../lib/withAuth";
import { callGroq } from "../../lib/groq";

const GUNLUK_LIMIT = 50;
const REQUIRED_FIELDS = [
  "baslik",
  "tagline",
  "ana_fikir",
  "karakter",
  "acilis_sahnesi",
  "buyuk_soru",
];

function sendError(res, status, error, code, extra = {}) {
  return res.status(status).json({
    ok: false,
    error,
    code,
    ...extra,
  });
}

function sendSuccess(res, data, extra = {}) {
  return res.status(200).json({
    ok: true,
    data,
    ...extra,
  });
}

function toSafeInteger(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.floor(parsed));
}

function sanitizeText(value, maxLength = 2000) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function validateBody(body) {
  const tip = sanitizeText(body?.tip, 100);
  const tur = sanitizeText(body?.tur, 100);
  const ozelIstek = sanitizeText(body?.ozelIstek, 2000);
  const sahneSayisi = toSafeInteger(body?.sahneSayisi, null);
  const karakterSayisi = toSafeInteger(body?.karakterSayisi, null);
  const dil = sanitizeText(body?.dil ?? "tr", 10).toLowerCase();
  const ulke = sanitizeText(body?.ulke ?? "TR", 10).toUpperCase();

  if (!/^[a-z]{2}(?:-[a-z]{2})?$/.test(dil) || !/^[A-Z]{2}$/.test(ulke)) {
    return {
      valid: false,
      error: "Geçersiz dil veya ülke kodu.",
      code: "INVALID_LOCALE",
    };
  }

  if (!tip || !tur) {
    return {
      valid: false,
      error: "tip ve tur zorunlu.",
      code: "VALIDATION_ERROR",
    };
  }

  if (sahneSayisi !== null && sahneSayisi > 200) {
    return {
      valid: false,
      error: "Sahne sayısı en fazla 200 olabilir.",
      code: "INVALID_SCENE_COUNT",
    };
  }

  if (karakterSayisi !== null && karakterSayisi > 20) {
    return {
      valid: false,
      error: "Karakter sayısı en fazla 20 olabilir.",
      code: "INVALID_CHARACTER_COUNT",
    };
  }

  return {
    valid: true,
    values: {
      tip,
      tur,
      ozelIstek,
      sahneSayisi,
      karakterSayisi,
      dil,
      ulke,
    },
  };
}

function buildPrompt({
  tip,
  tur,
  ozelIstek,
  sahneSayisi,
  karakterSayisi,
  dil,
  ulke,
}) {
  return `Sen deneyimli bir yaratıcı yazarlık ve senaryo geliştirme uzmanısın. ${tip} formatında, ${tur} türünde özgün bir hikâye fikri üret.

ZORUNLU KURALLAR:
- Eser dili: ${dil}. Başlık, özet, açılış ve diğer tüm yazılı içeriği bu dilde üret.
- Varsayılan hikâye ülkesi: ${ulke}. Kullanıcı farklı bir mekân belirttiyse kullanıcının seçimini koru.
- Karakter adları ve kültürel ayrıntılar eserin bağlamına uygun olmalı; zorunlu bir milliyet veya isim listesi dayatma.
- Kullanıcının özellikle seçtiği karakter adlarını, dili ve mekânları izinsiz değiştirme.
- Karakterler psikolojik olarak derinlikli ve tutarlı olsun
- Açılış sahnesi seyirciyi anında içine çekecek güçte olsun
- Tagline akılda kalıcı, film postere yazılabilecek nitelikte olsun
- Ana fikir somut çatışma ve dramatik gerilim içersin
${sahneSayisi ? `- Sahne sayısı yaklaşık ${sahneSayisi} sahne olsun` : ""}
${karakterSayisi ? `- Karakter sayısı tam olarak ${karakterSayisi} ana karakter olsun` : ""}
${ozelIstek ? `- Kullanıcının özel isteği kesinlikle uygulanmalı: ${ozelIstek}` : ""}
${ozelIstek ? `- Özel istekte gerçek kişi adları varsa, bunları yalnızca kurgusal karakter adı olarak işle` : ""}

SADECE aşağıdaki JSON formatında yanıt ver. Markdown, açıklama, kod bloğu ekleme:
{
  "baslik": "Güçlü ve akılda kalıcı başlık",
  "tagline": "Tek cümlelik çarpıcı tagline",
  "ana_fikir": "3-4 paragraf hikaye özeti ve çatışma",
  "karakter": "Ana karakterler ve kısa psikolojik profilleri",
  "acilis_sahnesi": "Güçlü ve sinematik açılış sahnesi",
  "buyuk_soru": "Temel dramatik soru"
}`;
}

function normalizeGroqResponse(parsed) {
  const result =
    parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};

  for (const field of REQUIRED_FIELDS) {
    if (typeof result[field] !== "string") {
      result[field] = result[field] ? String(result[field]) : "";
    }
  }

  return result;
}

async function reserveUsage(req, meta) {
  // The authenticated request client carries the caller's verified JWT.
  // A database transaction serializes quota reservations for concurrent calls.
  if (!req.supabase || typeof req.supabase.rpc !== "function") {
    throw new Error("Authenticated quota client unavailable");
  }

  const { data, error } = await req.supabase.rpc("reserve_generate_quota", {
    p_meta: meta,
  });
  if (error) throw error;

  if (!data || typeof data.allowed !== "boolean" ||
      !Number.isInteger(data.kalan) || !Number.isInteger(data.limit) ||
      data.limit !== GUNLUK_LIMIT || data.kalan < 0 || data.kalan > data.limit) {
    throw new Error("Invalid quota reservation response");
  }

  return {
    allowed: data.allowed,
    kalan: data.kalan,
    limit: data.limit,
    resetAt: data.reset_at || null,
  };
}

async function handler(req, res) {
  if (req.method !== "POST") {
    return sendError(res, 405, "Method not allowed", "METHOD_NOT_ALLOWED");
  }

  if (!req.user?.id) {
    return sendError(res, 401, "Giriş yapmanız gerekiyor.", "UNAUTHORIZED");
  }

  const validation = validateBody(req.body);

  if (!validation.valid) {
    return sendError(res, 400, validation.error, validation.code);
  }

  const { tip, tur, ozelIstek, sahneSayisi, karakterSayisi, dil, ulke } = validation.values;

  let usageInfo = null;

  try {
    usageInfo = await reserveUsage(req, { tip, tur, dil, ulke });

    if (!usageInfo.allowed) {
      return sendError(
        res,
        429,
        "Günlük üretim limitine ulaştınız.",
        "DAILY_LIMIT_EXCEEDED",
        {
          limit: usageInfo.limit,
          kalan: usageInfo.kalan,
          reset_at: usageInfo.resetAt,
        }
      );
    }

    res.setHeader("X-Kalan-Uretim", String(usageInfo.kalan));
    res.setHeader("X-Uretim-Limit", String(usageInfo.limit));
  } catch (usageError) {
    console.error("[generate] kota rezervasyonu hatası:", usageError);
    // Fail closed: do not call a billable AI provider without a verified quota.
    return sendError(
      res,
      503,
      "Kullanım limiti şu anda doğrulanamıyor. Lütfen daha sonra tekrar deneyin.",
      "USAGE_CHECK_UNAVAILABLE"
    );
  }

  const prompt = buildPrompt({
    tip,
    tur,
    ozelIstek,
    sahneSayisi,
    karakterSayisi,
    dil,
    ulke,
  });

  try {
    const parsed = await callGroq(prompt, {
      temperature: 0.92,
      max_tokens: 2048,
    });

    const senaryo = normalizeGroqResponse(parsed);

    return sendSuccess(
      res,
      { senaryo },
      usageInfo
        ? {
            meta: {
              limit: usageInfo.limit,
              kalan: usageInfo.kalan,
            },
          }
        : {}
    );
  } catch (error) {
    console.error("[generate] groq hatası:", error);

    return sendError(
      res,
      500,
      "Senaryo üretimi sırasında bir hata oluştu.",
      "GENERATE_FAILED"
    );
  }
}

export default withAuth(handler);
