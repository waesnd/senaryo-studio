import { useEffect, useState } from "react";
import { requestApi, safeUrl, errorMessage } from "../../lib/social-client";
export default function MessageMedia({ assetId, audio = false }) {
  const [url, setUrl] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setUrl("");
    setError("");
    requestApi("/api/media/access", { assetId })
      .then((result) => {
        if (active) {
          const safe = safeUrl(result.url);
          if (!safe) throw new Error("Medya adresi doğrulanamadı.");
          setUrl(safe);
        }
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      });
    return () => {
      active = false;
    };
  }, [assetId]);
  return error ? (
    <p role="alert" className="small">
      {error}
    </p>
  ) : !url ? (
    <span className="small muted">Medya yükleniyor…</span>
  ) : audio ? (
    <audio
      src={url}
      controls
      preload="metadata"
      style={{ maxWidth: "100%", width: 250 }}
    />
  ) : (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <img
        src={url}
        alt="Mesaja eklenen görsel"
        loading="lazy"
        style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 10 }}
      />
    </a>
  );
}
