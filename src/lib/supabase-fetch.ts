import { createReadCircuitBreaker } from "./read-circuit-breaker.ts";

export const SUPABASE_FETCH_TIMEOUT_MS = 3000;

export function createSupabaseFetch(
  supabaseKey: string,
  {
    circuitBreaker = true,
    transport = globalThis.fetch,
  }: { circuitBreaker?: boolean; transport?: typeof fetch } = {},
): typeof fetch {
  const guardedFetch = circuitBreaker ? createReadCircuitBreaker({ transport }) : transport;
  return (input, init) => {
    const request = typeof Request !== "undefined" && input instanceof Request ? input : undefined;
    const headers = new Headers(request?.headers);
    if (init?.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    // Opaque Supabase API keys are valid as apikey, but are not bearer JWTs.
    const opaque =
      supabaseKey.startsWith("sb_publishable_") || supabaseKey.startsWith("sb_secret_");
    if (opaque && headers.get("Authorization") === `Bearer ${supabaseKey}`)
      headers.delete("Authorization");
    headers.set("apikey", supabaseKey);
    // Defensive per-attempt deadline. The historical timeout comparison did not prove a latency gain.
    const timeout = AbortSignal.timeout(SUPABASE_FETCH_TIMEOUT_MS);
    const callerSignal = init?.signal ?? request?.signal;
    const signal = callerSignal ? AbortSignal.any([callerSignal, timeout]) : timeout;
    return guardedFetch(input, { ...init, headers, signal });
  };
}
