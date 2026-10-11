import { test, expect, installStudioFixture, TEST_USER_ID, OTHER_USER_ID } from "./fixtures.js";

const THIRD_USER_ID = "33333333-3333-4333-8333-333333333333";
const ASSET_ID = "44444444-4444-4444-8444-444444444444";
const peers = [
  { id: OTHER_USER_ID, username: "ipek", nickname: "İpek Yazar", avatar_url: null },
  { id: THIRD_USER_ID, username: "derin", nickname: "Derin Yazar", avatar_url: null },
];

async function installSocialFixture(page) {
  const state = await installStudioFixture(page);
  state.historyDelay = 0;
  state.historyRequested = new Set();
  state.historyCompleted = new Set();
  state.readIds = new Set();
  state.entries = [];
  state.notifications = Array.from({ length: 31 }, (_, index) => ({ id: 300 + index, gonderen_id: OTHER_USER_ID, alici_id: TEST_USER_ID, tip: "yorum", senaryo_id: null, icerik: `Geri bildirim ${index + 1}`, okundu: false, created_at: new Date(Date.UTC(2026, 9, 11, 12, 0, 60 - index)).toISOString() }));
  state.allNotifications = [...state.notifications, { id: 999, okundu: false }];
  const reply = (route, data, headers = {}) => route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*", ...headers }, body: JSON.stringify(data) });
  await page.route("**/rest/v1/**", async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.method() === "OPTIONS") return route.fallback();
    const body = request.postDataJSON();
    const path = url.pathname;
    state.requests.push({ path, method: request.method(), body, query: Object.fromEntries(url.searchParams) });
    if (path === "/rest/v1/profiles") {
      const filter = url.searchParams.get("id") || "";
      if (filter === `eq.${TEST_USER_ID}`) return route.fallback();
      const rows = filter.startsWith("eq.") ? peers.filter(peer => `eq.${peer.id}` === filter) : peers;
      return reply(route, request.headers().accept?.includes("object+json") ? rows[0] || null : rows);
    }
    if (path === "/rest/v1/rpc/list_conversations") return reply(route, peers.map((peer, index) => ({ peer_id: peer.id, last_id: 401 + index, created_at: "2026-10-11T12:00:00Z", icerik: `Sohbet ${index + 1}`, unread_count: 1 })));
    if (path === "/rest/v1/mesajlar") {
      if (request.method() === "PATCH") return reply(route, []);
      if (request.method() === "POST") return reply(route, { id: 503, ...body, okundu: false, created_at: "2026-10-11T12:10:00Z" });
      const peerId = url.searchParams.get("or")?.includes(THIRD_USER_ID) ? THIRD_USER_ID : OTHER_USER_ID;
      state.historyRequested.add(peerId);
      if (peerId === OTHER_USER_ID && state.historyDelay) await new Promise(resolve => setTimeout(resolve, state.historyDelay));
      state.historyCompleted.add(peerId);
      return reply(route, [{ id: peerId === OTHER_USER_ID ? 401 : 402, gonderen: peerId, alan: TEST_USER_ID, icerik: peerId === OTHER_USER_ID ? "İlk yazarın gizli mesajı" : "İkinci yazarın mesajı", okundu: false, created_at: "2026-10-11T12:00:00Z" }]).catch(() => {});
    }
    if (path === "/rest/v1/ozel_notlar") {
      return reply(route, [{ metin: "Hesabıma ait özel not." }]);
    }
    if (path === "/rest/v1/rpc/save_private_note") return reply(route, { user_id: TEST_USER_ID, profile_id: body.p_profile_id, metin: body.p_text });
    if (path === "/rest/v1/engellemeler") return reply(route, []);
    if (path === "/rest/v1/bildirimler") {
      if (request.method() === "HEAD") return reply(route, [], { "content-range": "0-0/32" });
      if (url.searchParams.get("select") === "id") return reply(route, state.allNotifications.filter(row => !state.readIds.has(row.id)).map(row => ({ id: row.id })));
      return reply(route, state.notifications.map(row => ({ ...row, okundu: state.readIds.has(row.id) })));
    }
    if (path === "/rest/v1/rpc/mark_notifications_read") { body.p_ids.forEach(id => state.readIds.add(id)); return reply(route, body.p_ids.length); }
    if (path === "/rest/v1/challengelar") return reply(route, [{ id: 77, konu: "Bir gece, iki karar", aciklama: "Tek mekânda geçen kısa bir hikâye yaz.", tur: "Drama", tip: "Film", deadline: "2027-10-11T23:59:59Z", katilimci_sayisi: state.entries.length }]);
    if (path === "/rest/v1/challenge_katilimlar") return reply(route, state.entries);
    if (path === "/rest/v1/rpc/submit_challenge") {
      state.entries = [{ id: 701, challenge_id: body.p_challenge_id, senaryo_id: Number(body.p_scenario_id), user_id: TEST_USER_ID, status: "submitted", score: null, feedback: null }];
      return reply(route, state.entries[0]);
    }
    return route.fallback();
  });
  // Every upload step is same-origin and mocked; provider credentials stay server-side.
  await page.route("**/api/media/**", async route => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const body = path === "/api/media/upload" ? { multipart: route.request().postData() } : route.request().postDataJSON();
    state.requests.push({ path, method: route.request().method(), body, headers: route.request().headers(), query: Object.fromEntries(url.searchParams) });
    if (path === "/api/media/sign") return reply(route, { assetId: ASSET_ID, upload: { url: `/api/media/upload?assetId=${ASSET_ID}`, fields: {} } });
    if (path === "/api/media/upload") return reply(route, { public_id: "fixture/private-dm", version: 123, signature: "fixture-provider-signature" });
    if (path === "/api/media/complete") return reply(route, { asset: { id: ASSET_ID, kind: "image", status: "ready" } });
    if (path === "/api/media/access") return reply(route, { url: new URL("/studio-mark.svg", page.url()).href });
    state.unexpectedApi.push(path);
    return route.abort();
  });
  return state;
}

