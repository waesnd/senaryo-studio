// pages/api/karakterbible.js
import { withAuth } from "../../lib/withAuth";
async function handler(req, res){
  if(req.method !== "POST") return res.status(405).json({error:"Method not allowed"});

  var {senaryo, tur} = req.body;
  if(!senaryo) return res.status(400).json({error:"senaryo zorunlu"});

  var prompt = `Sen Türk televizyon ve sinema sektöründe uzman bir karakter yazarısın. Aşağıdaki senaryodaki en önemli 3 ana karakter için kapsamlı Karakter Dosyası oluştur.

ZORUNLU: Tüm karakter isimleri Türkçe olmalı, yabancı isim kullanma.

Senaryo: ${senaryo.baslik}
Tür: ${tur}
Karakterler: ${senaryo.karakter}
Ana Fikir: ${senaryo.ana_fikir}
Açılış: ${senaryo.acilis_sahnesi}

SADECE aşağıdaki JSON formatında yanıt ver, hiçbir açıklama ekleme:
{
  "karakterler": [
    {
      "ad": "Türkçe isim",
      "yas": "yaş aralığı",
      "meslek": "mesleği veya rolü",
      "hedef": "hikayedeki temel hedefi ve arzusu",
      "korku": "en derin korkusu ve kaygısı",
      "sir": "sakladığı büyük sır veya utanç",
      "guc": "en güçlü özelliği veya becerisi",
      "zayiflik": "en belirgin zaafiyeti veya kör noktası",
      "arc": "hikaye boyunca geçireceği karakter dönüşümü",
      "diyalog_tonu": "nasıl konuşur — dili, üslubu, ağzından düşmeyen sözler"
    }
  ]
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
        max_tokens:2048,
      }),
    });

    if(!groqRes.ok) throw new Error("Groq API hatası: " + groqRes.status);

    var data = await groqRes.json();
    var text = data.choices?.[0]?.message?.content || "";
    text = text.replace(/```json\s*/gi,"").replace(/```\s*/g,"").trim();
    var match = text.match(/\{[\s\S]*\}/);
    if(!match) throw new Error("JSON bulunamadı");

    var parsed = JSON.parse(match[0]);
    // Güvenlik: karakterler dizisi yoksa boş döndür
    if(!parsed.karakterler) parsed.karakterler = [];

    res.status(200).json(parsed);
  }catch(e){
    console.error("[karakterbible]", e.message);
    res.status(500).json({error: e.message});
  }
}

export default withAuth(handler);
