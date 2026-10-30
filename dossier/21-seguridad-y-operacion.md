# 21 — Seguridad, despliegue y operación (Módulo 7)

> **Estado: evaluación aprobada por el equipo el 29/10/2026.** Los controles existentes fueron comprobados contra el código el 23/10/2026. El equipo aprobó el modelado STRIDE, la aceptación temporal de riesgos, el plan mínimo de observabilidad, la decisión de despliegue y ADR-008.
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

El equipo identificó, priorizó y aceptó temporalmente los riesgos residuales siguientes. Cada aceptación conserva una acción de mitigación concreta.

> **La matriz desarrollada vive en [`24-matriz-stride.md`](24-matriz-stride.md)**, con la superficie y los controles verificados desglosados por categoría. La tabla de abajo es el resumen; esa es la hoja de trabajo.

> **Advertencia de método de la propia lámina:** *"la existencia de autenticación no cierra por sí sola todas las categorías de amenaza"*. Conviene no marcar una categoría como cubierta solo porque hay login.

| Categoría STRIDE | Amenaza concreta sobre un activo | Prioridad | Control que aplica | Dónde se verifica | Riesgo residual |
|---|---|---|---|---|---|
| **S** — Suplantación | Una cuenta comprometida podría iniciar sesión como usuario porque MFA está habilitada, pero no es obligatoria. | Alta | Supabase Auth, JWT, MFA TOTP disponible y confirmación doble en cambios sensibles | `use-auth.ts`; `supabase/config.toml` | Medio, aceptado temporalmente mientras se exige MFA en cuentas administrativas |
| **T** — Manipulación | Un uso indebido del flujo con `service_role` podría modificar datos ignorando RLS. | Alta | RLS, RPC de borrado lógico, reglas de persistencia y prueba de aislamiento | Migraciones; `persistence-fitness.test.ts`; `rls-isolation.integration.test.ts` | Medio, aceptado mientras `service_role` siga limitado a servidor y protegido por fitness function |
| **R** — Repudio | Un usuario podría negar crear, editar o eliminar datos porque solo los cambios de etapa tienen traza atribuible. | Alta | Trigger append-only `deal_stage_history` para cambios de etapa | Migración inicial; tabla `deal_stage_history` | Alto, aceptado temporalmente; falta traza para crear, editar y eliminar |
| **I** — Divulgación | Una política RLS mal configurada podría permitir leer datos de otro usuario. | Alta | RLS, frontera de `service_role`, variables sin prefijo `VITE_` y CI | Migraciones; `service-role-boundary.test.ts`; CI | Medio, aceptado con auditoría progresiva de las 40 políticas RLS |
| **D** — Denegación | Una sobrecarga o límite del proveedor podría degradar la API. | Alta | Timeout de 3 s, circuit breaker y consultas por lotes | `supabase-fetch.ts`; `read-circuit-breaker.test.ts`; S11 | Alto, aceptado temporalmente mientras se implementa monitoreo y alerta |
| **E** — Elevación | Un fallo en el uso de `service_role` o una función privilegiada podría otorgar acceso administrativo indebido. | Alta | Frontera de `service_role`, `SECURITY DEFINER` con `search_path` fijo y roles en tabla propia | `service-role-boundary.test.ts`; migraciones | Bajo-Medio, aceptado mientras CI bloquee violaciones y se controle el acceso administrativo |

**Pistas de dónde hay evidencia real para apoyarse, sin que esto sustituya el análisis:**

- *Repudio* es la categoría más descubierta, pero **no está vacía, como afirmaba la primera versión de este documento**. El trigger `deals_stage_history` registra quién movió qué oportunidad, de qué etapa a cuál y cuándo. Lo que falta es alcance y uso: cubre **solo** el cambio de etapa, la aplicación **nunca la lee**, y el resto de las acciones no deja rastro. Exponer esa traza es probablemente la mitigación más barata de todo el módulo, porque el dato ya se está escribiendo.
- *Elevación* tiene el control más fuerte y verificado: la frontera de `service_role`, con tres capas.
- *Denegación* tiene controles parciales medidos: timeout de 3 s y circuit breaker, pero **no se midió** el comportamiento del sistema bajo ataque, solo bajo carga.
- *Divulgación* tiene RLS, pero el hueco declarado es que **las 40 políticas nunca se auditaron una por una** (riesgo R4).

