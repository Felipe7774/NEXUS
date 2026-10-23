export const READ_CIRCUIT = Object.freeze({ failureThreshold: 3, cooldownMs: 1000 });

type Circuit = {
  state: "closed" | "open" | "half-open";
  failures: number;
  openedAt: number;
  generation: number;
};

export function createReadCircuitBreaker({
  transport = globalThis.fetch,
  now = () => performance.now(),
}: { transport?: typeof fetch; now?: () => number } = {}): typeof fetch {
  const circuits = new Map<string, Circuit>();

  return async (input, init) => {
    const request = typeof Request !== "undefined" && input instanceof Request ? input : undefined;
    const method = (init?.method ?? request?.method ?? "GET").toUpperCase();
    const url = new URL(request?.url ?? String(input));
    if (!["GET", "HEAD"].includes(method) || !url.pathname.startsWith("/rest/v1/")) {
      return transport(input, init);
    }
    const signal = init?.signal ?? request?.signal;
    signal?.throwIfAborted();
    let circuit = circuits.get(url.origin);
    if (!circuit) {
      circuit = { state: "closed", failures: 0, openedAt: 0, generation: 0 };
      circuits.set(url.origin, circuit);
    }

    if (circuit.state === "open" && now() - circuit.openedAt >= READ_CIRCUIT.cooldownMs) {
      circuit.state = "half-open";
      circuit.generation++;
    } else if (circuit.state !== "closed") {
      return new Response(
        JSON.stringify({
          code: "NEXUS_CIRCUIT_OPEN",
          message: "El servicio de datos no está disponible temporalmente.",
          details: null,
          hint: "Vuelve a intentar en un momento.",
        }),
        {
          status: 503,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "1",
            "X-Nexus-Circuit": "open",
          },
        },
      );
    }

    const generation = circuit.generation;
    const probe = circuit.state === "half-open";
    const reopen = () => {
      circuit.state = "open";
      circuit.openedAt = now();
      circuit.generation++;
    };
    const failure = () => {
      // Ignore old in-flight completions after a transition: they cannot close a newer circuit.
      if (generation !== circuit.generation) return;
      circuit.failures++;
      if (probe || circuit.failures >= READ_CIRCUIT.failureThreshold) reopen();
    };
    try {
      const response = await transport(input, init);
      if ([502, 503, 504].includes(response.status)) failure();
      else if (generation === circuit.generation) {
        circuit.failures = 0;
        circuit.state = "closed";
        if (probe) circuit.generation++;
      }
      return response;
    } catch (error) {
      const callerCancelled = signal?.aborted && signal.reason?.name !== "TimeoutError";
      if (!callerCancelled) failure();
      else if (probe && generation === circuit.generation) {
        // A cancelled probe is not a dependency failure and must not strand Half-Open.
        circuit.state = "open";
        circuit.openedAt = now() - READ_CIRCUIT.cooldownMs;
        circuit.generation++;
      }
      throw error;
    }
  };
}
