import crypto from "crypto";
import { withAuth } from "../../lib/withAuth";

function sendError(res, status, error, code) {
  return res.status(status).json({ error, code });
}

function inferResourceType(url, explicitType) {
  if (explicitType === "video" || explicitType === "image") return explicitType;
  if (typeof url === "string" && url.includes("/video/upload/")) return "video";
  return "image";
}

async function handler(req, res) {
  if (req.method !== "POST") return sendError(res, 405, "Method not allowed", "METHOD_NOT_ALLOWED");

  var public_id = req.body?.public_id || null;
  var url = req.body?.url || null;
  var resource_type = inferResourceType(url, req.body?.resource_type);

  if (!public_id && url) {
    try {
      var match = String(url).match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i);
      if (match) public_id = match[1];
    } catch (e) {}
  }

  if (!public_id) return sendError(res, 400, "public_id gerekli", "VALIDATION_ERROR");

  var userId = req.user?.id;
  if (!userId) return sendError(res, 401, "Giriş yapmanız gerekiyor.", "UNAUTHORIZED");

  // Only signed uploads issued inside this authenticated user's namespace are
  // eligible. Legacy unsigned assets are intentionally not remotely deletable.
  const expectedPrefix = `fabularc/users/${userId}/`;
  const requestedId = String(public_id);
  const suffix = requestedId.startsWith(expectedPrefix)
    ? requestedId.slice(expectedPrefix.length)
    : "";
  if (resource_type !== "image" || !/^(?:avatar|banner)-[0-9a-f]{24}$/i.test(suffix)) {
    return sendError(res, 403, "Bu medyayı silme yetkiniz yok.", "FORBIDDEN");
  }

  // A client-controlled public_id, including folder segments, is never ownership proof.
  // Until a dedicated media ownership table exists, only exact references in the
  // authenticated user profile are eligible for deletion.
  var isOwner = false;

  if (!isOwner) {
    try {
      var { data: profil } = await req.supabase
        .from("profiles")
        .select("avatar_url, banner_url")
        .eq("id", userId)
        .single();

      if (profil) {
        const getStoredPublicId = (storedUrl) => {
          if (typeof storedUrl !== "string") return null;
          try {
            const parsedUrl = new URL(storedUrl);
            if (parsedUrl.protocol !== "https:" || parsedUrl.hostname !== "res.cloudinary.com") return null;
            const cloud = process.env.CLOUDINARY_CLOUD_NAME;
            const prefix = `/${cloud}/image/upload/`;
            if (!cloud || !parsedUrl.pathname.startsWith(prefix)) return null;
            const rest = parsedUrl.pathname.slice(prefix.length).replace(/^v\d+\//, "");
            const match = rest.match(/^(.+)\.[a-z0-9]+$/i);
            return match ? decodeURIComponent(match[1]) : null;
          } catch {
            return null;
          }
        };
        var isAvatar = getStoredPublicId(profil.avatar_url) === String(public_id);
        var isBanner = getStoredPublicId(profil.banner_url) === String(public_id);
        isOwner = Boolean(isAvatar || isBanner);
      }
    } catch (e) {
      console.error("[medya-sil] owner kontrolü hatası:", e);
    }
  }

  if (!isOwner) {
    return sendError(res, 403, "Bu medyayı silme yetkiniz yok.", "FORBIDDEN");
  }

  var cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  var api_key = process.env.CLOUDINARY_API_KEY;
  var api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    return sendError(res, 500, "Cloudinary env eksik", "CLOUDINARY_ENV_MISSING");
  }

  var timestamp = Math.round(Date.now() / 1000);
  var str = "public_id=" + public_id + "&timestamp=" + timestamp + api_secret;
  var signature = crypto.createHash("sha1").update(str).digest("hex");

  try {
    var fd = new URLSearchParams();
    fd.append("public_id", public_id);
    fd.append("timestamp", String(timestamp));
    fd.append("api_key", api_key);
    fd.append("signature", signature);
    fd.append("resource_type", resource_type);

    var r = await fetch("https://api.cloudinary.com/v1_1/" + cloud_name + "/" + resource_type + "/destroy", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: fd.toString(),
    });

    var data = await r.json();
    if (!r.ok || (data.result && data.result !== "ok" && data.result !== "not found")) {
      return sendError(res, 500, "Cloudinary silme işlemi başarısız oldu.", "MEDIA_DELETE_FAILED");
    }

    return res.status(200).json({ ...data, public_id, resource_type });
  } catch (e) {
    console.error("[medya-sil] Cloudinary hatası:", e);
    return sendError(res, 500, "Medya silinemedi.", "MEDIA_DELETE_FAILED");
  }
}

export default withAuth(handler);
