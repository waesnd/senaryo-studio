import { getSupabaseClient } from "./supabase";

export const PROFILE_FIELDS =
  "id,username,nickname,bio,website,avatar_url,banner_url,dogrulandi,senaryo_sayisi,takipci_sayisi,takip_sayisi";
export const SCENARIO_FIELDS =
  "id,user_id,baslik,tagline,ozet,tur,tip,paylasim_acik,begeni_sayisi,yorum_sayisi,created_at,updated_at,etiketler";
export const MESSAGE_FIELDS =
  "id,gonderen,alan,icerik,medya_asset_id,ses_asset_id,okundu,created_at";
export const PAGE_SIZE = 24;
export const isUuid = (value) =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
export const normalizeTag = (value) =>
  String(value || "")
    .normalize("NFKC")
    .trim()
    .replace(/^#+/, "")
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, "-")
    .slice(0, 60);
export const searchPattern = (value) =>
  "%" +
  String(value || "")
    .normalize("NFKC")
    .trim()
    .slice(0, 120)
    .replace(/[\\%_]/g, "\\$&") +
  "%";
export function safeUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}
export function client() {
  const db = getSupabaseClient();
  if (!db)
    throw new Error(
      "Platform bağlantısı henüz yapılandırılmadı. Lütfen daha sonra yeniden deneyin.",
    );
  return db;
}
export function unwrap(result) {
  if (result.error) throw new Error(errorMessage(result.error));
  return result.data;
}
export function errorMessage(error) {
  if (error?.name === "AbortError") return "";
  const message = typeof error?.message === "string" ? error.message : "";
  const translated = {
    SCENARIO_NOT_ACCESSIBLE:
      "Bu esere erişimin yok veya eser artık yayında değil.",
    SCENARIO_NOT_FOUND:
      "Eser bulunamadı. Silinmiş veya yayından kaldırılmış olabilir.",
    REVISION_CONFLICT:
      "Bu eser başka bir pencerede değişti. Son sürümü açıp yeniden dene.",
    CHALLENGE_CLOSED: "Bu yazı çalışmasının teslim süresi doldu.",
    CHALLENGE_NOT_FOUND:
      "Yazı çalışması bulunamadı veya artık katılıma açık değil.",
    FOLLOW_NOT_ALLOWED:
      "Bu yazarı takip edemezsin. Engelleme durumunu kontrol et.",
    PROFILE_NOT_FOUND: "Yazar bulunamadı.",
    INVALID_PROFILE: "Yazar hesabı geçerli değil.",
    INVALID_REASON: "Bildirim gerekçesi 10–2000 karakter olmalı.",
    INVALID_MESSAGE_ASSET:
      "Mesaja eklenen dosya doğrulanamadı. Dosyayı yeniden yükle.",
    AUTH_REQUIRED: "Bu işlem için giriş yapmalısın.",
    USER_REQUIRED: "Bu işlem için giriş yapmalısın.",
  };
  for (const [key, value] of Object.entries(translated))
    if (message.includes(key)) return value;
  if (error?.code === "23505")
    return "Bu kayıt zaten var. Farklı bir kullanıcı adı veya seçim dene.";
  if (
    error?.code === "42501" ||
    /row.level security|permission denied/i.test(message)
  )
    return "Bu işlem için yetkin yok. Oturumunu ve erişim durumunu kontrol et.";
  if (error?.code === "23514")
    return "Girdiğin bilgiler geçerli değil. Alanları kontrol ederek yeniden dene.";
  if (/fetch failed|failed to fetch|networkerror|load failed/i.test(message))
    return "Bağlantı kurulamadı. Lütfen yeniden deneyin.";
  if (
    !message ||
    /[A-Z]{3,}_[A-Z_]{3,}|column|relation|schema cache|constraint|SQL|PostgREST/i.test(
      message,
    )
  )
    return "İşlem tamamlanamadı. Lütfen yeniden deneyin.";
  return message;
}
export async function rpc(name, params) {
  const data = unwrap(await client().rpc(name, params));
  return Array.isArray(data) ? data[0] : data;
}
export async function profilesByIds(ids) {
  const unique = [...new Set(ids)].filter(isUuid);
  if (!unique.length) return {};
  const rows = unwrap(
    await client().from("profiles").select(PROFILE_FIELDS).in("id", unique),
  );
  return Object.fromEntries((rows || []).map((row) => [row.id, row]));
}
export async function attachAuthors(rows) {
  const profiles = await profilesByIds((rows || []).map((row) => row.user_id));
  return (rows || []).map((row) => ({ ...row, author: profiles[row.user_id] }));
}
export async function loadScenarios({
  cursor,
  ownerId,
  publicOnly = !ownerId,
  query = "",
  tag = "",
  followingIds,
  signal,
} = {}) {
  let request = client()
    .from("senaryolar")
    .select(SCENARIO_FIELDS, { count: "exact" });
  if (ownerId) request = request.eq("user_id", ownerId);
  if (publicOnly || !ownerId) request = request.eq("paylasim_acik", true);
  if (query.trim()) request = request.ilike("baslik", searchPattern(query));
  if (tag) request = request.contains("etiketler", [normalizeTag(tag)]);
  if (followingIds) {
    if (!followingIds.length) return { rows: [], more: false, count: 0 };
    request = request.in("user_id", followingIds);
  }
  request = request
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(PAGE_SIZE + 1);
  if (cursor) request = applyCursor(request, cursor);
  if (signal) request = request.abortSignal(signal);
  const result = await request;
  unwrap(result);
  const more = result.data.length > PAGE_SIZE,
    rows = result.data.slice(0, PAGE_SIZE);
  return {
    rows: await attachAuthors(rows),
    more,
    cursor: rows.length
      ? { created_at: rows.at(-1).created_at, id: rows.at(-1).id }
      : null,
    count: result.count || 0,
  };
}
export async function requestApi(path, body) {
  const session = unwrap(await client().auth.getSession());
  if (!session?.session?.access_token)
    throw new Error("Bu işlem için giriş yapmalısınız.");
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.session.access_token}`,
    },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      errorMessage({ message: result.error || "Medya işlemi tamamlanamadı." }),
    );
  return result;
}
export async function uploadMedia(file, purpose) {
  if (!file || file.size > 3 * 1024 * 1024)
    throw new Error("Dosya en fazla 3 MB olabilir.");
  const signed = await requestApi("/api/media/sign", {
    intent: purpose === "avatar" || purpose === "banner" ? purpose : "dm",
    mimeType: file.type.split(";")[0],
    size: file.size,
  });
  const form = new FormData();
  Object.entries(signed.upload.fields || {}).forEach(([key, value]) =>
    form.append(key, String(value)),
  );
  form.append("file", file);
  const session = unwrap(await client().auth.getSession());
  if (!session?.session?.access_token)
    throw new Error("Dosya yüklemek için giriş yapmalısın.");
  if (!/^\/api\/media\/upload(?:\?|$)/.test(signed.upload.url))
    throw new Error("Medya yükleme adresi doğrulanamadı.");
  const response = await fetch(signed.upload.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.session.access_token}` },
    body: form,
  });
  const uploaded = await response.json();
  if (!response.ok)
    throw new Error("Dosya yüklenemedi. Lütfen yeniden deneyin.");
  return requestApi("/api/media/complete", {
    assetId: signed.assetId,
    public_id: uploaded.public_id,
    version: uploaded.version,
    signature: uploaded.signature,
  });
}
export function applyCursor(request, cursor) {
  if (!cursor) return request;
  const raw = String(cursor.created_at || ""),
    id = String(cursor.id || "");
  if (
    !/^\d{4}-\d{2}-\d{2}T[\d:.]+(?:Z|[+-]\d{2}:\d{2})$/.test(raw) ||
    Number.isNaN(Date.parse(raw)) ||
    !/^\d+$/.test(id)
  )
    throw new Error("Sayfalama bilgisi geçersiz.");
  return request.or(
    `created_at.lt.${raw},and(created_at.eq.${raw},id.lt.${id})`,
  );
}
export function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}
