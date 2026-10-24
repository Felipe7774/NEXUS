# 24 — Matriz STRIDE: superficie, controles y plantilla

> **Estado: superficie y controles verificados + modelado por completar.** Todo lo que está abajo como *hecho verificado* se comprobó contra el código y las migraciones el 23/10/2026.
>
> **La identificación de cada amenaza, su priorización y la aceptación del riesgo residual son del equipo.** No están escritas acá a propósito: la rúbrica las evalúa como trabajo propio, y una amenaza redactada por una herramienta no es un modelado de amenazas.

Este documento desarrolla la sección 4 de [`21-seguridad-y-operacion.md`](21-seguridad-y-operacion.md).

## Cómo se llena, y la trampa que hay que evitar

Cada fila se completa con **una amenaza concreta sobre un activo concreto**, no con una categoría abstracta. Estructura sugerida para redactarla:

> *Un [actor con qué acceso] podría [acción concreta] sobre [activo identificado], aprovechando [debilidad verificable].*

**La advertencia que trae la propia lámina del curso**, y que conviene tener presente al llenar la columna de control:

> *"La existencia de autenticación no cierra por sí sola todas las categorías de amenaza."*

Es decir: marcar *Suplantación* como cubierta porque hay login es exactamente el atajo que un revisor va a picar primero. Cada categoría necesita su control, su punto de aplicación y dónde se verifica.

---

## S — Suplantación de identidad

**Activos y flujos en alcance:** identidad y sesiones (Supabase Auth/GoTrue), endpoint público de autenticación, claves publicables en el bundle del navegador, cuentas administradoras de Supabase y Vercel.

**Controles existentes, verificados:**

| Control | Dónde | Verificación |
|---|---|---|
| Autenticación gestionada por GoTrue, sesiones JWT | Supabase Auth | `use-auth.ts` y el flujo autenticado |
| **MFA TOTP habilitada** | `supabase/config.toml` → `[auth.mfa.totp]` con `enroll_enabled` y `verify_enabled` en `true` | Config versionada en Git |
| Confirmación doble al cambiar datos sensibles | `double_confirm_changes = true` | Config versionada |

**Hechos del sistema que conviene tener a la vista antes de redactar la amenaza.** Son datos, no clasificaciones:

- `enable_signup = true` — el registro está abierto.
- `enable_confirmations = false` — **no se confirma el correo al registrarse.**
- `secure_password_change = false`.
- `otp_length = 8`, `otp_expiry = 3600` — el código de un solo uso vive **una hora**.
- MFA está **habilitada para inscripción**, lo cual no equivale a estar **exigida**. El repositorio no contiene ninguna política que la requiera.
- Las cuentas administradoras del proveedor son un activo aparte del de los usuarios de la aplicación: el riesgo operativo de cuenta única ya está registrado en el documento 21 y **ocurrió dos veces**.

| Amenaza concreta | Prioridad | Control que aplica | Dónde se verifica | Riesgo residual |
|---|---|---|---|---|
| `[COMPLETAR]` | `[  ]` | `[COMPLETAR]` | `[COMPLETAR]` | `[COMPLETAR]` |

---

## T — Manipulación de datos

**Activos y flujos en alcance:** las 14 tablas, el esquema y las políticas, los disparadores, el flujo administrativo con `service_role`.

**Controles existentes, verificados:**

| Control | Dónde | Verificación |
|---|---|---|
| Políticas RLS de escritura | 40 políticas sobre 14 tablas | `rls-isolation.integration.test.ts`, en cada PR |
| Autorización centralizada en SQL | `can_access_owner()`, `is_admin()`, `is_gerente()`, todas apoyadas en `has_role()` sobre `user_roles`. Las políticas no repiten lógica: la delegan en estas funciones | Migraciones versionadas. Para contarlas: `grep -o "public\.can_access_owner(" supabase/migrations/*.sql \| wc -l` |
| Borrado lógico mediante RPC, no DELETE directo | `soft_delete_company`, `soft_delete_contact`, `soft_delete_deal` | `20261017141500_owned_soft_delete.sql` |
| Tabla y columna no pueden ser dinámicas | `persistence-rules.ts` rechaza `from()` y `select()` calculados | `persistence-fitness.test.ts` |
| Esquema como código | `supabase/migrations/` | Versionado; restauración probada en `EXP-003` |

**Hechos a la vista:** `apply_deal_stage_defaults` sobrescribe `probability`, `status`, `closed_at` y `lost_reason` en cada INSERT o cambio de etapa, así que esos campos **no los controla el cliente**. El flujo con `service_role` **bypassa RLS por completo**.

