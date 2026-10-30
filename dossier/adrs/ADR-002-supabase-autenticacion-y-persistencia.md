# ADR-002 — Uso de Supabase para autenticación y persistencia

## Estado

**Confirmado.** El equipo confirma el uso de Supabase para autenticación y persistencia del CRM.

## Contexto

La implementación integra Supabase Auth para las sesiones de usuario y PostgreSQL de Supabase para los datos del CRM. El esquema se mantiene en migraciones versionadas y los clientes de integración viven en `src/integrations/supabase/`.

## Decisión del equipo

El CRM utiliza Supabase como plataforma para autenticación y persistencia de datos.

## Alternativas consideradas

No se proporcionó una alternativa considerada de forma histórica. La siguiente comparación es una **evaluación retrospectiva** aprobada el 29/10/2026; no se presenta como parte de la decisión original.

| Alternativa retrospectiva | Evaluación actual |
|---|---|
| Backend propio con autenticación, API y PostgreSQL operados por el equipo | No se adopta. Trasladaría al equipo la operación de sesiones, recuperación de contraseñas, control de acceso e infraestructura. |
| Otro BaaS o Supabase autoalojado | No se adopta. Exigiría migrar autenticación, configuración y despliegue, además de validar de nuevo RLS. Docker local reproduce pruebas, pero no demuestra operación cloud propia. |

### Costo y reversibilidad

El costo verificable actual comprende 6 archivos de integración de Supabase y 5 migraciones versionadas. No hay horas registradas, por lo que el ADR no declara una cifra de esfuerzo.

Cambiar de proveedor afectaría al menos 16 archivos de `src/` que importan la integración de Supabase, además de migraciones, variables de entorno, autenticación y pruebas RLS. Es reversible, pero de costo alto.

## Consecuencias y trade-offs

- La autenticación, las políticas RLS y PostgreSQL se integran a través de una misma plataforma administrada.
- La disponibilidad, límites de plan y control de acceso a la cuenta de Supabase permanecen como dependencias y riesgos documentados en `01-contexto-y-drivers.md`.
- El uso de Supabase local mediante Docker permite reproducir pruebas y experimentos, pero no equivale por sí mismo a medir el comportamiento de la instancia cloud.

### Evaluación aprobada por el equipo

| Valor | Costo | Riesgo residual | Impacto en calidad | Veredicto |
|---|---|---|---|---|
| 🟢 | 🟢 | 🟡 | 🟢 | Confirmada |

El equipo justifica esta evaluación porque Supabase reduce el tiempo de desarrollo, evita construir autenticación propia y beneficia seguridad y operación. La dependencia tecnológica externa conserva una exposición de riesgo moderada.

## Evidencia y trazabilidad

- `src/integrations/supabase/`
- `src/hooks/use-auth.ts`
- `supabase/migrations/`
- `supabase/config.toml`
- `README.md`, secciones Base de datos y Variables de entorno

## Supuestos y seguimiento

El proveedor y la cuenta que aloja el proyecto deben mantener acceso administrado por el equipo. Cualquier cambio de proyecto o de credenciales debe verificarse con las migraciones y las pruebas antes de usarlo en producción. El ADR se reabre si el proveedor no permite cumplir un requisito verificable de aislamiento, recuperación, costo o acceso administrativo del equipo.
