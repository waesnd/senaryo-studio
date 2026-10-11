export class ApiError extends Error {
  constructor(status, code, message, details = {}) { super(message); this.name = "ApiError"; this.status = status; this.code = code; this.details = details; }
}
export function sendError(res, error) {
  const safe = error instanceof ApiError ? error : new ApiError(503, "SERVICE_UNAVAILABLE", "İşlem şu anda tamamlanamıyor.");
  if (safe.status === 405) res.setHeader("Allow", "POST");
  if (safe.details.retryAfterMs) res.setHeader("Retry-After", String(Math.ceil(safe.details.retryAfterMs / 1000)));
  return res.status(safe.status).json({ ok: false, error: safe.message, code: safe.code, ...safe.details });
}
export function requirePost(req) { if (req.method !== "POST") throw new ApiError(405, "METHOD_NOT_ALLOWED", "Bu işlem POST isteği gerektirir."); }
export function parseInput(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) throw new ApiError(400, "VALIDATION_ERROR", "Alanları ve metin uzunluklarını kontrol edin.", { fields: result.error.issues.map(item => item.path.join(".")) });
  return result.data;
}
