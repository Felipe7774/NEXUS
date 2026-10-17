import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { platform, arch, cpus, totalmem } from "node:os";
import { setTimeout as pause } from "node:timers/promises";
import { localBaseUrl } from "../spike-01-integracion/metrics.mjs";
import { createSupabaseFetch } from "../../../src/lib/supabase-fetch.ts";
import { READ_CIRCUIT } from "../../../src/lib/read-circuit-breaker.ts";
import { phaseSummary, evaluate } from "./fitness.mjs";

const base = localBaseUrl(process.env.SUPABASE_URL_TEST ?? "");
const anonKey = process.env.SUPABASE_ANON_KEY_TEST;
const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY_TEST;
assert.ok(anonKey && adminKey, "Faltan claves locales de pruebas");
const outputIndex = process.argv.indexOf("--output");
assert.ok(outputIndex >= 0 && process.argv[outputIndex + 1], "Usar --output ruta.json");
const output = resolve(process.argv[outputIndex + 1]);
const users = [];
let pipeline;
let stages;
let owner;
let other;
let proxy;
let proxyUrl;
let fault = false;
let recoveryProbe = false;
let proxyAttempts = 0;
let forwarded = 0;

async function api(method, path, body, key = adminKey, token = key) {
  const response = await fetch(base + path, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`${method} ${path.split("?")[0]}: HTTP ${response.status}`);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function newUser() {
  const password = `M6-${randomUUID()}!`;
  const user = await api("POST", "/auth/v1/admin/users", {
    email: `m6-${randomUUID()}@nexo.invalid`,
    password,
    email_confirm: true,
  });
  users.push(user.id);
  const session = await api(
    "POST",
    "/auth/v1/token?grant_type=password",
    { email: user.email, password },
    anonKey,
  );
  return { id: user.id, token: session.access_token };
}

async function setup() {
  owner = await newUser();
  other = await newUser();
  [pipeline] = await api("POST", "/rest/v1/pipelines", [{ name: `m6-${randomUUID()}` }]);
  stages = await api("POST", "/rest/v1/stages", [
    { pipeline_id: pipeline.id, name: "Negociación M6", position: 0, default_probability: 70 },
    {
      pipeline_id: pipeline.id,
      name: "Propuesta enviada M6",
      position: 1,
      default_probability: 40,
    },
    { pipeline_id: pipeline.id, name: "Inicial M6", position: 2, default_probability: 10 },
  ]);
  const companies = await api(
    "POST",
    "/rest/v1/companies",
    Array.from({ length: 20 }, (_, i) => ({ name: `M6 Empresa ${i}`, owner_id: owner.id })),
  );
  for (let offset = 0; offset < 800; offset += 200) {
    await api(
      "POST",
      "/rest/v1/contacts",
      Array.from({ length: 200 }, (_, i) => ({
        first_name: `M6 Contacto ${offset + i}`,
        last_name: "Sintético",
        owner_id: owner.id,
        company_id: companies[i % 20].id,
      })),
    );
  }
  for (let offset = 0; offset < 1000; offset += 200) {
    await api(
      "POST",
      "/rest/v1/deals",
      Array.from({ length: 200 }, (_, i) => ({
        title: `M6 Oportunidad ${offset + i}`,
        amount: 1000000 + (offset + i) * 5000,
        owner_id: owner.id,
        company_id: companies[i % 20].id,
        pipeline_id: pipeline.id,
        stage_id: offset === 0 ? stages[i % 2].id : stages[2].id,
      })),
    );
  }
  for (const [table, expected] of [
    ["companies", 20],
    ["contacts", 800],
    ["deals", 1000],
  ]) {
    const rows = await api("GET", `/rest/v1/${table}?owner_id=eq.${owner.id}&select=id`);
    assert.equal(rows.length, expected, `Volumen real incorrecto: ${table}`);
  }
}

function pathFor(index) {
  const filter =
    index % 5 === 0
      ? `pipeline_id=eq.${pipeline.id}`
      : `stage_id=in.(${stages[0].id},${stages[1].id})`;
  return `/rest/v1/deals?${filter}&select=id,title,amount,stage_id`;
}

async function startProxy() {
  proxy = createServer(async (request, response) => {
    // Destination is fixed to the validated loopback stack; callers cannot select a host.
    if (request.method !== "GET" || !request.url?.startsWith("/rest/v1/deals?")) {
      response.writeHead(404).end();
      return;
    }
    proxyAttempts++;
    if (fault) {
      await pause(120);
      response
        .writeHead(503, { "Content-Type": "application/json" })
        .end('{"code":"M6_INJECTED_FAILURE","message":"Controlled dependency outage"}');
      return;
    }
    if (recoveryProbe) await pause(40);
    forwarded++;
    try {
      const upstream = await fetch(base + request.url, {
        headers: { apikey: anonKey, Authorization: request.headers.authorization ?? "" },
        signal: AbortSignal.timeout(3000),
      });
      response
        .writeHead(upstream.status, { "Content-Type": "application/json" })
        .end(await upstream.text());
    } catch {
      response
        .writeHead(502, { "Content-Type": "application/json" })
        .end('{"message":"Local upstream unavailable"}');
    }
  });
  await new Promise((resolveListen) => proxy.listen(0, "127.0.0.1", resolveListen));
  proxyUrl = `http://127.0.0.1:${proxy.address().port}`;
}

async function read(request, index, token = owner.token) {
  const start = performance.now();
  try {
    const response = await request(proxyUrl + pathFor(index), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await response.text();
    const data = JSON.parse(body);
    return {
      durationMs: performance.now() - start,
      status: response.status,
      circuitOpen: response.headers.get("X-Nexus-Circuit") === "open",
      rows: Array.isArray(data) ? data.length : null,
      bytes: Buffer.byteLength(body),
    };
  } catch {
    return {
      durationMs: performance.now() - start,
      status: 0,
      circuitOpen: false,
      rows: null,
      bytes: 0,
    };
  }
}

async function phase(request) {
  const startedAt = new Date().toISOString();
  const samples = [];
  const start = performance.now();
  const cpuStart = process.cpuUsage();
  const attemptsStart = proxyAttempts;
  const forwardedStart = forwarded;
  await Promise.all(
    Array.from({ length: 5 }, async (_, worker) => {
      for (let i = 0; i < 24; i++) {
        samples.push(await read(request, worker * 24 + i));
        await pause(20);
      }
    }),
  );
  const result = {
    startedAt,
    finishedAt: new Date().toISOString(),
    samples,
    elapsedMs: performance.now() - start,
    proxyAttempts: proxyAttempts - attemptsStart,
    forwarded: forwarded - forwardedStart,
    runnerCpuMicros: process.cpuUsage(cpuStart),
    runnerRssBytes: process.memoryUsage().rss,
  };
  result.metrics = phaseSummary(result);
  return result;
}

async function execution(mode, round) {
  fault = false;
  recoveryProbe = false;
  const request = createSupabaseFetch(anonKey, { circuitBreaker: mode === "circuit" });
  for (let n = 0; n < 2; n++) assert.equal((await read(request, n)).status, 200);
  const healthy = await phase(request);
  fault = true;
  const outage = await phase(request);
  fault = false;
  recoveryProbe = true;
  const recoveryStart = performance.now();
  await pause(1050);
  const before = proxyAttempts;
  let firstSuccessMs = null;
  const probeSamples = await Promise.all(
    Array.from({ length: 5 }, async (_, n) => {
      const sample = await read(request, n);
      if (sample.status === 200 && firstSuccessMs === null)
        firstSuccessMs = performance.now() - recoveryStart;
      return sample;
    }),
  );
  const probeAttempts = proxyAttempts - before;
  recoveryProbe = false;
  const after = await Promise.all(Array.from({ length: 5 }, (_, n) => read(request, n)));
  return {
    mode,
    round,
    healthy,
    outage,
    recovery: {
      probeAttempts,
      probeStatuses: probeSamples.map((sample) => sample.status),
      firstSuccessMs,
      afterStatuses: after.map((sample) => sample.status),
    },
  };
}

async function cleanup() {
  if (proxy) await new Promise((resolveClose) => proxy.close(resolveClose));
  if (owner) {
    await api("DELETE", `/rest/v1/deals?owner_id=eq.${owner.id}`);
    await api("DELETE", `/rest/v1/contacts?owner_id=eq.${owner.id}`);
    await api("DELETE", `/rest/v1/companies?owner_id=eq.${owner.id}`);
  }
  if (pipeline) await api("DELETE", `/rest/v1/pipelines?id=eq.${pipeline.id}`);
  for (const id of users) {
    await api("DELETE", `/rest/v1/user_roles?user_id=eq.${id}`);
    await api("DELETE", `/rest/v1/profiles?id=eq.${id}`);
    await api("DELETE", `/auth/v1/admin/users/${id}`);
  }
}

const result = {
  status: "running",
  protocol: "PLAN.md; prerregistro 5998eff",
  startedAt: new Date().toISOString(),
  sourceCommit: process.env.SPIKE_SOURCE_COMMIT ?? "NO_REGISTRADO",
  environment: {
    node: process.version,
    platform: platform(),
    arch: arch(),
    cpus: cpus().length,
    memoryBytes: totalmem(),
    workers: 5,
    perWorker: 24,
    thinkTimeMs: 20,
    injectedFailureMs: 120,
    recoveryProbeMs: 40,
    circuit: READ_CIRCUIT,
    target: "Supabase real local a través de proxy loopback controlado",
    higherLayerRetries: false,
  },
  seed: { companies: 20, contacts: 800, deals: 1000, hotDeals: 200 },
  runs: [],
  checks: {},
};
try {
  await setup();
  await startProxy();
  const otherRequest = createSupabaseFetch(anonKey);
  const isolated = await read(otherRequest, 0, other.token);
  assert.equal(isolated.status, 200);
  assert.equal(isolated.rows, 0);
  result.checks.rls = true;
  for (let round = 1; round <= 3; round++) {
    for (const mode of round % 2 ? ["baseline", "circuit"] : ["circuit", "baseline"]) {
      result.runs.push(await execution(mode, round));
    }
  }
  result.status = "passed";
} catch (error) {
  result.status = "failed";
  result.error = error.message;
  process.exitCode = 1;
} finally {
  try {
    await cleanup();
    result.cleanup = "passed";
  } catch (error) {
    result.cleanup = "failed";
    result.cleanupError = error.message;
    result.status = "failed";
    process.exitCode = 1;
  }
  result.finishedAt = new Date().toISOString();
  if (result.status === "passed") {
    try {
      result.fitness = evaluate(result);
    } catch (error) {
      result.status = "failed";
      result.fitnessError = error.message;
      process.exitCode = 1;
    }
  }
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify(result, null, 2) + "\n");
  console.log(
    JSON.stringify({
      status: result.status,
      samples: result.runs.length * 240,
      checks: result.checks,
      fitness: result.fitness,
      output,
    }),
  );
}
