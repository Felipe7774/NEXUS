# ADR-001 — Estilo arquitectónico en capas

## Estado

**Confirmado.** El equipo confirma esta decisión porque la estructura existe actualmente en la implementación; no se presenta como una intención futura.

## Contexto

El repositorio separa responsabilidades en ubicaciones distintas:

- Presentación y navegación: `src/routes/` y `src/components/`.
- Operaciones del CRM: `src/lib/crm.ts`.
- Integración, autenticación y acceso a Supabase: `src/integrations/supabase/`.
- Persistencia versionada: `supabase/migrations/`.

Esta separación observable es la evidencia de que el sistema sigue un estilo en capas.

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

- `src/routes/`
- `src/components/`
- `src/lib/crm.ts`
- `src/integrations/supabase/`
- `supabase/migrations/`

## Supuestos y seguimiento

El equipo debe conservar la separación al añadir nuevas capacidades y registrar cualquier excepción relevante. Si se afirma un beneficio de escalabilidad o costo, debe acompañarse de una medición o declararse como supuesto.
