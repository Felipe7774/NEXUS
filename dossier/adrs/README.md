# ADRs — Registro de decisiones arquitectónicas

> **Carpeta única.** Desde el 23/10/2026 todos los ADR del proyecto viven acá. Antes convivían dos juegos (`dossier/adrs/` y `docs/adr/`) con números que chocaban: había dos "ADR 3" y dos "ADR 4" con contenidos distintos.

## ADRs registrados

| # | Decisión | Estado | Origen |
|---|---|---|---|
| [001](ADR-001-estilo-en-capas.md) | Estilo arquitectónico en capas | Confirmado por el equipo | Módulo 4 |
| [002](ADR-002-supabase-autenticacion-y-persistencia.md) | Supabase para autenticación y persistencia | Confirmado por el equipo | Módulo 4 |
| [003](ADR-003-aislamiento-de-datos-con-rls.md) | Aislamiento de datos mediante RLS | Confirmado por el equipo | Módulo 4 |
| [004](ADR-004-arquitectura-monolitica.md) | Arquitectura monolítica | Confirmado por el equipo | Módulo 4 |
| [005](ADR-005-integracion-oportunidades-actividades.md) | Conservar el cambio síncrono y evaluar outbox para el seguimiento diferido | Propuesta para revisión; respaldada por el spike 1 | Módulo 5 |
| [006](ADR-006-distribucion-y-resiliencia.md) | Mantener una app y contener fallos de lectura de Supabase | Propuesta con evidencia de EXP-004 | Módulo 6 |
| [007](ADR-007-particion-por-dominio.md) | Partición por dominio con propiedad exclusiva de tablas | **Propuesto** — decisión y trade-offs pendientes del equipo | Módulo 6 |

## Qué cambió en la consolidación

Solo numeración y ubicación. **Ningún contenido fue modificado.**

| Antes | Ahora | Por qué |
|---|---|---|
| `docs/adr/0003-integracion-oportunidades-actividades.md` | `ADR-005-...` | Chocaba con ADR-003 (RLS), que es otra decisión |
| `docs/adr/0004-distribucion-y-resiliencia.md` | `ADR-006-...` | Chocaba con ADR-004 (monolito), que es otra decisión |
| `docs/adr/0001-decision-estilo.md` | Eliminado | Esqueleto vacío (25 campos sin completar); la decisión de estilo está en ADR-001 |
| `docs/adr/0002-aislamiento-persistencia.md` | Eliminado | Esqueleto vacío (26 campos sin completar); la frontera de persistencia está en ADR-003 |

## Correspondencia con la nomenclatura de la cátedra

El material del curso pide `/docs/adr/0001-decision-estilo.md` y `0002-aislamiento-persistencia.md`. El equipo usa su propia numeración, igual que hizo con `modeloc4-nivel.md`. Equivalencias:

| Pide el curso | Está en |
|---|---|
| ADR 1 — decisión de estilo | [ADR-001](ADR-001-estilo-en-capas.md) |
| ADR 2 — aislamiento de persistencia / límites de módulos | [ADR-003](ADR-003-aislamiento-de-datos-con-rls.md) · el **mapa de dependencias permitidas entre módulos sigue pendiente** |
| ADR 3 — referencia al resultado del spike | [ADR-005](ADR-005-integracion-oportunidades-actividades.md) |
| ADR 4 — datos del experimento de carga | [ADR-006](ADR-006-distribucion-y-resiliencia.md) |

## Pendientes conocidos de este conjunto

- Los ADR 001 a 004 **no registran alternativas reales, costo en horas de ingeniería ni reversibilidad**. Declaran explícitamente que no se inventa una alternativa retroactiva, lo cual es honesto, pero la rúbrica pide esos tres campos. El `ADR-007` sí trae esas secciones, con la huella de reversibilidad ya medida.
- El `ADR-001` sigue vigente, pero **su sección de Contexto quedó desactualizada**: nombra `src/lib/crm.ts` como "Operaciones del CRM", y desde el PR #35 ese archivo es la capa de composición mientras las operaciones viven en los módulos.
- Ningún ADR tiene **veredicto de comité**: los primeros cuatro dicen "confirmado por el equipo", que no es lo mismo.

## Plantilla mínima

```md
# ADR-00X — [Título de la decisión]

## Estado
Propuesto / Confirmado / Ajustado / Reconsiderado

## Contexto
[Hechos y restricciones con enlaces a evidencia]

## Decisión del equipo
[Decisión aprobada por el equipo]

## Alternativas consideradas
[Alternativas reales]

## Consecuencias y trade-offs
[Beneficios, costos, riesgos e impacto en calidad]

## Evidencia y trazabilidad
[Commits, mediciones, tests, fuentes]

## Supuestos y seguimiento
[Qué no se ha verificado y próximo experimento]
```

No crear ADRs para funcionalidades rutinarias ni para decisiones que no puedan sostenerse con contexto y evidencia.
