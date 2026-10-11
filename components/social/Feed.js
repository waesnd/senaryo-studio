import { useEffect, useRef, useState } from "react";
import { Button, Input } from "../ui";
import { useAuth } from "../../lib/useAuth";
import {
  client,
  errorMessage,
  loadScenarios,
  unwrap,
} from "../../lib/social-client";
import ScenarioCard from "./ScenarioCard";
import { Empty, LoadMore, Notice } from "./Layout";
export default function Feed({
  ownerId,
  tag,
  initialQuery = "",
  allowFollowing = false,
  editable = false,
}) {
  const { user } = useAuth();
  const userId = user?.id;
  const [query, setQuery] = useState(initialQuery),
    [draft, setDraft] = useState(initialQuery),
    [mode, setMode] = useState("all"),
    [rows, setRows] = useState([]),
    [cursor, setCursor] = useState(null),
    [nextCursor, setNextCursor] = useState(null),
    [more, setMore] = useState(false),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [refresh, setRefresh] = useState(0);
  const epoch = useRef(0);
  useEffect(() => {
    setQuery(initialQuery);
    setDraft(initialQuery);
  }, [initialQuery]);
  useEffect(() => {
    setRows([]);
    setCursor(null);
  }, [query, tag, ownerId, mode, user?.id]);
  useEffect(() => {
    const token = ++epoch.current,
      controller = new AbortController();
    setLoading(true);
    setError("");
    (async () => {
      let followingIds;
      if (mode === "following" && userId) {
        followingIds = (
          unwrap(
            await client()
              .from("takipler")
              .select("takip_edilen")
              .eq("takip_eden", userId),
          ) || []
        ).map((x) => x.takip_edilen);
      }
      const result = await loadScenarios({
        cursor,
        ownerId,
        publicOnly: !editable,
        tag,
        query,
        followingIds,
        signal: controller.signal,
      });
      if (token === epoch.current) {
        setRows((old) =>
          cursor
            ? [
                ...old.filter((x) => !result.rows.some((y) => x.id === y.id)),
                ...result.rows,
              ]
            : result.rows,
        );
        setMore(result.more);
        setNextCursor(result.cursor);
      }
    })()
      .catch((e) => {
        if (token === epoch.current) setError(errorMessage(e));
      })
      .finally(() => {
        if (token === epoch.current) setLoading(false);
      });
    return () => {
      controller.abort();
      epoch.current = token + 1;
    };
  }, [cursor, query, ownerId, tag, mode, userId, refresh, editable]);
  return (
    <div>
      <div className="social-filter">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setCursor(null);
            setQuery(draft);
          }}
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={120}
            placeholder="Senaryo başlığı ara…"
            aria-label="Senaryo başlığı"
          />
          <Button variant="secondary" type="submit">
            Ara
          </Button>
        </form>
        {allowFollowing && user && (
          <>
            <Button
              variant={mode === "all" ? "primary" : "ghost"}
              onClick={() => setMode("all")}
            >
              Herkes
            </Button>
            <Button
              variant={mode === "following" ? "primary" : "ghost"}
              onClick={() => setMode("following")}
            >
              Takip ettiklerim
            </Button>
          </>
        )}
      </div>
      <Notice error={error} />
      {loading && !rows.length ? (
        <p role="status" className="muted">
          Senaryolar yükleniyor…
        </p>
      ) : !rows.length && !error ? (
        <Empty
          title="Burada yeni hikâyelere yer var."
          description={
            mode === "following"
              ? "Yazarları takip ederek kendi okuma akışını oluştur."
              : "İlk senaryonu oluştur ya da farklı bir arama dene."
          }
          href={ownerId ? "/uret" : "/kesfet"}
          action={ownerId ? "Yazmaya başla" : "Keşfet"}
        />
      ) : null}
      <div className="social-grid">
        {rows.map((s) => (
          <ScenarioCard
            key={s.id}
            scenario={s}
            editable={editable}
            onChanged={() => {
              setCursor(null);
              setRefresh((n) => n + 1);
            }}
          />
        ))}
      </div>
      <LoadMore
        more={more}
        loading={loading}
        onClick={() => setCursor(nextCursor)}
      />
    </div>
  );
}