test("a delayed conversation response never appears after switching peers", async ({ page }) => {
  const state = await installSocialFixture(page);
  state.historyDelay = 900;
  await page.goto("/mesajlar");
  await page.getByRole("button", { name: /İpek Yazar/ }).click();
  await expect.poll(() => state.historyRequested.has(OTHER_USER_ID)).toBe(true);
  await page.getByRole("button", { name: /Derin Yazar/ }).click();
  await expect(page.getByText("İkinci yazarın mesajı", { exact: true })).toBeVisible();
  await expect.poll(() => state.historyCompleted.has(OTHER_USER_ID)).toBe(true);
  await expect(page.getByText("İlk yazarın gizli mesajı", { exact: true })).toHaveCount(0);
  await expect(page.locator(".social-thread-header")).toContainText("Derin Yazar");
});

test("private notes query the current owner and save through a server-owned RPC", async ({ page }) => {
  const state = await installSocialFixture(page);
  await page.goto(`/mesajlar?chat=${OTHER_USER_ID}`);
  await page.getByRole("button", { name: "Özel not", exact: true }).click();
  await page.getByRole("textbox", { name: "Özel not", exact: true }).fill("Yalnızca kendi hesabım için bir not.");
  await page.getByRole("button", { name: "Notu kaydet", exact: true }).click();
  await expect(page.getByText("Özel notun kaydedildi.", { exact: true })).toBeVisible();
  const noteRead = state.requests.find(request => request.path === "/rest/v1/ozel_notlar" && request.method === "GET");
  expect(noteRead.query.user_id).toBe(`eq.${TEST_USER_ID}`);
  expect(noteRead.query.profile_id).toBe(`eq.${OTHER_USER_ID}`);
  const noteWrite = state.requests.find(request => request.path === "/rest/v1/rpc/save_private_note");
  expect(noteWrite.body).toEqual({ p_profile_id: OTHER_USER_ID, p_text: "Yalnızca kendi hesabım için bir not." });
  expect(state.requests.filter(request => request.path === "/rest/v1/ozel_notlar" && request.method !== "GET")).toEqual([]);
});

