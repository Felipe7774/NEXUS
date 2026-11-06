import http from "k6/http";
import { sleep } from "k6";
import exec from "k6/execution";
import { Trend, Rate, Counter } from "k6/metrics";

// Mezcla de lectura y escritura. Protocolo en PLAN.md; no modifica S11.
const levels = [5, 50, 100];
const seconds = Number(__ENV.MIX_SECONDS || 30);
// Una escritura cada N iteraciones. Entero, no fraccion: (i * 0.2) % 1 < 0.2
// da 40% por error de punto flotante, no el 20% pedido.
const writeEvery = Math.max(2, Math.round(1 / Number(__ENV.MIX_WRITE_RATIO || 0.2)));
const hotStages = (__ENV.MIX_HOT_STAGES || "").split(",").filter(Boolean);
const writeDeals = (__ENV.MIX_WRITE_DEALS || "").split(",").filter(Boolean);

const readLatency = new Trend("mix_read_latency", true);
const writeLatency = new Trend("mix_write_latency", true);
const readErrors = new Rate("mix_read_errors");
const writeErrors = new Rate("mix_write_errors");
const reads = new Counter("mix_reads");
const writes = new Counter("mix_writes");

const scenarios = {};
const thresholds = {};
levels.forEach((vus, i) => {
  scenarios["level" + vus] = {
    executor: "constant-vus",
    vus,
    duration: seconds + "s",
    startTime: i * (seconds + 5) + "s",
    gracefulStop: "3s",
    tags: { level: String(vus) },
  };
  // Resumenes etiquetados sin convertir la degradacion observada en un fallo del instrumento.
  for (const m of ["mix_read_latency", "mix_write_latency"])
    thresholds[m + "{level:" + vus + "}"] = ["p(95)>=0"];
  for (const m of ["mix_reads", "mix_writes"]) thresholds[m + "{level:" + vus + "}"] = ["count>=0"];
  for (const m of ["mix_read_errors", "mix_write_errors"])
    thresholds[m + "{level:" + vus + "}"] = ["rate>=0"];
});

export const options = {
  scenarios,
  thresholds,
  summaryTrendStats: ["avg", "min", "max", "p(95)", "p(99)"],
};

// Estado por VU: k6 da a cada VU su propia instancia del modulo.
let readsDone = 0;

const headers = () => ({
  apikey: __ENV.SUPABASE_ANON_KEY_TEST,
  Authorization: "Bearer " + __ENV.MIX_TOKEN,
});

function read() {
  // Una de cada cinco lecturas recorre el pipeline entero, como en S11. El
  // contador cuenta lecturas, no iteraciones: si contara iteraciones chocaria
  // con el modulo de la escritura y esta lectura no ocurriria nunca.
  const all = readsDone % 5 === 0;
  readsDone++;
  const filter = all
    ? "pipeline_id=eq." + __ENV.MIX_PIPELINE
    : "stage_id=in.(" + hotStages.join(",") + ")";
  const start = Date.now();
  const r = http.get(
    "http://127.0.0.1:8000/rest/v1/deals?" + filter + "&select=id,title,amount,stage_id",
    { headers: headers(), timeout: "3s", tags: { name: all ? "pipeline" : "hot", op: "read" } },
  );
  let valid = false;
  try {
    const body = r.json();
    valid =
      r.status === 200 &&
      Array.isArray(body) &&
      body.length === (all ? 1000 : 200) &&
      body.every(
        (row) =>
          typeof row.id === "string" &&
          typeof row.title === "string" &&
          typeof row.amount === "number" &&
          typeof row.stage_id === "string",
      );
  } catch {
    /* JSON invalido es un error, aunque el estado sea 200. */
  }
  readLatency.add(Date.now() - start);
  reads.add(1);
  readErrors.add(!valid);
}

function write() {
  // El destino alterna entre las dos etapas calientes: los conteos de lectura
  // no cambian, y por eso la validacion exacta de filas sigue siendo valida.
  const deal = writeDeals[(exec.vu.idInTest + exec.vu.iterationInScenario) % writeDeals.length];
  const target = hotStages[exec.vu.iterationInScenario % hotStages.length];
  const start = Date.now();
  const r = http.patch(
    "http://127.0.0.1:8000/rest/v1/deals?id=eq." + deal,
    JSON.stringify({ stage_id: target }),
    {
      headers: { ...headers(), "Content-Type": "application/json", Prefer: "return=representation" },
      timeout: "3s",
      tags: { name: "move", op: "write" },
    },
  );
  let valid = false;
  try {
    const body = r.json();
    const row = Array.isArray(body) ? body[0] : null;
    // La fila devuelta confirma el efecto: no alcanza con un 2xx.
    valid = r.status >= 200 && r.status < 300 && row != null && row.stage_id === target;
  } catch {
    /* Igual que en la lectura: cuerpo ilegible es un error. */
  }
  writeLatency.add(Date.now() - start);
  writes.add(1);
  writeErrors.add(!valid);
}

export default function () {
  // Determinista: la mezcla no depende del azar de la corrida.
  const isWrite = writeDeals.length > 0 && exec.vu.iterationInScenario % writeEvery === 0;
  if (isWrite) write();
  else read();
  sleep(0.1);
}

export function handleSummary(data) {
  return { ["/out/" + __ENV.MIX_RUN + ".json"]: JSON.stringify(data, null, 2) };
}
