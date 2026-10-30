# 23 — Comparación de estilos arquitectónicos contra los drivers (semana 7)

> **Estado: aprobado por el equipo el 29/10/2026.** Cada celda conserva la evidencia que el repositorio demuestra, comprobada el 23/10/2026; las calificaciones y el veredicto fueron deliberados y aprobados por el equipo.

## Por qué faltaba este documento

El ítem de la semana 7 pide **comparar tres alternativas de estilo contra los drivers priorizados**. No estaba hecho tal como lo pide el enunciado.

Lo que había era otra cosa: `12-matriz-trade-offs.md` evalúa las decisiones **ya tomadas** contra *"alternativa no documentada históricamente"*, que no es comparar tres candidatos. Y las filas de Hexagonal, Microkernel y Pipes & Filters en `PENDIENTES-DE-DECISION.md` están ahí como **afirmaciones de la IA por clasificar**, no como comparación propia del equipo.

Este documento aporta la estructura y la evidencia. No aporta el juicio.

## 1. La lista corta — aprobada por el equipo

La selección de los tres candidatos es, en sí misma, una decisión del equipo. Los tres propuestos abajo son los únicos sobre los que **este repositorio tiene algo que decir con datos**:

| Candidato | Por qué está en la lista corta |
|---|---|
| **A — Capas** | Es el estilo documentado en el `ADR-001`, confirmado por el equipo. Es la línea base contra la que se compara todo lo demás |
| **B — Monolito modular particionado por dominio** | Es lo que el código **es hoy**: cuatro módulos con propiedad exclusiva de tablas, `ADR-007`. Comparar contra algo que ya existe permite usar costos medidos en vez de estimados |
| **C — Hexagonal (puertos y adaptadores)** | Es el candidato que ataca directamente el acoplamiento a Supabase, que es el riesgo de proveedor ya identificado. Es la alternativa con tensión real contra B |

### Los tres que quedan fuera de la lista corta, con su razón

No se descartan por gusto; se descartan con evidencia del propio sistema. **La clasificación formal de estas afirmaciones sigue siendo el issue #29**, así que acá se registran como motivo de exclusión de la lista corta, no como veredicto EDAV.

| Excluido | Motivo verificable |
|---|---|
| **Microkernel** | Exige un núcleo mínimo y extensiones cargables. No hay ningún punto de extensión en el repositorio, ni requisito de que terceros agreguen funcionalidad |
| **Pipes & Filters** | Supone un flujo de transformaciones encadenadas. El CRM es CRUD sobre entidades relacionadas con un tablero; no hay pipeline de datos |
| **Microservicios distribuidos** | `EXP-004/tco-supuestos.json` lo cuantifica: **200-400 h** a 12 meses contra 26-64 h de la app actual con breaker. Un orden de magnitud, para un equipo de 3 personas con 6-8 h semanales |

## 2. El hallazgo que ordena la comparación

Antes de llenar la matriz conviene ver esto, porque cambia dónde hay que poner el esfuerzo:

**De los cinco drivers, solo uno discrimina de verdad entre los tres candidatos.**

- **Seguridad** (driver 1) vive en la base de datos, no en el estilo. Las 40 políticas RLS y la frontera de `service_role` funcionan igual bajo capas, bajo módulos o bajo hexagonal. Cambiar de estilo no mueve este driver.
- **Disponibilidad** (driver 2) está dominada por una sola unidad de despliegue y por el proveedor. Los tres candidatos siguen siendo un despliegue sobre Supabase gestionado.
- **Rendimiento** (driver 4) está dominado por PostgREST y PostgreSQL. El quiebre a 50 VUs no se mueve reordenando el código de la aplicación.
- **Usabilidad** (driver 5) es independiente del estilo. La prueba de primer uso midió la interfaz, no la arquitectura.
- **Mantenibilidad** (driver 3) **es el único donde los tres candidatos se comportan distinto**, y es el único donde el equipo tiene costos medidos en vez de estimados.

Esto es consistente con lo que el propio dossier ya registraba: `PENDIENTES-DE-DECISION.md` tiene las filas *"Rendimiento como no-factor de decisión"*, *"Disponibilidad como no-factor de decisión"* y *"Seguridad como no-diferenciador entre estilos"*.

> **Lo que esto implica para la defensa.** Si el equipo concluye que el estilo se decide por mantenibilidad, esa conclusión **está respaldada**. Lo que no se puede sostener es que el estilo se eligió por seguridad: el driver número uno no distingue entre los candidatos, y el repositorio lo demuestra.

## 3. Matriz — aprobada por el equipo

