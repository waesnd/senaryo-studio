import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  var { public_id } = req.body;
  if (!public_id) return res.status(400).json({ error: "public_id gerekli" });

  var cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  var api_key = process.env.CLOUDINARY_API_KEY;
  var api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    return res.status(500).json({ error: "Cloudinary env eksik" });
  }

  var timestamp = Math.round(Date.now() / 1000);
  var str = "public_id=" + public_id + "&timestamp=" + timestamp + api_secret;
  var signature = crypto.createHash("sha1").update(str).digest("hex");

  try {
    var fd = new URLSearchParams();
    fd.append("public_id", public_id);
    fd.append("timestamp", timestamp);
    fd.append("api_key", api_key);
    fd.append("signature", signature);

    var r = await fetch("https://api.cloudinary.com/v1_1/" + cloud_name + "/image/destroy", {
      method: "POST",
      body: fd,
    });
    var data = await r.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
