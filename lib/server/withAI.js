import { randomUUID } from "crypto";
import { withAuth } from "../withAuth";
import { callGroq } from "../groq";
import { ApiError, parseInput, requirePost, sendError } from "./errors";
import { createSupabaseServiceClient } from "./supabase";
export function resolveRequestId(req) {
  const supplied = req.headers?.["x-request-id"];
  if (supplied === undefined) return randomUUID();
  if (typeof supplied !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(supplied)) throw new ApiError(400, "INVALID_REQUEST_ID", "İstek kimliği geçersiz.");
  return supplied.toLowerCase();
}
export function withAI(operation, definition, dependencies = {}) {
  const model = dependencies.callModel || callGroq;
  return withAuth(async (req, res) => {
    let requestId;
    let reserved = false;
    let settled = false;
    let settlementClient;
    try {
      requirePost(req);
      requestId = resolveRequestId(req);
      res.setHeader("X-Request-ID", requestId);
      const input = parseInput(definition.inputSchema, req.body);
      if (!process.env.GROQ_API_KEY && !dependencies.callModel) throw new ApiError(503, "AI_NOT_CONFIGURED", "AI servisi henüz yapılandırılmadı.");
      settlementClient = (dependencies.settlementClientFactory || createSupabaseServiceClient)();
      const { data: usage, error } = await req.supabase.rpc("reserve_ai_usage", { p_request_id: requestId, p_operation: operation });
      if (error || !usage || typeof usage.allowed !== "boolean") throw new ApiError(503, "QUOTA_UNAVAILABLE", "Kullanım hakkınız doğrulanamadı. Lütfen tekrar deneyin.");
      if (!usage.allowed) throw new ApiError(usage.code === "DUPLICATE_REQUEST" ? 409 : 429, usage.code || "USAGE_LIMIT_EXCEEDED", usage.code === "DUPLICATE_REQUEST" ? "Bu istek zaten işlendi. Yeniden üretmek için yeni bir işlem başlatın." : "AI kullanım sınırına ulaştınız. Lütfen biraz bekleyin.", { remaining: usage.remaining ?? 0, retryAfterMs: usage.retryAfterMs ?? 60_000, ...(usage.resetAt ? { resetAt: usage.resetAt } : {}), ...(usage.limit ? { limit: usage.limit } : {}) });
      reserved = true;
      const result = await model(definition.buildPrompt(input), definition.options || {});
      const parsed = definition.outputSchema.safeParse(result);
      if (!parsed.success) throw new ApiError(502, "MODEL_OUTPUT_INVALID", "AI yanıtı beklenen alanları içermiyor. Çalışmanız korunuyor; tekrar deneyebilirsiniz.");
      if (definition.validateOutput && !definition.validateOutput(parsed.data, input)) throw new ApiError(502, "MODEL_OUTPUT_INVALID", "AI yanıtı istediğiniz içerik miktarını sağlamadı. Lütfen tekrar deneyin.");
      const output = definition.mapOutput ? definition.mapOutput(parsed.data) : parsed.data;
      const { data: settlement, error: settleError } = await settlementClient.rpc("settle_ai_usage", { p_request_id: requestId, p_success: true });
      if (settleError || settlement?.ok !== true || (settlement.status && settlement.status !== "succeeded")) throw new ApiError(503, "USAGE_SETTLEMENT_FAILED", "İşlem kaydı tamamlanamadı. Lütfen biraz sonra tekrar deneyin.");
      settled = true;
      const meta = { remaining: usage.remaining, kalan: usage.remaining, ...(usage.resetAt ? { resetAt: usage.resetAt } : {}), ...(usage.limit ? { limit: usage.limit } : {}) };
      return res.status(200).json(definition.envelope ? { ok: true, data: definition.envelope(output), meta, requestId } : { ...output, ok: true, meta, requestId });
    } catch (error) {
      if (reserved && !settled && error?.code !== "USAGE_SETTLEMENT_FAILED") {
        try { await settlementClient.rpc("settle_ai_usage", { p_request_id: requestId, p_success: false }); } catch { /* Reservations expire server-side; never fail open. */ }
      }
      const safe = error instanceof ApiError ? error : new ApiError(503, "SERVICE_UNAVAILABLE", "İşlem şu anda tamamlanamıyor. Lütfen tekrar deneyin.");
      safe.details = { ...safe.details, ...(requestId ? { requestId } : {}) };
      return sendError(res, safe);
    }
  }, dependencies.authOptions);
}
