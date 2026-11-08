const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_PROFILE_IMAGE_BYTES = 10 * 1024 * 1024;

export async function uploadProfileMedia({ supabase, file, kind, fetchImpl = fetch }) {
  if (kind !== "avatar" && kind !== "banner") {
    throw new Error("Geçersiz görsel türü.");
  }

  if (!file || !ACCEPTED_IMAGE_TYPES.has(file.type) ||
      !Number.isFinite(file.size) || file.size <= 0 || file.size > MAX_PROFILE_IMAGE_BYTES) {
    throw new Error("Yalnızca 10 MB altındaki JPG, PNG veya WebP görselleri yüklenebilir.");
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (sessionError || !token) {
    throw new Error("Görsel yüklemek için yeniden giriş yapmanız gerekiyor.");
  }

  const signatureResponse = await fetchImpl("/api/medya-imza", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ kind }),
  });
  const signed = await signatureResponse.json();
  if (!signatureResponse.ok) {
    throw new Error(signed?.error || "Görsel için güvenli yükleme izni alınamadı.");
  }

  if (!signed?.signature || !signed?.public_id ||
      !signed?.cloud_name || !signed?.api_key || !signed?.timestamp) {
    throw new Error("Eksik Cloudinary yükleme bilgisi.");
  }

  const data = new FormData();
  data.append("file", file);
  for (const key of ["api_key", "timestamp", "public_id", "signature"]) {
    data.append(key, String(signed[key]));
  }

  const uploadedResponse = await fetchImpl(
    `https://api.cloudinary.com/v1_1/${signed.cloud_name}/image/upload`,
    { method: "POST", body: data }
  );
  const uploaded = await uploadedResponse.json();
  if (!uploadedResponse.ok || !uploaded?.secure_url ||
      uploaded?.public_id !== signed.public_id ||
      !uploaded.secure_url.startsWith(`https://res.cloudinary.com/${signed.cloud_name}/`)) {
    throw new Error(uploaded?.error?.message || "Görsel güvenli biçimde yüklenemedi.");
  }

  return uploaded;
}

const CHAT_AUDIO_TYPES = new Set(["audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg"]);
const MAX_CHAT_AUDIO_BYTES = 15 * 1024 * 1024;

export async function uploadChatMedia({ supabase, file, kind, fetchImpl = fetch }) {
  const isImage = kind === "message-image";
  const isAudio = kind === "message-audio";
  if (!isImage && !isAudio) throw new Error("Desteklenmeyen sohbet medya türü.");

  const allowedType = isImage
    ? ACCEPTED_IMAGE_TYPES.has(file?.type)
    : CHAT_AUDIO_TYPES.has(file?.type);
  const maximum = isImage ? MAX_PROFILE_IMAGE_BYTES : MAX_CHAT_AUDIO_BYTES;
  if (!file || !allowedType || !Number.isFinite(file.size) ||
      file.size <= 0 || file.size > maximum) {
    throw new Error("Görsel veya ses dosyasının biçimi ya da boyutu geçersiz.");
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (sessionError || !token) throw new Error("Medya göndermek için yeniden giriş yapmalısınız.");

  const response = await fetchImpl("/api/medya-imza", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ kind }),
  });
  const signed = await response.json();
  if (!response.ok) throw new Error(signed?.error || "Yükleme izni alınamadı.");

  const type = isImage ? "image" : "video";
  if (!signed?.api_key || !signed?.signature || !signed?.timestamp ||
      !/^[a-z0-9_-]{1,64}$/i.test(signed?.cloud_name || "") ||
      signed?.resource_type !== type ||
      !/^fabularc\/users\/[0-9a-f-]{36}\/message-(?:image|audio)-[0-9a-f]{24}$/i.test(signed?.public_id || "") ||
      !signed.public_id.endsWith(kind + "-" + signed.public_id.split(kind + "-").pop())) {
    throw new Error("Geçersiz imzalı sohbet yükleme bilgisi.");
  }

  const payload = new FormData();
  const filename = isAudio ? (file.type === "audio/mp4" ? "ses.m4a" : "ses.webm") : "gorsel.png";
  payload.append("file", file, filename);
  for (const key of ["api_key", "timestamp", "public_id", "signature"]) {
    payload.append(key, String(signed[key]));
  }

  const uploadResponse = await fetchImpl(
    `https://api.cloudinary.com/v1_1/${signed.cloud_name}/${type}/upload`,
    { method: "POST", body: payload }
  );
  const uploaded = await uploadResponse.json();
  if (!uploadResponse.ok || uploaded?.public_id !== signed.public_id ||
      typeof uploaded?.secure_url !== "string" ||
      !uploaded.secure_url.startsWith(
        `https://res.cloudinary.com/${signed.cloud_name}/${type}/upload/`
      )) {
    throw new Error(uploaded?.error?.message || "Sohbet medyası güvenli şekilde yüklenemedi.");
  }
  return uploaded;
}
