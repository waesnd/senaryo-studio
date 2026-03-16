// pages/api/logline.js
import { withAuth } from "../../lib/withAuth";
async function handler(req, res){
  if(req.method !== "POST") return res.status(405).json({error:"Method not allowed"});
  var {senaryo, tur, tip} = req.body;
  if(!senaryo) return res.status(400).json({error:"senaryo zorunlu"});

  var prompt = `Sen Hollywood'un en iyi logline yazarısın. Aşağıdaki senaryo için 3 farklı güçlü logline yaz. Her biri tek cümle, max 40 kelime, protagonist + hedef + engel yapısında, Türkçe.

Senaryo: ${senaryo.baslik}
Tür: ${tur} ${tip}
Ana Fikir: ${senaryo.ana_fikir}
Karakterler: ${senaryo.karakter}

SADECE şu JSON formatında yanıt ver, başka hiçbir şey yazma:
{"logline1":"...","logline2":"...","logline3":"..."}`;

  try{
    var groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions",{
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":"Bearer "+process.env.GROQ_API_KEY},
      body:JSON.stringify({model:"llama-3.3-70b-versatile",messages:[{role:"user",content:prompt}],temperature:0.8,max_tokens:512}),
    });
    if(!groqRes.ok) throw new Error("Groq API hatası: "+groqRes.status);
    var data = await groqRes.json();
    var text = data.choices?.[0]?.message?.content||"";
    text = text.replace(/```json\s*/gi,"").replace(/```\s*/g,"").trim();
    var match = text.match(/\{[\s\S]*\}/);
    if(!match) throw new Error("JSON bulunamadı");
    res.status(200).json(JSON.parse(match[0]));
  }catch(e){
    console.error("[logline]", e.message);
    res.status(500).json({error: e.message});
  }
}

export default withAuth(handler);
