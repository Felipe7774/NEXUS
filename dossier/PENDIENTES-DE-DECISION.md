# Pendientes de decisión del equipo

> **Para qué sirve este documento.** Reúne en un solo lugar **todo lo que falta decidir**, con la evidencia ya levantada al lado de cada punto. La idea es que el equipo pueda sentarse una vez y resolverlos de corrido, sin tener que reconstruir el contexto ni abrir diez archivos.
>
> Nada de lo que está acá puede completarlo la IA: son clasificaciones, decisiones y justificaciones que la rúbrica evalúa como trabajo del equipo. Lo que sí está hecho es el trabajo de medir y traer la evidencia.
>
> **Última actualización de la evidencia: 23/10/2026.**

## Resumen

| # | Qué falta | Dónde se escribe | Peso |
|---|---|---|---|
| 1 | Clasificar las 10 filas de la Matriz de Control EDAV | Issue #29 → este documento | **Alto** |
| 1b | Confirmar la lista corta y calificar 3 estilos × 5 drivers | `23-comparacion-de-estilos.md` | **Alto** |
| 2 | ADR-007: decisión, alternativas y trade-offs | `adrs/ADR-007-particion-por-dominio.md` | **Cerrado el 29/10/2026** |
| 3 | Alternativas, reversibilidad y costo en los ADR 001-004 | `adrs/ADR-00{1,2,3,4}-*.md` | **Cerrado el 29/10/2026** |
| 4 | Validar la clasificación de atributos | `13-evaluacion-arquitectonica.md` | Medio |
| 5 | Aprobar el plan de evolución | `14-plan-evolucion.md` | Medio |
| 6 | Completar 3 filas de la sección B | `16-declaracion-uso-ia.md` | Medio |
| 7 | Confirmar 4 columnas en borrador | `modeloc4-nivel.md` | Bajo |
| 8 | Evaluar aplicabilidad de CQRS | `22-cqrs-y-consistencia-eventual.md` | Bajo |
| 9 | Revisión cruzada con otro equipo | Issue #30 | Externo |
| 10 | **Módulo 7**: STRIDE, observabilidad, despliegue y ADR | `21-seguridad-y-operacion.md` y `24-matriz-stride.md` | **Alto** |

---

# 1. Matriz de Control EDAV — las 10 filas

**Qué es.** En septiembre la IA produjo una propuesta de estilo arquitectónico bajo el rol de *"Junior Engineer no verificado"*. El ciclo EDAV exige auditarla **fila por fila**, clasificando cada afirmación y respaldando la clasificación con datos reales del sistema.

**Las cuatro clasificaciones:**

| | Significado |
|---|---|
| **Válido** | Correcta y respaldada por evidencia real |
| **Modificado** | Base real, pero necesita ajuste, matiz o condición |
| **Genérico** | Cierto en abstracto, no aporta nada específico de este sistema |
| **Falso** | Sin sustento en el código ni en las mediciones |

> **Advertencia de método.** Ya pasó antes en este dossier: en los Escenarios 2 y 4 se escribió "Válido" mientras la justificación decía "parcialmente cumplido", y hubo que corregirlo. En varias filas de abajo conviene **separar el hecho verificable de la interpretación que la IA montó encima** — suele ser ahí donde está la clasificación correcta.

---

## Fila 1 — Elección de estilo (recomendación final)

> *"La propuesta que generaría un ingeniero junior sin verificar sería: evolucionar a Monolito Modular (Domain-Partitioned)."*

**Lo que pasó después, y que cambia esta fila por completo:**

| Lo que propuso la IA en septiembre | Lo que el equipo construyó el 16-17/10 |
|---|---|
| Monolito Modular (Domain-Partitioned) | `ADR-007` — partición por dominio |
| Manteniendo una sola unidad de despliegue | `ADR-004` — monolito; la partición es lógica |
| Particionando `crm.ts` por dominio | 4 módulos; `crm.ts` bajó de 419 a 216 líneas |
| Con interfaces explícitas | Un `api.ts` por módulo, con propiedad exclusiva de tablas |

**El resultado coincide con la propuesta.** Pero la decisión del equipo se tomó por otra vía —un spike y mediciones propias— y su justificación no cita la propuesta de septiembre.

**Lo que esta fila NO debería decir:** que la IA "tenía razón". La rúbrica evalúa el proceso, no el acierto.

**La pregunta real:** ¿una propuesta que no se auditó y que después resultó coincidir es Válida, o es Genérica porque en su momento no aportó evidencia que la sostuviera?