| Amenaza concreta | Prioridad | Control que aplica | Dónde se verifica | Riesgo residual |
|---|---|---|---|---|
| `[COMPLETAR]` | `[  ]` | `[COMPLETAR]` | `[COMPLETAR]` | `[COMPLETAR]` |

---

## R — Repudio

**Activos y flujos en alcance:** toda acción de usuario sobre datos del CRM.

**Controles existentes, verificados — y acá está el matiz que más cambió con la auditoría:**

| Control | Dónde | Verificación |
|---|---|---|
| Traza de auditoría **del cambio de etapa** | Trigger `deals_stage_history` → tabla `deal_stage_history`, con `changed_by` hacia `profiles`, `changed_at` y las etapas origen y destino | Migración inicial; verificado el 23/10/2026 |

**Hechos a la vista:**

- Esa traza **existe y es append-only**: solo se inserta, nunca se actualiza ni se borra.
- **Cubre una sola acción** de todas las que hace la aplicación: mover una oportunidad de etapa.
- **Ninguna parte de la aplicación la lee.** Es inalcanzable desde `src/` sin romper el CI, porque `deal_stage_history` no tiene dueño declarado en `persistence-rules.ts`.
- No hay logs estructurados con correlación. Solo `console.error` hacia el pipeline del host.
- Ninguna otra acción —crear, editar, borrar lógicamente, iniciar sesión— deja rastro atribuible.

> **Por qué esta categoría merece atención especial.** Es la más descubierta, pero **no está vacía**, y la diferencia importa: afirmar "no hay auditoría" es falso y el repositorio lo desmiente. La primera versión del documento 21 lo afirmaba y hubo que corregirlo en el PR #51.

| Amenaza concreta | Prioridad | Control que aplica | Dónde se verifica | Riesgo residual |
|---|---|---|---|---|
| `[COMPLETAR]` | `[  ]` | `[COMPLETAR]` | `[COMPLETAR]` | `[COMPLETAR]` |

---

## I — Divulgación de información

**Activos y flujos en alcance:** datos del CRM, clave `service_role`, claves publicables, respaldos.

**Controles existentes, verificados — es la categoría mejor cubierta junto con Elevación:**

| Control | Dónde | Verificación |
|---|---|---|
| RLS en todas las tablas | 40 políticas / 14 tablas | `rls-isolation.integration.test.ts` |
| **Frontera del cliente privilegiado, en tres capas** | `service_role` solo en `*.server.ts`; Vite solo inyecta variables con prefijo `VITE_` y la clave se lee sin ese prefijo; `importProtection` con `behavior: "error"` | `service-role-boundary.test.ts`, **probada rompiéndola a propósito** |
| Superficie de consulta acotada | 8 de 14 tablas tienen dueño declarado; las otras 6 no se pueden consultar desde `src/` sin romper el CI | `persistence-fitness.test.ts` |
| Sin JOIN a tablas de otro dominio | `persistence-rules.ts` rechaza el `select()` con relaciones ajenas | `persistence-fitness.test.ts` |

**Hechos a la vista:**

- **Las 40 políticas nunca se auditaron una por una.** La prueba de aislamiento cubre una tabla. Es el riesgo R4, ya declarado.
- Las claves publicables son públicas por diseño: su protección es la RLS, no el secreto.
- `deal_stage_history` tiene `GRANT SELECT ... TO authenticated` y una política de lectura propia.

| Amenaza concreta | Prioridad | Control que aplica | Dónde se verifica | Riesgo residual |
|---|---|---|---|---|
| `[COMPLETAR]` | `[  ]` | `[COMPLETAR]` | `[COMPLETAR]` | `[COMPLETAR]` |

---

## D — Denegación de servicio

**Activos y flujos en alcance:** API REST pública de Supabase, endpoint de autenticación, el plan gratuito del proveedor.

**Controles existentes, verificados:**

| Control | Dónde | Verificación |
|---|---|---|
| Timeout de lectura | 3.000 ms por request | `supabase-fetch.ts` |
| Circuit breaker | Abre tras **3 fallos**, enfría **1.000 ms** | `read-circuit-breaker.test.ts` |
| Consultas acotadas por lotes | `lookupBatches` corta en bloques de 100 ids | `src/modules/lookup.ts` |

**Hechos a la vista, y acá hay un dato medido que vale oro:**

- El comportamiento bajo carga **sí está medido**, escalón por escalón: 61 ms a 5 VUs, 347 ms y 1,1% de error a 50, y a partir de 100 VUs el p95 se clava en el techo del timeout con el error trepando hasta **16,4% a 200 VUs**.
- El **throughput útil toca máximo a 50 VUs y después cae**: más carga produce menos trabajo útil.
- **Pero se midió bajo carga, no bajo ataque.** Son cosas distintas y conviene no presentarlas como equivalentes.
- El plan gratuito del proveedor impone límites que el equipo **no consultó** (está declarado así en `EXP-004/tco-supuestos.json`).
- `max_frequency = "1m0s"` limita la frecuencia de envío de correos de autenticación.

