import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { cp, mkdir, readFile, writeFile, access, rm } from "node:fs/promises";
import { delimiter, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { localBaseUrl } from "../dossier/experimentos/spike-01-integracion/metrics.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const local = join(root, ".docker");
const testRoot = join(local, "test-stack");
const artifacts = join(root, "artifacts", "docker");
const testProject = "nexus-docker-tests";
const image = "nexus-local:test";
const exclude =
  "studio,edge-runtime,vector,logflare,imgproxy,mailpit,realtime,storage-api,postgres-meta,supavisor";
const cli = join(root, "node_modules", "supabase", "dist", "supabase.js");
const secrets = new Set();

if (process.platform === "win32" && process.env.LOCALAPPDATA) {
  // Codex/terminal sessions opened before Docker was installed have an old PATH.
  process.env.PATH =
    join(process.env.LOCALAPPDATA, "Programs", "DockerDesktop", "resources", "bin") +
    delimiter +
    process.env.PATH;
}

function redact(value) {
  let text = String(value);
  for (const secret of secrets) text = text.split(secret).join("[LOCAL_KEY_REDACTED]");
  return text
    .replace(
      /("(?:JWT_SECRET|SECRET_KEY|SERVICE_ROLE_KEY|ANON_KEY|PUBLISHABLE_KEY|DB_URL)"\s*:\s*")[^"]*(")/g,
      "$1[LOCAL_SECRET_REDACTED]$2",
    )
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "[LOCAL_JWT_REDACTED]")
    .replace(/sb_(?:secret|publishable)_[A-Za-z0-9_-]+/g, "[LOCAL_KEY_REDACTED]");
}

function run(command, args, { input, env, quiet = false } = {}) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env: { ...process.env, ...env },
      shell: false,
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (data) => {
      stdout += data;
    });
    child.stderr.on("data", (data) => {
      stderr += data;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      const output = redact(stdout + stderr);
      if (!quiet && output.trim()) console.log(output.trim());
      if (code !== 0)
        reject(
          new Error(`${command} ${args[0]} terminó con código ${code}: ${output.slice(-3500)}`),
        );
      else resolveRun(stdout.trim());
    });
    child.stdin.on("error", () => {});
    child.stdin.end(input);
  });
}

const supabase = (args, workdir = root) =>
  run(process.execPath, [cli, ...args, "--workdir", workdir], { quiet: true });
const compose = (args) => run("docker", ["compose", "--env-file", join(local, "app.env"), ...args]);

async function stackStatus(workdir) {
  const status = JSON.parse(await supabase(["status", "-o", "json"], workdir));
  localBaseUrl(status.API_URL);
  assert.ok(status.ANON_KEY && status.SERVICE_ROLE_KEY, "Faltan claves del stack local");
  secrets.add(status.ANON_KEY);
  secrets.add(status.SERVICE_ROLE_KEY);
  return status;
}

async function up() {
  console.log("Iniciando Supabase local en Docker (migraciones del repositorio)...");
  await supabase(["start", "-x", exclude]);
  const status = await stackStatus(root);
  const api = new URL(status.API_URL);
  const serverUrl = `http://host.docker.internal:${api.port}`;
  const settings = {
    VITE_SUPABASE_URL: status.API_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: status.ANON_KEY,
    SUPABASE_URL: serverUrl,
    SUPABASE_PUBLISHABLE_KEY: status.ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: status.SERVICE_ROLE_KEY,
  };
  await mkdir(local, { recursive: true });
  await writeFile(
    join(local, "app.env"),
    Object.entries(settings)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n") + "\n",
    { mode: 0o600 },
  );
  console.log(
    "Construyendo y levantando NEXUS; las claves quedan en .docker/app.env, fuera de Git y de la imagen.",
  );
  await compose(["up", "--build", "--detach", "--wait", "app"]);
  const response = await fetch("http://127.0.0.1:3000/auth", {
    signal: AbortSignal.timeout(15000),
  });
  assert.equal(response.status, 200, "La página de acceso debe responder HTTP 200");
  console.log("NEXUS disponible en http://localhost:3000 (Supabase local en Docker).");
}