Escala sugerida: **la misma que el equipo ya acordó** en `12-matriz-trade-offs.md`, para no inventar una nueva — 🟢 favorable · 🟡 moderado · 🔴 desfavorable. Una línea de justificación por celda.

### Driver 1 — Seguridad

| | Evidencia verificada | Calificación | Justificación |
|---|---|---|---|
| **A — Capas** | RLS activa, 40 políticas sobre 14 tablas, verificada en CI por `rls-isolation.integration.test.ts` | 🟡 | RLS protege igual bajo este estilo, pero la prueba de aislamiento cubre una tabla y no audita las 40 políticas individualmente. |
| **B — Módulos por dominio** | Lo mismo, **más** la frontera de `service_role` y la propiedad exclusiva de tablas verificada por `persistence-fitness.test.ts` | 🟡 | Añade gobernanza de la frontera de persistencia, sin cambiar que el control decisivo es RLS ni el alcance acotado de su prueba. |
| **C — Hexagonal** | Idéntico: el control vive en la base, no en la aplicación | 🟡 | Los puertos podrían hacer más explícita la frontera, pero RLS y su cobertura actual no cambian por adoptar el estilo. |

> **Límite declarado que hay que tener a mano:** la prueba de aislamiento cubre **una tabla**, no las 40 políticas una por una. Es el hueco del riesgo R4 y vale igual para los tres candidatos.

### Driver 2 — Disponibilidad

| | Evidencia verificada | Calificación | Justificación |
|---|---|---|---|
| **A — Capas** | Una unidad de despliegue; circuit breaker (3 fallos, 1.000 ms) y timeout de 3.000 ms | 🟡 | Las tácticas limitan fallos de llamadas, pero permanecen un solo despliegue y dependencia del proveedor. |
| **B — Módulos por dominio** | Igual. La partición es interna, no cambia la unidad de despliegue | 🟡 | La modularización es interna: no modifica la dependencia del proveedor ni agrega redundancia. |
| **C — Hexagonal** | Igual, con un matiz real: un adaptador de persistencia explícito **facilitaría sustituir el proveedor**, que es el riesgo que ya se materializó en septiembre | 🟡 | Facilitaría una sustitución futura, pero esa sustitución no fue implementada ni medida; hoy conserva el mismo proveedor y despliegue. |

> Dato para esta fila: `EXP-003` restauró el respaldo en local con conteos coincidentes de 14 tablas y 4 usuarios, el 18/09/2026. Y la táctica de timeout se midió antes/después: **2.145 ms contra 2.135 ms**, sin efecto significativo.

### Driver 3 — Mantenibilidad *(el único que discrimina)*

| | Evidencia verificada | Calificación | Justificación |
|---|---|---|---|
| **A — Capas** | Antes de la partición, `src/lib/crm.ts` concentraba el acceso a datos de las 6 entidades | 🟡 | Separa presentación, lógica y datos, pero el acceso centralizado mostró menor cohesión por dominio. |
| **B — Módulos por dominio** | **Medido, no supuesto:** 294 líneas en 4 módulos; `crm.ts` hoy tiene **cero** accesos directos a tablas; las fronteras las enforca el CI; revertirlo exige tocar **10 archivos** (`ADR-007`) | 🟢 | Es la única opción con costo y resultado observados: propiedad por dominio, fronteras verificadas por CI y un refactor ya integrado. |
| **C — Hexagonal** | Agregaría puertos y adaptadores sobre la partición existente. **Costo sin medir**; la cifra de "~14 clases de mapeo por módulo" que propuso la IA **es un supuesto falso detectado**: venía de un ejemplo en Java y este repositorio no tiene clases en `src/` fuera de `components/ui` | 🟡 | Podría aislar adaptadores, pero el beneficio adicional y el costo de puertos/mapeos no cuentan con un spike propio. |

### Driver 4 — Rendimiento

| | Evidencia verificada | Calificación | Justificación |
|---|---|---|---|
| **A — Capas** | Línea base reproducida: mediana p95 **64,45 ms** contra umbral de 2.000 ms | 🟡 | La línea base es favorable, pero es una medición local de PostgREST y no una prueba de producción o carga alta. |
| **B — Módulos por dominio** | Mismo orden de magnitud, **con un costo que nunca se midió**: la prohibición de JOIN entre dominios obliga a componer en la aplicación (1 + 2 viajes por lista de oportunidades) | 🟡 | No hay evidencia de degradación, pero tampoco se midió el camino de composición que introduce la partición. |
| **C — Hexagonal** | Una capa de indirección más. Sin medir | 🟡 | La indirección adicional no se ha probado; no hay datos para declararla favorable ni desfavorable. |

