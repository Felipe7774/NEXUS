# ADR-0003 — Conservar el cambio síncrono actual y evaluar outbox para seguimiento diferido

**Fecha:** 16/10/2026. **Estado:** propuesta para revisión mediante PR.
**Veredicto de comité:** no registrado; este documento no afirma aprobación del equipo.

## Contexto

El CRM actual actualiza la etapa con `useMoveDeal` y aplica estado/probabilidad e
historial en triggers PostgreSQL. No crea actividades automáticamente tras ese cambio.
Los drivers existentes priorizan seguridad, disponibilidad y mantenibilidad; el equipo
tiene tiempo y presupuesto limitados. Una integración propuesta entre Ventas y
Seguimiento debe justificar la complejidad adicional.

## Alternativas

| Alternativa | Valor | Costo y riesgo |
|---|---|---|
| Mantener el flujo actual; actividades creadas explícitamente por el usuario | Mantiene comportamiento conocido y no añade operación de colas | No automatiza seguimiento; requiere acción del vendedor |
| Generar actividad y esperar el receptor en la misma petición | Confirmación significa actividad creada | Acopla respuesta a latencia/fallo del receptor; etapa y efecto no forman una transacción distribuida |
| Registrar evento durable y generar actividad después | Permite aceptar cambio mientras el efecto queda pendiente | Introduce consistencia eventual, idempotencia, consumidor, monitoreo y manejo de pendientes |

## Propuesta

Conservar el comportamiento productivo actual durante este PR. Validar las dos
coordinaciones con el Spike 1 y usar su resultado para evaluar un seguimiento
automático si existe una necesidad funcional aceptada. No introducir un broker
distribuido solo para completar el ejemplo de la imagen del curso.

Una aceptación asíncrona debe significar «cambio y evento guardados», sin presentar
la actividad como terminada. El evento v1 usa ID estable y efecto idempotente.

## Consecuencias

- Favorable: menor alcance de cambio; comportamiento existente preservado mientras
  se produce evidencia experimental y una propuesta revisable.
- Desfavorable: el PR no entrega seguimiento automático al usuario final. Adoptarlo
  después requiere UI de pendientes, controles de operación y pruebas adicionales.
- La outbox añade una tabla, dos RPC y un consumidor al laboratorio; la estimación de
  infraestructura cloud sigue sin medirse. La demora artificial no es costo de negocio.
- Reversibilidad del experimento: se descarta su stack y se elimina el harness sin
  migrar datos productivos. El costo de una adopción real debe estimarse sobre su
  implementación definitiva; no se inventan horas históricas.

## Evidencia

- [Dominio y contratos](../../dossier/06-dominio-e-integracion.md).
- [Plan previo](../../dossier/experimentos/spike-01-integracion/PLAN.md), commit `e348616`.
- [Implementación y reproducción](../../dossier/experimentos/spike-01-integracion/README.md).
- Resultados: primera corrida pendiente al redactar esta versión; se añadirán con
  URL de CI y SHA después de ejecutarla, incluso si refuta H1.

## Revisión y gobernanza

Reabrir la propuesta si se aprueba el requisito de automatización, se necesita
responder durante indisponibilidad del consumidor o se exige un plazo verificable
de materialización. Medir ese plazo con una carga y umbral acordados antes de adoptar.
El harness exige invariantes funcionales, aislamiento e idempotencia; falla en CI si
no se cumplen. Los tests de rendimiento no son un SLO productivo.

Este ADR corresponde al **tema 3 del curso, integración**. El antecedente
`dossier/adrs/ADR-003-aislamiento-de-datos-con-rls.md` sigue siendo un registro distinto
de seguridad. Se usan las rutas completas para evitar confundir ambos identificadores;
no se renombra el antecedente ni se finge que tenía otro contenido.