test("notifications auto-mark visible IDs and only the explicit all-read action includes old unseen IDs", async ({ page }) => {
  const state = await installSocialFixture(page);
  await page.goto("/bildirimler");
  await expect(page.locator("[data-notification-id]")).toHaveCount(30);
  await expect.poll(() => state.readIds.size).toBeGreaterThan(0);
  expect(state.readIds.has(330), "The pagination buffer was not rendered").toBe(false);
  expect(state.readIds.has(999), "The older notification was never loaded").toBe(false);
  const automatic = state.requests.filter(request => request.path === "/rest/v1/rpc/mark_notifications_read");
  expect(automatic.every(request => request.body.p_ids.length === 1)).toBe(true);
  await page.getByRole("button", { name: "Tümünü okundu işaretle", exact: true }).click();
  await expect.poll(() => state.readIds.has(999)).toBe(true);
  await expect(page.getByRole("button", { name: "Tümünü okundu işaretle", exact: true })).toBeEnabled();
  expect(state.readIds.size).toBe(32);
});

test("challenge submission uses a persistent RPC and survives a page reload", async ({ page }) => {
  const state = await installSocialFixture(page);
  await page.goto("/topluluk");
  await page.getByRole("combobox", { name: "Teslim edilecek eser" }).selectOption("101");
  await page.getByRole("button", { name: "Eseri teslim et", exact: true }).click();
  await expect(page.getByText("Eserin teslim edildi", { exact: true })).toBeVisible();
  expect(state.requests.find(request => request.path === "/rest/v1/rpc/submit_challenge").body).toMatchObject({ p_challenge_id: 77, p_scenario_id: "101" });
  await page.reload();
  await expect(page.getByText("Eserin teslim edildi", { exact: true })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Teslim edilecek eser" })).toHaveValue("101");
});

test("private message uploads complete a signed exchange and store only the verified asset ID", async ({ page }) => {
  const state = await installSocialFixture(page);
  await page.goto(`/mesajlar?chat=${OTHER_USER_ID}`);
  await page.getByRole("textbox", { name: "Mesajın" }).fill("Görsele bak.");
  await page.locator('input[type="file"]').setInputFiles({ name: "deneme.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aK+kAAAAASUVORK5CYII=", "base64") });
  await page.getByRole("button", { name: "Gönder ↗", exact: true }).click();
  await expect(page.locator(".social-thread article").getByText("Görsele bak.", { exact: true })).toBeVisible();
  await expect(page.getByRole("img", { name: "Mesaja eklenen görsel" })).toBeVisible();
  expect(state.requests.find(request => request.path === "/api/media/sign").body).toMatchObject({ intent: "dm", mimeType: "image/png" });
  expect(state.requests.find(request => request.path === "/api/media/complete").body).toMatchObject({ assetId: ASSET_ID, public_id: "fixture/private-dm", signature: "fixture-provider-signature" });
  const upload = state.requests.find(request => request.path === "/api/media/upload");
  expect(upload.headers.authorization).toBe(`Bearer ${state.session.access_token}`);
  expect(upload.query.assetId).toBe(ASSET_ID);
  expect(upload.body.multipart).toContain('name="file"');
  expect(upload.body.multipart).not.toContain('name="signature"');
  const message = state.requests.find(request => request.path === "/rest/v1/mesajlar" && request.method === "POST");
  expect(message.body).toMatchObject({ gonderen: TEST_USER_ID, alan: OTHER_USER_ID, medya_asset_id: ASSET_ID });
  expect(message.body.medya_url).toBeUndefined();
  expect(message.body.ses_url).toBeUndefined();
  expect(state.unexpectedApi).toEqual([]);
  expect(state.blockedExternal).toEqual([]);
});
