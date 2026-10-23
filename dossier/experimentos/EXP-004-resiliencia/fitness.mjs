import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { percentile, median } from "../spike-01-integracion/metrics.mjs";

export function phaseSummary(phase) {
  assert.equal(phase.samples.length, 120, "Cada fase exige 120 operaciones");
  assert.ok(phase.elapsedMs > 0 && Number.isFinite(phase.elapsedMs));
  const successful = phase.samples.filter((sample) => sample.status === 200);
  return {
    samples: phase.samples.length,
    p95Ms: percentile(
      phase.samples.map((sample) => sample.durationMs),
      0.95,
    ),
    p99Ms: percentile(
      phase.samples.map((sample) => sample.durationMs),
      0.99,
    ),
    errorRate: 1 - successful.length / phase.samples.length,
    successfulOpsPerSecond: successful.length / (phase.elapsedMs / 1000),
    attemptedOpsPerSecond: phase.samples.length / (phase.elapsedMs / 1000),
    fastRejected: phase.samples.filter((sample) => sample.circuitOpen).length,
    proxyAttempts: phase.proxyAttempts,
    forwarded: phase.forwarded,
  };
}

export function evaluate(result) {
  assert.equal(result.status, "passed", "Experimento no completado");
  assert.equal(result.cleanup, "passed", "La limpieza debe completarse");
  assert.equal(result.runs.length, 6, "Se requieren seis ejecuciones pareadas");
  assert.deepEqual(result.seed, { companies: 20, contacts: 800, deals: 1000, hotDeals: 200 });
  assert.equal(result.checks.rls, true, "El usuario ajeno debe ver cero filas");
  const summary = {};
  for (const mode of ["baseline", "circuit"]) {
    const runs = result.runs.filter((run) => run.mode === mode);
    assert.deepEqual(runs.map((run) => run.round).sort(), [1, 2, 3]);
    const healthy = [];
    const outage = [];
    for (const run of runs) {
      const h = phaseSummary(run.healthy);
      const o = phaseSummary(run.outage);
      assert.equal(h.errorRate, 0, "El estado sano debe tener cero errores");
      assert.ok(h.p95Ms < 2000 && h.p99Ms < 2500, "Presupuesto de latencia sano excedido");
      assert.equal(h.proxyAttempts, 120);
      assert.equal(h.forwarded, 120);
      assert.equal(run.healthy.samples.filter((sample) => sample.rows === 1000).length, 24);
      assert.equal(run.healthy.samples.filter((sample) => sample.rows === 200).length, 96);
      assert.ok(run.outage.samples.every((sample) => sample.status === 503));
      assert.equal(o.errorRate, 1, "Una dependencia caída no se presenta como éxito");
      assert.equal(o.successfulOpsPerSecond, 0);
      assert.equal(o.forwarded, 0, "El fallo se inyecta antes de Supabase");
      if (mode === "baseline") assert.equal(o.proxyAttempts, 120);
      else {
        const paired = result.runs.find(
          (other) => other.mode === "baseline" && other.round === run.round,
        );
        assert.ok(paired, "Falta base pareada");
        assert.ok(
          o.proxyAttempts <= paired.outage.proxyAttempts * 0.2,
          "H1: reducción menor al 80%",
        );
        assert.equal(
          o.fastRejected + o.proxyAttempts,
          120,
          "Todos los intentos deben contabilizarse",
        );
      }
      const probeAccepted = mode === "circuit" ? 1 : 5;
      assert.equal(run.recovery.probeAttempts, probeAccepted);
      assert.equal(
        run.recovery.probeStatuses.filter((status) => status === 200).length,
        probeAccepted,
      );
      assert.ok(run.recovery.afterStatuses.every((status) => status === 200));
      assert.equal(run.recovery.afterStatuses.length, 5);
      assert.ok(
        Number.isFinite(run.recovery.firstSuccessMs) && run.recovery.firstSuccessMs >= 1050,
      );
      healthy.push(h);
      outage.push(o);
    }
    const aggregate = (phases) =>
      Object.fromEntries(
        [
          "p95Ms",
          "p99Ms",
          "errorRate",
          "successfulOpsPerSecond",
          "attemptedOpsPerSecond",
          "proxyAttempts",
          "forwarded",
          "fastRejected",
        ].map((key) => [key, median(phases.map((phase) => phase[key]))]),
      );
    summary[mode] = { healthy: aggregate(healthy), outage: aggregate(outage) };
  }
  return {
    passed: true,
    healthyBudget: true,
    reducedAttempts: true,
    singleProbe: true,
    truthfulErrors: true,
    rls: true,
    summary,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    assert.ok(process.argv[2], "Usar: node fitness.mjs ruta/results.json");
    const result = JSON.parse(await readFile(process.argv[2], "utf8"));
    console.log(JSON.stringify(evaluate(result)));
  } catch (error) {
    console.error(`Fitness M6: ${error.message}`);
    process.exitCode = 1;
  }
}
