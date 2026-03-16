// pages/api/pitch.js
import { withAuth } from "../../lib/withAuth";
async function handler(req, res){
  if(req.method !== "POST") return res.status(405).json({error:"Method not allowed"});
  var {senaryo, tur, tip} = req.body;
  if(!senaryo) return res.status(400).json({error:"senaryo zorunlu"});

  var prompt = `Sen Türkiye'nin en iyi yapımcılarına pitch sunan bir senaryo temsilcisisin. Aşağıdaki senaryo için profesyonel bir pitch deck içeriği oluştur.

Senaryo: ${senaryo.baslik} (${tur} ${tip})
Tagline: ${senaryo.tagline||""}
Ana Fikir: ${senaryo.ana_fikir}
Karakterler: ${senaryo.karakter}
Açılış: ${senaryo.acilis_sahnesi}

SADECE şu JSON formatında yanıt ver, başka hiçbir şey yazma:
{
  "one_liner":"Tek cümlelik en güçlü pitch",
  "problem":"Hangi insani sorunu ele alıyor",
  "cozum":"Senaryo bunu nasıl çözüyor",
  "hedef_kitle":"Hedef kitle ve platform önerisi",
  "rekabet":"Benzer yapımlar ve bu senaryonun farkı",
  "neden_simdi":"Bu hikaye neden şimdi anlatılmalı",
  "vizyon":"Franchise veya sezon genişleme potansiyeli",
  "cagri":"Yapımcıya yatırım çağrısı"
}`;

  try{
    var groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions",{
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":"Bearer "+process.env.GROQ_API_KEY},
      body:JSON.stringify({model:"llama-3.3-70b-versatile",messages:[{role:"user",content:prompt}],temperature:0.75,max_tokens:1500}),
    });
    if(!groqRes.ok) throw new Error("Groq API hatası: "+groqRes.status);
    var data = await groqRes.json();
    var text = data.choices?.[0]?.message?.content||"";
    text = text.replace(/```json\s*/gi,"").replace(/```\s*/g,"").trim();
    var match = text.match(/\{[\s\S]*\}/);
    if(!match) throw new Error("JSON bulunamadı");
    res.status(200).json(JSON.parse(match[0]));
  }catch(e){
    console.error("[pitch]", e.message);
    res.status(500).json({error: e.message});
  }
}

export default withAuth(handler);
