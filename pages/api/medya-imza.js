import crypto from "crypto";
import { withAuth } from "../../lib/withAuth";

// Browser uploads must receive a short-lived, user-scoped signature from an
// authenticated backend. The Cloudinary API secret NEVER goes to the browser.
async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed", code: "METHOD_NOT_ALLOWED" });
  }

  const userId = req.user?.id;
  if (!userId || !/^[0-9a-f-]{36}$/i.test(userId)) {
    return res.status(401).json({ error: "Giriş yapmanız gerekiyor.", code: "UNAUTHORIZED" });
  }

  const kind = req.body?.kind;
  const kinds = {
    avatar: "image",
    banner: "image",
    "message-image": "image",
    "message-audio": "video",
  };
  if (!Object.hasOwn(kinds, kind)) {
    return res.status(400).json({ error: "Geçersiz medya türü.", code: "INVALID_MEDIA_KIND" });
  }

  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !secret) {
    return res.status(503).json({ error: "Medya yükleme geçici olarak kullanılamıyor.", code: "UPLOAD_UNAVAILABLE" });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = crypto.randomBytes(12).toString("hex");
  const public_id = `fabularc/users/${userId}/${kind}-${nonce}`;
  const signedParams = `public_id=${public_id}&timestamp=${timestamp}`;
  const signature = crypto.createHash("sha1").update(signedParams + secret).digest("hex");

  return res.status(200).json({
    cloud_name,
    api_key,
    resource_type: kinds[kind],
    public_id,
    timestamp,
    signature,
  });
}

export default withAuth(handler);
