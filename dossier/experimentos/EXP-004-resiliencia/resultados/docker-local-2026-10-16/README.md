# EXP-004 ejecutado en Docker Desktop

**Estado: pasó**, fitness satisfecha. Prerregistro `5998eff`; código medido
`76ccaba68bc4cf21875808f6c9b776da1909b5bf`. El resumen Docker y el arranque de la app
registran el mismo commit y árbol limpio. 16/10/2026 20:42:58–20:43:23 Colombia
(17/10/2026 01:42:58–01:43:23 UTC) para EXP-004.

| Archivo | Contenido verificable |
| --- | --- |
| [results.json](results.json) | 1.440 muestras, 3 rondas ×2 variantes, siembra, recuperación, RLS, limpieza y fitness |
| [resources.json](resources.json) | Nueve muestras Docker de cuatro servicios, incluidas siembra y limpieza |
| [summary.json](summary.json) | Docker/CLI/imagen, código, suite y experimentos; limpieza del stack desechable |
| [vitest.json](vitest.json) | 29 pruebas, cero fallos y cero omisiones; incluidas RLS y reglas de resiliencia |
| [fitness.txt](fitness.txt) | Evaluación independiente del JSON dentro del contenedor |
| [build.txt](build.txt) | Build real cliente/servidor Vite/Nitro dentro de Docker |
| [app-smoke.json](app-smoke.json) | App Docker HTTP 200 y conexión a Auth/PostgREST tras actualizar la imagen |
| [static-checks.json](static-checks.json) | ESLint nuevo correcto y dos errores TypeScript previos de `auth.tsx` sin alterar |

Medianas de tres percentiles por fase, calculados por nearest-rank:

| Métrica | Base | Breaker |
| --- | ---: | ---: |
| Sano p95 /p99 | 41,830 /46,637 ms | 39,754 /42,422 ms |
| Sano error /respuestas correctas por segundo | 0% /132,609 | 0% /136,016 |
| Caída intentos al proxy | 120 | 5 |
| Caída p95 /p99 de respuesta de error | 124,522 /125,536 ms | 0,898 /122,724 ms |
| Caída errores /lecturas correctas por segundo | 100% /0 | 100% /0 |

La reducción de intentos es **95,83%**. No se confunde un 503 rápido con un negocio
completado. La mejora de p95 de fallo no reduce p99 al mismo grado: quedan llamadas
previas en vuelo. La sonda única vuelve a habilitar lecturas; durante ella se
rechazan cuatro solicitudes concurrentes, y la tanda siguiente devuelve cinco 200.

No es prueba de uptime, UI completa, failover, RPO/RTO ni capacidad máxima. El
proxy evita llegar al backend durante el fallo, por lo que la reducción medida
es de intentos a una dependencia simulada, no ahorro de CPU de PostgreSQL. Los
datos de costo de alternativas son supuestos separados, no resultados del ensayo.

[Método y reproducción](../../README.md) · [Análisis y decisión](../../../../07-distribucion-y-resiliencia.md).
