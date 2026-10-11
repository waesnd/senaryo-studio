import { useEffect, useRef, useState } from "react";
import { Badge, Button, Card, Select } from "../components/ui";
import SocialLayout, {
  Empty,
  Notice,
  ProfileCard,
} from "../components/social/Layout";
import { useAuth } from "../lib/useAuth";
import {
  client,
  errorMessage,
  formatDate,
  PROFILE_FIELDS,
  rpc,
  unwrap,
} from "../lib/social-client";
export default function Community() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]),
    [writers, setWriters] = useState([]),
    [own, setOwn] = useState([]),
    [entries, setEntries] = useState({}),
    [selected, setSelected] = useState({}),
    [busy, setBusy] = useState(""),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  const epoch = useRef(0);
  useEffect(() => {
    const token = ++epoch.current;
    setLoading(true);
    setError("");
    setEntries({});
    setOwn([]);
    (async () => {
      const base = await Promise.all([
        client()
          .from("challengelar")
          .select("id,konu,aciklama,tip,tur,deadline,katilimci_sayisi")
          .eq("aktif", true)
          .order("olusturulma_tarihi", { ascending: false })
          .limit(30),
        client()
          .from("profiles")
          .select(PROFILE_FIELDS)
          .order("created_at", { ascending: false })
          .limit(12),
      ]);
      const values = base.map(unwrap);
      if (token === epoch.current) {
        setChallenges(values[0]);
        setWriters(values[1]);
      }
      if (user) {
        const results = await Promise.all([
          client()
            .from("senaryolar")
            .select("id,baslik")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false })
            .limit(100),
          client()
            .from("challenge_katilimlar")
            .select("id,challenge_id,senaryo_id,status,score,feedback")
            .eq("user_id", user.id),
        ]);
        const values = results.map(unwrap);
        if (token === epoch.current) {
          setOwn(values[0]);
          setEntries(
            Object.fromEntries(values[1].map((row) => [row.challenge_id, row])),
          );
        }
      }
    })()
      .catch((e) => {
        if (token === epoch.current) setError(errorMessage(e));
      })
      .finally(() => {
        if (token === epoch.current) setLoading(false);
      });
    return () => {
      epoch.current = token + 1;
    };
  }, [user]);
  async function submit(e, challenge) {
    e.preventDefault();
    if (!user) {
      setError("Yazı çalışmasına katılmak için giriş yapmalısın.");
      return;
    }
    const id = selected[challenge.id] || entries[challenge.id]?.senaryo_id;
    if (!id) {
      setError("Teslim etmek istediğin eseri seç.");
      return;
    }
    setBusy(String(challenge.id));
    setError("");
    setSuccess("");
    try {
      const row = await rpc("submit_challenge", {
        p_challenge_id: challenge.id,
        p_scenario_id: id,
      });
      setEntries((old) => ({ ...old, [challenge.id]: row }));
      setSuccess(
        "Eserin teslim edildi. Son tarihe kadar teslimini güncelleyebilirsin.",
      );
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy("");
    }
  }
  return (
    <SocialLayout
      title="Aynı masada, farklı hikâyeler."
      subtitle="Yazı çalışmalarına katıl, yeni yazarlarla tanış ve birlikte üret."
      actions={
        <a href="/kesfet" className="btn btn-secondary">
          Eserleri keşfet
        </a>
      }
    >
      <Notice error={error} success={success} />
      <div className="social-section-head">
        <h2>Yazı çalışmaları</h2>
        <span className="small muted">Brief → Yaz → Teslim et</span>
      </div>
      {loading ? (
        <p role="status" className="muted">
          Topluluk yükleniyor…
        </p>
      ) : !challenges.length && !error ? (
        <Empty
          title="Yeni brief'ler yakında."
          description="Aktif bir yazı çalışması olduğunda burada görünür."
        />
      ) : null}
      <div className="social-grid">
        {challenges.map((challenge) => {
          const closed =
              challenge.deadline && Date.parse(challenge.deadline) < Date.now(),
            entry = entries[challenge.id];
          return (
            <Card className="social-challenge" key={challenge.id}>
              <div className="cluster">
                <Badge tone="accent">{challenge.tur || "Serbest tema"}</Badge>
                <Badge tone={closed ? "neutral" : "success"}>
                  {closed ? "Teslim süresi doldu" : "Katılıma açık"}
                </Badge>
              </div>
              <h2>{challenge.konu}</h2>
              <p>
                {challenge.aciklama ||
                  "Bu tema etrafında özgün bir hikâye yaz."}
              </p>
              <div className="cluster small muted">
                <span>
                  {challenge.deadline
                    ? "Son teslim: " + formatDate(challenge.deadline)
                    : "Son tarih belirlenmedi"}
                </span>
                <span>· {challenge.katilimci_sayisi || 0} teslim</span>
              </div>
              {entry && (
                <div className="social-note">
                  <strong>
                    {entry.status === "reviewed"
                      ? "Değerlendirildi"
                      : "Eserin teslim edildi"}
                  </strong>
                  {entry.score !== null && entry.score !== undefined && (
                    <p>Puan: {entry.score}/100</p>
                  )}
                  {entry.feedback && <p>{entry.feedback}</p>}
                </div>
              )}
              <div className="cluster">
                <a
                  className="btn btn-secondary"
                  href={`/uret?challenge=${challenge.id}`}
                >
                  Brief ile yaz
                </a>
                {!user && (
                  <a className="btn btn-primary" href="/giris">
                    Katılmak için giriş yap
                  </a>
                )}
              </div>
              {user && !closed && (
                <form onSubmit={(e) => submit(e, challenge)}>
                  <Select
                    value={selected[challenge.id] || entry?.senaryo_id || ""}
                    onChange={(e) =>
                      setSelected({
                        ...selected,
                        [challenge.id]: e.target.value,
                      })
                    }
                    aria-label="Teslim edilecek eser"
                  >
                    <option value="">Kitaplığından eser seç</option>
                    {own.map((row) => (
                      <option key={row.id} value={row.id}>
                        {row.baslik || "İsimsiz senaryo"}
                      </option>
                    ))}
                  </Select>
                  <Button
                    type="submit"
                    loading={busy === String(challenge.id)}
                    disabled={!!busy}
                  >
                    {entry ? "Teslimi güncelle" : "Eseri teslim et"}
                  </Button>
                </form>
              )}
            </Card>
          );
        })}
      </div>
      <div className="social-section-head">
        <h2>Yeni yazarlarla tanış</h2>
        <a href="/arama" className="small muted">
          Tüm yazarlarda ara ↗
        </a>
      </div>
      <div className="social-grid">
        {writers.map((writer) => (
          <ProfileCard key={writer.id} profile={writer} />
        ))}
      </div>
    </SocialLayout>
  );
}
