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
