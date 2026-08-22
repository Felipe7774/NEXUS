import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 5, // usuarios virtuales simultaneos - ajustar segun el escenario a validar
  duration: "30s",
};

export default function () {
  const res = http.get("http://localhost:3000/"); // reemplazar por la ruta real del pipeline/kanban
  check(res, {
    "status 200": (r) => r.status === 200,
  });
  sleep(1);
}
