# Log EDAV — Auditoría de contenido generado por IA

> Registro honesto de qué contenido del dossier fue delegado a un LLM (Claude, vía Claude Code) y cuál es su estado real de auditoría. Este log existe porque gran parte del contenido de `01-contexto-y-drivers.md` y `02-escenarios-de-calidad.md` fue producido en sesiones de trabajo con IA **antes** de que el equipo tuviera el ciclo EDAV formal (E-D-A-V) documentado por la cátedra. Se declara explícitamente para cumplir con el criterio "Auditoría de IA" de la rúbrica, en vez de ocultarlo.

## Qué pasó, en orden

1. El equipo le pidió a Claude ayuda para levantar el proyecto, armar el repositorio del dossier y avanzar las semanas 1-2.
2. Claude propuso: un inventario de 9 riesgos, un orden de 5 drivers arquitectónicos, una matriz de 6 atributos de calidad, y 6 escenarios de calidad de 6 partes (3 basados en el código real, 3 como RNF nuevos porque no apareció el documento de Ingeniería de Software).
3. El equipo confirmó cada propuesta con un "sí"/"así" en el chat — **esto no equivale al paso "A — Auditoría" del ciclo EDAV**, que exige clasificación Válido/Modificado/Genérico/Falso con justificación matemática y empírica propia, no una confirmación conversacional.
4. Recién en la semana 4 el equipo obtuvo el material completo de la cátedra (Módulo 2, rúbrica, definición de EDAV) y detectó la diferencia.

## Estado real de auditoría por pieza de contenido

| Contenido | Propuesto por | Auditado formalmente (matriz Válido/Modificado/Genérico/Falso) | Acción pendiente |
|---|---|---|---|
| 9 riesgos iniciales (R1-R9) | Claude | No — solo confirmación rápida | Reclasificar con matriz EDAV y justificación propia |
| 5 drivers priorizados | Claude | No | Re-priorizar o ratificar con justificación propia del equipo |
| Matriz de 6 atributos de calidad | Claude | No | Re-priorizar con justificación propia |
| Escenario 1 (Seguridad) | Claude | **Sí** — ver Matriz de Auditoría abajo | Ninguna |
| Escenario 2 (Disponibilidad) | Claude | No | Auditar — el umbral de ≤3s fue propuesto sin dato empírico |
| Escenario 3 (Rendimiento) | Claude | No | Auditar — umbral p95<2000ms sin dato empírico, semilla no definida |
| Escenario 4 (Mantenibilidad) | Claude | No | Auditar |
| Escenario 5 (Usabilidad) | Claude | No | Auditar — requiere prueba de usuario real, no solo hipótesis |
| Escenario 6 (Escalabilidad) | Claude | No | Auditar — dataset de 5.000/1.000 registros no existe todavía |
| Migración de esquema (`stakeholders`, salud de cuenta) | Claude, propuesta técnica | Sí — validada corriendo Postgres real vía Supabase local, RLS y `security_invoker` verificados | Ninguna — es implementación, no decisión arquitectónica |
| Suite de tests (Vitest + Docker) | Claude, propuesta técnica | Sí — 12 tests corridos y verificados en local y Docker | Ninguna — es implementación |

## Matriz de auditoría de escenarios de IA (ciclo EDAV — paso A)

Clasificación y justificación del equipo, no de la IA. Se completa a medida que se audita cada escenario — no todos están auditados todavía (ver tabla de arriba).

| Escenario sugerido por IA | Clasificación (equipo) | Justificación técnica (equipo) | Verificación |
|---|---|---|---|
| Escenario 1 — Seguridad (aislamiento entre organizaciones) | **Válido** | "Veo válido ya que está corriendo pruebas exitosamente en mi Docker." | `rls-isolation.integration.test.ts`, 2/2 tests pasados contra PostgreSQL real en Docker (`npx supabase start` local), corrida el 25/08/2026. Automatizado en cada PR vía `.github/workflows/ci.yml` (job `rls-integration-test`). |
| Escenario 2 — Disponibilidad | `Por definir` | `Por definir` | `Por definir` |
| Escenario 3 — Rendimiento | `Por definir` | `Por definir` | `Por definir` |
| Escenario 4 — Mantenibilidad | `Por definir` | `Por definir` | `Por definir` |
| Escenario 5 — Usabilidad | `Por definir` | `Por definir` | `Por definir` |
| Escenario 6 — Escalabilidad | `Por definir` | `Por definir` | `Por definir` |

## Riesgos residuales asumidos mientras no se complete la auditoría

- El orden de prioridad de drivers/atributos podría no reflejar el criterio real del equipo — se está usando como si fuera definitivo en la práctica (PRs mergeados) sin el respaldo formal.
- Los umbrales numéricos (≤3s, p95<2000ms, ≤2s) son estimaciones sin dato empírico previo — riesgo de que la medición real los invalide por completo.
- La clasificación de riesgos R4 y R7 ("válido sin verificar" / "válido condicionado") no tiene una categoría exacta en la matriz de la cátedra (Válido/Modificado/Genérico/Falso) — falta decidir a cuál mapean.

## Instrucción para el equipo

Usar este log como entrada para el ciclo EDAV real: tomar cada fila de la tabla de arriba, pedirle al LLM (este mismo u otro) que vuelva a sugerir el escenario/driver/riesgo de forma aislada si hace falta, y completar la clasificación con la matriz oficial (`Válido / Modificado / Genérico / Falso`) con justificación propia — no delegarle esa clasificación a la IA.
