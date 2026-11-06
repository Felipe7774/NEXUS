import { createReadCircuitBreaker } from "./read-circuit-breaker.ts";
import { createReadObserver, type ReadObserver } from "./read-observability.ts";

export const SUPABASE_FETCH_TIMEOUT_MS = 3000;

export function createSupabaseFetch(
  supabaseKey: string,
  {
    circuitBreaker = true,
    transport = globalThis.fetch,
    observer = createReadObserver(),
  }: { circuitBreaker?: boolean; transport?: typeof fetch; observer?: ReadObserver } = {},
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
    return observe(observer, input, request, () => guardedFetch(input, { ...init, headers, signal }));
  };
}

/**
 * Registra duracion, estado y fallo de cada lectura (ADR-008). No altera la
 * respuesta ni traga errores: observa y vuelve a lanzar.
 */
async function observe(
  observer: ReadObserver,
  input: Parameters<typeof fetch>[0],
  request: Request | undefined,
  run: () => Promise<Response>,
): Promise<Response> {
  const started = performance.now();
  // Solo la ruta: la query puede llevar identificadores de propietario.
  let path = "desconocida";
  try {
    path = new URL(request?.url ?? String(input)).pathname;
  } catch {
    /* Una URL relativa en pruebas no debe romper la lectura. */
  }
  try {
    const response = await run();
    observer.record({
      path,
      durationMs: performance.now() - started,
      status: response.status,
      failed: response.status >= 500,
      circuitOpen: response.headers.get("X-Nexus-Circuit") === "open",
    });
    return response;
  } catch (error) {
    observer.record({
      path,
      durationMs: performance.now() - started,
      status: null,
      failed: true,
      circuitOpen: false,
    });
    throw error;
  }
}