| Amenaza concreta | Prioridad | Control que aplica | Dónde se verifica | Riesgo residual |
|---|---|---|---|---|
| `[COMPLETAR]` | `[  ]` | `[COMPLETAR]` | `[COMPLETAR]` | `[COMPLETAR]` |

---

## E — Elevación de privilegios

**Activos y flujos en alcance:** clave `service_role`, roles de la aplicación (`admin`, `gerente`, vendedor), funciones `SECURITY DEFINER`.

**Controles existentes, verificados — la categoría con el control más fuerte del sistema:**

| Control | Dónde | Verificación |
|---|---|---|
| Frontera de `service_role` en tres capas | Ver la categoría *Divulgación* | `service-role-boundary.test.ts`, **probada rompiéndola** |
| **Las 11 funciones `SECURITY DEFINER` fijan `SET search_path = public`** | Migraciones | Verificado una por una el 23/10/2026: **ninguna queda sin fijar** |
| Las funciones de autorización no son invocables desde la API | `REVOKE ALL ON FUNCTION is_admin(), is_gerente(), team_member_ids(), can_access_owner() FROM PUBLIC, anon, authenticated` | `20260805035020_*.sql` |
| Modelo de roles en tabla propia, no en el JWT | `user_roles`, leída por `has_role()` | Migración inicial |
| Alcance jerárquico explícito | `can_access_owner` concede a admin, al dueño, y al gerente **solo sobre su equipo** | Migración inicial |

> **Por qué el `search_path` importa y conviene saber explicarlo:** una función `SECURITY DEFINER` sin `search_path` fijado se puede desviar hacia objetos creados por el atacante, y es una vía clásica de escalada en PostgreSQL. **Las once la fijan.** Es un control que el equipo heredó del sistema base, no uno que haya diseñado — y conviene decirlo así, pero es verificable y cuenta.

| Amenaza concreta | Prioridad | Control que aplica | Dónde se verifica | Riesgo residual |
|---|---|---|---|---|
| `[COMPLETAR]` | `[  ]` | `[COMPLETAR]` | `[COMPLETAR]` | `[COMPLETAR]` |

---

## Resumen de cobertura — `[COMPLETAR — EQUIPO]`

Una vez llenadas las seis filas, esta tabla cierra el modelado:

| Categoría | ¿Cubierta? | Riesgo residual aceptado | Quién lo acepta |
|---|---|---|---|
| S — Suplantación | `[COMPLETAR]` | `[COMPLETAR]` | `[COMPLETAR]` |
| T — Manipulación | `[COMPLETAR]` | `[COMPLETAR]` | `[COMPLETAR]` |
| R — Repudio | `[COMPLETAR]` | `[COMPLETAR]` | `[COMPLETAR]` |
| I — Divulgación | `[COMPLETAR]` | `[COMPLETAR]` | `[COMPLETAR]` |
| D — Denegación | `[COMPLETAR]` | `[COMPLETAR]` | `[COMPLETAR]` |
| E — Elevación | `[COMPLETAR]` | `[COMPLETAR]` | `[COMPLETAR]` |

## Cuatro formas de llenar mal esta matriz

1. **Marcar una categoría como cubierta porque hay login.** Es la advertencia de la propia lámina, y la más fácil de cometer.
2. **Escribir la categoría en vez de la amenaza.** "Divulgación de información" no es una amenaza; "un vendedor podría leer las oportunidades de otro vendedor" sí lo es — con su activo, su actor y su debilidad.
3. **Decir que no hay auditoría.** El repositorio lo desmiente: `deal_stage_history` existe. Lo correcto es acotar su alcance.
4. **Presentar el comportamiento bajo carga como comportamiento bajo ataque.** Se midió carga. No se midió ataque. Son categorías distintas y el comité conoce la diferencia.

## Referencias

- [`21-seguridad-y-operacion.md`](21-seguridad-y-operacion.md) — inventario de activos, controles y brecha de detección
- [`../docs/resilience_matrix.md`](../docs/resilience_matrix.md) — modos de fallo del Módulo 6
- [`../experimentos/crecimiento-S11/README.md`](../experimentos/crecimiento-S11/README.md) — la escalera de 5 a 200 VUs
- [`experimentos/EXP-003-recuperacion/`](experimentos/EXP-003-recuperacion/) — restauración probada
