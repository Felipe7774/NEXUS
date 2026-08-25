# 04 — Evidencia ejecutable

> Límite: 1000 palabras. Evidencia cruda (scripts, JSON de corridas, logs) vive en `experimentos/EXP-001-linea-base/`, no acá.

**Estado: ejecutado el 25/08/2026.** Medición real corrida contra el stack local de Supabase.

## 1. Sistema y commit medido

`beca9da54be41c38099703182216f298e0108a08` (rama `main`), medido desde la rama de trabajo `semana-4-medicion-real`.

## 2. Escenario medido

Escenario 3 (Rendimiento) de `02-escenarios-de-calidad.md` — confirmado por el equipo como el único con instrumento de medición ya preparado.

## 3. Hipótesis previa que se contrasta

p95 de latencia < 2000 ms en la consulta de oportunidades del pipeline (ver `01-contexto-y-drivers.md`, punto 8).

## 4. Semilla utilizada

20 `companies`, 800 `contacts`, 1.000 `deals` (200 en etapas calientes "Negociación"/"Propuesta enviada", 800 en el resto) — decidida por el equipo el 25/08/2026, sembrada con `experimentos/EXP-001-linea-base/scripts/seed.mjs`.

## 5. Instrumento utilizado

k6 v2.2.0, contra la API REST de Supabase local (PostgREST) con RLS activo, autenticado con un usuario real (JWT obtenido en la siembra).

## 6. Condiciones

Ver `experimentos/EXP-001-linea-base/condiciones.md` — hardware, alimentación (AC confirmada), commit, semilla.

## 7. Validación del instrumento

Confirmado: Postgres real en Docker (no en memoria), 0% de errores en las 4 corridas, checks de `status 200` y "trae al menos 1 fila" pasando al 100%.

## 8. Número de corridas

4 corridas totales — la 1 descartada como calentamiento, 2-4 válidas (protocolo cumplido).

## 9. Resultado reportado

| Corrida | p95 | Throughput |
|---|---|---|
| 2 | 92.62ms | 4.77 req/s |
| 3 | 96.79ms | 4.75 req/s |
| 4 | 89.64ms | 4.74 req/s |
| **Mediana** | **92.62ms** | **4.75 req/s** |

## 10. Comparación con el criterio previo

Umbral: p95 < 2000ms. Resultado real: **92.62ms** — cumple el umbral con un margen de ~21x.

## 11. Qué puede afirmarse

- La consulta de oportunidades del pipeline, con RLS activo y la semilla decidida (1.000 deals, 20% calientes), responde muy por debajo del umbral auditado, en un entorno local con Postgres real.
- El aislamiento de RLS (validado en el Escenario 1) no introduce un costo de latencia perceptible a este volumen de datos.

## 12. Qué todavía no puede afirmarse

- **No se midió la app renderizada** (`npm run preview` + navegador) — se midió la API REST directamente. El tiempo real que percibiría un usuario en el tablero Kanban incluye además parseo de JS, render de React y pintado del DOM, que no están en este número.
- No se midió contra el proyecto de Supabase real (plan free, con latencia de red real) — esto fue contra Postgres local, sin latencia de red.
- No se probó con más de 5 usuarios virtuales concurrentes — no hay evidencia sobre el comportamiento bajo una carga mayor.
- No se validó el trade-off de RLS mencionado en `02-escenarios-de-calidad.md` punto 4 (`can_access_owner()` con subconsultas) a un volumen mucho mayor que 1.000 registros.

## 13. Limitaciones

- Medición contra el stack local de Supabase (Docker en la misma máquina), no representativa de la latencia de red hacia el proyecto real en la nube.
- No se midió el tiempo de renderizado del frontend, solo el de la consulta a la base de datos.
- No se controlaron otros procesos corriendo en la máquina durante la medición.
- Solo 5 usuarios virtuales — no representa un pico de carga real ni concurrencia alta.

## 14. Evidencia reproducible

`experimentos/EXP-001-linea-base/` — script de siembra, script de k6, condiciones, y los 3 JSON de corridas válidas (`resultados/corrida-2.json`, `corrida-3.json`, `corrida-4.json`).

**Para el equipo:** falta la clasificación (Válido/Modificado/Genérico/Falso) del Escenario 3 con este dato real, y la justificación propia — mismo proceso que los Escenarios 1 y 2 en `LOG-EDAV-auditoria-ia.md`.
