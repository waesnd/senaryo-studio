import { getSupabaseClient } from "./supabase";

export class StudioError extends Error {
  constructor(message, { code = "REQUEST_FAILED", status = 0, retryAfter = 0, resetAt = null } = {}) {
    super(message);
    this.name = "StudioError";
    this.code = code;
    this.status = status;
    this.retryAfter = retryAfter;
    this.resetAt = resetAt;
  }
}

export function requireStudioClient() {
  const client = getSupabaseClient();
  if (!client) throw new StudioError("Bulut bağlantısı henüz yapılandırılmadı. Çalışmanız bu tarayıcıda saklanır.", { code: "NOT_CONFIGURED" });
  return client;
}

export async function studioRpc(name, params) {
  const { data, error } = await requireStudioClient().rpc(name, params);
  if (error) {
    const conflict = /revision|conflict|sürüm|surum|concurrent/i.test(`${error.message} ${error.details}`) || error.code === "40001";
    throw new StudioError(conflict ? "Bu eser başka bir oturumda değişti. Yerel taslağınız korundu; bulut sürümünü inceleyin veya taslağı yeni eser olarak kaydedin." : "İşlem tamamlanamadı. Lütfen yeniden deneyin.", { code: conflict ? "REVISION_CONFLICT" : error.code });
  }
  return Array.isArray(data) ? data[0] : data;
}

export async function requestStudioAI(endpoint, body, signal) {
  const { data, error } = await requireStudioClient().auth.getSession();
  if (error || !data?.session?.access_token) throw new StudioError("AI araçlarını kullanmak için giriş yapın. Yazdığınız taslak korunur.", { code: "UNAUTHORIZED", status: 401 });
  const response = await fetch(`/api/${endpoint}`, {
    method: "POST", signal,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session.access_token}`, "x-request-id": crypto.randomUUID() },
    body: JSON.stringify(body),
  });
  let payload;
  try { payload = await response.json(); } catch { throw new StudioError("Sunucudan okunabilir bir yanıt alınamadı. Çalışmanız korundu."); }
  if (!response.ok || payload.ok === false || payload.error) {
    throw new StudioError(payload.error || "AI işlemi tamamlanamadı. Çalışmanız korundu.", {
      code: payload.code, status: response.status,
      retryAfter: Number(payload.retry_after || payload.retryAfter || (payload.retryAfterMs ? Math.ceil(payload.retryAfterMs / 1000) : 0) || response.headers.get("Retry-After") || 0),
      resetAt: payload.reset_at || payload.resetAt || null,
    });
  }
  return { data: payload.data || payload, meta: payload.meta || payload.usage || null };
}
