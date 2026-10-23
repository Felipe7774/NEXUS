import assert from "node:assert/strict";
import { readFile, writeFile, mkdir, cp } from "node:fs/promises";
import { resolve, join } from "node:path";

const source = resolve(process.argv[2] || "artifacts/growth");
const target = resolve(
  process.argv[3] || "experimentos/crecimiento-S11/resultados/local-2026-10-17",
);
const env = JSON.parse(await readFile(join(source, "environment.json"), "utf8"));
assert.equal(env.status, "passed");
assert.equal(env.cleanup, "passed");
assert.equal(env.validRuns.length, 3);
const runs = await Promise.all(
  env.validRuns.map(async (name) => ({
    name,
    data: JSON.parse(await readFile(join(source, name + ".json"), "utf8")),
  })),
);
const median = (values) => [...values].sort((a, b) => a - b)[1];
const levels = [5, 50, 100, 150, 200].map((vus) => {
  const rows = runs.map(({ name, data }) => {
    const metric = (n) => data.metrics[`${n}{level:${vus}}`].values;
    return {
      run: name,
      p95: metric("crm_latency")["p(95)"],
      p99: metric("crm_latency")["p(99)"],
      errorRate: metric("crm_errors").rate,
      samples: metric("crm_samples").count,
      useful: metric("crm_useful").count,
      // Counts can include up to 3 s graceful completion after each 30 s plateau.
      usefulPerScheduledSecond: metric("crm_useful").count / env.seconds,
    };
  });
  return {
    vus,
    runs: rows,
    p95: median(rows.map((r) => r.p95)),
    p99: median(rows.map((r) => r.p99)),
    errorRate: median(rows.map((r) => r.errorRate)),
    usefulPerScheduledSecond: median(rows.map((r) => r.usefulPerScheduledSecond)),
    violations: rows.filter((r) => r.p95 >= 2000 || r.errorRate >= 0.01).length,
  };
});
const resources = {};
for (const sample of env.resources)
  for (const c of sample.containers) {
    const row = (resources[c.Name] ??= { maxObservedCpuPercent: 0, lastMemory: "", samples: 0 });
    row.maxObservedCpuPercent = Math.max(row.maxObservedCpuPercent, parseFloat(c.CPUPerc));
    row.lastMemory = c.MemUsage;
    row.samples++;
  }
const result = {
  protocol: "docs/apuesta-crecimiento-S11.md; e2dc488",
  sourceCommit: env.sourceCommit,
  seconds: env.seconds,
  warmupExcluded: true,
  levels,
  firstViolation: levels.find((r) => r.violations >= 2)?.vus ?? null,
  predictionVus: 150,
  predictionConfirmed: levels.find((r) => r.violations >= 2)?.vus === 150,
  resources,
  docker: env.docker,
  limits: [
    "Laboratorio local, modelo cerrado; no equivale a capacidad de producción",
    "CPU y memoria compartidas con el generador y herramientas de desarrollo del mismo host",
    "No se instrumentaron esperas del pool ni pg_stat_activity; causa exacta no identificada",
    "Throughput útil dividido por duración programada; graceful stop puede añadir hasta 3 s",
    "Docker stats son muestras, no picos reales ni prueba suficiente para excluir un límite del generador",
  ],
};
await mkdir(target, { recursive: true });
for (const name of ["warmup.json", "run-1.json", "run-2.json", "run-3.json", "environment.json"])
  await cp(join(source, name), join(target, name));
await writeFile(join(target, "summary.json"), JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result, null, 2));
