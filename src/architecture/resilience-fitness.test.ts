import { describe, expect, it } from "vitest";
import { evaluate } from "../../dossier/experimentos/EXP-004-resiliencia/fitness.mjs";

function at<T>(items: T[], index: number): T {
  const item = items[index];
  if (item === undefined) throw new Error("Missing fixture item");
  return item;
}

function fixture() {
  return {
    status: "passed",
    cleanup: "passed",
    seed: { companies: 20, contacts: 800, deals: 1000, hotDeals: 200 },
    checks: { rls: true },
    runs: [1, 2, 3].flatMap((round) =>
      ["baseline", "circuit"].map((mode) => ({
        mode,
        round,
        healthy: {
          elapsedMs: 1000,
          proxyAttempts: 120,
          forwarded: 120,
          samples: Array.from({ length: 120 }, (_, n) => ({
            durationMs: 5,
            status: 200,
            rows: n % 5 === 0 ? 1000 : 200,
            circuitOpen: false,
          })),
        },
        outage: {
          elapsedMs: 1000,
          proxyAttempts: mode === "circuit" ? 5 : 120,
          forwarded: 0,
          samples: Array.from({ length: 120 }, (_, n) => ({
            durationMs: 120,
            status: 503,
            circuitOpen: mode === "circuit" && n >= 5,
          })),
        },
        recovery: {
          probeAttempts: mode === "circuit" ? 1 : 5,
          probeStatuses: mode === "circuit" ? [200, 503, 503, 503, 503] : [200, 200, 200, 200, 200],
          afterStatuses: [200, 200, 200, 200, 200],
          firstSuccessMs: 1100,
        },
      })),
    ),
  };
}

describe("fitness M6 rechaza regresiones y evidencia incompleta", () => {
  it("admite un protocolo completo que cumple los presupuestos", () => {
    expect(evaluate(fixture()).passed).toBe(true);
  });
  it("falla si faltan muestras o si el estado sano excede el presupuesto", () => {
    const missing = fixture();
    at(missing.runs, 0).healthy.samples.pop();
    expect(() => evaluate(missing)).toThrow();
    const slow = fixture();
    at(slow.runs, 0).healthy.samples.forEach((sample) => {
      sample.durationMs = 3000;
    });
    expect(() => evaluate(slow)).toThrow();
  });
  it("falla si no se protege la dependencia o si una caída se oculta como éxito", () => {
    const unprotected = fixture();
    at(unprotected.runs, 1).outage.proxyAttempts = 120;
    expect(() => evaluate(unprotected)).toThrow();
    const falseSuccess = fixture();
    at(at(falseSuccess.runs, 1).outage.samples, 0).status = 200;
    expect(() => evaluate(falseSuccess)).toThrow();
  });
  it("falla si se pierde aislamiento, se admiten varias sondas o falla la limpieza", () => {
    for (const change of [
      (result: ReturnType<typeof fixture>) => {
        result.checks.rls = false;
      },
      (result: ReturnType<typeof fixture>) => {
        at(result.runs, 1).recovery.probeAttempts = 5;
      },
      (result: ReturnType<typeof fixture>) => {
        result.cleanup = "failed";
      },
    ]) {
      const result = fixture();
      change(result);
      expect(() => evaluate(result)).toThrow();
    }
  });
});
