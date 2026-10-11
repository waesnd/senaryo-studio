import { randomUUID, createHash, timingSafeEqual } from "crypto";
import { z } from "zod";
import { withAuth } from "../withAuth";
import { fetchJsonWithDeadline } from "../groq";
import { ApiError, parseInput, requirePost } from "./errors";
import { createSupabaseServiceClient } from "./supabase";
import { readMultipartFile } from "./multipart";

const uuid = z.string().uuid();
const formats = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "video/mp4": "mp4", "video/webm": "webm", "audio/webm": "webm", "audio/ogg": "ogg", "audio/mpeg": "mp3", "audio/mp4": "m4a,mp4", "audio/wav": "wav" };
export const MEDIA_MAX_BYTES = 3 * 1024 * 1024;
export const mediaSignInput = z.object({ intent: z.enum(["avatar", "banner", "post", "dm"]), mimeType: z.enum(Object.keys(formats)), size: z.number().int().positive().max(MEDIA_MAX_BYTES) }).strict();
const completeInput = z.object({ assetId: uuid, public_id: z.string().min(1).max(300), version: z.number().int().positive(), signature: z.string().regex(/^[a-f0-9]{40}$/i) }).strict();
const assetInput = z.object({ assetId: uuid }).strict();
const deleteInput = z.object({ assetId: uuid.optional(), public_id: z.string().min(1).max(300).optional(), resource_type: z.enum(["image", "video"]).optional() }).strict().refine(value => Boolean(value.assetId || value.public_id));

export function cloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !/^[a-zA-Z0-9_-]+$/.test(cloudName) || !apiKey || !apiSecret) throw new ApiError(503, "MEDIA_NOT_CONFIGURED", "Medya servisi henüz yapılandırılmadı.");
  return { cloudName, apiKey, apiSecret };
}
export function createMediaAdminClient() {
  return createSupabaseServiceClient();
}
export function signCloudinary(params, secret) {
  const string = Object.keys(params).filter(key => params[key] !== undefined && params[key] !== "").sort().map(key => `${key}=${params[key]}`).join("&");
  return createHash("sha1").update(string + secret).digest("hex");
}
function signatureMatches(actual, expected) {
  const a = Buffer.from(actual.toLowerCase());
  const b = Buffer.from(expected.toLowerCase());
  return a.length === b.length && timingSafeEqual(a, b);
}
async function getAsset(client, input) {
  let query = client.from("media_assets").select("*");
  query = input.assetId ? query.eq("id", input.assetId) : query.eq("public_id", input.public_id);
  const { data, error } = await query.maybeSingle();
  if (error) throw new ApiError(503, "MEDIA_REGISTRY_UNAVAILABLE", "Medya kaydı doğrulanamadı.");
  if (!data) throw new ApiError(404, "MEDIA_NOT_FOUND", "Medya bulunamadı veya erişim yetkiniz yok.");
  return data;
}
function assetResponse(asset) {
  return { id: asset.id, url: asset.delivery_type === "authenticated" ? null : asset.secure_url, public_id: asset.public_id, resource_type: asset.resource_type, intent: asset.intent };
}