**Clasificación:** `[  ]`
**Justificación del equipo:** `[  ]`
**Acción correctiva:** `[  ]`

---

## Fila 2 — Descarte de Hexagonal

> *"Riesgo de sobreingeniería: no hay métrica que muestre que el acoplamiento a Supabase sea un problema hoy — costo estimado de ~14 clases nuevas de mapeo por módulo."*

**Primera mitad: se sostiene.** No existe métrica que muestre que el acoplamiento a Supabase sea un problema. Ojo: el incidente de Supabase **no** cuenta como evidencia a favor de Hexagonal — lo que dolió fue la identidad del proyecto repartida en dos configuraciones, no el acoplamiento del código a la API.

**Segunda mitad: supuesto falso detectado.**

| | |
|---|---|
| De dónde salió el número | De una diapositiva del curso, con ejemplo en **Java/Spring Boot** |
| Clases en `src/` fuera de `components/ui` | **0** |
| Cómo está hecho el acceso a datos | Funciones y tipos de TypeScript |

La IA **no estimó ese costo a partir de este código**: tomó una cifra de un ejemplo genérico en una unidad —"clases"— que acá no existe. Es el patrón que el propio material llama *"alucinación de IA"*.

**Clasificación:** `[  ]`
**Justificación del equipo:** `[  ]`
**Acción correctiva:** `[  ]`

---

## Fila 3 — Descarte de Microkernel

> *"Sin driver que lo motive: no hay caso de uso de plug-ins/extensiones de terceros en el driver ni en los riesgos."*

**Verificable:** ni los 5 drivers priorizados ni los 9 riesgos mencionan extensibilidad por terceros, plug-ins ni personalización por cliente. Microkernel resuelve variabilidad de reglas por cliente o territorio, y nada en el dossier pide eso.

**La tensión:** el argumento es correcto, pero ¿aporta algo específico de **este** sistema, o es la observación obvia de que no se adopta un estilo que resuelve un problema que no se tiene? Ahí se juega entre `Válido` y `Genérico`.

**Clasificación:** `[  ]`
**Justificación del equipo:** `[  ]`
**Acción correctiva:** `[  ]`

---

## Fila 4 — Descarte de Pipes & Filters

> *"No aplica la forma del problema: no hay un flujo de transformación secuencial de datos, es un CRUD transaccional."*

**Verificable:** el sistema es CRUD sobre 14 tablas con RLS. No hay pipeline ETL ni procesamiento por etapas.

**La tensión, igual que la anterior:** descartar un estilo por incompatibilidad de forma es correcto, pero es casi una definición, no un hallazgo. Y conviene mirar un matiz: el spike del Módulo 5 evaluó **coordinación diferida** con un patrón outbox, que sí tiene algo de flujo. ¿Eso cambia la lectura?

**Clasificación:** `[  ]`
**Justificación del equipo:** `[  ]`
**Acción correctiva:** `[  ]`

---

## Fila 5 — Descarte de microservicios distribuidos

> *"Advertencia directa del caso de apertura ('Microservicios Pueden Ser Deuda') aplicada a un equipo de 3 personas con 6-8h/semana."*

**Lo verificable del lado del sistema:** equipo de 3, 6-8 h semanales, una sola unidad de despliegue, p95 muy por debajo del umbral. Nada justifica distribuir.

**Lo que conviene mirar:** el argumento **no sale de medir este sistema**, sale de un caso de estudio del material de cátedra. La conclusión puede ser correcta y el razonamiento, prestado.

**Dato a favor del equipo:** `14-plan-evolucion.md` ya declara por su cuenta que *"no se presupone que microservicios sean necesarios hoy"*, con criterio propio.

**Clasificación:** `[  ]`
**Justificación del equipo:** `[  ]`
**Acción correctiva:** `[  ]`

---

## Fila 6 — Rendimiento como no-factor de decisión

> *"El p95 real (92.62ms @1.000 filas, 127.16ms @5.000, umbral 2000ms) ya está muy por debajo del umbral. No hay dato que justifique cambiar de estilo por esto."*

**Los números están bien citados**, y se re-verificaron el 23/10: la línea base volvió a correr y dio **64,45 ms**.

**Lo que la cita omite, y está en el propio `condiciones.md`:**

| Condición real | Qué no cubre |
|---|---|
| Red: **localhost** | La latencia de red real en producción |
| Se midió **la API REST directa** | El documento lo llama *"un piso, no el número final que vería un usuario"* |
| **5 usuarios virtuales** | Carga baja |

