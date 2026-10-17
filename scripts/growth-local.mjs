import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { delimiter, join } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as pause } from "node:timers/promises";

const root = fileURLToPath(new URL("../", import.meta.url));
const stack = join(root, ".docker", "growth-stack");
const output = join(root, "artifacts", "growth");
const project = "nexus-growth-tests";
const k6 = "grafana/k6:2.3.0";
const secrets = new Set();
const seconds = Number(process.env.GROWTH_SECONDS || 30);
assert.ok(Number.isInteger(seconds) && seconds >= 3 && seconds <= 600);
if (process.platform === "win32")
  process.env.PATH =
    join(process.env.LOCALAPPDATA, "Programs", "DockerDesktop", "resources", "bin") +
    delimiter +
    process.env.PATH;
const redact = (value) =>
  [...secrets].reduce((s, key) => s.split(key).join("[REDACTED]"), String(value));
async function run(command, args, { env, quiet = true } = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(command, args, {
      cwd: root,
      env: { ...process.env, ...env },
      windowsHide: true,
    });
    let out = "",
      err = "";
    p.stdout.on("data", (d) => {
      out += d;
    });
    p.stderr.on("data", (d) => {
      err += d;
    });
    p.on("error", reject);
    p.on("close", (code) => {
      if (!quiet) console.log(redact(out + err));
      code === 0
        ? resolve(out.trim())
        : reject(new Error(redact(`${command}: ${code} ${err.slice(-1800)}`)));
    });
  });
}
const cli = (args) =>
  run(process.execPath, [
    join(root, "node_modules", "supabase", "dist", "supabase.js"),
    ...args,
    "--workdir",
    stack,
  ]);
