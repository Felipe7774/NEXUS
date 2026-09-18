# 14 — Plan de evolución y experimentos futuros

> **Estado:** propuesta de evolución para validación del equipo. Los indicadores son metas futuras, no resultados ya demostrados.

## Entradas verificables para planear

| Hallazgo o limitación ya documentada | Fuente | Pregunta que el equipo debe resolver |
|---|---|---|
| El rendimiento se midió contra PostgREST local, no contra el flujo renderizado en navegador. | `04-evidencia-ejecutable.md`, sección 13; EXP-001/EXP-002 | ¿Se requiere medir el flujo completo y bajo qué condiciones? |
| El costo de RLS con mayor volumen no se midió. | `02-escenarios-de-calidad.md`, sección 4 | ¿Qué rango de volumen o carga merece una prueba posterior? |
| Los tres integrantes tienen acceso; la revisión previa identificó cuentas `Owner` sin MFA. | `01-contexto-y-drivers.md`, actualización operativa del 18/09/2026 | ¿Qué rol mínimo requiere cada integrante y cuándo se habilitará MFA? |
| La restauración lógica local fue verificada, pero no hay respaldo automático, almacenamiento externo ni RPO/RTO medidos. | EXP-003; `13-evaluacion-arquitectonica.md` | ¿Dónde se almacenará el respaldo cifrado y con qué periodicidad se repetirá el simulacro? |
| Hubo un indicio de inestabilidad puntual de CI. | `LOG-EDAV-auditoria-ia.md`, Escenario 4 | ¿Debe repetirse la prueba para decidir si existe un problema? |

## Roadmap propuesto

| Horizonte | Objetivos | Experimentos / acciones | Metas propuestas | Riesgo o supuesto asociado | Evidencia de cierre esperada |
|---|---|---|---|---|---|
| Corto plazo (0–3 meses) | Estabilizar la plataforma, corregir incidencias y consolidar métricas. | Aplicar privilegio mínimo; habilitar MFA; programar respaldos cifrados; repetir el simulacro de recuperación; medir tiempos de respuesta, verificar periódicamente RLS y monitorear errores. | 3 integrantes con acceso trazable (alcanzado); 1 restauración lógica exitosa (alcanzado); 100% de cuentas administrativas con MFA; periodicidad y RPO/RTO definidos; error rate < 2%; respuesta promedio < 500 ms; 100% de pruebas RLS exitosas. | Acceso y restauración lógica ya tienen evidencia; las demás cifras siguen siendo metas futuras. | Exportación de roles sin secretos, procedimiento periódico de recuperación, resultados versionados, ejecución de CI y registro de incidentes. |
| Mediano plazo (3–12 meses) | Mejorar capacidad y resiliencia. | Pruebas de carga, optimización de consultas y evaluación de caché para consultas frecuentes. | p95 < 300 ms; disponibilidad > 99%; reducción de consultas lentas. | Las metas requieren definir escenario, carga, instrumento y condiciones antes de medir. | Experimento reproducible y comparación contra un umbral definido previamente. |
| Largo plazo (>12 meses) | Evolucionar la arquitectura según el crecimiento comprobado. | Evaluar microservicios, separar módulos críticos y evaluar replicación de datos si la evidencia lo justifica. | Escalabilidad demostrada; tiempo de despliegue reducido; costo operacional controlado. | No se presupone que microservicios, separación o réplica sean necesarios hoy. | ADR actualizado, decisión trazable y evidencia de la necesidad. |

## Regla de trazabilidad

Cada acción aprobada debe referenciar al menos un ADR, una limitación o una evidencia existente. Si la acción depende de una hipótesis no medida, debe quedar marcada como supuesto.
