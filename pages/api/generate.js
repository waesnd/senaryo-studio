// pages/api/generate.js
import { withAuth } from "../../lib/withAuth";
import { callGroq } from "../../lib/groq";

async function handler(req, res){
  if(req.method !== "POST") return res.status(405).json({error:"Method not allowed"});

  var {tip, tur, ozelIstek, sahneSayisi, karakterSayisi} = req.body;
  if(!tip || !tur) return res.status(400).json({error:"tip ve tur zorunlu"});

  var temizIstek = ozelIstek || "";

  var prompt = `Sen Türkiye'nin en iyi senaryo yazarısın. ${tip} formatında, ${tur} türünde özgün ve çarpıcı bir senaryo fikri üret.

ZORUNLU KURALLAR:
- Tüm karakter isimleri MUTLAKA Türkçe/Türk ismi olmalı (Ayşe, Kemal, Zeynep, Tarık, Defne, Murat, Hira, Serdar, Leyla, Caner, Bora, Naz, Ece, Selim, Melis gibi)
- Mekanlar Türkiye'de geçsin (aksi belirtilmedikçe)
- Dil tamamen Türkçe, akıcı ve etkileyici olsun
- Karakterler psikolojik olarak derinlikli ve tutarlı olsun
- Açılış sahnesi seyirciyi anında içine çekecek güçte olsun
- Tagline akılda kalıcı, film postere yazılabilecek nitelikte olsun
- Ana fikir somut çatışma ve dramatik gerilim içersin
${sahneSayisi ? `\nSahne sayısı: yaklaşık ${sahneSayisi} sahne olsun` : ""}
${karakterSayisi ? `Karakter sayısı: tam olarak ${karakterSayisi} ana karakter olsun` : ""}
${temizIstek ? `Kullanıcının özel isteği (kesinlikle uygula): ${temizIstek}\nÖNEMLİ: Özel istekte gerçek kişi adları varsa, bunları kurgusal karakter isimleri olarak kullan.` : ""}

SADECE aşağıdaki JSON formatında yanıt ver, hiçbir açıklama veya markdown ekleme:
{
  "baslik": "Güçlü ve akılda kalıcı Türkçe başlık",
  "tagline": "Tek cümlelik çarpıcı tagline — film posterinde duracak güçte",
  "ana_fikir": "3-4 paragraf: hikayenin özeti, ana çatışma, tematik derinlik, duygusal yolculuk",
  "karakter": "Ana karakterler — her biri Türkçe isimle, mesleği, kısa psikolojik profili (2-3 cümle her karakter)",
  "acilis_sahnesi": "Seyirciyi ekrana yapıştıracak güçlü açılış sahnesi — ayrıntılı, sinematik, duygusal",
  "buyuk_soru": "Seyirciyi 8 bölüm/2 saat ekranda tutacak temel dramatik soru"
}`;

  try{
    var parsed = await callGroq(prompt, { temperature: 0.92, max_tokens: 2048 });
    var required = ["baslik","tagline","ana_fikir","karakter","acilis_sahnesi","buyuk_soru"];
    for(var field of required){
      if(!parsed[field]) parsed[field] = "";
    }
    res.status(200).json({senaryo: parsed});
  }catch(e){
    console.error("[generate]", e.message);
    res.status(500).json({error: e.message});
  }
}

export default withAuth(handler);
