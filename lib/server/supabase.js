import { createClient } from "@supabase/supabase-js";
import { ApiError } from "./errors";
import { boundedServerFetch } from "./network";
export function createSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new ApiError(503, "SERVER_NOT_CONFIGURED", "Sunucu veri servisi henüz yapılandırılmadı.");
  return createClient(url, key, { global: { fetch: boundedServerFetch }, auth: { persistSession: false, autoRefreshToken: false } });
}
