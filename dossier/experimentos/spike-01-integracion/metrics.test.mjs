import assert from 'node:assert/strict';
import { test } from 'node:test';
import { localBaseUrl, median, percentile, summarize, validateEvent } from './metrics.mjs';

test('rechaza destinos cloud, credenciales y URLs que no son bases loopback', () => {
  for (const url of ['https://example.supabase.co', 'http://127.0.0.1.evil.test',
    'http://user:pass@localhost', 'http://localhost/rest/v1', 'http://localhost/?token=secret']) {
    assert.throws(() => localBaseUrl(url));
  }
  assert.equal(localBaseUrl('http://127.0.0.1:54321'), 'http://127.0.0.1:54321');
});

test('nearest-rank y mediana conservan extremos y no mutan los datos', () => {
  const values = [8, 1, 2, 3, 4, 5, 6, 7];
  assert.equal(percentile(values, 0.95), 8);
  assert.equal(median(values), 4.5);
  assert.equal(values[0], 8);
  assert.throws(() => percentile([], 0.95));
  assert.throws(() => percentile([NaN], 0.95));
});

test('resume medianas de p95 por corrida y exige el protocolo completo', () => {
  const runs = ['sync','async'].flatMap(mode => [1,2,3].map(round => ({
    mode, elapsedMs: 1000,
    samples: Array.from({length: 8}, (_, i) => ({ackMs: round * (i + 1), completionMs: 100, windowMs: 10})),
  })));
  assert.equal(summarize(runs).sync.medianP95AckMs, 16);
  assert.equal(summarize(runs).async.medianCompletedOpsPerSecond, 8);
  assert.throws(() => summarize(runs.slice(1)));
});

test('rechaza una version desconocida o un evento con datos faltantes', () => {
  const id='12345678-1234-1234-1234-123456789abc';
  const event={id,owner_id:id,deal_id:id,from_stage_id:id,to_stage_id:id,mode:'async',
    event_type:'crm.deal.stage_changed.v1',schema_version:1,enqueued_at:'2026-10-16T12:00:00Z',delivered_at:null};
  assert.equal(validateEvent(event),event);
  assert.throws(() => validateEvent({...event,schema_version:2}));
  assert.throws(() => validateEvent({...event,owner_id:'another-user'}));
  assert.throws(() => validateEvent({...event,extra:'not-in-v1'}));
});