let status, owner, pipeline;
const users = [];
async function api(method, path, body, key = status.SERVICE_ROLE_KEY, token = key) {
  const r = await fetch(status.API_URL + path, {
    method,
    headers: {
      apikey: key,
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  assert.ok(r.ok, `${method} ${path.split("?")[0]}: HTTP ${r.status}`);
  const text = await r.text();
  return text ? JSON.parse(text) : null;
}
async function user() {
  const password = randomUUID() + "!";
  const u = await api("POST", "/auth/v1/admin/users", {
    email: "growth-" + randomUUID() + "@nexo.invalid",
    password,
    email_confirm: true,
  });
  users.push(u.id);
  const session = await api(
    "POST",
    "/auth/v1/token?grant_type=password",
    { email: u.email, password },
    status.ANON_KEY,
  );
  secrets.add(session.access_token);
  return { id: u.id, token: session.access_token };
}
async function seed() {
  owner = await user();
  const other = await user();
  [pipeline] = await api("POST", "/rest/v1/pipelines", [{ name: "Growth S11 " + randomUUID() }]);
  const stages = await api(
    "POST",
    "/rest/v1/stages",
    [0, 1, 2].map((i) => ({
      pipeline_id: pipeline.id,
      name: "Growth " + i,
      position: i,
      default_probability: 30,
    })),
  );
  const companies = await api(
    "POST",
    "/rest/v1/companies",
    Array.from({ length: 20 }, (_, i) => ({ name: "Growth " + i, owner_id: owner.id })),
  );
  for (let offset = 0; offset < 800; offset += 200)
    await api(
      "POST",
      "/rest/v1/contacts",
      Array.from({ length: 200 }, (_, i) => ({
        first_name: "Growth " + (offset + i),
        last_name: "Test",
        owner_id: owner.id,
        company_id: companies[i % 20].id,
      })),
    );
  for (let offset = 0; offset < 1000; offset += 200)
    await api(
      "POST",
      "/rest/v1/deals",
      Array.from({ length: 200 }, (_, i) => ({
        title: "Growth " + (offset + i),
        amount: 1000000,
        owner_id: owner.id,
        pipeline_id: pipeline.id,
        stage_id: offset === 0 ? stages[i % 2].id : stages[2].id,
        company_id: companies[i % 20].id,
      })),
    );
  for (const [table, n] of [
    ["companies", 20],
    ["contacts", 800],
    ["deals", 1000],
  ]) {
    assert.equal(
      (await api("GET", `/rest/v1/${table}?select=id`, undefined, status.ANON_KEY, owner.token))
        .length,
      n,
    );
    assert.equal(
      (await api("GET", `/rest/v1/${table}?select=id`, undefined, status.ANON_KEY, other.token))
        .length,
      0,
    );
  }
  return stages;
}
const result = {
  status: "running",
  startedAt: new Date().toISOString(),
  seconds,
  profile: seconds === 30 ? "local-preregistered" : "custom",
  warmup: "warmup",
  validRuns: [],
  resources: [],
};
let started = false;
try {
  await mkdir(join(stack, "supabase"), { recursive: true });
  await mkdir(output, { recursive: true });
  const config = (await readFile(join(root, "supabase", "config.toml"), "utf8")).replace(
    /^project_id\s*=.*$/m,
    `project_id = "${project}"`,
  );
  assert.ok(!/^\[(api|db)\]/m.test(config));
  await writeFile(
    join(stack, "supabase", "config.toml"),
    config + "\n[api]\nport = 56321\n\n[db]\nport = 56322\nshadow_port = 56320\n",
  );
  await cp(join(root, "supabase", "migrations"), join(stack, "supabase", "migrations"), {
    recursive: true,
  });
  result.sourceCommit = await run("git", ["rev-parse", "HEAD"]);
  result.workingTreeDirty = Boolean(
    await run("git", ["status", "--porcelain", "--untracked-files=no"]),
  );
  result.docker = JSON.parse(
    await run("docker", ["info", "--format", '{"cpus":{{.NCPU}},"memory":{{.MemTotal}}}']),
  );
  console.log("Iniciando laboratorio de crecimiento aislado...");
  started = true;
  await cli([
    "start",
    "-x",
    "studio,edge-runtime,vector,logflare,imgproxy,mailpit,realtime,storage-api,postgres-meta,supavisor",
  ]);
  status = JSON.parse(await cli(["status", "-o", "json"]));
  assert.equal(new URL(status.API_URL).hostname, "127.0.0.1");
  secrets.add(status.ANON_KEY);
  secrets.add(status.SERVICE_ROLE_KEY);
  const stages = await seed();
  result.rls = "passed";
  await run("docker", ["pull", k6]);
  result.k6Image = await run("docker", ["image", "inspect", "--format", "{{.Id}}", k6]);
  for (const name of ["warmup", "run-1", "run-2", "run-3"]) {
    console.log(`k6 ${name}: 5, 50, 100, 150, 200 VUs; ${seconds}s por escalón`);
    const env = {
      GROWTH_SECONDS: String(seconds),
      GROWTH_RUN: name,
      GROWTH_PIPELINE: pipeline.id,
      GROWTH_HOT_STAGES: stages
        .slice(0, 2)
        .map((s) => s.id)
        .join(","),
      GROWTH_TOKEN: owner.token,
      SUPABASE_ANON_KEY_TEST: status.ANON_KEY,
    };
    const container = "nexus-growth-generator";
    const args = [
      "run",
      "--rm",
      "--name",
      container,
      "--network",
      `container:supabase_kong_${project}`,
      "--mount",
      `type=bind,source=${join(root, "experimentos", "crecimiento-S11")},target=/scripts,readonly`,
      "--mount",
      `type=bind,source=${output},target=/out`,
    ];
    // On Linux the checkout/output belongs to the host runner, while k6 defaults
    // to UID 12345. Match the host owner instead of broadening directory modes.
    if (process.platform !== "win32" && process.getuid && process.getgid)
      args.push("--user", `${process.getuid()}:${process.getgid()}`);
    for (const key of Object.keys(env)) args.push("-e", key);
    let active = true;
    const measurement = run(
      "docker",
      [...args, k6, "run", "--no-usage-report", "/scripts/load.js"],
      { env, quiet: false },
    );
    const sampler = (async () => {
      while (active) {
        try {
          const stats = await run("docker", [
            "stats",
            "--no-stream",
            "--format",
            "{{json .}}",
            container,
            ...["db", "rest", "kong", "auth"].map((s) => `supabase_${s}_${project}`),
          ]);
          result.resources.push({
            run: name,
            at: new Date().toISOString(),
            containers: stats.split(/\r?\n/).filter(Boolean).map(JSON.parse),
          });
        } catch {
          /* Initial/final sample can race container lifecycle. */
        }
        if (active) await pause(1000);
      }
    })();
    try {
      await measurement;
    } finally {
      active = false;
      await sampler;
    }
    const summary = JSON.parse(await readFile(join(output, name + ".json"), "utf8"));
    for (const level of [5, 50, 100, 150, 200])
      assert.ok(
        summary.metrics[`crm_samples{level:${level}}`]?.values.count > 0,
        "Sin muestras por escalón",
      );
    if (name !== "warmup") result.validRuns.push(name);
    await pause(5000);
  }
  result.status = "passed";
} catch (e) {
  result.status = "failed";
  result.error = redact(e.message);
  process.exitCode = 1;
  console.error(result.error);
} finally {
  if (started) {
    // The whole named, disposable stack is removed; development volumes are untouched.
    try {
      await cli(["stop", "--no-backup"]);
      result.cleanup = "passed";
    } catch (e) {
      result.cleanup = "failed";
      result.status = "failed";
      process.exitCode = 1;
      console.error(redact(e.message));
    }
  }
  result.finishedAt = new Date().toISOString();
  await mkdir(output, { recursive: true });
  await writeFile(join(output, "environment.json"), JSON.stringify(result, null, 2) + "\n");
  console.log("Crecimiento: " + result.status + "; artifacts/growth/environment.json");
}
