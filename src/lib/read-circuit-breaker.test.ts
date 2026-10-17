import { describe, expect, it, vi } from "vitest";
import { createReadCircuitBreaker, READ_CIRCUIT } from "./read-circuit-breaker";
import { createSupabaseFetch } from "./supabase-fetch";

const url = "http://127.0.0.1:8000/rest/v1/deals";
const unavailable = () => new Response("{}", { status: 503 });

describe("fitness de resiliencia: lecturas Supabase", () => {
  it("abre tras tres fallos y limita a una sonda tras el cooldown", async () => {
    let now = 0;
    const transport = vi.fn<typeof fetch>().mockImplementation(async () => unavailable());
    const request = createReadCircuitBreaker({ transport, now: () => now });
    for (let n = 0; n < 3; n++) expect((await request(url)).status).toBe(503);
    expect((await request(url)).headers.get("X-Nexus-Circuit")).toBe("open");
    expect(transport).toHaveBeenCalledTimes(3);
    now += READ_CIRCUIT.cooldownMs;
    let finish!: (response: Response) => void;
    transport.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const probe = request(url);
    const concurrent = await Promise.all(Array.from({ length: 10 }, () => request(url)));
    expect(concurrent.every((response) => response.status === 503)).toBe(true);
    expect(transport).toHaveBeenCalledTimes(4);
    finish(new Response("[]"));
    expect((await probe).ok).toBe(true);
    transport.mockImplementation(async () => new Response("[]"));
    expect((await request(url)).ok).toBe(true);
  });

  it("no suprime ni reintenta escrituras ni llamadas de Auth con el circuito abierto", async () => {
    const transport = vi.fn<typeof fetch>().mockImplementation(async () => unavailable());
    const request = createReadCircuitBreaker({ transport });
    for (let n = 0; n < 3; n++) await request(url);
    for (const method of ["POST", "PATCH", "DELETE"]) await request(url, { method });
    await request("http://127.0.0.1:8000/auth/v1/user");
    expect(transport).toHaveBeenCalledTimes(7);
  });

  it("los 4xx y errores SQL HTTP 500 no abren el circuito", async () => {
    const transport = vi.fn<typeof fetch>();
    for (const status of [400, 401, 403, 404, 429, 500, 200]) {
      transport.mockResolvedValueOnce(new Response("[]", { status }));
    }
    const request = createReadCircuitBreaker({ transport });
    for (let n = 0; n < 7; n++)
      expect((await request(url)).headers.has("X-Nexus-Circuit")).toBe(false);
    expect(transport).toHaveBeenCalledTimes(7);
  });

  it("ignora éxitos antiguos que terminan después de abrir y reabre si falla la sonda", async () => {
    let now = 0;
    let finish!: (response: Response) => void;
    const transport = vi
      .fn<typeof fetch>()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finish = resolve;
          }),
      )
      .mockImplementation(async () => unavailable());
    const request = createReadCircuitBreaker({ transport, now: () => now });
    const old = request(url);
    for (let n = 0; n < 3; n++) await request(url);
    finish(new Response("[]"));
    await old;
    expect((await request(url)).headers.get("X-Nexus-Circuit")).toBe("open");
    now += READ_CIRCUIT.cooldownMs;
    await request(url);
    expect((await request(url)).headers.get("X-Nexus-Circuit")).toBe("open");
    expect(transport).toHaveBeenCalledTimes(5);
  });

  it("cuenta red/timeouts, pero una cancelación voluntaria no abre ni bloquea la recuperación", async () => {
    let now = 0;
    const transport = vi.fn<typeof fetch>().mockRejectedValue(new TypeError("Network unavailable"));
    const request = createReadCircuitBreaker({ transport, now: () => now });
    for (let n = 0; n < 3; n++) await expect(request(url)).rejects.toThrow();
    now += READ_CIRCUIT.cooldownMs;
    const controller = new AbortController();
    transport.mockImplementationOnce(async () => {
      controller.abort();
      throw controller.signal.reason;
    });
    await expect(request(url, { signal: controller.signal })).rejects.toThrow();
    transport.mockResolvedValueOnce(new Response("[]"));
    expect((await request(url)).ok).toBe(true);
    const cancelOnly = vi.fn<typeof fetch>().mockImplementation(async (_input, init) => {
      const controller = new AbortController();
      controller.abort();
      throw init?.signal?.reason ?? controller.signal.reason;
    });
    const isolated = createReadCircuitBreaker({ transport: cancelOnly });
    for (let n = 0; n < 4; n++) {
      const controller = new AbortController();
      controller.abort();
      await expect(isolated(url, { signal: controller.signal })).rejects.toThrow();
    }
    expect(cancelOnly).not.toHaveBeenCalled();
    const timeoutTransport = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new DOMException("Timed out", "TimeoutError"));
    const timed = createReadCircuitBreaker({ transport: timeoutTransport });
    for (let n = 0; n < 3; n++) await expect(timed(url)).rejects.toThrow();
    expect((await timed(url)).headers.get("X-Nexus-Circuit")).toBe("open");
  });

  it("aísla estado entre instancias y orígenes, sin cachear respuestas", async () => {
    const transport = vi.fn<typeof fetch>().mockImplementation(async () => unavailable());
    const first = createReadCircuitBreaker({ transport });
    for (let n = 0; n < 3; n++) await first(url);
    const second = createReadCircuitBreaker({ transport });
    await second(url);
    await first("http://localhost:9000/rest/v1/deals");
    expect(transport).toHaveBeenCalledTimes(5);
  });

  it("conserva JWT de usuario y apikey, sin enviar una clave opaca como bearer", async () => {
    const transport = vi.fn<typeof fetch>().mockImplementation(async () => new Response("[]"));
    const request = createSupabaseFetch("sb_publishable_test", { transport });
    await request(new Request(url, { headers: { "X-Request-ID": "test" } }), {
      headers: { Authorization: "Bearer user.jwt.signature" },
    });
    let headers = new Headers(transport.mock.calls[0]?.[1]?.headers);
    expect(headers.get("apikey")).toBe("sb_publishable_test");
    expect(headers.get("authorization")).toBe("Bearer user.jwt.signature");
    expect(headers.get("X-Request-ID")).toBe("test");
    await request(url, { headers: { Authorization: "Bearer sb_publishable_test" } });
    headers = new Headers(transport.mock.calls[1]?.[1]?.headers);
    expect(headers.has("authorization")).toBe(false);
    expect(transport.mock.calls[0]?.[1]?.signal).toBeInstanceOf(AbortSignal);
  });
});
