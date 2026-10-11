import { useEffect, useRef, useState } from "react";
import { Button } from "../components/ui";
import SocialLayout, {
  AuthRequired,
  Empty,
  LoadMore,
  Notice,
} from "../components/social/Layout";
import Feed from "../components/social/Feed";
import ScenarioCard from "../components/social/ScenarioCard";
import { useAuth } from "../lib/useAuth";
import {
  attachAuthors,
  applyCursor,
  client,
  errorMessage,
  PAGE_SIZE,
  SCENARIO_FIELDS,
  unwrap,
} from "../lib/social-client";
export default function Library() {
  const { user } = useAuth();
  const userId = user?.id;
  const [tab, setTab] = useState("own"),
    [rows, setRows] = useState([]),
    [cursor, setCursor] = useState(null),
    [nextCursor, setNextCursor] = useState(null),
    [more, setMore] = useState(false),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  const epoch = useRef(0);
  useEffect(() => {
    setRows([]);
    setCursor(null);
    setError("");
  }, [user?.id, tab]);
  useEffect(() => {
    if (!userId || tab !== "saved") return;
    const token = ++epoch.current;
    setLoading(true);
    setError("");
    (async () => {
      let request = client()
        .from("kaydedilenler")
        .select("id,senaryo_id,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(PAGE_SIZE + 1);
      request = applyCursor(request, cursor);
      const bookmarks = unwrap(await request),
        batch = bookmarks.slice(0, PAGE_SIZE);
      const ids = batch.map((row) => row.senaryo_id).filter(Boolean);
      const data = ids.length
        ? unwrap(
            await client()
              .from("senaryolar")
              .select(SCENARIO_FIELDS)
              .in("id", ids),
          )
        : [];
      const authored = await attachAuthors(data);
      const ordered = ids
        .map((id) => authored.find((row) => row.id === id))
        .filter(Boolean);
      if (token === epoch.current) {
        setRows((old) =>
          cursor
            ? [
                ...old.filter(
                  (row) => !ordered.some((next) => row.id === next.id),
                ),
                ...ordered,
              ]
            : ordered,
        );
        setMore(bookmarks.length > PAGE_SIZE);
        setNextCursor(
          batch.length
            ? { created_at: batch.at(-1).created_at, id: batch.at(-1).id }
            : null,
        );
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
  }, [userId, tab, cursor]);
  return (
    <SocialLayout
      title="Kitaplığın."
      subtitle="Taslakların, yayınladıkların ve yeniden okumak istediklerin."
      actions={
        <a href="/uret" className="btn btn-primary">
          Yeni senaryo ↗
        </a>
      }
    >
      <AuthRequired>
        <div className="social-filter">
          <Button
            variant={tab === "own" ? "primary" : "ghost"}
            onClick={() => setTab("own")}
          >
            Eserlerim
          </Button>
          <Button
            variant={tab === "saved" ? "primary" : "ghost"}
            onClick={() => setTab("saved")}
          >
            Kaydettiklerim
          </Button>
        </div>
        {tab === "own" ? (
          user && <Feed ownerId={user.id} editable />
        ) : (
          <>
            <Notice error={error} />
            {loading && !rows.length ? (
              <p role="status" className="muted">
                Kitaplığın yükleniyor…
              </p>
            ) : !rows.length && !error ? (
              <Empty
                title="Okuma listen henüz boş."
                description="Keşfettiğin senaryoları kaydederek burada toplayabilirsin."
                href="/kesfet"
                action="Hikâyeleri keşfet"
              />
            ) : null}
            <div className="social-grid">
              {rows.map((row) => (
                <ScenarioCard
                  key={row.id}
                  scenario={row}
                  onSavedChange={(saved) => {
                    if (!saved)
                      setRows((old) =>
                        old.filter((item) => item.id !== row.id),
                      );
                  }}
                />
              ))}
            </div>
            <LoadMore
              more={more}
              loading={loading}
              onClick={() => setCursor(nextCursor)}
            />
          </>
        )}
      </AuthRequired>
    </SocialLayout>
  );
}
