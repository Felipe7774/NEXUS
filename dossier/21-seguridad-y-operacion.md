# 21 — Seguridad, despliegue y operación (Módulo 7)

> **Estado: inventario verificado + plantillas por completar.** Todo lo que está en las tablas de *controles existentes* fue comprobado contra el código el 23/10/2026. El modelado de amenazas, la priorización y la aceptación de riesgo residual son del equipo: la rúbrica los evalúa como trabajo propio.
>
> Este módulo cubre las semanas 13-14, que hasta hoy no tenían ningún entregable en el dossier.

## El hallazgo que ordena todo el módulo

El sistema tiene **controles preventivos sólidos y verificables**, y prácticamente **ninguna capacidad de detección**.

La prueba no es teórica: cuando el proyecto de Supabase fue eliminado en septiembre, **el equipo no se enteró por una alerta sino porque una persona lo avisó**. El mismo patrón se repitió en octubre con el build de Vercel, que estuvo roto una semana sin que nadie lo notara, bloqueado por un CVE.

Dos incidentes reales, ninguno detectado por el sistema. Ese es el eje honesto del Módulo 7.

---

## 1. Activos y flujos críticos

Inventario verificable, base para el modelado de amenazas.

| Activo | Dónde vive | Exposición |
|---|---|---|
| Datos del CRM | 14 tablas en PostgreSQL | API REST pública de Supabase, protegida por RLS |
| Identidad y sesiones | Supabase Auth (GoTrue) | Endpoint público de autenticación |
| Clave `service_role` | Variable de entorno, solo servidor | Bypassa RLS por completo |
| Claves publicables | Bundle del navegador | Públicas por diseño |
| Esquema y políticas | `supabase/migrations/` | Versionado en Git |
| Credenciales de despliegue | Vercel y Supabase | Cuentas administradas por integrantes |

**Flujos críticos:** autenticación → sesión → consulta con RLS → render; y el flujo administrativo que usa `service_role` sin RLS.

## 2. Controles que ya existen y están verificados

Esto es lo que hay **hoy en el código**, con su punto de aplicación y cómo se comprueba.

| Control | Dónde aplica | Verificación |
|---|---|---|
| **RLS** en toda la base | 40 políticas sobre 14 tablas | `rls-isolation.integration.test.ts` — corre en cada PR |
| **Frontera del cliente privilegiado** | `service_role` solo en `*.server.ts` | `service-role-boundary.test.ts` — probada rompiéndola adrede |
| **Aislamiento de secretos por bundler** | Vite solo inyecta variables con prefijo `VITE_`; la clave se lee sin ese prefijo | Verificado el 23/10/2026 |
| **Protección de importación** | `importProtection` en `vite.config.ts`, con `behavior: "error"` | Falla el build |
| **Propiedad de datos por módulo** | Toda consulta respeta al propietario y sus JOINs | `persistence-fitness.test.ts` |
| **Ausencia de ciclos entre módulos** | ArchUnitTS | `persistence-fitness.test.ts` — incluye un ciclo deliberado |
| **Timeout de lectura** | 3.000 ms por request a Supabase | `supabase-fetch.ts` |
| **Circuit breaker** | Abre tras **3 fallos**, enfría **1.000 ms** | `read-circuit-breaker.test.ts` |
| **Captura de errores fuera de banda** | Recupera el stack que h3 descarta en un 500 genérico | `error-capture.ts` |
| **Traza de auditoría del cambio de etapa** | Trigger `deals_stage_history` → tabla `deal_stage_history`, con `changed_by` hacia `profiles` y RLS activa | Migración inicial; verificado el 23/10/2026 |
| **Puerta de integración** | Ningún merge sin `unit-tests` ni `rls-integration-test` | Branch protection, probada en vivo bloqueando un merge |

> **Cuatro de estos controles se probaron rompiéndolos a propósito.** Es la diferencia entre un control declarado y uno verificado, y conviene decirlo en la defensa.

### Superficie realmente alcanzable

Hallazgo de la auditoría del 23/10/2026, que acota la superficie de ataque mejor que cualquier declaración: de las **14 tablas**, solo **8 tienen dueño declarado** en `src/architecture/persistence-rules.ts`. Como la fitness function trata cualquier `.from()` fuera de `src/modules/*/api.ts` como violación, las otras seis —`deal_stage_history`, `tags`, `taggables`, `stakeholders`, `stakeholder_relationships` y `client_documents`— **no se pueden consultar desde el código sin romper el CI**, y de hecho ninguna se consulta.

La lectura correcta tiene dos caras y conviene dar las dos:

- **A favor:** reduce la superficie de ataque de la aplicación a 8 tablas. Las otras seis quedan protegidas por RLS *y* por una barrera estática.
- **En contra:** `stakeholders` se agregó como entregable en la semana 3 y hoy es **esquema sin consumidor**. No es un riesgo de seguridad, pero sí una inconsistencia entre lo entregado y lo usado.

## 3. Lo que NO existe — brecha de detección

| Capacidad | Estado |
|---|---|
| Métricas de aplicación | **No existe** |
| Logs estructurados con correlación | **No existe.** Solo `console.error` hacia el pipeline del host |
| Trazas | **No existe** |
| Alertas | **No existe** |
| SLO definidos | **No existe** |
| Runbooks | **No existe** |
| Auditoría de acciones de usuario | **Parcial.** Solo el cambio de etapa queda registrado, y **ninguna parte de la aplicación lee esa tabla** |
| Monitoreo de disponibilidad del proveedor | **No existe** — el incidente de septiembre lo demuestra |

**Consecuencia directa y comprobada:** los dos incidentes reales del proyecto se detectaron por aviso humano, no por el sistema.

