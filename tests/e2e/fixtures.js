import { test as base, expect } from "@playwright/test";

export const TEST_USER_ID = "11111111-1111-4111-8111-111111111111";
export const OTHER_USER_ID = "22222222-2222-4222-8222-222222222222";
export const MOCK_SUPABASE_ORIGIN = "http://supabase.test";
export const seededDocument = {
  schemaVersion: 1, title: "Kayıp Işık", tagline: "Her gölge bir sır saklar.", synopsis: "Şule geçmişini arar.",
  characters: [{ id: "character-seed", name: "Şule", description: "Meraklı bir yazar." }],
  scenes: [{ id: "scene-seed", heading: "İÇ. KÜTÜPHANE - GECE", action: "Şule ışığı takip eder.", dialogue: [{ id: "line-seed", character: "Şule", text: "Beni duyuyor musun?" }] }],
  dramaticQuestion: "Geçmişini değiştirebilir mi?", metadata: { tip: "Film", tur: "Drama" },
};

function sessionFor(userId) {
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;
  const user = { id: userId, aud: "authenticated", role: "authenticated", email: "qa@example.test", user_metadata: { full_name: "Deneme Yazarı" }, app_metadata: { provider: "google" }, created_at: "2026-01-01T00:00:00Z" };
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ sub: userId, aud: "authenticated", role: "authenticated", exp: expiresAt, iat: expiresAt - 3600 })).toString("base64url");
  return { access_token: `${header}.${payload}.fixture-signature`, token_type: "bearer", refresh_token: "fixture-refresh-token", expires_in: 3600, expires_at: expiresAt, user };
}

function seededRow(userId, document = seededDocument) {
  return { id: 101, user_id: userId, document, revision: 1, baslik: document.title, senaryo: { baslik: document.title, ana_fikir: document.synopsis }, tip: "Film", tur: "Drama", paylasim_acik: false, created_at: "2026-10-01T12:00:00Z", updated_at: "2026-10-01T12:00:00Z" };
}

export async function installStudioFixture(page, { authenticated = true, withDraft = false, userId = TEST_USER_ID } = {}) {
  const session = sessionFor(userId);
  const state = {
    userId, session, row: seededRow(userId), saveError: null, generationError: null, generationResult: null,
    analysis: { sonuc: "Şule loş odanın sessizliğinde ışığın izini sürer." },
    requests: [], blockedExternal: [], unexpectedApi: [], generationDelay: 0, saveDelay: 0,
  };
  await page.addInitScript(({ session, withDraft, document, row, userId }) => {
    if (session) localStorage.setItem("sb-supabase-auth-token", JSON.stringify(session));
    if (withDraft && !localStorage.getItem(`senaryo-studio:draft:v1:${userId}`)) {
      localStorage.setItem(`senaryo-studio:draft:v1:${userId}`, JSON.stringify({ draftSchemaVersion: 1, ownerId: userId, document, row, savedFingerprint: JSON.stringify(document), lastSaved: row.updated_at, updatedAt: row.updated_at }));
    }
  }, { session: authenticated ? session : null, withDraft, document: seededDocument, row: state.row, userId: authenticated ? userId : "guest" });

  // Route all traffic before opening the page: provider URLs never reach a network.
  await page.route("**/*", async route => {
    const request = route.request();
    const url = new URL(request.url());
    const local = ["127.0.0.1", "localhost", "::1"].includes(url.hostname);
    const reply = (body, status = 200, headers = {}) => route.fulfill({ status, contentType: "application/json", headers: { "access-control-allow-origin": "*", ...headers }, body: JSON.stringify(body) });
    if (url.origin === MOCK_SUPABASE_ORIGIN) {
      if (request.method() === "OPTIONS") return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS" } });
      const body = request.postDataJSON();
      state.requests.push({ path: url.pathname, method: request.method(), body });
      if (url.pathname === "/auth/v1/user") return reply(session.user);
      if (url.pathname === "/auth/v1/token") return reply(session);
      if (url.pathname === "/auth/v1/logout") return reply({});
      if (url.pathname.startsWith("/rest/v1/rpc/")) {
        const name = url.pathname.split("/").at(-1);
        if (name === "save_scenario") {
          if (state.saveDelay) await new Promise(resolve => setTimeout(resolve, state.saveDelay));
          if (state.saveError) return reply(state.saveError, 400);
          state.row = { ...state.row, id: body.p_id || state.row.id, document: body.p_document, revision: state.row.revision + 1, baslik: body.p_document.title, updated_at: new Date().toISOString() };
          return reply(state.row);
        }
        if (name === "set_scenario_visibility") { state.row = { ...state.row, paylasim_acik: body.p_public }; return reply(state.row); }
        if (name === "create_scenario_version") return reply({ id: 201, senaryo_id: state.row.id, document: state.row.document, label: body.p_label, versiyon: 1 });
        if (name === "get_unread_notification_count") return reply(0);
        return reply(null);
      }
      if (url.pathname === "/rest/v1/profiles") {
        const profile = { id: userId, username: "deneme", nickname: "Deneme Yazarı", bio: "", avatar_url: null, banner_url: null, dogrulandi: false, senaryo_sayisi: 1, takipci_sayisi: 0, takip_sayisi: 0 };
        return reply(request.headers().accept?.includes("object+json") ? profile : [profile]);
      }
      if (url.pathname === "/rest/v1/senaryolar") return reply(request.headers().accept?.includes("object+json") ? state.row : url.searchParams.get("user_id") === `eq.${userId}` || url.searchParams.get("id") === "eq.101" ? [state.row] : []);
      return reply([], 200, { "content-range": "0-0/0" });
    }
    if (local && url.pathname.startsWith("/api/")) {
      state.requests.push({ path: url.pathname, method: request.method(), body: request.postDataJSON() });
      if (url.pathname === "/api/generate") {
        if (state.generationDelay) await new Promise(resolve => setTimeout(resolve, state.generationDelay));
        if (state.generationError) return reply({ ok: false, error: state.generationError, code: "PROVIDER_UNAVAILABLE" }, 503);
        return reply({ ok: true, data: state.generationResult || { baslik: "Yeni Bir Sabah", tagline: "Yeni yollar.", ana_fikir: "İpek bir yolculuğa çıkar.", karakter: "İpek: Gezgin", acilis_sahnesi: "Güneş doğar.", buyuk_soru: "Eve dönecek mi?" }, usage: { remaining: 8 } });
      }
      if (["diyalog", "dramaturg", "logline", "pitch", "puan", "herosjourney", "beatsheet", "karakterbible", "karakter", "scenes"].some(name => url.pathname === `/api/${name}`)) return reply({ ok: true, data: state.analysis, usage: { remaining: 7 } });
      state.unexpectedApi.push(url.pathname);
      return reply({ ok: false, error: "Test fixture has no handler for this route" }, 501);
    }
    if (!local) { state.blockedExternal.push(url.origin); return route.abort("blockedbyclient"); }
    return route.continue();
  });
  await page.routeWebSocket(/^(?:wss?|https?):\/\/(?!127\.0\.0\.1|localhost)/, socket => socket.close());
  return state;
}

export const test = base.extend({
  studio: async ({ page }, provideFixture) => {
    const fixture = await installStudioFixture(page, { withDraft: true });
    await provideFixture(fixture);
    expect(fixture.unexpectedApi, "Every local API must be an explicit mock").toEqual([]);
  },
});
export { expect };
