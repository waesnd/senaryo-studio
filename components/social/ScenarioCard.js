import { useEffect, useState } from "react";
import { Badge, Button, Card, Dialog, Textarea } from "../ui";
import { useAuth } from "../../lib/useAuth";
import {
  client,
  errorMessage,
  formatDate,
  normalizeTag,
  rpc,
  unwrap,
} from "../../lib/social-client";
import { Avatar, Notice } from "./Layout";

export default function ScenarioCard({
  scenario,
  editable = false,
  onChanged,
  onSavedChange,
}) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false),
    [saved, setSaved] = useState(false),
    [count, setCount] = useState(scenario.begeni_sayisi || 0);
  const [busy, setBusy] = useState(""),
    [error, setError] = useState(""),
    [reportOpen, setReportOpen] = useState(false),
    [reason, setReason] = useState(""),
    [deleteOpen, setDeleteOpen] = useState(false);
  useEffect(() => {
    let active = true;
    setLiked(false);
    setSaved(false);
    if (user)
      Promise.all([
        client()
          .from("begeniler")
          .select("id")
          .eq("user_id", user.id)
          .eq("senaryo_id", scenario.id)
          .maybeSingle(),
        client()
          .from("kaydedilenler")
          .select("id")
          .eq("user_id", user.id)
          .eq("senaryo_id", scenario.id)
          .maybeSingle(),
      ])
        .then((results) => {
          const values = results.map(unwrap);
          if (active) {
            setLiked(!!values[0]);
            setSaved(!!values[1]);
          }
        })
        .catch((e) => {
          if (active) setError(errorMessage(e));
        });
    return () => {
      active = false;
    };
  }, [scenario.id, user]);
  async function action(type) {
    if (!user) {
      setError(
        "Beğenmek, kaydetmek ve geri bildirim göndermek için giriş yapmalısın.",
      );
      return;
    }
    setBusy(type);
    setError("");
    try {
      if (type === "like") {
        const result = await rpc("toggle_scenario_like", {
          p_scenario_id: scenario.id,
        });
        setLiked(!!result.liked);
        setCount(Number(result.count || 0));
      }
      if (type === "save") {
        const result = await rpc("toggle_scenario_bookmark", {
          p_scenario_id: scenario.id,
        });
        setSaved(!!result.saved);
        onSavedChange?.(!!result.saved);
      }
      if (type === "visibility") {
        await rpc("set_scenario_visibility", {
          p_scenario_id: scenario.id,
          p_public: !scenario.paylasim_acik,
        });
        onChanged?.();
      }
      if (type === "delete") {
        await rpc("delete_scenario", { p_scenario_id: scenario.id });
        setDeleteOpen(false);
        onChanged?.();
      }
      if (type === "report") {
        if (reason.trim().length < 10)
          throw new Error("Lütfen en az 10 karakterle nedenini açıkla.");
        await rpc("submit_report", {
          p_scenario_id: scenario.id,
          p_reason: reason.trim(),
        });
        setReportOpen(false);
        setReason("");
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy("");
    }
  }
  return (
    <Card className="social-card">
      <div className="cluster" style={{ justifyContent: "space-between" }}>
        <Badge tone="accent">{scenario.tur || "Senaryo"}</Badge>
        {editable && (
          <Badge tone={scenario.paylasim_acik ? "success" : "neutral"}>
            {scenario.paylasim_acik ? "Yayında" : "Özel"}
          </Badge>
        )}
        <span className="small muted">{formatDate(scenario.created_at)}</span>
      </div>
      <a href={`/senaryo/${scenario.id}`}>
        <h2>{scenario.baslik || "İsimsiz senaryo"}</h2>
      </a>
      <p className="social-card-summary social-clamp">
        {scenario.tagline || scenario.ozet || "Yeni bir hikâyenin başlangıcı."}
      </p>
      {!!scenario.etiketler?.length && (
        <div className="social-tags">
          {scenario.etiketler.slice(0, 6).map((tag) => (
            <a
              key={tag}
              href={`/hashtag/${encodeURIComponent(normalizeTag(tag))}`}
            >
              #{tag}
            </a>
          ))}
        </div>
      )}
      <a
        className="social-author"
        href={`/@${encodeURIComponent(scenario.author?.username || "")}`}
      >
        <Avatar profile={scenario.author} size={30} />
        <strong>
          {scenario.author?.nickname || scenario.author?.username || "Yazar"}
        </strong>
      </a>
      <Notice error={error} />
      <div className="social-card-foot">
        <div className="social-card-actions">
          <Button
            variant="ghost"
            size="sm"
            aria-pressed={liked}
            loading={busy === "like"}
            disabled={!!busy}
            onClick={() => action("like")}
          >
            {liked ? "♥" : "♡"} {count}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-pressed={saved}
            loading={busy === "save"}
            disabled={!!busy}
            onClick={() => action("save")}
          >
            {saved ? "Kaydedildi" : "Kaydet"}
          </Button>
          <a
            className="btn btn-ghost btn-sm"
            href={`/senaryo/${scenario.id}#yorumlar`}
          >
            {scenario.yorum_sayisi || 0} yorum
          </a>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setReportOpen(true)}
          aria-label="İçeriği bildir"
        >
          Bildir
        </Button>
      </div>
      {editable && (
        <div className="cluster">
          <a
            className="btn btn-secondary btn-sm"
            href={`/uret?id=${scenario.id}`}
          >
            Düzenle
          </a>
          <Button
            size="sm"
            variant="secondary"
            disabled={!!busy}
            loading={busy === "visibility"}
            onClick={() => action("visibility")}
          >
            {scenario.paylasim_acik ? "Yayından kaldır" : "Yayınla"}
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setDeleteOpen(true)}
          >
            Sil
          </Button>
        </div>
      )}
      <Dialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title="İçeriği bildir"
      >
        <div className="social-dialog">
          <p className="muted">Gerekçen inceleme için kaydedilir.</p>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={2000}
            aria-label="Bildirim gerekçesi"
          />
          <Notice error={error} />
          <Button onClick={() => action("report")} loading={busy === "report"}>
            Bildirimi gönder
          </Button>
        </div>
      </Dialog>
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Senaryoyu sil"
      >
        <div className="social-dialog">
          <p>“{scenario.baslik}” ve bağlı sürümleri kalıcı olarak silinecek.</p>
          <Notice error={error} />
          <Button
            variant="danger"
            loading={busy === "delete"}
            onClick={() => action("delete")}
          >
            Kalıcı olarak sil
          </Button>
        </div>
      </Dialog>
    </Card>
  );
}
