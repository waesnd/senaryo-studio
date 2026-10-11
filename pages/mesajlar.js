import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Button, Input, Textarea, Dialog } from "../components/ui";
import SocialLayout, {
  AuthRequired,
  Avatar,
  Empty,
  LoadMore,
  Notice,
} from "../components/social/Layout";
import MessageMedia from "../components/social/MessageMedia";
import { useAuth } from "../lib/useAuth";
import {
  applyCursor,
  client,
  errorMessage,
  isUuid,
  MESSAGE_FIELDS,
  PROFILE_FIELDS,
  profilesByIds,
  rpc,
  searchPattern,
  unwrap,
  uploadMedia,
} from "../lib/social-client";
const HISTORY_SIZE = 40,
  INBOX_SIZE = 25,
  MAX_RECORDING = 90;
const combine = (rows) =>
  [...new Map(rows.map((row) => [String(row.id), row])).values()].sort(
    (a, b) =>
      Date.parse(a.created_at) - Date.parse(b.created_at) ||
      Number(a.id) - Number(b.id),
  );
function time(value) {
  return new Date(value).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
function conversationFilter(owner, peer) {
  if (!isUuid(owner) || !isUuid(peer))
    throw new Error("Sohbet kimliği geçersiz.");
  return `and(gonderen.eq.${owner},alan.eq.${peer}),and(gonderen.eq.${peer},alan.eq.${owner})`;
}
export default function Messages() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id;
  const [inbox, setInbox] = useState([]),
    [inboxCursor, setInboxCursor] = useState(null),
    [inboxMore, setInboxMore] = useState(false),
    [inboxLoading, setInboxLoading] = useState(false),
    [peer, setPeer] = useState(null),
    [messages, setMessages] = useState([]),
    [historyMore, setHistoryMore] = useState(false),
    [historyLoading, setHistoryLoading] = useState(false),
    [text, setText] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [search, setSearch] = useState(""),
    [people, setPeople] = useState([]),
    [searching, setSearching] = useState(false),
    [note, setNote] = useState(""),
    [noteOpen, setNoteOpen] = useState(false),
    [noteBusy, setNoteBusy] = useState(false),
    [noteSuccess, setNoteSuccess] = useState(""),
    [blocked, setBlocked] = useState(false),
    [attachment, setAttachment] = useState(null),
    [attachmentUrl, setAttachmentUrl] = useState(""),
    [recording, setRecording] = useState(false),
    [seconds, setSeconds] = useState(0);
  const accountEpoch = useRef(0),
    historyEpoch = useRef(0),
    searchEpoch = useRef(0),
    peerRef = useRef(null),
    ownerRef = useRef(null),
    historyAbort = useRef(null),
    recorderRef = useRef(null),
    streamRef = useRef(null),
    recordTimer = useRef(null),
    recordChunks = useRef([]),
    discardRecording = useRef(false),
    threadBottom = useRef(null),
    attachmentInput = useRef(null),
    inboxNext = useRef(null);
  peerRef.current = peer;
  ownerRef.current = user?.id;
  const cleanupRecording = useCallback((discard = true) => {
    discardRecording.current = discard;
    if (recordTimer.current) {
      clearInterval(recordTimer.current);
      recordTimer.current = null;
    }
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setRecording(false);
  }, []);
  useEffect(() => {
    accountEpoch.current++;
    historyEpoch.current++;
    searchEpoch.current++;
    historyAbort.current?.abort();
    setInbox([]);
    setPeer(null);
    setMessages([]);
    setText("");
    setPeople([]);
    setNote("");
    setNoteSuccess("");
    setNoteOpen(false);
    setAttachment(null);
    setError("");
    setBlocked(false);
    setInboxCursor(null);
    cleanupRecording(true);
    return () => cleanupRecording(true);
  }, [user?.id, cleanupRecording]);
  useEffect(() => {
    if (!attachment) {
      setAttachmentUrl("");
      return;
    }
    const url = URL.createObjectURL(attachment);
    setAttachmentUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [attachment]);
  const loadInbox = useCallback(
    async (cursor = null) => {
      if (!userId) return;
      const owner = userId,
        epoch = accountEpoch.current;
      setInboxLoading(true);
      try {
        const data =
          unwrap(
            await client().rpc("list_conversations", {
              p_before_at: cursor?.created_at || null,
              p_before_id: cursor?.id || null,
              p_limit: INBOX_SIZE + 1,
            }),
          ) || [];
        const batch = data.slice(0, INBOX_SIZE),
          profiles = await profilesByIds(batch.map((row) => row.peer_id));
        if (epoch !== accountEpoch.current || owner !== ownerRef.current)
          return;
        const rows = batch.map((row) => ({
          ...row,
          profile: profiles[row.peer_id],
        }));
        setInbox((old) =>
          cursor
            ? [
                ...old.filter(
                  (x) => !rows.some((y) => x.peer_id === y.peer_id),
                ),
                ...rows,
              ]
            : rows,
        );
        setInboxMore(data.length > INBOX_SIZE);
        inboxNext.current = batch.length
          ? { created_at: batch.at(-1).created_at, id: batch.at(-1).last_id }
          : null;
      } catch (e) {
        if (epoch === accountEpoch.current) setError(errorMessage(e));
      } finally {
        if (epoch === accountEpoch.current) setInboxLoading(false);
      }
    },
    [userId],
  );
  useEffect(() => {
    loadInbox(inboxCursor);
  }, [loadInbox, inboxCursor]);
  const markReceived = useCallback(async (rows, owner) => {
    const ids = rows
      .filter((row) => row.alan === owner && !row.okundu)
      .map((row) => row.id);
    if (!ids.length) return;
    unwrap(
      await client()
        .from("mesajlar")
        .update({ okundu: true })
        .eq("alan", owner)
        .in("id", ids),
    );
  }, []);
  useEffect(() => {
    if (!userId) return;
    const owner = userId;
    const onInsert = async (payload) => {
      if (owner !== ownerRef.current) return;
      loadInbox(null);
      const row = payload.new,
        active = peerRef.current;
      if (active && (row.gonderen === active.id || row.alan === active.id)) {
        setMessages((old) => combine([...old, row]));
        try {
          await markReceived([row], owner);
        } catch (e) {
          if (owner === ownerRef.current) setError(errorMessage(e));
        }
      }
    };
    const onUpdate = (payload) => {
      if (owner !== ownerRef.current) return;
      setMessages((old) =>
        old.map((row) =>
          row.id === payload.new.id ? { ...row, ...payload.new } : row,
        ),
      );
      loadInbox(null);
    };
    const channel = client()
      .channel("inbox:" + owner)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mesajlar",
          filter: "alan=eq." + owner,
        },
        onInsert,
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mesajlar",
          filter: "gonderen=eq." + owner,
        },
        onInsert,
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "mesajlar",
          filter: "gonderen=eq." + owner,
        },
        onUpdate,
      )
      .subscribe();
    return () => {
      client().removeChannel(channel);
    };
  }, [userId, loadInbox, markReceived]);
  useEffect(() => {
    if (!userId || !router.isReady) return;
    const chat = typeof router.query.chat === "string" ? router.query.chat : "";
    const dm = typeof router.query.dm === "string" ? router.query.dm : "";
    if (!chat && !dm) {
      setPeer(null);
      return;
    }
    if (chat && !isUuid(chat)) {
      setError("Sohbet adresi geçersiz.");
      return;
    }
    let active = true;
    (async () => {
      let request = client().from("profiles").select(PROFILE_FIELDS);
      request = chat
        ? request.eq("id", chat)
        : request.eq("username", dm.slice(0, 30));
      const result = unwrap(await request.maybeSingle());
      if (active) {
        if (!result) throw new Error("Yazar bulunamadı.");
        if (result.id === userId)
          throw new Error("Kendine mesaj gönderemezsin.");
        setPeer(result);
      }
    })().catch((e) => {
      if (active) setError(errorMessage(e));
    });
    return () => {
      active = false;
    };
  }, [userId, router.isReady, router.query.chat, router.query.dm]);
  const loadHistory = useCallback(
    async (older = false) => {
      const activePeer = peerRef.current,
        owner = user?.id;
      if (!activePeer || !owner) return;
      const epoch = historyEpoch.current;
      setHistoryLoading(true);
      if (!older) {
        historyAbort.current?.abort();
        historyAbort.current = new AbortController();
      }
      const controller = historyAbort.current;
      try {
        let request = client()
          .from("mesajlar")
          .select(MESSAGE_FIELDS)
          .or(conversationFilter(owner, activePeer.id))
          .order("created_at", { ascending: false })
          .order("id", { ascending: false })
          .limit(HISTORY_SIZE + 1);
        if (older && messages[0])
          request = applyCursor(request, {
            created_at: messages[0].created_at,
            id: messages[0].id,
          });
        const data = unwrap(await request.abortSignal(controller.signal));
        if (
          epoch !== historyEpoch.current ||
          peerRef.current?.id !== activePeer.id ||
          ownerRef.current !== owner
        )
          return;
        const batch = data.slice(0, HISTORY_SIZE);
        setMessages((old) =>
          combine(older ? [...batch, ...old] : [...batch, ...old]),
        );
        setHistoryMore(data.length > HISTORY_SIZE);
        await markReceived(batch, owner);
        loadInbox(null);
      } catch (e) {
        if (epoch === historyEpoch.current) setError(errorMessage(e));
      } finally {
        if (epoch === historyEpoch.current) setHistoryLoading(false);
      }
    },
    [user?.id, messages, markReceived, loadInbox],
  );
  const loadHistoryRef = useRef(loadHistory);
  loadHistoryRef.current = loadHistory;
  useEffect(() => {
    historyEpoch.current++;
    historyAbort.current?.abort();
    setMessages([]);
    setText("");
    setNote("");
    setNoteOpen(false);
    setNoteSuccess("");
    setAttachment(null);
    setBlocked(false);
    setError("");
    cleanupRecording(true);
    if (!peer || !userId) return;
    const epoch = historyEpoch.current,
      owner = userId;
    loadHistoryRef.current(false);
    (async () => {
      const results = await Promise.all([
        client()
          .from("ozel_notlar")
          .select("metin")
          .eq("user_id", owner)
          .eq("profile_id", peer.id)
          .maybeSingle(),
        client()
          .from("engellemeler")
          .select("id")
          .eq("engelleyen", owner)
          .eq("engellenen", peer.id)
          .maybeSingle(),
      ]);
      const values = results.map(unwrap);
      if (epoch === historyEpoch.current) {
        setNote(values[0]?.metin || "");
        setBlocked(!!values[1]);
      }
    })().catch((e) => {
      if (epoch === historyEpoch.current) setError(errorMessage(e));
    });
    return () => {
      historyEpoch.current = epoch + 1;
      historyAbort.current?.abort();
    };
  }, [peer, userId, cleanupRecording]);
  const latestMessageId = messages.at(-1)?.id;
  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      threadBottom.current?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      }),
    );
    return () => cancelAnimationFrame(frame);
  }, [latestMessageId]);
  useEffect(() => {
    const token = ++searchEpoch.current;
    if (!userId || search.trim().length < 2) {
      setPeople([]);
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      setSearching(true);
      (async () =>
        unwrap(
          await client()
            .from("profiles")
            .select(PROFILE_FIELDS)
            .ilike("username", searchPattern(search))
            .neq("id", userId)
            .order("username")
            .limit(8)
            .abortSignal(controller.signal),
        ))()
        .then((data) => {
          if (token === searchEpoch.current) setPeople(data || []);
        })
        .catch((e) => {
          if (token === searchEpoch.current) setError(errorMessage(e));
        })
        .finally(() => {
          if (token === searchEpoch.current) setSearching(false);
        });
    }, 250);
    return () => {
      clearTimeout(timeout);
      controller.abort();
      searchEpoch.current = token + 1;
    };
  }, [search, userId]);
  async function openChat(profile) {
    cleanupRecording(true);
    setSearch("");
    setPeople([]);
    await router.replace(
      { pathname: "/mesajlar", query: { chat: profile.id } },
      undefined,
      { shallow: true, scroll: false },
    );
  }
  async function send(e) {
    e?.preventDefault();
    const active = peerRef.current,
      owner = user?.id,
      content = text.trim(),
      file = attachment;
    if (!active || !owner || (!content && !file) || busy || recording) return;
    setBusy(true);
    setError("");
    try {
      if (content.length > 10000)
        throw new Error("Mesaj en fazla 10.000 karakter olabilir.");
      let media = {};
      if (file) {
        const result = await uploadMedia(file, "dm", active.id);
        media = file.type.startsWith("audio/")
          ? { ses_asset_id: result.asset.id }
          : { medya_asset_id: result.asset.id };
      }
      const row = unwrap(
        await client()
          .from("mesajlar")
          .insert({
            gonderen: owner,
            alan: active.id,
            icerik: content || null,
            ...media,
          })
          .select(MESSAGE_FIELDS)
          .single(),
      );
      if (owner === ownerRef.current && active.id === peerRef.current?.id) {
        setMessages((old) => combine([...old, row]));
        setText("");
        setAttachment(null);
      }
      if (owner === ownerRef.current) loadInbox(null);
    } catch (e) {
      if (owner === ownerRef.current) setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function saveNote() {
    const active = peerRef.current,
      owner = user?.id,
      value = note;
    if (!active || !owner) return;
    setNoteBusy(true);
    setNoteSuccess("");
    setError("");
    try {
      await rpc("save_private_note", {
        p_profile_id: active.id,
        p_text: value.slice(0, 5000),
      });
      if (owner === ownerRef.current && active.id === peerRef.current?.id)
        setNoteSuccess("Özel notun kaydedildi.");
    } catch (e) {
      if (owner === ownerRef.current) setError(errorMessage(e));
    } finally {
      setNoteBusy(false);
    }
  }
  async function startRecording() {
    if (recording || busy) return;
    setError("");
    setSeconds(0);
    setAttachment(null);
    try {
      if (
        !navigator.mediaDevices?.getUserMedia ||
        typeof MediaRecorder === "undefined"
      )
        throw new Error("Tarayıcın ses kaydını desteklemiyor.");
      const recordingOwner = ownerRef.current,
        recordingPeer = peerRef.current?.id,
        recordingEpoch = historyEpoch.current;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (
        recordingOwner !== ownerRef.current ||
        recordingPeer !== peerRef.current?.id ||
        recordingEpoch !== historyEpoch.current
      ) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      const type = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find(
        (t) => MediaRecorder.isTypeSupported(t),
      );
      const recorder = new MediaRecorder(
        stream,
        type ? { mimeType: type } : undefined,
      );
      streamRef.current = stream;
      recorderRef.current = recorder;
      recordChunks.current = [];
      discardRecording.current = false;
      recorder.ondataavailable = (e) => {
        if (e.data.size) recordChunks.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        if (recordTimer.current) {
          clearInterval(recordTimer.current);
          recordTimer.current = null;
        }
        setRecording(false);
        if (
          !discardRecording.current &&
          recordingOwner === ownerRef.current &&
          recordingPeer === peerRef.current?.id &&
          recordingEpoch === historyEpoch.current
        ) {
          const blob = new Blob(recordChunks.current, {
            type: recorder.mimeType,
          });
          if (blob.size > 3 * 1024 * 1024)
            setError("Ses kaydı 3 MB sınırını aşıyor.");
          else if (blob.size) setAttachment(blob);
        }
        recordChunks.current = [];
      };
      recorder.start();
      setRecording(true);
      const start = Date.now();
      recordTimer.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - start) / 1000);
        setSeconds(elapsed);
        if (elapsed >= MAX_RECORDING) cleanupRecording(false);
      }, 250);
    } catch (e) {
      cleanupRecording(true);
      setError(errorMessage(e));
    }
  }
  async function toggleBlock() {
    if (!peer) return;
    setError("");
    try {
      const result = await rpc("block_profile", { p_profile_id: peer.id });
      setBlocked(!!result.blocked);
      if (result.blocked) {
        setMessages([]);
        cleanupRecording(true);
        setAttachment(null);
      } else loadHistoryRef.current(false);
      loadInbox(null);
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  function attach(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 3 * 1024 * 1024
    ) {
      setError("En fazla 3 MB JPEG, PNG veya WebP görsel seç.");
      return;
    }
    setAttachment(file);
  }
  return (
    <SocialLayout
      title="Bir sohbetle başlar."
      subtitle="Yazarlarla fikir alışverişi yap. Özel notların hesabına bağlı kalır."
      wide
    >
      <AuthRequired>
        <Notice error={error} />
        <div className={"social-messages" + (peer ? " has-peer" : "")}>
          <aside className="social-inbox">
            <div className="social-inbox-head">
              <h2>Sohbetler</h2>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Yeni sohbet için yazar ara"
                placeholder="Bir yazar ara…"
                maxLength={30}
              />
            </div>
            {searching && (
              <p className="small muted" style={{ padding: 16 }}>
                Aranıyor…
              </p>
            )}
            {people.map((profile) => (
              <button
                className="social-chat-row"
                key={profile.id}
                onClick={() => openChat(profile)}
              >
                <Avatar profile={profile} />
                <div>
                  <strong>{profile.nickname || profile.username}</strong>
                  <p className="small muted">
                    @{profile.username} · Yeni sohbet
                  </p>
                </div>
              </button>
            ))}
            {inbox.map((row) => (
              <button
                className={
                  "social-chat-row" +
                  (peer?.id === row.peer_id ? " active" : "")
                }
                key={row.peer_id}
                onClick={() => openChat(row.profile || { id: row.peer_id })}
              >
                <Avatar profile={row.profile} />
                <div className="social-chat-preview">
                  <div
                    className="cluster"
                    style={{ justifyContent: "space-between" }}
                  >
                    <strong>
                      {row.profile?.nickname ||
                        row.profile?.username ||
                        "Yazar"}
                    </strong>
                    <time className="small muted">{time(row.created_at)}</time>
                  </div>
                  <p className="small muted">
                    {row.icerik ||
                      (row.ses_asset_id
                        ? "Ses kaydı"
                        : row.medya_asset_id
                          ? "Görsel"
                          : "Mesaj")}
                  </p>
                </div>
                {Number(row.unread_count) > 0 && (
                  <span className="social-unread">{row.unread_count}</span>
                )}
              </button>
            ))}
            {!inbox.length && !inboxLoading && !search && (
              <p className="muted small" style={{ padding: 20 }}>
                Yeni bir sohbet başlatmak için yazar ara.
              </p>
            )}
            <LoadMore
              more={inboxMore}
              loading={inboxLoading}
              onClick={() => setInboxCursor(inboxNext.current)}
            />
          </aside>
          <section className="social-thread">
            {!peer ? (
              <div className="social-chat-empty">
                <Empty
                  title="Hikâyeler konuşarak büyür."
                  description="Bir sohbet seç veya kullanıcı adıyla bir yazar ara."
                />
              </div>
            ) : (
              <>
                <header className="social-thread-header">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="social-back"
                    href="/mesajlar"
                  >
                    ←
                  </Button>
                  <a className="social-author" href={`/@${peer.username}`}>
                    <Avatar profile={peer} />
                    <div>
                      <strong>{peer.nickname || peer.username}</strong>
                      <p className="small muted">@{peer.username}</p>
                    </div>
                  </a>
                  <div className="cluster" style={{ marginLeft: "auto" }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setNoteOpen(true)}
                    >
                      Özel not
                    </Button>
                    <Button variant="ghost" size="sm" onClick={toggleBlock}>
                      {blocked ? "Engeli kaldır" : "Engelle"}
                    </Button>
                  </div>
                </header>
                <div
                  className="social-history"
                  aria-live="polite"
                  aria-relevant="additions"
                >
                  {blocked ? (
                    <p className="muted">
                      Bu yazarı engelledin. Mesajlaşmak için engeli kaldır.
                    </p>
                  ) : (
                    <>
                      <LoadMore
                        more={historyMore}
                        loading={historyLoading}
                        onClick={() => loadHistory(true)}
                      />
                      {historyLoading && !messages.length && (
                        <p role="status" className="muted">
                          Sohbet yükleniyor…
                        </p>
                      )}
                      {messages.map((row, index) => (
                        <div key={row.id}>
                          {(index === 0 ||
                            new Date(
                              messages[index - 1].created_at,
                            ).toDateString() !==
                              new Date(row.created_at).toDateString()) && (
                            <div className="social-message-date">
                              {new Date(row.created_at).toLocaleDateString(
                                "tr-TR",
                                { day: "numeric", month: "long" },
                              )}
                            </div>
                          )}
                          <article
                            className={
                              "social-message" +
                              (row.gonderen === user?.id ? " sent" : "")
                            }
                          >
                            <div className="social-bubble">
                              {row.medya_asset_id && (
                                <MessageMedia assetId={row.medya_asset_id} />
                              )}{" "}
                              {row.ses_asset_id && (
                                <MessageMedia
                                  assetId={row.ses_asset_id}
                                  audio
                                />
                              )}
                              {row.icerik && <p>{row.icerik}</p>}
                              <div className="social-message-meta">
                                <time dateTime={row.created_at}>
                                  {time(row.created_at)}
                                </time>
                                {row.gonderen === user?.id && (
                                  <span>
                                    {row.okundu ? "Okundu" : "Gönderildi"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </article>
                        </div>
                      ))}
                      <div ref={threadBottom} />
                    </>
                  )}
                </div>
                {!blocked && (
                  <form className="social-composer" onSubmit={send}>
                    {attachment && (
                      <div className="social-attachment">
                        {attachment.type.startsWith("audio/") ? (
                          <audio
                            controls
                            src={attachmentUrl}
                            style={{ maxWidth: "100%", height: 40 }}
                          />
                        ) : (
                          <img src={attachmentUrl} alt="Gönderilecek görsel" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busy}
                          onClick={() => setAttachment(null)}
                        >
                          Eki kaldır
                        </Button>
                      </div>
                    )}
                    {recording ? (
                      <div className="cluster">
                        <span role="status">
                          ● Kayıt sürüyor · {seconds} / {MAX_RECORDING} sn
                        </span>
                        <Button
                          variant="secondary"
                          onClick={() => cleanupRecording(false)}
                        >
                          Durdur ve dinle
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => cleanupRecording(true)}
                        >
                          İptal
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="social-composer-row">
                          <Textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            disabled={busy}
                            rows={2}
                            maxLength={10000}
                            aria-label="Mesajın"
                            placeholder="Bir fikir paylaş…"
                            onKeyDown={(e) => {
                              if (
                                e.key === "Enter" &&
                                (e.ctrlKey || e.metaKey)
                              ) {
                                e.preventDefault();
                                send();
                              }
                            }}
                          />
                          <Button
                            type="submit"
                            loading={busy}
                            disabled={!text.trim() && !attachment}
                          >
                            Gönder ↗
                          </Button>
                        </div>
                        <div className="cluster">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={busy}
                            onClick={() => attachmentInput.current?.click()}
                          >
                            Görsel ekle
                          </Button>
                          <input
                            ref={attachmentInput}
                            type="file"
                            hidden
                            accept="image/jpeg,image/png,image/webp"
                            disabled={busy}
                            onChange={attach}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={busy}
                            onClick={startRecording}
                          >
                            Ses kaydet
                          </Button>
                          <span className="small muted">
                            Ctrl + Enter · En fazla 3 MB ek
                          </span>
                        </div>
                      </>
                    )}
                  </form>
                )}
              </>
            )}
          </section>
        </div>
        <Dialog
          open={noteOpen}
          onClose={() => setNoteOpen(false)}
          title="Bu yazar için özel notun"
        >
          <div className="social-dialog">
            <p className="muted small">
              Bu not yalnızca senin hesabında görünür.
            </p>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={5000}
              rows={8}
              aria-label="Özel not"
            />
            <Notice success={noteSuccess} />
            <Button loading={noteBusy} onClick={saveNote}>
              Notu kaydet
            </Button>
          </div>
        </Dialog>
      </AuthRequired>
      <style jsx global>{`
        .social-messages {
          display: grid;
          grid-template-columns: 310px 1fr;
          min-height: 650px;
          height: min(780px, calc(100vh - 220px));
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 18px;
          overflow: hidden;
        }
        .social-inbox {
          border-right: 1px solid var(--border);
          overflow-y: auto;
        }
        .social-inbox-head {
          padding: 22px;
          border-bottom: 1px solid var(--border);
          display: grid;
          gap: 18px;
        }
        .social-inbox-head h2 {
          font-family: var(--font-display);
          font-size: 25px;
        }
        .social-chat-row {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 17px;
          text-align: left;
          border: 0;
          border-bottom: 1px solid var(--border);
          background: transparent;
          color: var(--text);
          cursor: pointer;
        }
        .social-chat-row:hover,
        .social-chat-row.active {
          background: var(--accent-soft);
        }
        .social-chat-row strong {
          font-size: 13px;
        }
        .social-chat-preview {
          flex: 1;
          min-width: 0;
        }
        .social-chat-preview p {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-top: 5px;
        }
        .social-unread {
          border-radius: 50%;
          min-width: 22px;
          padding: 3px 5px;
          background: var(--accent);
          color: var(--surface);
          text-align: center;
          font-size: 11px;
          font-weight: 700;
        }
        .social-thread {
          display: flex;
          flex-direction: column;
          min-width: 0;
          min-height: 0;
        }
        .social-thread-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px;
          border-bottom: 1px solid var(--border);
        }
        .social-back {
          display: none !important;
        }
        .social-chat-empty {
          display: grid;
          place-content: center;
          height: 100%;
          padding: 28px;
        }
        .social-history {
          overflow-y: auto;
          flex: 1;
          padding: 24px;
          min-height: 200px;
        }
        .social-message {
          display: flex;
          justify-content: flex-start;
          margin: 9px 0;
        }
        .social-message.sent {
          justify-content: flex-end;
        }
        .social-bubble {
          max-width: 82%;
          padding: 13px 16px;
          border-radius: 16px 16px 16px 3px;
          background: var(--surface-muted);
          border: 1px solid var(--border);
        }
        .sent .social-bubble {
          background: var(--accent-soft);
          border-color: var(--accent-soft);
          border-radius: 16px 16px 3px 16px;
        }
        .social-bubble p {
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          font-size: 14px;
          line-height: 1.7;
        }
        .social-message-meta {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          font-size: 10px;
          color: var(--muted);
          margin-top: 8px;
        }
        .social-message-date {
          text-align: center;
          font-size: 11px;
          color: var(--muted);
          margin: 24px 0 14px;
        }
        .social-composer {
          border-top: 1px solid var(--border);
          padding: 18px;
          display: grid;
          gap: 10px;
        }
        .social-composer-row {
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }
        .social-composer-row textarea {
          flex: 1;
          resize: none;
          min-height: 64px;
        }
        .social-composer-row button {
          flex-shrink: 0;
        }
        .social-attachment {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .social-attachment img {
          height: 70px;
          width: 90px;
          object-fit: cover;
          border-radius: 10px;
        }
        @media (max-width: 1050px) {
          .social-messages {
            grid-template-columns: 260px 1fr;
          }
          .social-thread-header {
            flex-wrap: wrap;
          }
          .social-thread-header .cluster {
            margin-left: 0 !important;
          }
          .social-history {
            padding: 16px;
          }
        }
        @media (max-width: 700px) {
          .social-messages {
            grid-template-columns: 1fr;
            height: calc(100dvh - 230px);
            min-height: 500px;
          }
          .social-messages:not(.has-peer) .social-thread {
            display: none;
          }
          .social-messages.has-peer .social-inbox {
            display: none;
          }
          .social-back {
            display: inline-flex !important;
          }
          .social-inbox {
            border-right: 0;
          }
          .social-bubble {
            max-width: 92%;
          }
          .social-composer {
            padding: 12px;
          }
          .social-composer-row {
            gap: 8px;
          }
          .social-composer-row button {
            padding: 10px;
            font-size: 12px;
          }
          .social-thread-header {
            padding: 12px;
          }
        }
      `}</style>
    </SocialLayout>
  );
}
