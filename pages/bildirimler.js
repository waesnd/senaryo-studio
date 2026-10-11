import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Card } from "../components/ui";
import SocialLayout, {
  AuthRequired,
  Avatar,
  Empty,
  LoadMore,
  Notice,
} from "../components/social/Layout";
import { useAuth } from "../lib/useAuth";
import {
  applyCursor,
  client,
  errorMessage,
  formatDate,
  profilesByIds,
  rpc,
  unwrap,
} from "../lib/social-client";
const SIZE = 30;
const labels = {
  takip: "seni takip etmeye başladı.",
  begeni: "senaryonu beğendi.",
  yorum: "senaryona geri bildirim yazdı.",
  challenge: "yazı çalışman hakkında bir güncelleme var.",
};
export default function Notifications() {
  const { user, setOkunmayanBildirim } = useAuth();
  const [rows, setRows] = useState([]),
    [cursor, setCursor] = useState(null),
    [next, setNext] = useState(null),
    [more, setMore] = useState(false),
    [loading, setLoading] = useState(false),
    [allBusy, setAllBusy] = useState(false),
    [error, setError] = useState(""),
    [refresh, setRefresh] = useState(0);
  const epoch = useRef(0);
  const viewed = useRef(new Set());
  useEffect(() => {
    setRows([]);
    setCursor(null);
    viewed.current.clear();
  }, [user]);
  useEffect(() => {
    if (!user) return;
    const token = ++epoch.current,
      controller = new AbortController();
    setLoading(true);
    setError("");
    (async () => {
      let request = client()
        .from("bildirimler")
        .select("id,gonderen_id,tip,senaryo_id,icerik,okundu,created_at")
        .eq("alici_id", user.id)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(SIZE + 1);
      request = applyCursor(request, cursor);
      const data = unwrap(await request.abortSignal(controller.signal));
      const batch = data.slice(0, SIZE);
      const authors = await profilesByIds(batch.map((row) => row.gonderen_id));
      if (token === epoch.current) {
        setRows((old) =>
          cursor
            ? [
                ...old.filter((x) => !batch.some((y) => x.id === y.id)),
                ...batch.map((row) => ({
                  ...row,
                  author: authors[row.gonderen_id],
                })),
              ]
            : batch.map((row) => ({
                ...row,
                author: authors[row.gonderen_id],
              })),
        );
        setMore(data.length > SIZE);
        setNext(
          batch.length
            ? { id: batch.at(-1).id, created_at: batch.at(-1).created_at }
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
      controller.abort();
      epoch.current = token + 1;
    };
  }, [user, cursor, refresh]);
  useEffect(() => {
    if (!user) return;
    const channel = client()
      .channel("notifications:" + user.id)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bildirimler",
          filter: "alici_id=eq." + user.id,
        },
        () => {
          setCursor(null);
          setRefresh((n) => n + 1);
        },
      )
      .subscribe();
    return () => {
      client().removeChannel(channel);
    };
  }, [user]);
  const markVisible = useCallback(
    async (id) => {
      if (viewed.current.has(id)) return;
      viewed.current.add(id);
      try {
        await rpc("mark_notifications_read", { p_ids: [id] });
        setRows((old) =>
          old.map((row) => (row.id === id ? { ...row, okundu: true } : row)),
        );
        setOkunmayanBildirim?.((n) => Math.max(0, n - 1));
      } catch (e) {
        viewed.current.delete(id);
        setError(errorMessage(e));
      }
    },
    [setOkunmayanBildirim],
  );
  useEffect(() => {
    if (!user || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-notification-id"),
              row = rows.find((x) => String(x.id) === id);
            if (row && !row.okundu) markVisible(row.id);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 },
    );
    document
      .querySelectorAll("[data-notification-id]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [rows, user, markVisible]);
  async function markAll() {
    setAllBusy(true);
    setError("");
    try {
      let iterations = 0;
      while (iterations++ < 100) {
        const batch = unwrap(
          await client()
            .from("bildirimler")
            .select("id")
            .eq("alici_id", user.id)
            .eq("okundu", false)
            .order("id")
            .limit(100),
        );
        if (!batch.length) break;
        await rpc("mark_notifications_read", { p_ids: batch.map((x) => x.id) });
      }
      if (iterations >= 100)
        throw new Error(
          "İlk 10.000 bildirim okundu. Kalanlar için işlemi yeniden başlat.",
        );
      setRows((old) => old.map((row) => ({ ...row, okundu: true })));
      setOkunmayanBildirim?.(0);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setAllBusy(false);
    }
  }
  return (
    <SocialLayout
      title="Bildirimlerin."
      subtitle="Yazarlardan, eserlerinden ve topluluktan haberler."
      actions={
        user ? (
          <Button variant="secondary" loading={allBusy} onClick={markAll}>
            Tümünü okundu işaretle
          </Button>
        ) : null
      }
    >
      <AuthRequired>
        <Notice error={error} />
        {loading && !rows.length ? (
          <p role="status" className="muted">
            Bildirimler yükleniyor…
          </p>
        ) : !rows.length && !error ? (
          <Empty
            title="Henüz bildirim yok."
            description="Eserlerin ve takip ettiğin yazarlarla ilgili gelişmeler burada görünür."
          />
        ) : null}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {rows.map((row) => (
            <a
              data-notification-id={row.id}
              className={"social-notification" + (!row.okundu ? " unread" : "")}
              key={row.id}
              href={
                row.senaryo_id
                  ? `/senaryo/${row.senaryo_id}`
                  : row.author?.username
                    ? `/@${row.author.username}`
                    : "/topluluk"
              }
            >
              <Avatar profile={row.author} />
              <div>
                <strong>
                  {row.author?.nickname ||
                    row.author?.username ||
                    "Senaryo Studio"}
                </strong>
                <p>
                  {row.icerik || labels[row.tip] || "Yeni bir gelişme var."}
                </p>
                <time dateTime={row.created_at}>
                  {formatDate(row.created_at)}
                </time>
              </div>
            </a>
          ))}
        </Card>
        <LoadMore
          more={more}
          loading={loading}
          onClick={() => setCursor(next)}
        />
      </AuthRequired>
    </SocialLayout>
  );
}
