import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client = null;

if (url && key) {
  client = createClient(url, key);
} else if (process.env.NODE_ENV !== "production") {
  console.warn(
    "[supabase] NEXT_PUBLIC_SUPABASE_URL veya NEXT_PUBLIC_SUPABASE_ANON_KEY eksik. Auth özellikleri devre dışı kalacak."
  );
}

export function getSupabaseClient() {
  return client;
}

export const supabase = getSupabaseClient();