export function createMediaHandlers(dependencies = {}) {
  const getConfig = dependencies.getConfig || cloudinaryConfig;
  const getAdmin = dependencies.getAdmin || createMediaAdminClient;
  const requestJson = dependencies.requestJson || fetchJsonWithDeadline;
  const wrap = handler => withAuth(handler, dependencies.authOptions);

  const sign = wrap(async (req, res) => {
    requirePost(req);
    const input = parseInput(mediaSignInput, req.body);
    const isImage = input.mimeType.startsWith("image/");
    const isAudio = input.mimeType.startsWith("audio/");
    if ((["avatar", "banner"].includes(input.intent) && !isImage) || (input.intent === "post" && isAudio)) throw new ApiError(400, "MEDIA_VALIDATION_ERROR", "Bu alanda dosya biçimi desteklenmiyor.");
    getConfig();
    const admin = getAdmin();
    const now = new Date();
    const assetId = randomUUID();
    const publicId = `senaryo-studio/${req.user.id}/${assetId}`;
    const resourceType = isImage ? "image" : "video";
    const deliveryType = input.intent === "dm" ? "authenticated" : "upload";
    const expiresAt = new Date(now.getTime() + 10 * 60_000).toISOString();
    const { data: reservation, error } = await admin.rpc("register_media_upload", { p_id: assetId, p_owner_id: req.user.id, p_public_id: publicId, p_resource_type: resourceType, p_intent: input.intent, p_mime_type: input.mimeType, p_bytes: input.size, p_delivery_type: deliveryType, p_expires_at: expiresAt });
    if (error || typeof reservation?.allowed !== "boolean") throw new ApiError(503, "MEDIA_REGISTRY_UNAVAILABLE", "Medya yüklemesi başlatılamadı.");
    if (!reservation.allowed) throw new ApiError(429, reservation.code || "MEDIA_UPLOAD_LIMIT", "Medya yükleme sınırına ulaştınız. Lütfen biraz bekleyin.", { retryAfterMs: reservation.retryAfterMs ?? 600_000 });
    // Upload signatures stay server-side: clients cannot use an intent to send
    // oversized, billable files directly to the provider.
    return res.status(200).json({ ok: true, assetId, expiresAt, upload: { url: `/api/media/upload?assetId=${assetId}`, fields: {} } });
  });

  const upload = wrap(async (req, res) => {
    requirePost(req);
    const input = parseInput(assetInput, { assetId: req.query?.assetId });
    const asset = await getAsset(req.supabase, input);
    if (asset.owner_id !== req.user.id) throw new ApiError(403, "FORBIDDEN", "Bu medyayı yükleme yetkiniz yok.");
    if (asset.status !== "pending" || !Number.isFinite(Date.parse(asset.expires_at)) || Date.parse(asset.expires_at) <= Date.now()) throw new ApiError(409, "MEDIA_UPLOAD_EXPIRED", "Medya yükleme süresi doldu. Yeni bir yükleme başlatın.");
    if (!Number.isSafeInteger(asset.bytes) || asset.bytes <= 0 || asset.bytes > MEDIA_MAX_BYTES || !formats[asset.mime_type]) throw new ApiError(400, "MEDIA_VALIDATION_ERROR", "Dosya biçimi veya boyutu desteklenmiyor.");
    const config = getConfig();
    const admin = getAdmin();
    const file = await readMultipartFile(req, asset.bytes);
    if (file.size !== asset.bytes || file.type.split(";")[0] !== asset.mime_type) throw new ApiError(400, "MEDIA_VALIDATION_ERROR", "Dosyanın boyutu veya biçimi yükleme isteğiyle eşleşmiyor.");
    const { data: claimed, error: claimError } = await admin.from("media_assets").update({ upload_started_at: new Date().toISOString() }).eq("id", asset.id).eq("owner_id", req.user.id).eq("status", "pending").is("upload_started_at", null).select("id").maybeSingle();
    if (claimError) throw new ApiError(503, "MEDIA_REGISTRY_UNAVAILABLE", "Medya yükleme hakkınız doğrulanamadı.");
    if (!claimed) throw new ApiError(409, "MEDIA_UPLOAD_ALREADY_STARTED", "Bu dosyanın yüklemesi zaten başlatıldı. Tamamlanmasını bekleyin veya yeni bir yükleme başlatın.");
    try {
      const fields = { timestamp: Math.floor(Date.now() / 1000), public_id: asset.public_id, type: asset.delivery_type, overwrite: "false", allowed_formats: formats[asset.mime_type] };
      const form = new FormData();
      for (const [key, value] of Object.entries({ ...fields, api_key: config.apiKey, signature: signCloudinary(fields, config.apiSecret) })) form.append(key, String(value));
      form.append("file", file, `media.${formats[asset.mime_type].split(",")[0]}`);
      const { response, data } = await requestJson(`https://api.cloudinary.com/v1_1/${config.cloudName}/${asset.resource_type}/upload`, { method: "POST", body: form });
      const receipt = completeInput.safeParse({ assetId: asset.id, public_id: data.public_id, version: data.version, signature: data.signature });
      if (!response.ok || !receipt.success || data.public_id !== asset.public_id || !signatureMatches(data.signature, signCloudinary({ public_id: data.public_id, version: data.version }, config.apiSecret))) throw new ApiError(502, "MEDIA_UPLOAD_FAILED", "Medya servisi yüklemeyi tamamlayamadı.");
      return res.status(200).json({ ok: true, public_id: data.public_id, version: data.version, signature: data.signature });
    } catch (error) {
      try { await admin.from("media_assets").update({ upload_started_at: null }).eq("id", asset.id).eq("owner_id", req.user.id).eq("status", "pending"); } catch { /* Failed claims expire; no unbounded provider retry. */ }
      throw error;
    }
  });

  const complete = wrap(async (req, res) => {
    requirePost(req);
    const input = parseInput(completeInput, req.body);
    const asset = await getAsset(req.supabase, input);
    if (asset.owner_id !== req.user.id || asset.public_id !== input.public_id) throw new ApiError(403, "FORBIDDEN", "Bu medyayı kaydetme yetkiniz yok.");
    if (asset.status === "ready") return res.status(200).json({ ok: true, asset: assetResponse(asset) });
    if (asset.status !== "pending" || !Number.isFinite(Date.parse(asset.expires_at)) || Date.parse(asset.expires_at) < Date.now()) throw new ApiError(409, "MEDIA_UPLOAD_EXPIRED", "Medya yükleme süresi doldu. Yeni bir yükleme başlatın.");
    const config = getConfig();
    if (!signatureMatches(input.signature, signCloudinary({ public_id: input.public_id, version: input.version }, config.apiSecret))) throw new ApiError(400, "MEDIA_SIGNATURE_INVALID", "Medya yükleme imzası doğrulanamadı.");
    const { response, data } = await requestJson(`https://api.cloudinary.com/v1_1/${config.cloudName}/resources/${asset.resource_type}/${asset.delivery_type}/${encodeURIComponent(asset.public_id)}`, { headers: { Authorization: `Basic ${Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString("base64")}` } });
    if (!response.ok) throw new ApiError(502, "MEDIA_VERIFY_FAILED", "Yüklenen medya servis tarafından doğrulanamadı.");
    const expectedFormats = (formats[asset.mime_type] || "").split(",");
    if (data.public_id !== asset.public_id || data.resource_type !== asset.resource_type || data.type !== asset.delivery_type || data.version !== input.version || !Number.isSafeInteger(data.bytes) || data.bytes <= 0 || data.bytes > asset.bytes || !expectedFormats.includes(data.format) || !data.asset_id) throw new ApiError(400, "MEDIA_VERIFY_FAILED", "Yüklenen dosya türü, boyutu veya sahipliği doğrulanamadı.");
    let url;
    try { url = new URL(data.secure_url); } catch { throw new ApiError(502, "MEDIA_VERIFY_FAILED", "Medya bağlantısı doğrulanamadı."); }
    if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com" || !url.pathname.startsWith(`/${config.cloudName}/`)) throw new ApiError(502, "MEDIA_VERIFY_FAILED", "Medya bağlantısı doğrulanamadı.");
    const { data: updated, error } = await getAdmin().from("media_assets").update({ status: "ready", bytes: data.bytes, version: data.version, format: data.format, cloudinary_asset_id: data.asset_id, secure_url: data.secure_url, expires_at: null }).eq("id", asset.id).eq("owner_id", req.user.id).eq("status", "pending").select("*").maybeSingle();
    if (error || !updated) throw new ApiError(503, "MEDIA_REGISTRY_UNAVAILABLE", "Medya yüklemesi kaydedilemedi. Tekrar deneyin.");
    return res.status(200).json({ ok: true, asset: assetResponse(updated) });
  });

  const remove = wrap(async (req, res) => {
    requirePost(req);
    const input = parseInput(deleteInput, req.body);
    const asset = await getAsset(req.supabase, input);
    if (asset.owner_id !== req.user.id) throw new ApiError(403, "FORBIDDEN", "Bu medyayı silme yetkiniz yok.");
    if (asset.status === "deleted") return res.status(200).json({ ok: true, result: "not found", public_id: asset.public_id });
    const config = getConfig();
    const admin = getAdmin();
    const fields = { public_id: asset.public_id, timestamp: Math.floor(Date.now() / 1000), type: asset.delivery_type, invalidate: "true" };
    const body = new URLSearchParams({ ...fields, api_key: config.apiKey, signature: signCloudinary(fields, config.apiSecret) });
    const { response, data } = await requestJson(`https://api.cloudinary.com/v1_1/${config.cloudName}/${asset.resource_type}/destroy`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() });
    if (!response.ok || !["ok", "not found"].includes(data.result)) throw new ApiError(502, "MEDIA_DELETE_FAILED", "Medya servisi silme işlemini tamamlayamadı.");
    const { error } = await admin.from("media_assets").update({ status: "deleted", secure_url: null }).eq("id", asset.id).eq("owner_id", req.user.id);
    if (error) throw new ApiError(503, "MEDIA_REGISTRY_UNAVAILABLE", "Silme işlemi kaydı tamamlanamadı. Tekrar deneyin.");
    return res.status(200).json({ ok: true, result: data.result, public_id: asset.public_id, resource_type: asset.resource_type });
  });

  const access = wrap(async (req, res) => {
    requirePost(req);
    const input = parseInput(assetInput, req.body);
    const asset = await getAsset(req.supabase, input);
    if (asset.status !== "ready") throw new ApiError(404, "MEDIA_NOT_FOUND", "Medya henüz hazır değil veya silinmiş.");
    if (asset.owner_id !== req.user.id) {
      const { data: messages, error } = await req.supabase.from("mesajlar").select("gonderen,alan").or(`medya_asset_id.eq.${asset.id},ses_asset_id.eq.${asset.id}`).or(`gonderen.eq.${req.user.id},alan.eq.${req.user.id}`).limit(1);
      if (error) throw new ApiError(503, "MEDIA_ACCESS_UNAVAILABLE", "Medya erişimi doğrulanamadı.");
      const message = messages?.[0];
      if (!message || ![message.gonderen, message.alan].includes(req.user.id)) throw new ApiError(403, "FORBIDDEN", "Bu medyaya erişim yetkiniz yok.");
      const { data: blocks, error: blockError } = await getAdmin().from("engellemeler").select("id").or(`and(engelleyen.eq.${message.gonderen},engellenen.eq.${message.alan}),and(engelleyen.eq.${message.alan},engellenen.eq.${message.gonderen})`).limit(1);
      if (blockError) throw new ApiError(503, "MEDIA_ACCESS_UNAVAILABLE", "Medya erişimi doğrulanamadı.");
      if (blocks?.length) throw new ApiError(403, "FORBIDDEN", "Bu sohbetin medyasına erişilemiyor.");
    }
    if (asset.delivery_type !== "authenticated") return res.status(200).json({ ok: true, url: asset.secure_url, expiresAt: null });
    const config = getConfig();
    const now = Math.floor(Date.now() / 1000);
    const fields = { timestamp: now, expires_at: now + 300, public_id: asset.public_id, format: asset.format || (formats[asset.mime_type] || "").split(",")[0], type: "authenticated" };
    const query = new URLSearchParams({ ...fields, api_key: config.apiKey, signature: signCloudinary(fields, config.apiSecret) });
    return res.status(200).json({ ok: true, url: `https://api.cloudinary.com/v1_1/${config.cloudName}/${asset.resource_type}/download?${query}`, expiresAt: new Date((now + 300) * 1000).toISOString() });
  });
  return { sign, upload, complete, remove, access };
}