## 4. Matriz STRIDE

`[COMPLETAR — EQUIPO]`

El modelado de amenazas es trabajo del equipo. Abajo quedan la estructura y los activos ya inventariados; **la identificación, la priorización y la aceptación de riesgo residual son decisiones propias**.

> **Advertencia de método de la propia lámina:** *"la existencia de autenticación no cierra por sí sola todas las categorías de amenaza"*. Conviene no marcar una categoría como cubierta solo porque hay login.

| Categoría STRIDE | Amenaza concreta sobre un activo | Prioridad | Control que aplica | Dónde se verifica | Riesgo residual |
|---|---|---|---|---|---|
| **S** — Suplantación | `[COMPLETAR]` | `[  ]` | `[COMPLETAR]` | `[COMPLETAR]` | `[COMPLETAR]` |
| **T** — Manipulación | `[COMPLETAR]` | `[  ]` | `[COMPLETAR]` | `[COMPLETAR]` | `[COMPLETAR]` |
| **R** — Repudio | `[COMPLETAR]` | `[  ]` | `[COMPLETAR]` | `[COMPLETAR]` | `[COMPLETAR]` |
| **I** — Divulgación | `[COMPLETAR]` | `[  ]` | `[COMPLETAR]` | `[COMPLETAR]` | `[COMPLETAR]` |
| **D** — Denegación | `[COMPLETAR]` | `[  ]` | `[COMPLETAR]` | `[COMPLETAR]` | `[COMPLETAR]` |
| **E** — Elevación | `[COMPLETAR]` | `[  ]` | `[COMPLETAR]` | `[COMPLETAR]` | `[COMPLETAR]` |

**Pistas de dónde hay evidencia real para apoyarse, sin que esto sustituya el análisis:**

- *Repudio* es la categoría más descubierta, pero **no está vacía, como afirmaba la primera versión de este documento**. El trigger `deals_stage_history` registra quién movió qué oportunidad, de qué etapa a cuál y cuándo. Lo que falta es alcance y uso: cubre **solo** el cambio de etapa, la aplicación **nunca la lee**, y el resto de las acciones no deja rastro. Exponer esa traza es probablemente la mitigación más barata de todo el módulo, porque el dato ya se está escribiendo.
- *Elevación* tiene el control más fuerte y verificado: la frontera de `service_role`, con tres capas.
- *Denegación* tiene controles parciales medidos: timeout de 3 s y circuit breaker, pero **no se midió** el comportamiento del sistema bajo ataque, solo bajo carga.
- *Divulgación* tiene RLS, pero el hueco declarado es que **las 40 políticas nunca se auditaron una por una** (riesgo R4).

## 5. Riesgos operativos

`[COMPLETAR — EQUIPO]` la priorización y la aceptación. Los hechos están verificados.

| Riesgo operativo | Evidencia de que es real | Mitigación actual | Pendiente |
|---|---|---|---|
| Pérdida del proyecto del proveedor | **Ocurrió** en septiembre de 2026 | Esquema versionado; restauración probada en EXP-003 | Sin respaldo automático ni externo; RPO/RTO sin medir |
| Dependencia de una sola cuenta administradora | **Ocurrió dos veces**: Supabase en septiembre, Vercel en octubre | Acceso de los 3 integrantes a Supabase desde el 18/09 | Vercel sigue en una sola cuenta; MFA pendiente |
| Vulnerabilidad en dependencia | **Ocurrió**: CVE-2026-102989 bloqueó deploys una semana | Vercel bloquea el deploy automáticamente | Sin alerta propia; se detectó al investigar otra cosa |
| Caída silenciosa en producción | No detectada hasta hoy por falta de instrumentación | Ninguna | Todo el plan de observabilidad |

## 6. Plan de observabilidad

`[COMPLETAR — EQUIPO]`

Debe conectarse con los modos de fallo ya identificados en [`../docs/resilience_matrix.md`](../docs/resilience_matrix.md), que es trabajo del Módulo 6 y sirve de insumo directo.

| Qué observar | Señal | Umbral / SLO | Qué acción dispara |
|---|---|---|---|
| Disponibilidad del proveedor | `[COMPLETAR]` | `[COMPLETAR]` | `[COMPLETAR]` |
| Latencia de lectura | `[COMPLETAR]` | `[COMPLETAR]` | `[COMPLETAR]` |
| Tasa de error | `[COMPLETAR]` | `[COMPLETAR]` | `[COMPLETAR]` |
| Aperturas del circuit breaker | `[COMPLETAR]` | `[COMPLETAR]` | `[COMPLETAR]` |

> **Criterio de realidad:** el plan debe ser proporcional a un equipo de 3 personas con 6-8 horas semanales y plan gratuito. Proponer una pila de observabilidad de empresa sería el mismo error de sobreingeniería que el módulo 4 enseñó a evitar.

## 7. Despliegue y alternativas

`[COMPLETAR — EQUIPO]` la comparación con costo relativo.

**Estado actual verificado:** una unidad de despliegue en Vercel, con Supabase gestionado. Producción respondiendo en `https://nexus-green-xi.vercel.app`, apuntando al proyecto vigente.

## 8. ADR del módulo

El módulo pide un **ADR 5**. En la numeración del equipo corresponde el **ADR-008**, por la misma razón documentada en `adrs/README.md`: los números del curso y los del repositorio no coinciden, y existe una tabla de equivalencias.

`[COMPLETAR — EQUIPO]` el tema concreto. Sale del resultado del modelado: lo natural es que documente la decisión de seguridad u operación que el equipo tome a partir de la matriz STRIDE y del plan de observabilidad.
