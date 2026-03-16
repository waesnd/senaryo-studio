// pages/api/puan.js
import { withAuth } from "../../lib/withAuth";
import { callGroq } from "../../lib/groq";
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
    var sonuc = await callGroq(prompt, { temperature: 0.85, max_tokens: 1024 });
    var sayisal = ["toplam","orijinallik","ticari_potansiyel","karakter_derinligi","anlatim"];
    sayisal.forEach(k=>{ if(typeof sonuc[k]==="string") sonuc[k]=parseInt(sonuc[k])||0; });
    if(typeof sonuc.netflix_uygun_mu === "string") sonuc.netflix_uygun_mu = sonuc.netflix_uygun_mu==="true";
    if(!Array.isArray(sonuc.benzer_yapimlar)) sonuc.benzer_yapimlar = [];
    var altToplam = (sonuc.orijinallik||0)+(sonuc.ticari_potansiyel||0)+(sonuc.karakter_derinligi||0)+(sonuc.anlatim||0);
    if(altToplam !== sonuc.toplam) sonuc.toplam = altToplam;
    res.status(200).json(sonuc);
  }catch(e){
    console.error("[puan]", e.message);
    res.status(500).json({error: e.message});
  }
}

export default withAuth(handler);
