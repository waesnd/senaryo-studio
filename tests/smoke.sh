#!/usr/bin/env bash
set -euo pipefail

# Safety gate: never run this CI smoke script against a real Supabase project.
if [[ "${NEXT_PUBLIC_SUPABASE_URL:-}" != "https://ci-placeholder.supabase.co" ]]; then
  echo "Refusing smoke test without isolated dummy config" >&2
  exit 2
fi

port=3107
log_file="$(mktemp)"
tmp_dir="$(mktemp -d)"
npm run start -- --port "$port" > "$log_file" 2>&1 &
server_pid=$!
cleanup() {
  kill "$server_pid" 2>/dev/null || true
  rm -rf "$tmp_dir" "$log_file"
}
trap cleanup EXIT

ready=0
for i in $(seq 1 35); do
  if curl -fsS "http://127.0.0.1:$port/" -o "$tmp_dir/home.html"; then
    ready=1
    break
  fi
  sleep 1
done
if [[ "$ready" -ne 1 ]]; then
  cat "$log_file" >&2
  echo "App did not serve the homepage" >&2
  exit 1
fi

grep -q 'Fabularc' "$tmp_dir/home.html"

curl -fsS "http://127.0.0.1:$port/manifest.json" -o "$tmp_dir/manifest.json"
node -e "const m=require(process.argv[1]); if(m.name!=='Fabularc'||m.icons.length!==2)process.exit(1)" "$tmp_dir/manifest.json"

curl -fsS "http://127.0.0.1:$port/brand/fabularc-primary.svg" -o "$tmp_dir/logo.svg"
grep -q '<svg' "$tmp_dir/logo.svg"

curl -fsS "http://127.0.0.1:$port/editor" -o "$tmp_dir/editor.html"
grep -q 'Editör hazırlanıyor' "$tmp_dir/editor.html"

status="$(curl -sS -o "$tmp_dir/unauthorized.json" -w '%{http_code}' "http://127.0.0.1:$port/api/generate")"
test "$status" = "401"

echo "PASS: homepage, editor route, Fabularc metadata, PWA manifest, vector logo, and unauthorized API response"
