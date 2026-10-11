import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Button, Input } from "../components/ui";
import SocialLayout, {
  Notice,
  ProfileCard,
  LoadMore,
  Empty,
} from "../components/social/Layout";
import Feed from "../components/social/Feed";
import {
  client,
  errorMessage,
  PAGE_SIZE,
  PROFILE_FIELDS,
  searchPattern,
  unwrap,
} from "../lib/social-client";
export default function Search() {
  const router = useRouter();
  const [draft, setDraft] = useState(""),
    [query, setQuery] = useState(""),
    [tab, setTab] = useState("stories"),
    [profiles, setProfiles] = useState([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    [page, setPage] = useState(0),
    [more, setMore] = useState(false);
  const epoch = useRef(0);
  useEffect(() => {
    if (router.isReady) {
      const q =
        typeof router.query.q === "string" ? router.query.q.slice(0, 120) : "";
      setDraft(q);
      setQuery(q);
      setPage(0);
    }
  }, [router.isReady, router.query.q]);
  useEffect(() => {
    if (tab !== "writers") return;
    const token = ++epoch.current,
      controller = new AbortController();
    setLoading(true);
    setError("");
    (async () => {
      let request = client()
        .from("profiles")
        .select(PROFILE_FIELDS, { count: "exact" })
        .order("username")
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
        .abortSignal(controller.signal);
      if (query.trim())
        request = request.ilike("username", searchPattern(query));
      return request;
    })()
      .then((result) => {
        const rows = unwrap(result);
        if (token === epoch.current) {
          setProfiles((old) => (page ? [...old, ...rows] : rows));
          setMore((page + 1) * PAGE_SIZE < (result.count || 0));
        }
      })
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
  }, [query, tab, page]);
  function submit(e) {
    e.preventDefault();
    setPage(0);
    setProfiles([]);
    setQuery(draft.trim());
    router.replace(
      { pathname: "/arama", query: draft.trim() ? { q: draft.trim() } : {} },
      undefined,
      { shallow: true },
    );
  }
  return (
    <SocialLayout
      title="Aradığın hikâye burada."
      subtitle="Senaryo başlıklarında ve yazar kullanıcı adlarında ara."
    >
      <div className="social-filter">
        <form onSubmit={submit}>
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Bir başlık veya kullanıcı adı…"
            maxLength={120}
            aria-label="Arama"
          />
          <Button type="submit">Ara</Button>
        </form>
        <Button
          variant={tab === "stories" ? "primary" : "ghost"}
          onClick={() => {
            setTab("stories");
            setPage(0);
          }}
        >
          Senaryolar
        </Button>
        <Button
          variant={tab === "writers" ? "primary" : "ghost"}
          onClick={() => {
            setTab("writers");
            setPage(0);
          }}
        >
          Yazarlar
        </Button>
      </div>
      {tab === "stories" ? (
        <Feed initialQuery={query} />
      ) : (
        <>
          <Notice error={error} />
          {loading && !profiles.length ? (
            <p role="status" className="muted">
              Yazarlar aranıyor…
            </p>
          ) : !profiles.length && !error ? (
            <Empty
              title="Yazar bulunamadı."
              description="Farklı bir kullanıcı adı deneyebilirsin."
            />
          ) : null}
          <div className="social-grid">
            {profiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
          <LoadMore
            more={more}
            loading={loading}
            onClick={() => setPage((p) => p + 1)}
          />
        </>
      )}
    </SocialLayout>
  );
}
