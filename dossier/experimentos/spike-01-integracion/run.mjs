import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { platform, arch, cpus, totalmem } from 'node:os';
import { setTimeout as delay } from 'node:timers/promises';
import { localBaseUrl, summarize, validateEvent } from './metrics.mjs';

const base = localBaseUrl(process.env.SUPABASE_URL_TEST ?? '');
const anonKey = process.env.SUPABASE_ANON_KEY_TEST;
const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY_TEST;
assert.ok(anonKey && adminKey, 'Faltan claves del stack LOCAL de pruebas');
const outputIndex = process.argv.indexOf('--output');
assert.ok(outputIndex >= 0 && process.argv[outputIndex + 1], 'Usar --output ruta.json');
const outputPath = resolve(process.argv[outputIndex + 1]);
const delayMs = 40;
const pollMs = 20;
const checks = [];
const runs = [];
const authUserIds = [];
let user;
let other;
let pipeline;
let otherPipeline;
let deal;
let stageA;
let stageB;
let currentStage;
let receiver;
let receiverUrl;
let unavailable = false;
const receiverSecret = randomUUID();

function client(key, token = key) {
  return async (method, path, body, allowed = [200, 201, 204]) => {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: { apikey: key, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    // Never include request headers, tokens, passwords or authentication responses in errors/artifacts.
    if (!allowed.includes(response.status)) throw new Error(`${method} ${path.split('?')[0]}: HTTP ${response.status}`);
    const text = await response.text();
    return { status: response.status, data: text ? JSON.parse(text) : null };
  };
}
const admin = client(adminKey);

async function newUser() {
  const email = `m5-${randomUUID()}@nexo.invalid`;
  const password = `M5-${randomUUID()}!`;
  const created = await admin('POST', '/auth/v1/admin/users', {email, password, email_confirm: true});
  assert.ok(created.data.id);
  authUserIds.push(created.data.id);
  const signed = await client(anonKey)('POST', '/auth/v1/token?grant_type=password', {email, password});
  assert.ok(signed.data.access_token);
  return {id: created.data.id, api: client(anonKey, signed.data.access_token)};
}

async function setup() {
  // Wait for the explicit fixture's PostgREST schema-cache reload, bounded to 10 seconds.
  for (let attempt = 0; ; attempt++) {
    try { await admin('GET', '/rest/v1/m5_spike_events?select=id&limit=0'); break; }
    catch (error) { if (attempt === 19) throw error; await delay(500); }
  }
  user = await newUser();
  other = await newUser();
  const suffix = randomUUID();
  const seeded = await admin('POST', '/rest/v1/pipelines', [
    {name: `m5-primary-${suffix}`}, {name: `m5-other-${suffix}`},
  ]);
  [pipeline, otherPipeline] = seeded.data;
  const stages = await admin('POST', '/rest/v1/stages', [
    {pipeline_id: pipeline.id, name: 'M5-A', position: 0, default_probability: 10},
    {pipeline_id: pipeline.id, name: 'M5-B', position: 1, default_probability: 50},
    {pipeline_id: otherPipeline.id, name: 'M5-invalid-target', position: 0},
  ]);
  [stageA, stageB] = stages.data;
  const seededDeal = await user.api('POST', '/rest/v1/deals', {
    title: `[M5] synthetic-${suffix}`, owner_id: user.id, pipeline_id: pipeline.id, stage_id: stageA.id,
  });
  [deal] = seededDeal.data;
  currentStage = stageA.id;
  return stages.data[2];
}

async function startReceiver() {
  receiver = createServer(async (request, response) => {
    try {
      if (request.method !== 'POST' || request.url !== '/deliver' || request.headers['x-spike-token'] !== receiverSecret) {
        response.writeHead(403).end(); return;
      }
      let body = '';
      for await (const chunk of request) {
        body += chunk;
        if (body.length > 2048) { response.writeHead(413).end(); return; }
      }
      const { eventId } = JSON.parse(body);
      assert.match(eventId, /^[0-9a-f-]{36}$/);
      await delay(delayMs);
      if (unavailable) { response.writeHead(503).end(); return; }
      await user.api('POST', '/rest/v1/rpc/m5_spike_deliver', {p_event_id: eventId});
      response.writeHead(200, {'Content-Type': 'application/json'}).end('{"delivered":true}');
    } catch { response.writeHead(500).end(); }
  });
  await new Promise((done, reject) => {
    receiver.once('error', reject);
    receiver.listen(0, '127.0.0.1', done);
  });
  receiverUrl = `http://127.0.0.1:${receiver.address().port}/deliver`;
}

async function stopReceiver() {
  if (!receiver) return;
  const stopping = new Promise((done, reject) => receiver.close(error => error ? reject(error) : done()));
  receiver.closeAllConnections();
  await stopping;
  receiver = undefined;
}

async function deliver(eventId) {
  const response = await fetch(receiverUrl, {
    method: 'POST', headers: {'Content-Type':'application/json','x-spike-token':receiverSecret},
    body: JSON.stringify({eventId}), signal: AbortSignal.timeout(10000),
  });
  await response.text();
  return response.status;
}

async function command(mode, eventId = randomUUID(), target = currentStage === stageA.id ? stageB.id : stageA.id) {
  const start = performance.now();
  const result = await user.api('POST', '/rest/v1/rpc/m5_spike_move', {
    p_deal_id: deal.id, p_stage_id: target, p_mode: mode, p_event_id: eventId,
  });
  validateEvent(result.data);
  assert.equal(result.data.owner_id, user.id);
  currentStage = target;
  const status = mode === 'sync' ? await deliver(eventId) : 202;
  return {eventId, target, mode, status, start, ackMs: performance.now() - start};
}

async function eventState(eventId) {
  const events = await user.api('GET', `/rest/v1/m5_spike_events?id=eq.${eventId}&select=id,delivered_at`);
  const activities = await user.api('GET', `/rest/v1/activities?id=eq.${eventId}&select=id,deal_id,created_by`);
  assert.equal(events.data.length, 1);
  return {event: events.data[0], activities: activities.data};
}

async function sample(mode) {
  const op = await command(mode);
  assert.equal(op.status, mode === 'sync' ? 200 : 202);
  if (mode === 'async') {
    // Controlled consumer: starts only after acceptance, not a claimed production broker.
    await delay(pollMs);
    assert.equal(await deliver(op.eventId), 200);
  }
  const completionMs = performance.now() - op.start;
  const state = await eventState(op.eventId);
  assert.equal(state.activities.length, 1);
  assert.equal(state.activities[0].deal_id, deal.id);
  assert.equal(state.activities[0].created_by, user.id);
  assert.ok(state.event.delivered_at);
  const current = await user.api('GET', `/rest/v1/deals?id=eq.${deal.id}&select=stage_id,probability`);
  assert.equal(current.data[0].stage_id, op.target);
  assert.equal(current.data[0].probability, op.target === stageA.id ? 10 : 50);
  return {ackMs: op.ackMs, completionMs, windowMs: mode === 'async' ? completionMs - op.ackMs : 0};
}

async function faults(invalidStage) {
  for (const mode of ['sync','async']) {
    unavailable = true;
    const op = await command(mode);
    assert.equal(op.status, mode === 'sync' ? 503 : 202);
    if (mode === 'async') assert.equal(await deliver(op.eventId), 503);
    const pending = await eventState(op.eventId);
    assert.equal(pending.event.delivered_at, null);
    assert.equal(pending.activities.length, 0);
    const historyBefore = await user.api('GET', `/rest/v1/deal_stage_history?deal_id=eq.${deal.id}&select=id`);
    // Request retry reuses its event ID and must not apply the stage change twice.
    await command(mode, op.eventId, op.target);
    const historyAfter = await user.api('GET', `/rest/v1/deal_stage_history?deal_id=eq.${deal.id}&select=id`);
    assert.equal(historyBefore.data.length, historyAfter.data.length);
    await stopReceiver();
    unavailable = false;
    await startReceiver();
    // Rediscover pending work from PostgreSQL after receiver restart; no in-memory queue.
    const persisted = await user.api('GET', `/rest/v1/m5_spike_events?id=eq.${op.eventId}&delivered_at=is.null&select=id`);
    assert.equal(persisted.data.length, 1);
    assert.equal(await deliver(persisted.data[0].id), 200);
    assert.equal(await deliver(persisted.data[0].id), 200);
    const recovered = await eventState(op.eventId);
    assert.equal(recovered.activities.length, 1);
    checks.push({name: `${mode}: caida, reintento de comando, reinicio y entrega duplicada`, passed: true,
      initialStatus: op.status, activityCountAfterDuplicate: recovered.activities.length});
  }

  const deniedId = randomUUID();
  const before = currentStage;
  const invalid = await user.api('POST', '/rest/v1/rpc/m5_spike_move', {
    p_deal_id: deal.id, p_stage_id: invalidStage.id, p_mode:'async', p_event_id:deniedId,
  }, [400]);
  assert.equal(invalid.status, 400);
  const absent = await user.api('GET', `/rest/v1/m5_spike_events?id=eq.${deniedId}&select=id`);
  const unchanged = await user.api('GET', `/rest/v1/deals?id=eq.${deal.id}&select=stage_id`);
  assert.equal(absent.data.length, 0);
  assert.equal(unchanged.data[0].stage_id, before);
  checks.push({name:'etapa de otro pipeline: rechazo sin cambio ni evento', passed:true});

  const foreignId = randomUUID();
  await other.api('POST','/rest/v1/rpc/m5_spike_move', {
    p_deal_id:deal.id,p_stage_id:stageA.id,p_mode:'async',p_event_id:foreignId,
  }, [403]);
  const foreignEvents = await other.api('GET','/rest/v1/m5_spike_events?select=id');
  assert.equal(foreignEvents.data.length, 0);
  const anyEvent = await user.api('GET','/rest/v1/m5_spike_events?select=id&limit=1');
  await other.api('POST','/rest/v1/rpc/m5_spike_deliver',{p_event_id:anyEvent.data[0].id},[403]);
  const deniedAfter = await user.api('GET', `/rest/v1/m5_spike_events?id=eq.${foreignId}&select=id`);
  assert.equal(deniedAfter.data.length, 0);
  checks.push({name:'otro vendedor no mueve la oportunidad, no ve ni entrega eventos',passed:true});

  const history = await user.api('GET', `/rest/v1/deal_stage_history?deal_id=eq.${deal.id}&select=changed_by,to_stage_id`);
  assert.ok(history.data.length > 1);
  assert.ok(history.data.every(row => row.changed_by === user.id));
  checks.push({name:'triggers reales conservan probabilidad e historial con identidad',passed:true});
}

async function cleanup() {
  await stopReceiver();
  if (deal) await admin('DELETE',`/rest/v1/deals?id=eq.${deal.id}`);
  for (const p of [pipeline,otherPipeline].filter(Boolean)) await admin('DELETE',`/rest/v1/pipelines?id=eq.${p.id}`);
  for (const id of authUserIds) {
    await admin('DELETE',`/rest/v1/user_roles?user_id=eq.${id}`);
    await admin('DELETE',`/rest/v1/profiles?id=eq.${id}`);
    await admin('DELETE',`/auth/v1/admin/users/${id}`);
  }
}

const result = {
  status:'running', protocol:'PLAN.md; preregistro e348616', startedAt:new Date().toISOString(),
  sourceCommit:process.env.GITHUB_SHA ?? process.env.SPIKE_SOURCE_COMMIT ?? 'NO_REGISTRADO',
  environment:{node:process.version,platform:platform(),arch:arch(),cpus:cpus().length,memoryBytes:totalmem(),
    target:'Supabase local en loopback',receiverDelayMs:delayMs,consumerDelayMs:pollMs,concurrency:1,
    warmupPerMode:2,runsPerMode:3,samplesPerRun:8},
  runs,checks,
};
try {
  const invalidStage = await setup();
  await startReceiver();
  for (const mode of ['sync','async']) for (let n=0;n<2;n++) await sample(mode);
  for (let round=1;round<=3;round++) {
    for (const mode of round % 2 ? ['sync','async'] : ['async','sync']) {
      const start = performance.now();
      const samples=[];
      for(let n=0;n<8;n++) samples.push(await sample(mode));
      runs.push({round,mode,samples,elapsedMs:performance.now()-start});
    }
  }
  await faults(invalidStage);
  result.summary=summarize(runs);
  result.hypothesisH1=result.summary.async.medianP95AckMs < result.summary.sync.medianP95AckMs ? 'confirmada en este entorno controlado' : 'refutada en este entorno controlado';
  result.status='passed';
} catch (error) {
  result.status='failed';
  result.error=error.message;
  process.exitCode=1;
} finally {
  try { await cleanup(); result.cleanup='passed'; }
  catch (error) { result.cleanup='failed'; result.cleanupError=error.message; result.status='failed'; process.exitCode=1; }
  result.finishedAt=new Date().toISOString();
  await mkdir(dirname(outputPath),{recursive:true});
  await writeFile(outputPath,JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({status:result.status,checks:checks.length,summary:result.summary,hypothesisH1:result.hypothesisH1,output:outputPath}));
}
