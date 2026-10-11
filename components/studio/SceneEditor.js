import { createId } from "../../lib/scenario";
import { Button } from "../ui";
import styles from "./Studio.module.css";

export default function SceneEditor({ scene, index, characters, onChange, onRemove, onMove, onAssist, onRemoveDialogue, onlyScene }) {
  const update = (key, value) => onChange({ ...scene, [key]: value });
  const updateLine = (id, key, value) => update("dialogue", scene.dialogue.map(line => line.id === id ? { ...line, [key]: value } : line));
  return <section className={styles.scene} id={`scene-${scene.id}`} aria-label={`Sahne ${index + 1}`}>
    <div className={styles.sceneToolbar}>
      <span className={styles.sceneNumber}>SAHNE {String(index + 1).padStart(2, "0")}</span>
      <div className="cluster">
        <Button size="sm" variant="ghost" onClick={() => onMove(-1)} disabled={index === 0} aria-label={`Sahne ${index + 1} yukarı taşı`}>↑</Button>
        <Button size="sm" variant="ghost" onClick={() => onMove(1)} aria-label={`Sahne ${index + 1} aşağı taşı`}>↓</Button>
        <Button size="sm" variant="ghost" onClick={onRemove} disabled={onlyScene} aria-label={`Sahne ${index + 1} sil`}>Sil</Button>
      </div>
    </div>
    <label className={styles.paperLabel} htmlFor={`heading-${scene.id}`}>Sahne başlığı</label>
    <input id={`heading-${scene.id}`} className={styles.sceneHeading} value={scene.heading} maxLength={500} onChange={event => update("heading", event.target.value)} placeholder="İÇ. KADIKÖY, KAFE - GECE" />
    <label className={styles.paperLabel} htmlFor={`action-${scene.id}`}>Aksiyon</label>
    <textarea id={`action-${scene.id}`} className={styles.action} value={scene.action} onChange={event => update("action", event.target.value)} placeholder="Gördüğümüz ve duyduğumuz şeyleri yazın…" rows={Math.max(4, Math.min(18, scene.action.split("\n").length + 2))} />
    <Button size="sm" variant="ghost" disabled={!scene.action.trim()} onClick={() => onAssist({ sceneId: scene.id, type: "action", text: scene.action })}>Seçili aksiyonu AI ile düzenle</Button>
    <datalist id={`characters-${scene.id}`}>{characters.filter(character => character.name).map(character => <option key={character.id} value={character.name} />)}</datalist>
    {scene.dialogue.map((line, lineIndex) => <div className={styles.dialogue} key={line.id}>
      <label className={styles.paperLabel} htmlFor={`character-${line.id}`}>Konuşan karakter</label>
      <input id={`character-${line.id}`} className={styles.characterName} value={line.character} onChange={event => updateLine(line.id, "character", event.target.value)} list={`characters-${scene.id}`} maxLength={150} placeholder="KARAKTER" />
      <label className={styles.paperLabel} htmlFor={`dialogue-${line.id}`}>Diyalog {lineIndex + 1}</label>
      <textarea id={`dialogue-${line.id}`} className={styles.dialogueText} value={line.text} onChange={event => updateLine(line.id, "text", event.target.value)} placeholder="Söyleyeceklerini yazın…" rows={3} />
      <div className={styles.dialogueActions}>
        <Button size="sm" variant="ghost" disabled={!line.text.trim()} onClick={() => onAssist({ sceneId: scene.id, lineId: line.id, type: "dialogue", text: line.text })}>AI ile düzenle</Button>
        <Button size="sm" variant="ghost" onClick={() => onRemoveDialogue(line.id)} aria-label={`Diyalog ${lineIndex + 1} sil`}>Sil</Button>
      </div>
    </div>)}
    <Button size="sm" variant="secondary" onClick={() => update("dialogue", [...scene.dialogue, { id: createId("dialogue"), character: "", text: "" }])}>+ Diyalog ekle</Button>
  </section>;
}
