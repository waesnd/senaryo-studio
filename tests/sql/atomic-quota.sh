#!/usr/bin/env bash
set -euo pipefail

# Destructive by design: run ONLY against the disposable GitHub Actions
# postgres service. Never point this script at a real database.
if [[ "${FABULARC_TEST_DATABASE:-}" != "disposable-ci-postgres" ]]; then
  echo "Refusing SQL test outside disposable CI database" >&2
  exit 2
fi

psql -X -v ON_ERROR_STOP=1 <<'SQL'
CREATE SCHEMA auth;
CREATE ROLE anon;
CREATE ROLE authenticated;

CREATE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
 SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

CREATE TABLE public.kullanim_log (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL,
  islem text NOT NULL,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
SQL

psql -X -v ON_ERROR_STOP=1 -f supabase/migrations/202611080001_atomic_ai_quota.sql

# Permissions are a required security boundary.
psql -X -v ON_ERROR_STOP=1 -tA <<'SQL' | grep -Fqx 't|f'
SELECT has_function_privilege('authenticated','public.reserve_generate_quota(jsonb)','EXECUTE'),
       has_function_privilege('anon','public.reserve_generate_quota(jsonb)','EXECUTE');
SQL

# All 55 callers share one user. At most 50 reservations must succeed even
# if the process invocations overlap, and exactly 50 records must be inserted.
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT
test_user="11111111-1111-4111-8111-111111111111"
pids=()
for i in $(seq 1 55); do
  (
    psql -X -q -v ON_ERROR_STOP=1 -tA \
      -c "SET ROLE authenticated; SET request.jwt.claim.sub='$test_user'; SELECT public.reserve_generate_quota('{}'::jsonb)->>'allowed';" \
      > "$tmp_dir/out-$i" 2> "$tmp_dir/err-$i"
  ) &
  pids+=("$!")
done

for pid in "${pids[@]}"; do wait "$pid"; done
accepted="$(grep -h -x 'true' "$tmp_dir"/out-* | wc -l | tr -d ' ')"
denied="$(grep -h -x 'false' "$tmp_dir"/out-* | wc -l | tr -d ' ')"
recorded="$(psql -X -v ON_ERROR_STOP=1 -tA -c "SELECT COUNT(*) FROM public.kullanim_log WHERE user_id = '$test_user';")"

test "$accepted" -eq 50
test "$denied" -eq 5
test "$recorded" -eq 50

# No JWT may never reserve or insert.
if psql -X -v ON_ERROR_STOP=1 -c "SET ROLE anon; SELECT public.reserve_generate_quota('{}'::jsonb);" > "$tmp_dir/anon.out" 2>&1; then
  echo "Anonymous access was incorrectly allowed" >&2
  exit 1
fi

echo "PASS atomic quota: 50 accepted, 5 denied, 50 rows, anonymous caller rejected."
