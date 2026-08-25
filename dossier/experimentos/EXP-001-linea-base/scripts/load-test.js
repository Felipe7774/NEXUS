import http from "k6/http";
import { check, sleep } from "k6";

// Parametros experimentales - PENDIENTE: semilla 80/20 y volumen todavia no definidos por el equipo.
// Ver dossier/02-escenarios-de-calidad.md punto 8.
export const options = {
  vus: 5, // usuarios virtuales concurrentes - valor provisional, no auditado
  duration: "30s",
  thresholds: {
    // Umbral propuesto por IA en dossier/02-escenarios-de-calidad.md, NO auditado formalmente todavia.
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate==0.00"],
  },
};

export default function () {
  // TODO: reemplazar por la ruta real del pipeline/kanban una vez el equipo confirme el escenario (punto 6 de 02-escenarios-de-calidad.md)
  const res = http.get("http://localhost:3000/");
  check(res, {
    "status 200": (r) => r.status === 200,
  });
  sleep(1);
}
