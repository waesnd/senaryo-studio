// pages/api/diyalog.js
export default async function handler(req, res){
  if(req.method !== "POST") return res.status(405).json({error:"Method not allowed"});
  var {metin, tur} = req.body;
  if(!metin?.trim()) return res.status(400).json({error:"metin zorunlu"});

  var prompt = `Sen Türkiye'nin en iyi diyalog yazarısın. Aşağıdaki diyaloğu güçlendir — daha doğal, daha çarpıcı, karaktere özgü ve sinematik yap. Tür: ${tur||"Drama"}. Orijinalin duygusunu ve anlamını koru ama çok daha iyi yaz.

Orijinal diyalog:
${metin}

SADECE güçlendirilmiş diyaloğu yaz, başka açıklama ekleme.`;

  try{
    var groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions",{
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":"Bearer "+process.env.GROQ_API_KEY},
      body:JSON.stringify({model:"llama-3.3-70b-versatile",messages:[{role:"user",content:prompt}],temperature:0.85,max_tokens:1024}),
    });
    if(!groqRes.ok) throw new Error("Groq API hatası: "+groqRes.status);
    var data = await groqRes.json();
    var sonuc = data.choices?.[0]?.message?.content || "";
    res.status(200).json({sonuc});
  }catch(e){
    console.error("[diyalog]", e.message);
    res.status(500).json({error: e.message});
  }
}
