# Matrices de fallos y resiliencia — módulo 6

Actualización: 17/10/2026. Referencia: [ADR 0004](adr/0004-distribucion-y-resiliencia.md).
«Implementado» describe código; «medido» exige evidencia del escenario indicado.

| Fallo / componente                       | Efecto en NEXUS                                            | Contención actual                                                      | Evidencia / límite                                                                                 |
| ---------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| REST devuelve 502/503/504 o falla la red | Lecturas de CRM fallan                                     | Circuito abre tras 3 fallos; cooldown 1 s, una sonda                   | EXP-004: 503 artificial, 3 pares; errores siguen siendo errores                                    |
| Dependencia tarda antes de cabeceras     | Espera del llamante                                        | AbortSignal 3 s; cuenta para circuito si es lectura REST               | Tests unitarios; no prueba de corte físico de red                                                  |
| Respuesta comienza y cuerpo se atasca    | Lectura incompleta                                         | El timeout cubre la solicitud; no reintentar automáticamente           | El breaker observa fallo anterior a cabeceras; no garantiza detectar todos los fallos de streaming |
| Auth devuelve 401/403 o JWT vencido      | No hay acceso autorizado                                   | No abrir circuito por errores 4xx; Auth fuera del circuito             | Tests; se conserva RLS, sin fallback de permisos                                                   |
| Escritura de resultado incierto          | Posible duplicación si se reintenta                        | Adaptador no repite ni bloquea escrituras con breaker de lectura       | Test de paso directo; idempotencia productiva pendiente para eventos                               |
| Aumento de usuarios                      | Más competencia por recursos del stack                     | Medir mesetas 5/50/100/150/200 antes de decidir extracción             | `/experimentos/crecimiento-S11/`; no suponer causa exacta sin trazas del pool                      |
| Consulta a tablas de otro módulo         | Acoplamiento y cambios coordinados                         | Propietarios explícitos + composición por API pública + AST/ArchUnitTS | CI rechaza FROM/JOIN ajeno, tabla dinámica, import privado y ciclos                                |
| PostgreSQL caído                         | CRM pierde persistencia; Auth también puede depender de DB | Error acotado y breaker de lectura                                     | Sin réplica/failover implementado; no ofrece alta disponibilidad                                   |
| Fallo de proceso de aplicación           | Interfaz no disponible                                     | Healthcheck Docker                                                     | Reinicio/failover de producción y RTO/RPO no ensayados                                             |

| Táctica                  | Decisión                            | Condición verificable / trade-off                                                 |
| ------------------------ | ----------------------------------- | --------------------------------------------------------------------------------- |
| Timeout                  | Implementado: 3.000 ms              | Limita espera, no repara dependencia                                              |
| Circuit breaker          | Implementado y medido               | Menos intentos durante fallo; puede rechazar lecturas durante cooldown            |
| Retry/backoff/jitter     | No añadido al adaptador             | Medir amplificación; escrituras necesitan idempotencia antes de repetir           |
| Bulkhead/pools separados | Propuesta                           | Requiere demostrar recurso compartido agotado; abrir otro pool no crea CPU        |
| Caché/fallback de datos  | Propuesta                           | Requiere política de frescura, permisos e invalidación; no devolver éxitos vacíos |
| Outbox/worker            | Spike M5, propuesta para producción | Idempotencia, reentrega y monitoreo; introduce consistencia eventual              |
| Réplicas/autoscaling     | Propuesta                           | Demostrar demanda, cuello y presupuesto; evitar multiplicar conexiones a DB       |

La regla estática protege el código TypeScript revisado. No crea bases físicas por
servicio ni roles SQL por módulo: FKs, políticas RLS y despliegue de migraciones
continúan compartidos. Accesos SQL/RPC nuevos requieren revisar el contrato y el
control; no se presenta el escáner como un sandbox contra código malicioso.
Los RPC `soft_delete_company`, `soft_delete_contact`, `soft_delete_deal` tienen
propietario explícito y solo actualizan la tabla de ese módulo. Comprueban sesión
y acceso al propietario en SQL, `search_path` vacío y ejecución solo autenticada.
La prueba real verifica rechazo anónimo/ajeno y ocultación de la fila eliminada.
