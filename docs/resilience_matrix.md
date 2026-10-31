# Matrices de fallos y resiliencia — módulo 6

Actualización: 23/10/2026. Referencia: [ADR-006](../dossier/adrs/ADR-006-distribucion-y-resiliencia.md).
«Implementado» describe código; «medido» exige evidencia del escenario indicado.

## Cómo leer la columna «Origen»

Agregada el 23/10/2026 para que la distinción entre lo observado y lo hipotético **esté etiquetada y no haya que inferirla** leyendo la columna de evidencia. Tres valores, y la diferencia entre los dos primeros importa:

| Valor | Significado |
| --- | --- |
| **Ocurrió** | El fallo se materializó en el sistema real, fuera de un experimento |
| **Inducido** | Se provocó a propósito en un experimento o en una prueba automatizada |
| **Hipotético** | Está razonado a partir del diseño, pero nunca se observó ni se indujo |

Un fallo **inducido** no equivale a uno **ocurrido en producción**: el primero prueba que el control reacciona, el segundo prueba que el fallo es real. Mezclarlos sería presentar una simulación como un incidente.

## Matriz de fallos

| Fallo / componente | Origen | Efecto en NEXUS | Contención actual | Evidencia / límite |
| --- | --- | --- | --- | --- |
| **Pérdida del proyecto del proveedor** | **Ocurrió** — septiembre 2026 | Pérdida total de persistencia y autenticación | Esquema versionado en `supabase/migrations/`; restauración probada | `EXP-003`, 18/09/2026: 14 tablas y 4 usuarios con conteos coincidentes. **Nadie se enteró por una alerta; avisó una persona.** RPO y RTO sin medir |
| **Deploy bloqueado por vulnerabilidad en dependencia** | **Ocurrió** — octubre 2026 | Ninguna entrega llega a producción | Vercel bloquea el despliegue automáticamente | CVE-2026-102989 en `@tanstack/react-start`, corregido en el PR #39. **Estuvo roto una semana y se descubrió investigando otra cosa** |
| REST devuelve 502/503/504 o falla la red | Inducido | Lecturas de CRM fallan | Circuito abre tras 3 fallos; cooldown 1 s, una sonda | EXP-004: 503 artificial, 3 pares; errores siguen siendo errores |
| Dependencia tarda antes de cabeceras | Inducido | Espera del llamante | AbortSignal 3 s; cuenta para circuito si es lectura REST | Tests unitarios; no prueba de corte físico de red |
| Respuesta comienza y cuerpo se atasca | Hipotético | Lectura incompleta | El timeout cubre la solicitud; no reintentar automáticamente | El breaker observa fallo anterior a cabeceras; no garantiza detectar todos los fallos de streaming |
| Auth devuelve 401/403 o JWT vencido | Inducido | No hay acceso autorizado | No abrir circuito por errores 4xx; Auth fuera del circuito | Tests; se conserva RLS, sin fallback de permisos |
| Escritura de resultado incierto | Hipotético | Posible duplicación si se reintenta | Adaptador no repite ni bloquea escrituras con breaker de lectura | Test de paso directo; idempotencia productiva pendiente para eventos |
| Aumento de usuarios | **Inducido y medido** | Más competencia por recursos del stack | Medir mesetas 5/50/100/150/200 antes de decidir extracción | `/experimentos/crecimiento-S11/`: quiebre en **50 VUs**; no suponer causa exacta sin trazas del pool |
| Consulta a tablas de otro módulo | Inducido | Acoplamiento y cambios coordinados | Propietarios explícitos + composición por API pública + AST/ArchUnitTS | CI rechaza FROM/JOIN ajeno, tabla dinámica, import privado y ciclos. Violación deliberada ejecutada: ver [`26-demostracion-fitness-function.md`](../dossier/26-demostracion-fitness-function.md) |
| Acceso ajeno a datos de otro usuario | Inducido | Fuga de datos entre usuarios | 40 políticas RLS sobre 14 tablas | `rls-isolation.integration.test.ts`: **8 casos sobre 4 tablas** desde el PR #59. Las 40 políticas no se auditaron una por una (riesgo R4) |
| PostgreSQL caído | Hipotético | CRM pierde persistencia; Auth también puede depender de DB | Error acotado y breaker de lectura | Sin réplica/failover implementado; no ofrece alta disponibilidad |
| Fallo de proceso de aplicación | Hipotético | Interfaz no disponible | Healthcheck Docker | Reinicio/failover de producción y RTO/RPO no ensayados |
| **Caída silenciosa en producción** | Hipotético | El sistema falla y nadie se entera | **Ninguna** | Cero métricas, trazas, alertas y SLO. Los dos fallos marcados «Ocurrió» los detectó una persona, no el sistema |

**Resumen:** 2 ocurrieron en producción, 6 se indujeron, 5 son hipotéticos.

## Matriz de tácticas

| Táctica | Decisión | Condición verificable / trade-off |
| --- | --- | --- |
| Timeout | Implementado: 3.000 ms | Limita espera, no repara dependencia |
| Circuit breaker | Implementado y medido | Menos intentos durante fallo; puede rechazar lecturas durante cooldown. **No se midió cuántas lecturas legítimas rechaza** (mini-comité 2, respuesta 10) |
| Aislamiento por RLS | Implementado y medido | 8 casos sobre 4 tablas en CI; las 40 políticas sin auditar una por una |
| Propiedad de datos por módulo | Implementado y verificado rompiéndolo | Violación deliberada ejecutada en CI: PR #60, corrida 40051537724 |
| Retry/backoff/jitter | No añadido al adaptador | Medir amplificación; escrituras necesitan idempotencia antes de repetir |
| Bulkhead/pools separados | Propuesta | Requiere demostrar recurso compartido agotado; abrir otro pool no crea CPU |
| Caché/fallback de datos | Propuesta | Requiere política de frescura, permisos e invalidación; no devolver éxitos vacíos |
| Outbox/worker | Spike M5, propuesta para producción | Idempotencia, reentrega y monitoreo; introduce consistencia eventual |
| Réplicas/autoscaling | Propuesta | Demostrar demanda, cuello y presupuesto; evitar multiplicar conexiones a DB |
| Observabilidad y alertas | **No existe** | Brecha declarada del Módulo 7; sin ella el SLO comprometido no se puede verificar |

## Qué no afirma este documento

- Que los fallos **hipotéticos** no vayan a ocurrir. Significa que no se observaron ni se indujeron, nada más.
- Que un fallo **inducido** equivalga a uno ocurrido en producción. La inducción prueba la reacción del control, no la frecuencia del fallo.
- Que las tácticas marcadas como **propuesta** estén implementadas. No lo están, y por eso se marcan así.

## Alcance de la regla estática

La regla estática protege el código TypeScript revisado. No crea bases físicas por
servicio ni roles SQL por módulo: FKs, políticas RLS y despliegue de migraciones
continúan compartidos. Accesos SQL/RPC nuevos requieren revisar el contrato y el
control; no se presenta el escáner como un sandbox contra código malicioso.
Los RPC `soft_delete_company`, `soft_delete_contact`, `soft_delete_deal` tienen
propietario explícito y solo actualizan la tabla de ese módulo. Comprueban sesión
y acceso al propietario en SQL, `search_path` vacío y ejecución solo autenticada.
La prueba real verifica rechazo anónimo/ajeno y ocultación de la fila eliminada.
