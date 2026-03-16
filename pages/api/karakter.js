// pages/api/karakter.js
import { withAuth } from "../../lib/withAuth";
import { callGroq } from "../../lib/groq";
async function handler(req, res){
  if(req.method !== "POST") return res.status(405).json({error:"Method not allowed"});

  var {concept, tip, tur} = req.body;
  if(!concept) return res.status(400).json({error:"concept zorunlu"});

  var prompt = `Sen psikoloji ve dramatik yapı konusunda uzman bir karakter analistisin. Aşağıdaki ${tip} senaryosunun ana karakterini derinlemesine analiz et.

Başlık: ${concept.baslik}
Karakter: ${concept.karakter}
Ana Fikir: ${concept.ana_fikir}
Tür: ${tur}

SADECE aşağıdaki JSON formatında yanıt ver, hiçbir açıklama ekleme:
{
  "gecmis": "Karakterin geçmişi, kökeni ve bunu şekillendiren olaylar — 2-3 cümle",
  "motivasyon": "Karakteri harekete geçiren temel motivasyon ve arzular — 2-3 cümle",
  "guclu": "Güçlü yanları ve sahip olduğu beceriler — 2-3 cümle",
  "zayif": "Zayıf yanları, zaafiyetleri ve kör noktaları — 2-3 cümle",
  "ic_catisma": "Karakterin içsel çatışması ve ruhsal düğümü — 1-2 cümle",
  "arc": "Hikaye boyunca geçireceği dönüşüm ve karakter yayı — 2 cümle"
}`;

  try{
    var sonuc = await callGroq(prompt, { temperature: 0.85, max_tokens: 1024, raw: false });

    res.status(200).json(sonuc);
  }catch(e){
    console.error("[karakter]", e.message);
    res.status(500).json({error: e.message});
  }
}

export default withAuth(handler);
