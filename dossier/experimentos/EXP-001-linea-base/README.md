# EXP-001 — Línea base de rendimiento

**Estado: no ejecutado todavía.** Este README responde el checklist de auditoría del experimento; se completa a medida que el equipo corre el experimento de verdad, no antes.

- **¿Qué pregunta intenta responder?** `PENDIENTE`
- **¿Qué escenario ejecuta?** Escenario 3 (Rendimiento) de `dossier/02-escenarios-de-calidad.md` — pendiente de confirmación del equipo.
- **¿Qué hipótesis previa referencia?** p95 < 2000 ms (ver `dossier/01-contexto-y-drivers.md`, punto 8) — propuesta por IA, no auditada.
- **¿Qué commit se mide?** `PENDIENTE`
- **¿Cómo se prepara la semilla?** `PENDIENTE` — no definida (ver `dossier/02-escenarios-de-calidad.md`, punto 8).
- **¿Cómo se levanta el sistema?** `npm install && npm run preview` (build de producción) desde la raíz del repo, con `.env` configurado. Ver `dossier/01-contexto-y-drivers.md` para las variables necesarias.
- **¿Cómo se ejecuta el experimento?** `k6 run scripts/load-test.js` desde esta carpeta.
- **¿Cómo se verifica que las respuestas son válidas?** El script incluye un `check` de `status 200`; el umbral `http_req_failed` debe ser `0.00`.
- **¿Dónde están las tres corridas?** `resultados/` — `PENDIENTE`, todavía no ejecutadas.
- **¿Cuál se descarta?** La corrida 1 (calentamiento — equivalente al warm-up de JIT/V8, análogo al de JVM que usa la cátedra en su stack de referencia).
- **¿Cómo se obtiene el resultado reportado?** Mediana del p95 y del throughput de las corridas 2 y 3.
- **¿Qué limitaciones tiene?** Ver `dossier/04-evidencia-ejecutable.md`, punto 13.

## Estructura de esta carpeta

```
EXP-001-linea-base/
├── README.md          (este archivo)
├── condiciones.md      (hardware, red, build, fecha de la corrida)
├── scripts/
│   └── load-test.js    (script de k6)
├── resultados/          (JSON de cada corrida — vacío hasta ejecutar)
└── logs/                (logs crudos de cada corrida — vacío hasta ejecutar)
```