La cita dice *"p95 real"*, pero su propia documentación dice que es un piso en condiciones ideales.

**Un supuesto que nadie enunció:** los estilos comparados organizan **el código de la app**; lo medido es el costo de la consulta a Postgres con RLS. Cambiar de estilo no toca ese camino. La conclusión puede ser correcta **por una razón más fuerte que la que da la cita**.

**Clasificación:** `[  ]`
**Justificación del equipo:** `[  ]`
**Acción correctiva:** `[  ]`

---

## Fila 7 — Disponibilidad como no-factor de decisión

> *"El incidente real de R3 (proyecto Supabase borrado) no lo resuelve ningún estilo interno evaluado, es un riesgo organizacional, no arquitectónico."*

**Se sostiene:** ninguno de los tres estilos cambia que todo dependa de un único proyecto Supabase.

**La disyuntiva que plantea es falsa.** La *causa* fue organizacional, pero **el daño y la recuperación los determinaron decisiones técnicas**:

| Qué pasó en la recuperación | Qué lo determinó |
|---|---|
| El esquema se reconstruyó rápido | Estaba entero en `supabase/migrations/` — decisión técnica que ya existía |
| Los datos del proyecto viejo no se recuperaron | No había respaldo — decisión técnica, por omisión |
| La identidad del proyecto vivía en dos lugares | Hubo que corregir `config.toml` y 6 variables de Vercel por separado |

**Dato nuevo que refuerza la fila:** el 23/10 volvió a pasar lo mismo con **otro proveedor** — no se pudo leer el log de Vercel porque la cuenta la administra un solo integrante. R3 no está cerrado, se mudó.

**Clasificación:** `[  ]`
**Justificación del equipo:** `[  ]`
**Acción correctiva:** `[  ]`

---

## Fila 8 — Diagnóstico de cohesión actual

> *"Las 6 entidades (companies, contacts, deals, activities, pipelines/stages, profiles) viven en un único archivo de 419 líneas (`src/lib/crm.ts`) con cohesión comunicacional, no funcional."*

**Era verificable y era cierto en septiembre:** 419 líneas, único archivo con acceso a datos, 6 secciones separadas solo por comentarios.

**La etiqueta es interpretación, no hecho.** *"Cohesión comunicacional"* es una clasificación de Constantine que la IA aplicó. El hecho crudo es "6 entidades en un archivo". Se podía argumentar que tenía cohesión funcional, porque hacía una sola cosa bien definida: hablar con Supabase.

**Lo que cambió:** hoy `crm.ts` tiene **216 líneas** y es la capa de composición; el acceso por dominio vive en `src/modules/`. El diagnóstico describía un problema que **el equipo efectivamente resolvió**, aunque por su cuenta.

**Clasificación:** `[  ]`
**Justificación del equipo:** `[  ]`
**Acción correctiva:** `[  ]`

---

## Fila 9 — Seguridad como no-diferenciador entre estilos

> *"El mecanismo real de aislamiento (RLS en Postgres) no cambia con ningún estilo evaluado; ninguno resuelve R1 (fuga de service_role) ni R4 (RLS sin auditar línea por línea)."*

**Se sostiene en parte:** RLS vive en Postgres, no depende del estilo. R4 sigue sin resolverse — son **40 políticas sobre 14 tablas** sin auditar una por una.

**Lo que dejó de ser cierto:** cuando se escribió, R1 no tenía control. **Desde el 15/09 sí lo tiene**: la fitness function de `service_role`. No es un estilo, es gobernanza — pero el módulo pone la gobernanza *dentro* de la decisión arquitectónica.

**El contraargumento que la cita no considera:** los estilos no se diferencian en *si* hay RLS, pero sí en **qué tan fácil es hacer cumplir una frontera**. La fitness function se apoya en una convención de nombre (`*.server.ts`): si alguien renombra el archivo, la regla se debilita. En hexagonal, esa frontera estaría en la estructura.

**Clasificación:** `[  ]`
**Justificación del equipo:** `[  ]`
**Acción correctiva:** `[  ]`

---

## Fila 10 — Costo de implementación estimado

> *"Monolito Modular: costo bajo (reorganizar código existente). Hexagonal: costo alto (refactor grande para el tiempo disponible). Microkernel: costo medio-alto sin driver que lo motive."*

**Esta es la única fila cuya predicción se puede contrastar con la realidad**, porque el equipo hizo esa modularización. Commit `e5e6a80`, del 16-17/10:

