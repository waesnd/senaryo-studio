// pages/api/puan.js
import { withAuth } from "../../lib/withAuth";
async function handler(req, res){
  if(req.method !== "POST") return res.status(405).json({error:"Method not allowed"});

  var {senaryo, tip, tur} = req.body;
  if(!senaryo) return res.status(400).json({error:"senaryo zorunlu"});

  // Her seferinde farklı bir yapımcı profili
  var yapimcilar = [
    {isim:"Ay Yapım tarzı yapımcı", imdb_base:6.8, ticari_ağırlık:true},
    {isim:"Netflix Türkiye içerik alıcısı", imdb_base:7.2, ticari_ağırlık:false},
    {isim:"bağımsız sinema yapımcısı", imdb_base:7.5, ticari_ağırlık:false},
    {isim:"Disney+ Türkiye editörü", imdb_base:7.0, ticari_ağırlık:false},
    {isim:"BluTV içerik direktörü", imdb_base:6.9, ticari_ağırlık:true},
  ];
  var y = yapimcilar[Math.floor(Math.random()*yapimcilar.length)];

  var prompt = `Sen bir ${y.isim} olarak bu senaryoyu değerlendiriyorsun. Gerçekçi, tarafsız ve bu senaryonun gerçek kalitesini yansıtan puanlar ver. Ortalama bir senaryo 55-65 alır, iyi bir senaryo 70-80, olağanüstü bir senaryo 85+.

Senaryo: ${senaryo.baslik} (${tur} — ${tip})
Tagline: ${senaryo.tagline || "—"}
Ana Fikir: ${senaryo.ana_fikir}
Karakterler: ${senaryo.karakter}
Açılış Sahnesi: ${senaryo.acilis_sahnesi}
Büyük Soru: ${senaryo.buyuk_soru}

Puanlama (her biri max 25, toplam 100):
- Orijinallik: Bu hikaye daha önce anlatılmış mı? Ne kadar özgün?
- Ticari Potansiyel: ${y.ticari_ağırlık?"İzleyici ve reklam potansiyeli kritik.":"Sanatsal değer ön planda."}
- Karakter Derinliği: Karakterler gerçekçi ve ilgi çekici mi?
- Anlatım: Yapı, tempo ve dramatik akış ne kadar güçlü?

SADECE aşağıdaki JSON formatında yanıt ver, başka hiçbir şey yazma:
{
  "toplam": <gerçekçi toplam 40-95 arası>,
  "orijinallik": <0-25>,
  "ticari_potansiyel": <0-25>,
  "karakter_derinligi": <0-25>,
  "anlatim": <0-25>,
  "imdb_tahmin": "<bu senaryonun gerçekçi IMDb tahmini 5.0-9.0 arası>",
  "netflix_uygun_mu": <true/false — gerçekçi değerlendir>,
  "hedef_kitle": "Yaş aralığı, platform, izleyici profili — bu senaryoya özgü",
  "benzer_yapimlar": ["Bu senaryoya gerçekten benzeyen yapım 1", "yapım 2", "yapım 3"],
  "yayin_platformu": "Bu senaryo için en uygun platform ve neden",
  "yapimci_yorumu": "${y.isim} olarak bu senaryoya dair 2-3 cümle özgün yorum"
}`;

  try{
    var groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions",{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Authorization":"Bearer " + process.env.GROQ_API_KEY,
      },
      body:JSON.stringify({
        model:"llama-3.3-70b-versatile",
        messages:[{role:"user", content:prompt}],
        temperature:0.85,
        max_tokens:1024,
      }),
    });

    if(!groqRes.ok) throw new Error("Groq API hatası: " + groqRes.status);

    var data = await groqRes.json();
    var text = data.choices?.[0]?.message?.content || "";
    text = text.replace(/```json\s*/gi,"").replace(/```\s*/g,"").trim();
    var match = text.match(/\{[\s\S]*\}/);
    if(!match) throw new Error("JSON bulunamadı");

    var parsed = JSON.parse(match[0]);

    // Tip güvenliği
    var sayisal = ["toplam","orijinallik","ticari_potansiyel","karakter_derinligi","anlatim"];
    sayisal.forEach(k=>{ if(typeof parsed[k]==="string") parsed[k]=parseInt(parsed[k])||0; });
    if(typeof parsed.netflix_uygun_mu === "string") parsed.netflix_uygun_mu = parsed.netflix_uygun_mu==="true";
    if(!Array.isArray(parsed.benzer_yapimlar)) parsed.benzer_yapimlar = [];

    // Toplam doğrula (alt puanların toplamı 100'ü geçmesin)
    var altToplam = (parsed.orijinallik||0)+(parsed.ticari_potansiyel||0)+(parsed.karakter_derinligi||0)+(parsed.anlatim||0);
    if(altToplam !== parsed.toplam) parsed.toplam = altToplam;

    res.status(200).json(parsed);
  }catch(e){
    console.error("[puan]", e.message);
    res.status(500).json({error: e.message});
  }
}

export default withAuth(handler);
