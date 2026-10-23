# ADR-001 — Estilo arquitectónico en capas

## Estado

**Confirmado.** El equipo confirma esta decisión porque la estructura existe actualmente en la implementación; no se presenta como una intención futura.

## Contexto

El repositorio separa responsabilidades en ubicaciones distintas. **Estado verificado el 23/10/2026:**

| Capa | Dónde vive | Tamaño |
|---|---|---|
| Presentación y navegación | `src/routes/`, `src/components/` | 13 + 55 archivos |
| Composición y estado de UI | `src/lib/crm.ts`, `src/lib/crm-composition.ts` | 216 + 36 líneas |
| Operaciones de dominio | `src/modules/` | 6 archivos, 294 líneas |
| Integración, autenticación y acceso a Supabase | `src/integrations/supabase/` | 6 archivos |
| Persistencia versionada | `supabase/migrations/` | 5 migraciones |

Esta separación observable es la evidencia de que el sistema sigue un estilo en capas.

> **Actualización del contexto (23/10/2026).** Cuando se redactó este ADR, la tabla tenía cuatro filas y las *"Operaciones del CRM"* figuraban en `src/lib/crm.ts`. Tras el PR #35 ese archivo pasó a ser la capa de composición —bajó de 419 a 216 líneas— y las operaciones de dominio se mudaron a `src/modules/`. **Se actualiza la descripción, no la decisión:** la separación por capas que este ADR documenta se mantiene intacta.
>
> La partición por dominio que introdujo ese cambio es un eje de organización distinto y se registra aparte, en el [`ADR-007`](ADR-007-particion-por-dominio.md).

**La separación dejó de ser una convención y pasó a ser una regla ejecutable.** `src/architecture/persistence-fitness.test.ts` verifica en cada PR que *los módulos no dependan de composición ni de presentación*, es decir, que las dependencias solo apunten hacia abajo. Antes la capa se sostenía por disciplina del equipo; hoy, si alguien la rompe, falla el CI.

## Decisión del equipo

El CRM adopta y mantiene un estilo arquitectónico en capas, separando presentación, operaciones del sistema e integración/acceso a datos.

## Alternativas consideradas

No se proporcionó una alternativa considerada de forma histórica. No se infiere ni se agrega una alternativa posterior como si hubiera formado parte de la decisión original.

## Consecuencias y trade-offs

- La separación de responsabilidades es observable en la organización actual del código.
- El equipo espera que esa separación favorezca el mantenimiento y la reutilización de componentes; ese impacto no se ha medido de forma cuantitativa.
- El estilo en capas, por sí solo, no demuestra escalabilidad. Las mediciones disponibles evalúan escenarios concretos y sus límites se conservan en `04-evidencia-ejecutable.md`.

### Evaluación aprobada por el equipo

| Valor | Costo | Riesgo residual | Impacto en calidad | Veredicto |
|---|---|---|---|---|
| 🟢 | 🟡 | 🟢 | 🟢 | Confirmada |

El equipo justifica esta evaluación porque el estilo mejora mantenibilidad y comprensión, ya está implementado y corresponde a una solución madura con riesgo residual favorable.

## Evidencia y trazabilidad

- `src/routes/` · `src/components/` — presentación
- `src/lib/crm.ts` · `src/lib/crm-composition.ts` — composición
- `src/modules/` — operaciones de dominio (ver `ADR-007`)
- `src/integrations/supabase/` — integración
- `supabase/migrations/` — persistencia
- `src/architecture/persistence-fitness.test.ts` — **verifica la dirección de las dependencias en cada PR**

## Supuestos y seguimiento

El equipo debe conservar la separación al añadir nuevas capacidades y registrar cualquier excepción relevante. Si se afirma un beneficio de escalabilidad o costo, debe acompañarse de una medición o declararse como supuesto.
