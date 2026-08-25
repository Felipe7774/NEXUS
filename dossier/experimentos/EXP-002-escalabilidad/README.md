# EXP-002 — Escalabilidad (crecimiento de datos)

**Estado: ejecutado el 25/08/2026.**

- **¿Qué pregunta intenta responder?** ¿Los listados de contactos y oportunidades siguen respondiendo dentro del umbral auditado cuando la base crece al volumen que describe el Escenario 6 (5.000 contactos, 1.000 oportunidades)?
- **¿Qué escenario ejecuta?** Escenario 6 (Escalabilidad) de `dossier/02-escenarios-de-calidad.md`.
- **¿Qué hipótesis previa referencia?** p95 < 2.000 ms en los listados, con ese volumen — umbral definido directamente en el escenario.
- **¿Qué commit se mide?** `c9d15bea63a2887d704240c94ebf8b3f5632eb29`.
- **¿Cómo se prepara la semilla?** `node scripts/seed-scale.mjs` contra el stack local de Supabase — 50 companies, 5.000 contacts, 1.000 deals.
- **¿Cómo se levanta el sistema?** `npx supabase start` (stack local); medición contra la API REST directamente (misma limitación que EXP-001).
- **¿Cómo se ejecuta el experimento?** `k6 run scripts/load-test-scale.js` desde esta carpeta.
- **¿Cómo se verifica que las respuestas son válidas?** `check` de `status 200` y de que el listado traiga filas; umbral `http_req_failed` en `0.00`.
- **¿Dónde están las tres corridas?** `resultados/corrida-2.json`, `corrida-3.json`, `corrida-4.json`.
- **¿Cuál se descarta?** La corrida 1 (calentamiento).
- **¿Cómo se obtiene el resultado reportado?** Mediana del p95 y throughput de las corridas 2-4.
- **¿Qué limitaciones tiene?** Igual que EXP-001: mide la API, no la app renderizada; sin latencia de red real; solo 5 VUs.

## Resultado

| Corrida | p95 | Throughput (req/s) | Errores |
|---|---|---|---|
| 1 (descartada) | 135.51ms | 4.54/s | 0% |
| 2 | 112.89ms | 4.58/s | 0% |
| 3 | 129.30ms | 4.53/s | 0% |
| 4 | 127.16ms | 4.53/s | 0% |
| **Mediana (2-4)** | **127.16ms** | **4.53/s** | **0%** |

Umbral: p95 < 2.000ms. **Resultado: 127.16ms — muy por debajo del umbral, incluso con 6.25x más contactos que en EXP-001.**

## Estructura de esta carpeta

```
EXP-002-escalabilidad/
├── README.md
├── condiciones.md
├── scripts/
│   ├── seed-scale.mjs        (siembra 50 companies, 5000 contacts, 1000 deals)
│   └── load-test-scale.js    (k6, listados completos de contacts/deals)
├── resultados/                (JSON de cada corrida + resumen de siembra)
└── logs/
```
