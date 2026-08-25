# EXP-001 — Línea base de rendimiento

**Estado: ejecutado el 25/08/2026.**

- **¿Qué pregunta intenta responder?** ¿La consulta de oportunidades del pipeline (con RLS aplicado) responde dentro del umbral auditado (p95 < 2000ms) bajo la semilla decidida por el equipo?
- **¿Qué escenario ejecuta?** Escenario 3 (Rendimiento) de `dossier/02-escenarios-de-calidad.md`.
- **¿Qué hipótesis previa referencia?** p95 < 2000 ms (ver `dossier/01-contexto-y-drivers.md`, punto 8).
- **¿Qué commit se mide?** `beca9da54be41c38099703182216f298e0108a08` (rama `main`), medido desde `semana-4-medicion-real`.
- **¿Cómo se prepara la semilla?** `node scripts/seed.mjs` contra el stack local de Supabase — genera 20 companies, 800 contacts, 1.000 deals (200 en etapas calientes).
- **¿Cómo se levanta el sistema?** `npx supabase start` (stack local) — la medición se hizo contra la API REST de Supabase local directamente, no contra `npm run preview`. Ver limitación en `condiciones.md`.
- **¿Cómo se ejecuta el experimento?** `k6 run scripts/load-test.js` desde esta carpeta, con `SUPABASE_URL` y `SUPABASE_ANON_KEY` apuntando al stack local.
- **¿Cómo se verifica que las respuestas son válidas?** El script incluye `check` de `status 200` y de que la respuesta traiga al menos una fila; umbral `http_req_failed` en `0.00`.
- **¿Dónde están las tres corridas?** `resultados/corrida-2.json`, `corrida-3.json`, `corrida-4.json`.
- **¿Cuál se descarta?** La corrida 1 (calentamiento) — no se exportó a JSON, solo se corrió y se descartó como indica el protocolo.
- **¿Cómo se obtiene el resultado reportado?** Mediana del p95 y del throughput de las corridas 2, 3 y 4.
- **¿Qué limitaciones tiene?** Ver `dossier/04-evidencia-ejecutable.md`, punto 13 y `condiciones.md`.

## Resultado

| Corrida | p95 | Throughput (req/s) | Errores |
|---|---|---|---|
| 1 (descartada) | 120.31ms | 4.75/s | 0% |
| 2 | 92.62ms | 4.77/s | 0% |
| 3 | 96.79ms | 4.75/s | 0% |
| 4 | 89.64ms | 4.74/s | 0% |
| **Mediana (2-4)** | **92.62ms** | **4.75/s** | **0%** |

Umbral auditado: p95 < 2000ms. **Resultado: 92.62ms — muy por debajo del umbral.**

## Estructura de esta carpeta

```
EXP-001-linea-base/
├── README.md          (este archivo)
├── condiciones.md      (hardware, red, build, fecha de la corrida)
├── scripts/
│   ├── seed.mjs         (siembra de datos: 20/800/1000, 200 calientes)
│   └── load-test.js     (script de k6, semilla 80/20)
├── resultados/          (JSON de cada corrida + resumen de siembra)
└── logs/                (logs crudos de cada corrida)
```