| | |
|---|---|
| Archivos tocados | 17 |
| Líneas | **+1.810 / −378** |
| `crm.ts` | 287 líneas reescritas |
| Archivos nuevos | 9 (4 módulos, contratos, composición, 3 de gobernanza) |
| Tiempo real | 2 días |

**La tensión:** la IA dijo *"reorganizar código existente, no reescribirlo"*. Pero 1.810 líneas nuevas contra 378 borradas **no es reorganizar**. Y un tercio de eso son las pruebas de gobernanza, que la estimación ni mencionó.

Al mismo tiempo, se hizo en dos días y salió bien, así que "bajo" no era descabellado como orden de magnitud.

**Clasificación:** `[  ]`
**Justificación del equipo:** `[  ]`
**Acción correctiva:** `[  ]`

---

# 2. ADR-007 — decisión, alternativas y trade-offs

**Cerrado el 29/10/2026.** El equipo confirmó la partición por dominio con propiedad exclusiva de tablas. El ADR incluye decisión en voz activa, cuatro alternativas, trade-offs con rendimiento como efecto degradado potencial, reversibilidad medida y condiciones explícitas de reapertura.

Ver [`adrs/ADR-007-particion-por-dominio.md`](adrs/ADR-007-particion-por-dominio.md).

# 3. ADR 001-004 — alternativas, reversibilidad y costo

**Cerrado el 29/10/2026.** Los cuatro ADR distinguen ahora la evaluación retrospectiva de una alternativa histórica. Documentan alternativas evaluables hoy, costo y reversibilidad observables, sin inventar horas ni afirmar una deliberación pasada que no dejó evidencia.

La sustitución de Supabase se actualizó con el conteo actual de 16 archivos fuente que importan su integración.

# 4. Validar la clasificación de atributos

[`13-evaluacion-arquitectonica.md`](13-evaluacion-arquitectonica.md) clasifica 8 atributos entre *verificado con alcance acotado*, *verificado parcialmente*, *no verificado* y *no aplica*. El documento aclara que es **una propuesta pendiente de validación del equipo**.

# 5. Aprobar el plan de evolución

[`14-plan-evolucion.md`](14-plan-evolucion.md) — roadmap y metas propuestas. Antes de evaluarlas hay que definir condiciones reproducibles para cada meta.

# 6. Sección B de la declaración de IA

[`16-declaracion-uso-ia.md`](16-declaracion-uso-ia.md) — quedan **3 filas**. La del Módulo 5 ya se respondió sola: el Log EDAV declara que se preparó con Codex.

Faltan: Módulo 6, documentos 12-17, y el documento 18 con su rama `codex/`.

# 7. Columnas en borrador del C4

[`modeloc4-nivel.md`](modeloc4-nivel.md) — 4 renglones marcados `[BORRADOR — CONFIRMAR]` en la tabla de audiencia: las columnas de propósito y exclusiones.

# 8. Evaluar la aplicabilidad de CQRS

[`22-cqrs-y-consistencia-eventual.md`](22-cqrs-y-consistencia-eventual.md) — el insumo ya está levantado: qué existe hoy, qué no, y los datos del spike y de S11 que sirven para decidir. Falta **calificar los seis criterios y firmar el veredicto**.

Dos cosas conviene mirarlas antes de calificar, porque desarman el argumento más obvio: la asimetría entre lecturas y escrituras **nunca se midió** —el script de carga no escribe nada— y el costo de composición que introdujo la modularización tampoco.

# 9. Revisión cruzada con otro equipo

Issue #30. Depende de coordinar con otro grupo.

# 10. Módulo 7 — seguridad, despliegue y operación

[`21-seguridad-y-operacion.md`](21-seguridad-y-operacion.md) — semanas 13-14, que hasta el 23/10/2026 no tenían ningún entregable.

El inventario de controles ya está verificado contra el código. Falta el trabajo que la rúbrica evalúa como propio:

- **Matriz STRIDE**: identificar la amenaza concreta por categoría, priorizarla y aceptar el riesgo residual.
- **Plan de observabilidad**: señal, umbral o SLO y acción, proporcional a 3 personas en plan gratuito.
- **Despliegue**: la comparación de alternativas con costo relativo.
- **ADR-008** (el "ADR 5" del curso): el tema sale del resultado del modelado.

El punto de partida está servido: dos incidentes reales —el borrado del proyecto de Supabase en septiembre y el bloqueo del build de Vercel por CVE en octubre— **no los detectó el sistema sino una persona**. La brecha no hay que argumentarla, está demostrada.
