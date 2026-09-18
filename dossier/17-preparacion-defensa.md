# 17 — Preparación para la defensa

> **Estado:** guía de ensayo. Las respuestas deben ser validadas por el equipo y acompañadas por los archivos citados durante la defensa.

## Estructura sugerida de presentación (15–20 minutos)

| Tiempo | Tema | Evidencia que debe mostrarse |
|---|---|---|
| 2 min | Contexto, alcance y restricciones | `01-contexto-y-drivers.md` |
| 4 min | ADR-001 a ADR-004 | `adrs/` y `12-matriz-trade-offs.md` |
| 6 min | Escenarios y evidencia ejecutable | `02-escenarios-de-calidad.md`, `04-evidencia-ejecutable.md`, EXP-001 y EXP-002 |
| 3 min | Verificado, supuesto y en riesgo | `13-evaluacion-arquitectonica.md` |
| 2 min | Evolución y riesgo operativo de Supabase | `14-plan-evolucion.md`; actualización en `01-contexto-y-drivers.md` |
| 1–3 min | Preguntas del comité | Archivos fuente y commit del repositorio |

## Preguntas críticas y respuesta respaldada

### ¿Por qué Supabase y no un backend propio?

El equipo confirmó Supabase para integrar autenticación, PostgreSQL y RLS, reduciendo el trabajo de construir esas capacidades desde cero. El stack local en Docker complementa esa decisión: permite ejecutar el entorno de Supabase, pruebas y experimentos de forma reproducible. Esto no elimina la dependencia del proveedor ni demuestra por sí mismo disponibilidad o recuperación en producción.

**Mostrar:** ADR-002, `src/integrations/supabase/`, `supabase/migrations/`, `.github/workflows/ci.yml`.

### ¿Por qué no microservicios?

El equipo confirmó una aplicación monolítica para el alcance actual. La unidad de código y despliegue está en un único repositorio y no existe evidencia de que separar servicios sea necesario hoy. La evaluación futura de servicios separados aparece como posibilidad condicionada a nueva evidencia, no como compromiso actual.

**Mostrar:** ADR-004, `vite.config.ts`, estructura `src/`, `14-plan-evolucion.md`.

### ¿Cómo garantizan el aislamiento de datos?

El aislamiento se aplica mediante RLS en la base de datos. Una prueba de integración levanta Supabase localmente, crea dos usuarios y comprueba que uno no puede leer la empresa del otro; CI ejecuta ese caso. La defensa debe precisar que este resultado no equivale a una auditoría de todas las políticas existentes.

**Mostrar:** ADR-003, `src/integrations/supabase/rls-isolation.integration.test.ts`, `.github/workflows/ci.yml`, migraciones.

### ¿Qué evidencia tienen de rendimiento y escalabilidad?

EXP-001 y EXP-002 registran mediciones k6 contra la API REST local de Supabase con RLS y semillas documentadas. La evidencia respalda esos escenarios y condiciones, pero no el render completo del Kanban, la red hacia producción ni una capacidad ilimitada.

**Mostrar:** `04-evidencia-ejecutable.md`, `experimentos/EXP-001-linea-base/`, `experimentos/EXP-002-escalabilidad/`.

### ¿Cuál es el riesgo arquitectónico vigente más importante?

El riesgo de control administrativo y continuidad del proyecto Supabase aumentó porque el proyecto original dejó de estar disponible y el reemplazo se encuentra en otra cuenta. El equipo debe presentarlo como riesgo vigente hasta verificar acceso compartido, migraciones aplicadas y una restauración reproducible.

**Mostrar:** actualización operativa en `01-contexto-y-drivers.md` y el plan de evolución.

## Reglas de respuesta

- Decir **“verificado con alcance acotado”** cuando la evidencia sea local, parcial o de un escenario específico.
- Decir **“supuesto”** cuando no exista prueba o medición.
- No atribuir a Docker evidencia de disponibilidad cloud, respaldo o recuperación ante desastres.
- Abrir el archivo, commit, script o resultado al que se haga referencia; no depender solo de diapositivas.
