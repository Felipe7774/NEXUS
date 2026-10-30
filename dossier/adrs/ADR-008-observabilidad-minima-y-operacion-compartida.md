# ADR-008 — Observabilidad mínima y operación compartida sobre servicios gestionados

## Estado

**Confirmado por el equipo el 29/10/2026.** La decisión está aprobada; su implementación queda pendiente y se sigue en `14-plan-evolucion.md`.

## Contexto

Nexus se despliega como una aplicación en Vercel con Supabase gestionado. Dos incidentes reales mostraron una brecha de detección: la eliminación del proyecto de Supabase en septiembre y el bloqueo de despliegues de Vercel por un CVE en octubre fueron detectados por personas, no por el sistema.

El equipo tiene controles preventivos verificables, como RLS, fronteras de `service_role`, CI, timeout y circuit breaker. No tiene todavía métricas, alertas, trazas, SLO ni runbooks operativos.

## Decisión del equipo

El equipo mantiene Vercel y Supabase gestionados e incorpora una observabilidad mínima: monitor sintético de aplicación y proveedor, registro de latencia y errores, seguimiento de aperturas del circuit breaker y un procedimiento de respuesta a incidentes.

El equipo compartirá el acceso administrativo, habilitará MFA en cuentas administrativas y documentará respaldo, recuperación e incidentes.

## Alternativas consideradas

| Alternativa | Decisión | Razón |
|---|---|---|
| No agregar detección y depender de avisos humanos | Descartada | Los dos incidentes reales mostraron que este modelo deja fallos sin detectar. |
| Pila empresarial de observabilidad con métricas, trazas y alertas completas | Postergada | Su costo de operación no es proporcional a un equipo de tres personas con 6–8 horas semanales y plan gratuito. |
| Autoalojar aplicación y Supabase con Docker | Descartada | Docker aporta reproducibilidad local, pero la operación de producción agrega respaldo, actualizaciones, monitoreo y respuesta a incidentes. |
| Vercel y Supabase gestionados con observabilidad mínima | Adoptada | Conserva bajo costo operativo y mejora la capacidad de detección con señales accionables. |

## Consecuencias y trade-offs

| Aspecto | Consecuencia |
|---|---|
| Detección | Mejora cuando se implementen monitor, señales y acciones documentadas. |
| Operación | Añade trabajo periódico de revisar alertas, incidentes y respaldos. |
| Costo | Mantiene servicios gestionados y evita operar infraestructura propia. |
| Dependencia | Conserva dependencia de Vercel y Supabase; se mitiga con acceso compartido, MFA y procedimientos de recuperación. |

## Evidencia y trazabilidad

- `21-seguridad-y-operacion.md` — activos, controles, incidentes y plan de observabilidad.
- `24-matriz-stride.md` — amenazas, riesgos residuales y aceptación del equipo.
- `experimentos/EXP-003-recuperacion/README.md` — recuperación lógica verificada.
- `src/integrations/supabase/supabase-fetch.ts` y `read-circuit-breaker.test.ts` — timeout y circuit breaker.
- `14-plan-evolucion.md` — metas e implementación futura.

## Supuestos y seguimiento

La decisión se reabre si las señales mínimas no permiten detectar o diagnosticar incidentes a tiempo, o si el crecimiento obliga a una plataforma de observabilidad más completa.

El cierre de implementación requiere evidencia de monitor activo, umbrales operativos, procedimiento de respuesta, acceso administrativo compartido y MFA en cuentas administrativas.
