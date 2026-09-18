# ADRs — Registro de decisiones arquitectónicas

> **Estado actual:** contiene cuatro ADRs confirmados por el equipo. Las demás decisiones deben registrarse solo cuando el equipo las identifique y valide durante Módulo 8.

## ADRs registrados

- [`ADR-001-estilo-en-capas.md`](ADR-001-estilo-en-capas.md) — confirmado; su evidencia está en la organización observable del repositorio.
- [`ADR-002-supabase-autenticacion-y-persistencia.md`](ADR-002-supabase-autenticacion-y-persistencia.md) — confirmado; plataforma de autenticación y persistencia.
- [`ADR-003-aislamiento-de-datos-con-rls.md`](ADR-003-aislamiento-de-datos-con-rls.md) — confirmado; control de acceso en la capa de datos.
- [`ADR-004-arquitectura-monolitica.md`](ADR-004-arquitectura-monolitica.md) — confirmado; una única aplicación y unidad de despliegue.

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
