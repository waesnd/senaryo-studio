import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  var { public_id, url } = req.body;

  // URL'den public_id çıkar (eğer direkt public_id gelmemişse)
  if (!public_id && url) {
    try {
      // https://res.cloudinary.com/CLOUD/image/upload/v123456/KLASOR/DOSYA.jpg
      var match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
      if (match) public_id = match[1];
    } catch (e) {}
  }

  if (!public_id) return res.status(400).json({ error: "public_id gerekli" });

  var cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  var api_key = process.env.CLOUDINARY_API_KEY;
  var api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    return res.status(500).json({ error: "Cloudinary env eksik", vars: { cloud_name: !!cloud_name, api_key: !!api_key, api_secret: !!api_secret } });
  }

  var timestamp = Math.round(Date.now() / 1000);
  // İmza formatı önemli: alfabetik sıra + secret sonuna eklenir
  var str = "public_id=" + public_id + "&timestamp=" + timestamp + api_secret;
  var signature = crypto.createHash("sha1").update(str).digest("hex");

  try {
    var fd = new URLSearchParams();
    fd.append("public_id", public_id);
    fd.append("timestamp", String(timestamp));
    fd.append("api_key", api_key);
    fd.append("signature", signature);

    var r = await fetch("https://api.cloudinary.com/v1_1/" + cloud_name + "/image/destroy", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: fd.toString(),
    });
    var data = await r.json();
    console.log("Cloudinary silme sonucu:", data, "public_id:", public_id);
    return res.status(200).json({ ...data, public_id });
  } catch (e) {
    console.error("Cloudinary silme hatası:", e);
    return res.status(500).json({ error: e.message });
  }
}
