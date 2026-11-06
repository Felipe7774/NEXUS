import { describe, it, expect } from "vitest";
import { createReadObserver, READ_OBSERVABILITY } from "./read-observability.ts";

function harness() {
  const emitted: { signal: string; detail: Record<string, unknown> }[] = [];
  let clock = 0;
  const observer = createReadObserver({
    emit: (signal, detail) => emitted.push({ signal, detail }),
    now: () => clock,
  });
  return { emitted, observer, advance: (ms: number) => (clock += ms) };
}

const ok = { path: "/rest/v1/deals", durationMs: 40, status: 200, failed: false, circuitOpen: false };

describe("ADR-008: observabilidad minima de lecturas", () => {
  it("una lectura rapida y correcta no emite nada", () => {
    const { emitted, observer } = harness();
    observer.record(ok);
    expect(emitted).toEqual([]);
  });

  it("avisa de una lectura lenta sin incluir la query", () => {
    const { emitted, observer } = harness();
    observer.record({ ...ok, durationMs: READ_OBSERVABILITY.slowReadMs + 1 });
    expect(emitted).toHaveLength(1);
    expect(emitted[0]!.signal).toBe("slow-read");
    expect(emitted[0]!.detail["path"]).toBe("/rest/v1/deals");
  });

  it("no avisa justo en el umbral, solo por encima", () => {
    const { emitted, observer } = harness();
    observer.record({ ...ok, durationMs: READ_OBSERVABILITY.slowReadMs });
    expect(emitted).toEqual([]);
  });

  it("distingue un fallo de una apertura del circuito", () => {
    const { emitted, observer } = harness();
    observer.record({ ...ok, status: 503, failed: true, circuitOpen: false });
    observer.record({ ...ok, status: 503, failed: true, circuitOpen: true });
    expect(emitted.map((e) => e.signal)).toEqual(["read-failed", "circuit-open"]);
  });

  it("no alerta por tasa de error sin muestras suficientes", () => {
    const { emitted, observer } = harness();
    observer.record({ ...ok, failed: true, status: 500 });
    expect(emitted.some((e) => e.signal === "error-rate")).toBe(false);
  });

  it("alerta cuando la tasa supera el 2% con la ventana llena", () => {
    const { emitted, observer } = harness();
    for (let i = 0; i < READ_OBSERVABILITY.minSamples - 1; i++) observer.record(ok);
    expect(emitted.some((e) => e.signal === "error-rate")).toBe(false);
    observer.record({ ...ok, failed: true, status: 500 });
    const alerta = emitted.find((e) => e.signal === "error-rate");
    expect(alerta).toBeDefined();
    expect(alerta!.detail["failed"]).toBe(1);
    expect(alerta!.detail["samples"]).toBe(READ_OBSERVABILITY.minSamples);
  });

  it("no repite la alerta de tasa dentro de la misma ventana", () => {
    const { emitted, observer } = harness();
    for (let i = 0; i < READ_OBSERVABILITY.minSamples; i++) {
      observer.record({ ...ok, failed: i === 0, status: i === 0 ? 500 : 200 });
    }
    observer.record({ ...ok, failed: true, status: 500 });
    expect(emitted.filter((e) => e.signal === "error-rate")).toHaveLength(1);
  });

  it("olvida las muestras que salieron de la ventana de 15 minutos", () => {
    const { observer, advance } = harness();
    for (let i = 0; i < READ_OBSERVABILITY.minSamples; i++) observer.record(ok);
    expect(observer.snapshot().samples).toBe(READ_OBSERVABILITY.minSamples);
    advance(READ_OBSERVABILITY.windowMs + 1);
    expect(observer.snapshot().samples).toBe(0);
  });
});
