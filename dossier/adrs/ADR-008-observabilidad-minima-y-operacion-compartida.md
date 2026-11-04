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

### Reversibilidad

Agregada el 03/11/2026 a pedido de la auditoría del Módulo 7 (M7-08), con el mismo criterio del [`ADR-007`](ADR-007-particion-por-dominio.md): costo observable, no estimado a ojo.

**Estado actual:** la decisión está aprobada pero **no implementada**, así que hoy no hay nada que revertir. El costo de reversión es cero mientras ese estado no cambie.

**Cuando se implemente**, revertir significa retirar lo que se haya agregado. Lo que el equipo puede afirmar sin medirlo todavía:

| Qué se agregaría | Qué cuesta deshacerlo |
|---|---|
| Monitor sintético externo | Dar de baja el servicio. No deja dependencias en el código |
| Registro de latencia y errores en el cliente de Supabase | Revertir el cambio en `supabase-fetch.ts`, que es el único punto de instrumentación previsto |
| Acceso administrativo compartido y MFA | **No se revierte**: quitar MFA o volver a una sola cuenta reintroduce un riesgo que ya se materializó dos veces |

**Lo que hace reversible esta decisión** es que no cambia la arquitectura: no introduce un proceso nuevo, ni una base de datos, ni un contrato entre módulos. Es instrumentación y gobernanza de cuentas. Por eso su costo de reversión es de otro orden que el del [`ADR-007`](ADR-007-particion-por-dominio.md), donde deshacer la partición exige tocar 10 archivos.

`[COMPLETAR — EQUIPO]` las horas, una vez implementado. El historial dará las fechas; el esfuerzo lo pone el equipo.

## Evidencia y trazabilidad

- `21-seguridad-y-operacion.md` — activos, controles, incidentes y plan de observabilidad.
- `24-matriz-stride.md` — amenazas, riesgos residuales y aceptación del equipo.
- `experimentos/EXP-003-recuperacion/README.md` — recuperación lógica verificada.
- `src/integrations/supabase/supabase-fetch.ts` y `read-circuit-breaker.test.ts` — timeout y circuit breaker.
- `14-plan-evolucion.md` — metas e implementación futura.

## Supuestos y seguimiento

La decisión se reabre si las señales mínimas no permiten detectar o diagnosticar incidentes a tiempo, o si el crecimiento obliga a una plataforma de observabilidad más completa.

El cierre de implementación requiere evidencia de monitor activo, umbrales operativos, procedimiento de respuesta, acceso administrativo compartido y MFA en cuentas administrativas.
