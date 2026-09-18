# 12 — Matriz de trade-offs

> **Estado:** evaluación aprobada por el equipo para ADR-001 a ADR-004. Docker, GitHub Actions, CI/CD y pruebas automatizadas se mantienen como evidencia de atributos de calidad, no como ADRs.

## Escala acordada por el equipo

- 🟢 Alto / positivo o favorable.
- 🟡 Medio.
- 🔴 Bajo / negativo o desfavorable.

En la columna de riesgo, 🟢 representa una exposición residual favorable o baja; 🟡 una exposición moderada; y 🔴 una exposición desfavorable o alta.

## Evidencia disponible antes de deliberar

| Tensión documentada | Evidencia existente | Estado de la evidencia |
|---|---|---|
| Seguridad RLS vs. rendimiento | `02-escenarios-de-calidad.md`, sección 4; `supabase/migrations/`; EXP-001 y EXP-002 | La tensión existe en el diseño. El costo específico de `can_access_owner()` a mayor volumen no fue medido. |
| Disponibilidad/rendimiento vs. costo operativo | `01-contexto-y-drivers.md`, restricciones; `02-escenarios-de-calidad.md`, sección 4 | La restricción económica está documentada. No hay comparación experimental entre planes o réplicas. |
| Tiempo de detección de una caída vs. experiencia de usuario | Escenario 2 en `LOG-EDAV-auditoria-ia.md`; `auth-middleware.ts` | Hay medición del manejo del error. El efecto percibido en un flujo completo debe conservar sus limitaciones documentadas. |
| Mantenibilidad mediante controles de integración vs. tiempo de entrega | `.github/workflows/ci.yml`; Escenario 4 en `LOG-EDAV-auditoria-ia.md` | Hay CI y protección de rama documentados. El costo de operación para el equipo no fue cuantificado. |

## Matriz para decisión del equipo

Complete una fila por decisión arquitectónica real. No use esta tabla para convertir una funcionalidad en una decisión arquitectónica.

| Decisión arquitectónica existente | Alternativa considerada | Valor (biz/tec) | Costo (TCO) | Riesgo residual | Impacto en calidad | Veredicto | Evidencia y justificación del equipo |
|---|---|---|---|---|---|---|---|
| Estilo arquitectónico en capas | No documentada históricamente | 🟢 | 🟡 | 🟢 | 🟢 | **Confirmada** | Mejora mantenibilidad y comprensión; está implementada; solución madura. `adrs/ADR-001-estilo-en-capas.md` |
| Supabase para autenticación y persistencia | No documentada históricamente | 🟢 | 🟢 | 🟡 | 🟢 | **Confirmada** | Reduce tiempo de desarrollo y evita construir autenticación propia; introduce dependencia externa. `adrs/ADR-002-supabase-autenticacion-y-persistencia.md` |
| Aislamiento de datos mediante RLS | No documentada históricamente | 🟢 | 🟡 | 🟡 | 🟢 | **Confirmada** | Aporta seguridad y está respaldada por migraciones y prueba de integración; una configuración incorrecta sigue siendo un riesgo. `adrs/ADR-003-aislamiento-de-datos-con-rls.md` |
| Arquitectura monolítica | No documentada históricamente | 🟢 | 🟢 | 🟡 | 🟢 | **Confirmada** | Menor complejidad operacional para un equipo pequeño; el riesgo de escalabilidad futura se conserva como supuesto. `adrs/ADR-004-arquitectura-monolitica.md` |

## Criterio de cierre

- Cada veredicto debe enlazar evidencia existente.
- Todo valor no medido debe declararse como supuesto o limitación.
- Una revisión futura debe actualizar el ADR y esta matriz si cambia el contexto o la evidencia.
