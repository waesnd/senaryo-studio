import styles from "./Studio.module.css";

const LABELS = {
  logline1: "Logline · 1", logline2: "Logline · 2", logline3: "Logline · 3", one_liner: "Tek cümlelik sunum",
  problem: "İnsani çatışma", cozum: "Hikâyenin yaklaşımı", hedef_kitle: "Hedef kitle", rekabet: "Benzer yapımlar ve farkı",
  neden_simdi: "Neden şimdi?", vizyon: "Vizyon", cagri: "Yapımcıya çağrı", sonuc: "Önerilen metin", analiz: "Analiz",
  toplam: "Toplam", puan: "Puan", guclu_yanlar: "Güçlü yanlar", zayif_yanlar: "Geliştirilebilecek yanlar", oneriler: "Öneriler",
};
const HIDDEN = new Set(["ok", "requestId", "meta", "metadata", "id", "usage", "schemaVersion"]);

export default function AnalysisResult({ value, depth = 0 }) {
  if (value == null) return null;
  if (typeof value !== "object") return <p className={styles.resultText}>{String(value)}</p>;
  if (Array.isArray(value)) return <div className="stack">{value.map((item, index) => <div className={styles.resultItem} key={index}><AnalysisResult value={item} depth={depth + 1} /></div>)}</div>;
  return <div className="stack">{Object.entries(value).filter(([key]) => !HIDDEN.has(key)).map(([key, item]) => <div className={depth ? "" : styles.resultItem} key={key}>
    <h4 className={styles.resultLabel}>{LABELS[key] || key.replace(/_/g, " ").replace(/^./u, char => char.toLocaleUpperCase("tr"))}</h4>
    <AnalysisResult value={item} depth={depth + 1} />
  </div>)}</div>;
}