> **Advertencia fuerte para esta fila.** El quiebre medido está en **50 VUs**, y la escalera de S11 consultó `/rest/v1/deals` con un select plano: **no ejerció el camino de composición**. Calificar rendimiento como favorable para B sin medir esa composición sería afirmar lo que la propia evidencia no respalda. Ver [`22-cqrs-y-consistencia-eventual.md`](22-cqrs-y-consistencia-eventual.md).

### Driver 5 — Usabilidad

| | Evidencia verificada | Calificación | Justificación |
|---|---|---|---|
| **A, B y C** | Prueba de primer uso con una persona real: oportunidad creada y guardada en **3:28 min**, umbral 5 min. Mide la interfaz, no el estilo | 🟡 | La prueba supera el umbral, pero no diferencia ninguna alternativa arquitectónica. |

## 4. Costo y reversibilidad

Lo único con cifras trazables es el candidato B, porque ya se implementó:

| | Costo de implementación | Costo de reversión |
|---|---|---|
| **B — Módulos por dominio** | Trabajo concentrado el 16-17/10/2026, commits `e5e6a80` y `9255129`. El historial permite afirmar dos días de calendario, **no horas reales**. | 10 archivos, 294 líneas de módulos más sus consumidores |
| **A — Capas** | Cero: es el punto de partida | No aplica |
| **C — Hexagonal** | Sin medir: requeriría un spike propio antes de estimar horas o clases. | Sin medir; dependería del alcance del adaptador y de la migración de consumidores. |

## 5. Veredicto — aprobado por el equipo

**Estilo elegido:** se mantiene **B — monolito modular particionado por dominio**, dentro de la arquitectura en capas.

**Por qué, en función de los drivers priorizados:** mantenibilidad es el único driver que diferencia con evidencia propia. B ya demostró propiedad de tablas por módulo y fronteras verificadas por CI. Seguridad, disponibilidad, rendimiento y usabilidad no distinguen de forma suficiente entre candidatos: sus controles, limitaciones o mediciones actuales se conservan bajo los tres estilos.

**Qué se descartó y por qué:** no se adopta Hexagonal ahora. Aunque podría facilitar una sustitución futura de proveedor, el acoplamiento a Supabase no se ha demostrado como un problema que los módulos no puedan manejar y el costo/beneficio de puertos y adaptadores no fue validado con un spike. Microkernel y Pipes & Filters quedan fuera por no responder a estructuras o requisitos presentes; microservicios distribuidos se descartan para este alcance por el TCO medido en `EXP-004`.

**Qué condición reproducible haría reconsiderarlo:** se reabre la decisión si ocurre al menos una de estas condiciones: (1) tres pruebas Kanban reproducibles documentan p95 superior a **300 ms** o tasa de errores superior a **2 %**; (2) dos funcionalidades del mismo entregable requieren romper la propiedad exclusiva de tablas entre dominios; o (3) existe un requisito verificable de operar simultáneamente con dos proveedores de persistencia. Cada condición exige un spike y medición antes de cambiar el estilo.

## 6. Tres formas de responder mal esto

1. **Decir que el estilo se eligió por seguridad.** Es el driver número uno, y por eso tienta. Pero el control vive en la base de datos y funciona igual bajo los tres candidatos; el repositorio desmiente la afirmación en un minuto.
2. **Presentar la partición como consecuencia de esta comparación.** El orden real fue al revés: la partición se implementó el 16-17/10 y el `ADR-007` la documentó después. Esta comparación es del 23/10. Decir que la decisión salió de acá sería invertir la cronología que el historial de Git muestra.
3. **Calificar rendimiento sin nombrar el hueco.** El costo de composición no se midió. Un "favorable" sin ese matiz es exactamente el tipo de afirmación que el comité va a pedir que se sustente.

## Referencias

- [`01-contexto-y-drivers.md`](01-contexto-y-drivers.md) — el orden de los cinco drivers
- [`12-matriz-trade-offs.md`](12-matriz-trade-offs.md) — la escala acordada por el equipo
- [`PENDIENTES-DE-DECISION.md`](PENDIENTES-DE-DECISION.md) — las filas de estilos por clasificar (issue #29)
- [`adrs/ADR-001-estilo-en-capas.md`](adrs/ADR-001-estilo-en-capas.md) y [`adrs/ADR-007-particion-por-dominio.md`](adrs/ADR-007-particion-por-dominio.md)
- [`experimentos/EXP-004-resiliencia/tco-supuestos.json`](experimentos/EXP-004-resiliencia/tco-supuestos.json) — el costo relativo de distribuir
