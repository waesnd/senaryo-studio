// Supabase reads JSON after fetch resolves; retain the abort deadline on the
// response stream so its body is bounded as well as the connection.
export function createBoundedServerFetch(timeoutMs = 10_000, fetchImpl = fetch) {
  return (input, init = {}) => {
    const deadline = AbortSignal.timeout(timeoutMs);
    const inherited = init.signal || (typeof Request !== "undefined" && input instanceof Request ? input.signal : null);
    return fetchImpl(input, { ...init, signal: inherited ? AbortSignal.any([inherited, deadline]) : deadline });
  };
}
export const boundedServerFetch = createBoundedServerFetch();
