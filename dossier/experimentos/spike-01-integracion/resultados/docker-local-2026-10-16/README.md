# Validación en Docker Desktop — 16/10/2026

**Resultado: pasó.** Ejecución real en el equipo Windows, con contenedores Linux
de Docker Desktop y WSL 2. Esta corrida complementa la referencia previa de CI.

## Trazabilidad

- Suite/spike/build: commit `69a2a75b513ca269b9046e785bcbf84be91f73a2`, sin cambios
  pendientes al iniciar. [Resumen de ejecución](summary.json).
- Inicio: 17/10/2026 01:16:03 UTC; final: 01:17:54 UTC
  (16/10/2026 20:16–20:17, Colombia).
- App y conectividad: commit `c7ec7f87e15b32d62cc59e56a7bee67c08c6d120`, sin cambios
  pendientes. Ese commit añade la comprobación de conectividad al comando de
  arranque, sin modificar las pruebas ni el protocolo experimental.
- Docker Desktop 4.95.0; Docker Engine 29.8.2; Supabase CLI 2.121.0.
- Imagen de pruebas y versiones completas: `summary.json`; Node Linux, memoria,
  CPU y condiciones del experimento: `spike.json`.
- Mismas cuatro migraciones versionadas del CRM; proyecto de pruebas
  `nexus-docker-tests`, independiente del proyecto local de desarrollo.

## Comprobaciones

| Comprobación real                                          | Resultado                                                      | Evidencia                                |
| ---------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------- |
| Suite NEXUS dentro de Docker                               | 18 pasaron, 0 fallaron, 0 omitidas; incluye las 2 RLS          | [vitest.json](vitest.json)               |
| Cálculos, contrato y destino local del spike               | 4 pasaron, 0 omitidas                                          | [metricas-spike.txt](metricas-spike.txt) |
| Experimento de integración                                 | 48 muestras, 5 verificaciones funcionales y limpieza correctas | [spike.json](spike.json)                 |
| Compilación cliente y servidor Vite/Nitro dentro de Docker | Pasó                                                           | [compilacion.txt](compilacion.txt)       |
| Página `/auth` servida por la app en Docker                | HTTP 200                                                       | [app-smoke.json](app-smoke.json)         |
| App → Supabase Auth y API de empresas                      | HTTP 200 en ambos endpoints desde el contenedor                | [app-smoke.json](app-smoke.json)         |
| Retirada del stack desechable de pruebas                   | Pasó; desarrollo siguió funcionando                            | [summary.json](summary.json)             |

También se comprobó en la imagen de desarrollo que no existen `/app/.env`,
`/app/.docker` ni `/app/.git`. Las claves locales solo entran al contenedor en
ejecución; no se publican en estos archivos.

## Medición del spike

Medianas de tres p95 nearest-rank, con ocho muestras por corrida. Mismo protocolo
preregistrado, 40 ms artificiales en el receptor y espera del consumidor de 20 ms:

| Métrica                            |  Síncrono | Asíncrono |
| ---------------------------------- | --------: | --------: |
| Acuse                              | 57,229 ms |  5,905 ms |
| Efecto completado                  | 57,235 ms | 76,111 ms |
| Ventana tras acuse                 |      0 ms | 71,337 ms |
| Operaciones terminadas por segundo |    15,979 |    12,187 |

Se confirma H1 en este laboratorio: aceptar el evento antes reduce el tiempo de
acuse, pero no el tiempo al efecto final ni mejora el throughput secuencial.
Los cinco controles cubren caída/reinicio del receptor, reintentos, entrega
duplicada, pipeline ajeno, aislamiento entre vendedores y triggers reales.

El código 202 asíncrono sigue siendo una representación lógica del harness tras
una RPC PostgREST HTTP 200. No se ha creado un endpoint HTTP 202 ni un worker
productivo. Esta prueba de arranque/conectividad tampoco equivale a una prueba de
navegador de todos los flujos del CRM. No se repitieron k6, disponibilidad visual
o usabilidad humana.

Para reproducir: [`docs/docker-local.md`](../../../../../docs/docker-local.md).
