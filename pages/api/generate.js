import { createClient } from "@supabase/supabase-js";
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
    },
  };
}

function buildPrompt({
  tip,
  tur,
  ozelIstek,
  sahneSayisi,
  karakterSayisi,
}) {
  return `Sen Türkiye'nin en iyi senaryo yazarısın. ${tip} formatında, ${tur} türünde özgün ve çarpıcı bir senaryo fikri üret.

ZORUNLU KURALLAR:
- Tüm karakter isimleri MUTLAKA Türkçe/Türk ismi olmalı (Ayşe, Kemal, Zeynep, Tarık, Defne, Murat, Hira, Serdar, Leyla, Caner, Bora, Naz, Ece, Selim, Melis gibi)
- Mekanlar Türkiye'de geçsin (aksi belirtilmedikçe)
- Dil tamamen Türkçe, akıcı ve etkileyici olsun
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
  "baslik": "Güçlü ve akılda kalıcı Türkçe başlık",
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

function createSupabaseServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

async function checkAndLogUsage(userId, meta) {
  const supabase = createSupabaseServerClient();
  const sinir = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { count, error: countError } = await supabase
    .from("kullanim_log")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("islem", "generate")
    .gte("created_at", sinir);

  if (countError) {
    throw countError;
  }

  const mevcutKullanim = count || 0;

  if (mevcutKullanim >= GUNLUK_LIMIT) {
    return {
      allowed: false,
      kalan: 0,
      limit: GUNLUK_LIMIT,
      resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  const { error: insertError } = await supabase.from("kullanim_log").insert({
    user_id: userId,
    islem: "generate",
    meta,
  });

  if (insertError) {
    throw insertError;
  }

  return {
    allowed: true,
    kalan: Math.max(GUNLUK_LIMIT - (mevcutKullanim + 1), 0),
    limit: GUNLUK_LIMIT,
    resetAt: null,
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

  const { tip, tur, ozelIstek, sahneSayisi, karakterSayisi } = validation.values;
  const userId = req.user.id;

  let usageInfo = null;

  try {
    usageInfo = await checkAndLogUsage(userId, { tip, tur });

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
    console.error("[generate] kullanim_log hatası:", usageError);
  }

  const prompt = buildPrompt({
    tip,
    tur,
    ozelIstek,
    sahneSayisi,
    karakterSayisi,
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
