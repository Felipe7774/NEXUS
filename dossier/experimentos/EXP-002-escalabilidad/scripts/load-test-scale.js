import http from "k6/http";
import { check, sleep } from "k6";

// Escenario 6 (Escalabilidad, dossier/02-escenarios-de-calidad.md):
// listados de contacts y deals con 5.000/1.000 registros sembrados
// por seed-scale.mjs, deben responder sin degradacion perceptible.
const seed = JSON.parse(open("../resultados/seed-output.json"));

const SUPABASE_URL = __ENV.SUPABASE_URL;
const ANON_KEY = __ENV.SUPABASE_ANON_KEY;

export const options = {
  vus: 5,
  duration: "30s",
  thresholds: {
    // Umbral del escenario: listado responde en <=2000ms con este volumen.
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate==0.00"],
  },
};

export default function () {
  // Alterna entre el listado de contactos y el de oportunidades, ambos completos (sin filtro),
  // que es el caso mas exigente: traer todo el volumen sembrado de una sola consulta.
  const useContacts = Math.random() < 0.5;
  const url = useContacts
    ? `${SUPABASE_URL}/rest/v1/contacts?owner_id=eq.${seed.ownerId}&select=id,first_name,last_name,company_id`
    : `${SUPABASE_URL}/rest/v1/deals?owner_id=eq.${seed.ownerId}&select=id,title,amount,stage_id`;

  const res = http.get(url, {
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${seed.userJwt}`,
    },
  });

  check(res, {
    "status 200": (r) => r.status === 200,
    "trae filas": (r) => {
      try {
        return JSON.parse(r.body).length > 0;
      } catch {
        return false;
      }
    },
  });
  sleep(1);
}
