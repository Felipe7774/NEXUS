export function localBaseUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost'].includes(url.hostname) ||
      url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('El spike solo admite una URL base HTTP de Supabase en loopback');
  }
  return url.origin;
}

export function validateEvent(event) {
  const ids = ['id','owner_id','deal_id','from_stage_id','to_stage_id'];
  const required = [...ids,'mode','event_type','schema_version','enqueued_at','delivered_at'];
  if (!event || Object.keys(event).length !== required.length || required.some(key => !(key in event)) ||
      ids.some(key => typeof event[key] !== 'string' || !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(event[key])) ||
      !['sync','async'].includes(event.mode) || event.event_type !== 'crm.deal.stage_changed.v1' ||
      event.schema_version !== 1 || typeof event.enqueued_at !== 'string' || !Number.isFinite(Date.parse(event.enqueued_at)) ||
      (event.delivered_at !== null && (typeof event.delivered_at !== 'string' || !Number.isFinite(Date.parse(event.delivered_at))))) {
    throw new Error('Evento incompatible con el contrato experimental v1');
  }
  return event;
}

export function percentile(values, fraction) {
  if (!values.length || values.some(v => !Number.isFinite(v) || v < 0) || fraction <= 0 || fraction > 1) {
    throw new Error('Muestra o percentil invalido');
  }
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.ceil(sorted.length * fraction) - 1];
}

export function median(values) {
  if (!values.length || values.some(v => !Number.isFinite(v))) throw new Error('Muestra invalida');
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function summarize(runs) {
  return Object.fromEntries(['sync', 'async'].map(mode => {
    const selected = runs.filter(run => run.mode === mode);
    if (selected.length !== 3 || selected.some(r => r.samples.length !== 8)) {
      throw new Error('El protocolo requiere tres corridas de ocho muestras por modalidad');
    }
    return [mode, {
      runs: selected.length,
      samples: selected.reduce((sum, r) => sum + r.samples.length, 0),
      medianP95AckMs: median(selected.map(r => percentile(r.samples.map(s => s.ackMs), 0.95))),
      medianP95CompletionMs: median(selected.map(r => percentile(r.samples.map(s => s.completionMs), 0.95))),
      medianP95WindowMs: median(selected.map(r => percentile(r.samples.map(s => s.windowMs), 0.95))),
      medianCompletedOpsPerSecond: median(selected.map(r => r.samples.length * 1000 / r.elapsedMs)),
    }];
  }));
}