## 5. Riesgos operativos

| Riesgo operativo | Prioridad | Riesgo residual y aceptación | Mitigación actual | Pendiente |
|---|---|---|---|---|
| Pérdida del proyecto del proveedor | Alta | Alto, aceptado temporalmente | Esquema versionado; restauración probada en EXP-003 | Respaldo automático externo; RPO/RTO definidos |
| Dependencia de una sola cuenta administradora | Alta | Medio, aceptado temporalmente | Acceso de los 3 integrantes a Supabase desde el 18/09 | Acceso compartido y MFA en Vercel |
| Vulnerabilidad en dependencia | Media | Medio, aceptado | Vercel bloquea el deploy automáticamente | Alerta propia y revisión periódica de dependencias |
| Caída silenciosa en producción | Alta | Alto, aceptado temporalmente | Ninguna | Plan de observabilidad aprobado abajo |

## 6. Plan de observabilidad

Debe conectarse con los modos de fallo ya identificados en [`../docs/resilience_matrix.md`](../docs/resilience_matrix.md), que es trabajo del Módulo 6 y sirve de insumo directo.

| Qué observar | Señal | Umbral / SLO | Qué acción dispara |
|---|---|---|---|
| Disponibilidad del proveedor | Monitor sintético de la aplicación y verificación no mutante de Supabase | Alerta tras 2 fallos consecutivos en 10 minutos | Revisar Vercel/Supabase, registrar incidente y aplicar el runbook de recuperación si corresponde |
| Latencia de lectura | Duración registrada en el cliente de Supabase | Investigar lecturas mayores a 2.000 ms o timeout de 3.000 ms | Revisar consulta, RLS, proveedor y carga antes de optimizar |
| Tasa de error | Errores de servidor y respuestas fallidas registradas | Más de 2% en una ventana documentada de 15 minutos | Revisar logs, identificar ruta afectada y abrir incidente |
| Aperturas del circuit breaker | Transición del breaker a estado abierto | 3 aperturas en una hora | Revisar disponibilidad del proveedor; no reintentar en bucle ni ocultar el fallo |

> **Criterio de realidad:** el plan debe ser proporcional a un equipo de 3 personas con 6-8 horas semanales y plan gratuito. Proponer una pila de observabilidad de empresa sería el mismo error de sobreingeniería que el módulo 4 enseñó a evitar.

## 7. Despliegue y alternativas

**Estado actual verificado:** una unidad de despliegue en Vercel, con Supabase gestionado. Producción respondiendo en `https://nexus-green-xi.vercel.app`, apuntando al proyecto vigente.

| Alternativa | Costo relativo | Decisión del equipo |
|---|---|---|
| Vercel + Supabase gestionados | Bajo | Mantenerla. Ya funciona, reduce operación y es adecuada para tres personas. |
| Autoalojar aplicación y Supabase con Docker | Alto | No adoptar. Docker sirve para pruebas reproducibles, pero operar producción exige respaldo, actualizaciones, monitoreo y respuesta a incidentes. |
| Separar servicios y despliegues por módulo | Alto | No adoptar. No existe evidencia de necesidad de despliegue independiente y contradice el monolito actual. |

El equipo acepta la dependencia de Vercel y Supabase como trade-off. La mitigación aprobada es acceso administrativo compartido, MFA, migraciones versionadas, respaldo/restauración y observabilidad mínima.

## 8. ADR del módulo

El módulo pide un **ADR 5**. En la numeración del equipo corresponde el **ADR-008**, por la misma razón documentada en `adrs/README.md`: los números del curso y los del repositorio no coinciden, y existe una tabla de equivalencias.

El equipo registró esta decisión en [`ADR-008`](adrs/ADR-008-observabilidad-minima-y-operacion-compartida.md): mantener servicios gestionados y adoptar observabilidad mínima y operación compartida.
