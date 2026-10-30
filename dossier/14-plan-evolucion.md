# 14 — Plan de evolución y experimentos futuros

> **Estado:** plan de evolución aprobado por el equipo el 29/10/2026. Los indicadores son metas futuras, no resultados ya demostrados.

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
| Corto plazo (0–3 meses) | Estabilizar la plataforma, corregir incidencias y consolidar métricas. | Aplicar privilegio mínimo; habilitar MFA; programar respaldos cifrados; repetir el simulacro de recuperación; medir tiempos de respuesta, verificar periódicamente RLS y monitorear errores. | 3 integrantes con acceso trazable (alcanzado); 1 restauración lógica exitosa (alcanzado); 100% de cuentas administrativas con MFA; periodicidad y RPO/RTO definidos; error rate < 2% cuando exista monitoreo y se defina como solicitudes con error de servidor durante un periodo documentado; cobertura trazable de las políticas RLS priorizadas. | Acceso y restauración lógica ya tienen evidencia; las demás cifras siguen siendo metas futuras. No se afirma cobertura completa de RLS hasta auditarla política por política. | Exportación de roles sin secretos, procedimiento periódico de recuperación, resultados versionados, ejecución de CI, matriz de políticas RLS y registro de incidentes. |
| Mediano plazo (3–12 meses) | Mejorar capacidad y resiliencia. | Medir el flujo completo de navegador a producción; pruebas de carga; optimización de consultas y evaluación de caché para consultas frecuentes. | p95 < 300 ms solo después de documentar semilla, concurrencia, red y flujo medido; disponibilidad > 99% solo cuando exista monitoreo que permita calcularla; reducción de consultas lentas. | Las metas requieren definir escenario, carga, instrumento y condiciones antes de medir. | Experimento reproducible y comparación contra un umbral definido previamente. |
| Largo plazo (>12 meses) | Evolucionar la arquitectura según el crecimiento comprobado. | Reabrir ADR-004 o ADR-007 para evaluar separación de módulos, microservicios o replicación de datos solo si la evidencia lo justifica. | Escalabilidad demostrada; tiempo de despliegue reducido; costo operacional controlado. | No se presupone que microservicios, separación o réplica sean necesarios hoy. Los disparadores son necesidad de despliegue independiente o un cuello de botella no resoluble dentro del monolito. | ADR actualizado, decisión trazable y evidencia de la necesidad. |

## Regla de trazabilidad

Cada acción aprobada debe referenciar al menos un ADR, una limitación o una evidencia existente. Si la acción depende de una hipótesis no medida, debe quedar marcada como supuesto.
