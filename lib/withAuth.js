import { createClient } from "@supabase/supabase-js";
import { ApiError, sendError } from "./server/errors";
import { boundedServerFetch } from "./server/network";

// Abuse backstop only. Paid AI budgets live in shared, transactional PostgreSQL.
const bursts = new Map();
export function checkUserBurst(userId, now = Date.now()) {
  for (const [key, value] of bursts) if (value.resetAt <= now) bursts.delete(key);
  const value = bursts.get(userId) || { count: 0, resetAt: now + 60_000 };
  bursts.set(userId, value);
  value.count += 1;
  return { allowed: value.count <= 60, retryAfterMs: Math.max(value.resetAt - now, 0) };
}
export function createSupabaseUserClient(token) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new ApiError(503, "AUTH_NOT_CONFIGURED", "Oturum servisi henüz yapılandırılmadı.");
  return createClient(url, key, { global: { headers: { Authorization: `Bearer ${token}` }, fetch: boundedServerFetch }, auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}
export function withAuth(handler, options = {}) {
  const { requireAuth = true, enableRateLimit = true, clientFactory = createSupabaseUserClient } = options;
  return async function authWrappedHandler(req, res) {
    res.setHeader("Cache-Control", "no-store");
    req.user = null;
    req.supabase = null;
    const header = req.headers?.authorization;
    const match = typeof header === "string" && header.match(/^Bearer\s+(\S+)$/i);
    if (!match) return requireAuth ? sendError(res, new ApiError(401, "UNAUTHORIZED", "Giriş yapmanız gerekiyor.")) : handler(req, res);
    try {
      const supabase = clientFactory(match[1]);
      let timer;
      const auth = await Promise.race([supabase.auth.getUser(match[1]), new Promise((_, reject) => { timer = setTimeout(() => reject(new ApiError(503, "AUTH_SERVICE_ERROR", "Oturum servisine ulaşılamadı.")), 8_000); })]).finally(() => clearTimeout(timer));
      if (auth.error || !auth.data?.user?.id) throw new ApiError(401, "INVALID_TOKEN", "Geçersiz veya süresi dolmuş oturum.");
      req.user = auth.data.user;
      req.supabase = supabase;
      if (enableRateLimit) {
        const rate = checkUserBurst(req.user.id);
        if (!rate.allowed) throw new ApiError(429, "RATE_LIMIT_EXCEEDED", "Çok fazla istek. Lütfen biraz bekleyin.", { retryAfterMs: rate.retryAfterMs });
      }
      return await handler(req, res);
    } catch (error) {
      if (!requireAuth && error?.status === 401) return handler(req, res);
      return sendError(res, error instanceof ApiError ? error : new ApiError(503, "SERVICE_UNAVAILABLE", "İşlem şu anda tamamlanamıyor. Lütfen tekrar deneyin."));
    }
  };
}
export function withOptionalAuth(handler, options = {}) { return withAuth(handler, { ...options, requireAuth: false }); }
export function withRateLimit(handler, options = {}) { return withAuth(handler, { ...options, requireAuth: false, enableRateLimit: true }); }
