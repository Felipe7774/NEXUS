import http from "k6/http";
import { check, sleep } from "k6";

// Semilla decidida por el equipo el 25/08/2026 (dossier/02-escenarios-de-calidad.md, punto 8):
// 80% de las peticiones consultan las etapas "calientes" (Negociacion / Propuesta enviada),
// 20% consultan el tablero completo sin filtrar. Datos generados por scripts/seed.mjs.
const seed = JSON.parse(open("../resultados/seed-output.json"));

const SUPABASE_URL = __ENV.SUPABASE_URL;
const ANON_KEY = __ENV.SUPABASE_ANON_KEY;

export const options = {
  vus: 5, // usuarios virtuales concurrentes
  duration: "30s",
  thresholds: {
    // Umbral auditado por el equipo en dossier/02-escenarios-de-calidad.md (Escenario 3).
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate==0.00"],
  },
};

export default function () {
  const useHot = Math.random() < 0.8;
  const stageFilter = useHot
    ? `stage_id=in.(${seed.hotStageIds.join(",")})`
    : `pipeline_id=eq.${seed.pipelineId}`;

  const res = http.get(`${SUPABASE_URL}/rest/v1/deals?${stageFilter}&select=id,title,amount,stage_id`, {
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${seed.userJwt}`,
    },
  });

  check(res, {
    "status 200": (r) => r.status === 200,
    "trae al menos 1 fila": (r) => {
      try {
        return JSON.parse(r.body).length > 0;
      } catch {
        return false;
      }
    },
  });
  sleep(1);
}
