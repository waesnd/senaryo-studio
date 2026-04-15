import { createClient } from "@supabase/supabase-js";

const RATE_LIMIT_MAP = new Map();
const RATE_LIMIT = 20;
const RATE_WINDOW = 60 * 1000;
const CLEANUP_INTERVAL = RATE_WINDOW * 5;

function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function createApiResponse(res, status, payload) {
  return res.status(status).json(payload);
}

function sendError(res, status, error, code, extra = {}) {
  return createApiResponse(res, status, {
    ok: false,
    error,
    code,
    ...extra,
  });
}

function checkRateLimit(key) {
  const now = Date.now();
  const record = RATE_LIMIT_MAP.get(key);

  if (!record || now - record.start > RATE_WINDOW) {
    RATE_LIMIT_MAP.set(key, { count: 1, start: now });
    return {
      allowed: true,
      remaining: RATE_LIMIT - 1,
      resetAt: now + RATE_WINDOW,
    };
  }

  if (record.count >= RATE_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.start + RATE_WINDOW,
    };
  }

  record.count += 1;

  return {
    allowed: true,
    remaining: Math.max(RATE_LIMIT - record.count, 0),
    resetAt: record.start + RATE_WINDOW,
  };
}

function cleanupRateLimitMap() {
  const now = Date.now();

  for (const [key, value] of RATE_LIMIT_MAP.entries()) {
    if (now - value.start > RATE_WINDOW * 2) {
      RATE_LIMIT_MAP.delete(key);
    }
  }
}

if (typeof global !== "undefined" && !global.__SCRIPTIFY_RATE_LIMIT_CLEANER__) {
  global.__SCRIPTIFY_RATE_LIMIT_CLEANER__ = setInterval(() => {
    cleanupRateLimitMap();
  }, CLEANUP_INTERVAL);
}

function createSupabaseUserClient(token) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase environment değişkenleri eksik.");
  }

  return createClient(
    url,
    anonKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
}

export function withAuth(handler, options = {}) {
  const {
    requireAuth = true,
    enableRateLimit = true,
  } = options;

  return async function authWrappedHandler(req, res) {
    req.user = null;
    req.supabase = null;

    if (enableRateLimit) {
      const ip = getClientIp(req);
      const rate = checkRateLimit(ip);

      res.setHeader("X-RateLimit-Limit", String(RATE_LIMIT));
      res.setHeader("X-RateLimit-Remaining", String(rate.remaining));
      res.setHeader("X-RateLimit-Reset", String(rate.resetAt));

      if (!rate.allowed) {
        return sendError(
          res,
          429,
          "Çok fazla istek. Lütfen biraz bekleyin.",
          "RATE_LIMIT_EXCEEDED",
          { retryAfterMs: Math.max(rate.resetAt - Date.now(), 0) }
        );
      }
    }

    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      if (requireAuth) {
        return sendError(
          res,
          401,
          "Giriş yapmanız gerekiyor.",
          "UNAUTHORIZED"
        );
      }

      return handler(req, res);
    }

    try {
      const supabase = createSupabaseUserClient(token);
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        if (requireAuth) {
          return sendError(
            res,
            401,
            "Geçersiz veya süresi dolmuş oturum.",
            "INVALID_TOKEN"
          );
        }

        return handler(req, res);
      }

      req.user = user;
      req.supabase = supabase;

      return handler(req, res);
    } catch (error) {
      console.error("[withAuth] token doğrulama hatası:", error);

      if (requireAuth) {
        return sendError(
          res,
          500,
          "Auth servisi hatası.",
          "AUTH_SERVICE_ERROR"
        );
      }

      return handler(req, res);
    }
  };
}

export function withOptionalAuth(handler, options = {}) {
  return withAuth(handler, {
    ...options,
    requireAuth: false,
  });
}

export function withRateLimit(handler, options = {}) {
  return withAuth(handler, {
    ...options,
    requireAuth: false,
    enableRateLimit: true,
  });
}