async function test() {
  await mkdir(artifacts, { recursive: true });
  for (const filename of ["vitest.json", "spike.json", "summary.json"]) {
    await rm(join(artifacts, filename), { force: true });
  }
  await mkdir(join(testRoot, "supabase"), { recursive: true });
  // A dedicated local project keeps laboratory RPCs and synthetic users away from development data.
  const config = (await readFile(join(root, "supabase", "config.toml"), "utf8")).replace(
    /^project_id\s*=.*$/m,
    `project_id = "${testProject}"`,
  );
  assert.ok(config.includes(`project_id = "${testProject}"`));
  assert.ok(
    !/^\[(api|db)\]/m.test(config),
    "Actualizar puertos del runner si config.toml ya declara api/db",
  );
  await writeFile(
    join(testRoot, "supabase", "config.toml"),
    config + "\n[api]\nport = 55321\n\n[db]\nport = 55322\nshadow_port = 55320\n",
  );
  const testMigrations = resolve(testRoot, "supabase", "migrations");
  assert.equal(testMigrations, join(local, "test-stack", "supabase", "migrations"));
  await rm(testMigrations, { recursive: true, force: true });
  await cp(join(root, "supabase", "migrations"), testMigrations, {
    recursive: true,
  });
  const summary = {
    status: "running",
    startedAt: new Date().toISOString(),
    sourceCommit: await run("git", ["rev-parse", "HEAD"], { quiet: true }),
    workingTreeDirty: Boolean(
      await run("git", ["status", "--porcelain", "--untracked-files=no"], { quiet: true }),
    ),
    docker: JSON.parse(
      await run("docker", ["version", "--format", "{{json .Server}}"], { quiet: true }),
    ),
    supabaseCli: await supabase(["--version"]),
    testProject,
    checks: [],
  };
  let started = false;
  try {
    console.log("Levantando un Supabase Docker separado para las pruebas (puertos 55321/55322)...");
    started = true;
    await supabase(["start", "-x", exclude], testRoot);
    const status = await stackStatus(testRoot);
    const db = `supabase_db_${testProject}`;
    const gateway = `supabase_kong_${testProject}`;
    for (const container of [db, gateway]) {
      const label = await run(
        "docker",
        ["inspect", "--format", '{{index .Config.Labels "com.supabase.cli.project"}}', container],
        { quiet: true },
      );
      assert.equal(label, testProject, "El contenedor debe pertenecer al proyecto de pruebas");
    }
    await run(
      "docker",
      ["exec", "-i", db, "psql", "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1"],
      {
        input: await readFile(
          join(root, "dossier", "experimentos", "spike-01-integracion", "fixture.sql"),
        ),
        quiet: true,
      },
    );
    console.log("Construyendo imagen de pruebas Linux con npm ci...");
    await run("docker", ["build", "--target", "test", "-t", image, "."]);
    summary.imageId = await run("docker", ["image", "inspect", "--format", "{{.Id}}", image], {
      quiet: true,
    });
    // Share only the disposable gateway's network namespace: 127.0.0.1:8000 stays local.
    // No Docker socket, host credentials or repository .env files enter the test container.
    const testEnv = {
      SUPABASE_URL_TEST: "http://127.0.0.1:8000",
      SUPABASE_ANON_KEY_TEST: status.ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY_TEST: status.SERVICE_ROLE_KEY,
      SPIKE_SOURCE_COMMIT: summary.sourceCommit,
      VITE_SUPABASE_URL: "http://127.0.0.1:8000",
      VITE_SUPABASE_PUBLISHABLE_KEY: status.ANON_KEY,
    };
    const base = [
      "run",
      "--rm",
      "--network",
      `container:${gateway}`,
      "--mount",
      `type=bind,source=${artifacts},target=/app/artifacts/docker`,
    ];
    for (const name of Object.keys(testEnv)) base.push("-e", name);
    async function check(name, args) {
      console.log(`Ejecutando ${name} dentro de Docker...`);
      const output = await run("docker", [...base, image, ...args], { env: testEnv });
      await writeFile(join(artifacts, `${name}.log`), redact(output) + "\n");
      summary.checks.push({ name, status: "passed" });
    }
    await check("unitarias-y-rls", [
      "npx",
      "--no-install",
      "vitest",
      "run",
      "--reporter=default",
      "--reporter=json",
      "--outputFile=artifacts/docker/vitest.json",
    ]);
    await check("metricas-spike", ["npm", "run", "test:spike-m5"]);
    await check("spike-integracion", [
      "npm",
      "run",
      "spike:m5",
      "--",
      "--output",
      "artifacts/docker/spike.json",
    ]);
    await check("compilacion", ["npm", "run", "build"]);
    const vitest = JSON.parse(await readFile(join(artifacts, "vitest.json"), "utf8"));
    summary.vitest = {
      passed: vitest.numPassedTests,
      failed: vitest.numFailedTests,
      pending: vitest.numPendingTests,
    };
    const spike = JSON.parse(await readFile(join(artifacts, "spike.json"), "utf8"));
    assert.equal(spike.status, "passed");
    assert.equal(spike.cleanup, "passed");
    assert.equal(summary.vitest.pending, 0, "Las pruebas RLS deben ejecutarse, sin saltarse");
    summary.spike = {
      status: spike.status,
      samples: spike.runs.reduce((n, round) => n + round.samples.length, 0),
      checks: spike.checks.length,
      cleanup: spike.cleanup,
    };
    summary.status = "passed";
  } catch (error) {
    summary.status = "failed";
    summary.error = redact(error.message);
    throw error;
  } finally {
    if (started) {
      try {
        await supabase(["stop", "--no-backup"], testRoot);
        summary.testStackCleanup = "passed";
      } catch (error) {
        summary.testStackCleanup = "failed";
        summary.status = "failed";
        process.exitCode = 1;
        console.error(redact(error.message));
      }
    }
    summary.finishedAt = new Date().toISOString();
    await writeFile(join(artifacts, "summary.json"), JSON.stringify(summary, null, 2) + "\n");
    console.log(
      `Resultado: ${summary.status}. Evidencia sin claves: artifacts/docker/summary.json`,
    );
  }
}

try {
  await access(cli);
  await run("docker", ["info", "--format", "{{.OSType}}"], { quiet: true });
  const command = process.argv[2];
  if (command === "up") await up();
  else if (command === "test") await test();
  else if (command === "down") {
    await compose(["down"]);
    await supabase(["stop"]);
    console.log("NEXUS detenido; se conservan los datos locales de desarrollo.");
  } else throw new Error("Usar: node scripts/docker-local.mjs up|test|down");
} catch (error) {
  console.error(redact(error.message));
  process.exitCode = 1;
}
