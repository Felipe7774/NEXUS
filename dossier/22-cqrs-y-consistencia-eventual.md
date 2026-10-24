# 22 — Aplicabilidad de CQRS y consistencia eventual (semana 10)

> **Estado: insumo verificado + evaluación por completar.** Todo lo que está marcado como verificado se comprobó contra el código el 23/10/2026. **La evaluación y el veredicto son del equipo**: la rúbrica los evalúa como trabajo propio.
>
> Este documento cubre el único ítem de la semana 10 que ningún otro archivo del dossier tocaba.

## La distinción que ordena todo el análisis

El ítem pide evaluar **dos cosas distintas** que se confunden con facilidad, y confundirlas acá sería el error más caro:

| Concepto | Qué significa | Estado en Nexo CRM |
|---|---|---|
| **Separación de comandos y consultas** (CQS) | Una operación o cambia estado, o devuelve datos, pero no ambas | **Ya existe**, verificado abajo |
| **CQRS** | Modelos **y almacenes** de lectura y escritura separados, sincronizados entre sí | **No existe** |
| **Consistencia eventual** | Aceptar un cambio antes de que todos sus efectos estén aplicados | **Analizada, no adoptada** — `ADR-005` |

Decir que el sistema "ya hace CQRS" porque las funciones de lectura y escritura están separadas sería **falso y desmentible con el propio repositorio**: hay un solo almacén, una sola fuente de verdad y ninguna proyección. Decir que no hay nada tampoco sería cierto.

## 1. Lo que ya existe, verificado

### Comandos y consultas separados por función

En `src/modules/sales/api.ts`, cada operación es una cosa o la otra:

| Consultas | Comandos |
|---|---|
| `readPipelines`, `readStages`, `readDeals`, `dealSummaries` | `saveDeal`, `moveDeal`, `deleteDeal` |

Lo mismo en los otros tres módulos. **Ninguna función de lectura escribe, ninguna de escritura devuelve el estado resultante.** Eso es CQS, y se sostiene sin esfuerzo porque la fitness function lo refuerza indirectamente.

### Un modelo de lectura compuesto en la aplicación

Este es el hallazgo más relevante del inventario, y **no fue una decisión de CQRS: fue una consecuencia de la modularización**.

Como `persistence-rules.ts` prohíbe los JOIN a tablas de otro dominio, las vistas que necesitan datos de varios dominios se arman en `src/lib/crm-composition.ts`:

- `enrichDeals(rows)` toma las oportunidades y les adjunta compañía y contacto llamando a `companySummaries` y `contactSummaries`.
- `enrichActivities(rows)` hace lo mismo con tres dominios: compañías, contactos y oportunidades.

En otras palabras: **el JOIN que antes hacía PostgreSQL ahora lo hace la aplicación**. Es una proyección de lectura, construida en memoria y en cada request, sin materializar.

### Un registro append-only que ya se parece a un log de eventos

`deal_stage_history` guarda, por trigger, cada cambio de etapa con `deal_id`, `from_stage_id`, `to_stage_id`, `changed_by` y `changed_at`. Nunca se actualiza ni se borra: solo se inserta.

No es event sourcing —el estado de la oportunidad no se reconstruye desde ahí, vive en `deals`— pero es materia prima real para esa discusión, y conviene saber que existe.

### El vocabulario de comando y evento ya está versionado

En `contratos/` hay dos esquemas JSON Schema 2020-12:

| Archivo | Qué es |
|---|---|
| `m5-mover-oportunidad.v1.schema.json` | Un **comando**: "Comando experimental de cambio de etapa v1" |
| `m5-etapa-cambiada.v1.schema.json` | Un **evento**: `crm.deal.stage_changed.v1` |

> **Límite que hay que declarar:** ningún código, test ni workflow valida nada contra estos esquemas. Son diseño versionado, no contratos verificados. Presentarlos como "contratos en CI" sería falso.

## 2. Lo que no existe

| Pieza de CQRS | Estado |
|---|---|
| Almacén de lectura separado | No existe |
| Proyecciones materializadas | No existen — la composición es en memoria, por request |
| Sincronización entre modelos | No aplica, no hay dos modelos |
| Consumidor, outbox o cola | No existe |
| Reconstrucción desde eventos | No existe |

## 3. Los datos que ya están medidos

No hace falta medir de cero: hay dos experimentos cuyos datos sirven directamente.

### Del Spike 1 — el costo de diferir

Comparó aceptar el cambio de etapa de forma síncrona contra registrar el evento y aplicar el efecto después. Medianas de tres p95 por modalidad, 24 muestras cada una:

| Métrica | Síncrono | Diferido |
|---|---|---|
| Aceptación | 51,00 ms | **4,49 ms** |
| Finalización de la actividad | 51,00 ms | **71,84 ms** |
| Ventana posterior al acuse | 0,00 ms | **66,90 ms** |

La lectura honesta, que el propio `RESUMEN.md` ya hace: diferir **acelera el acuse 11 veces y retrasa el efecto final**. No es una mejora, es un traslado del costo — y abre una ventana de 66,90 ms en la que el usuario vio "listo" y el efecto todavía no ocurrió. Esa ventana **es** la consistencia eventual, medida.

> **Límite del dato:** con ocho muestras por corrida, el p95 es el máximo de cada corrida. Está declarado en el `RESUMEN.md`. Hay que decirlo antes de que lo pregunten.

### Del crecimiento S11 — dónde aprieta la lectura

| Carga | p95 | Error |
|---|---|---|
| 5 VUs | 61 ms | 0% |
| 50 VUs | 347 ms | 1,1% |
| 100 VUs | 3.000 ms | 5,8% |
| 200 VUs | 3.034 ms | 16,4% |

El throughput útil toca máximo a 50 VUs y después **cae**: más carga produce menos trabajo útil. Si la presión está del lado de la lectura, es el argumento clásico a favor de separar modelos.

> **Límite que invalida parte del argumento, y que hay que poner sobre la mesa:** el script de carga consulta `/rest/v1/deals?select=id,title,amount,stage_id` — **la tabla cruda, con un select plano**. No ejerce el camino real de lectura de la interfaz, que es `readDeals` más dos viajes adicionales de `enrichDeals`. Es decir: **el costo de composición que introdujo la modularización nunca se midió.** Es el mismo tipo de hueco que ya estaba declarado en EXP-001 ("se midió la API, no la app renderizada").
>
> Esto corta en las dos direcciones y conviene usarlo así: debilita cualquier afirmación de que la lectura está medida, y al mismo tiempo **es exactamente el experimento que faltaría correr** para decidir si una proyección materializada se paga sola.

## 4. Consistencia eventual: qué hay y qué falta

A diferencia de CQRS, esta mitad del ítem **ya tiene análisis real**. El `ADR-005` compara tres alternativas, y la tercera es literalmente la opción eventual:

> *"Registrar evento durable y generar actividad después — Permite aceptar cambio mientras el efecto queda pendiente — Introduce consistencia eventual, idempotencia, consumidor, monitoreo y manejo de pendientes"*

Y fija una regla de honestidad hacia el usuario que vale la pena citar en la defensa:

> *"Una aceptación asíncrona debe significar «cambio y evento guardados», sin presentar la actividad como terminada."*

**Lo que falta de esta mitad:** el `ADR-005` está en estado *"propuesta para revisión mediante PR"*, con *"Veredicto de comité: no registrado"*. Sin esa firma, el análisis existe pero la decisión no.

## 5. Evaluación — `[COMPLETAR — EQUIPO]`

La estructura y la evidencia están servidas. **La calificación de cada criterio y el veredicto final los escribe el equipo.**

| Criterio | Qué dice la evidencia | ¿Justifica CQRS? | Por qué |
|---|---|---|---|
| Asimetría entre lecturas y escrituras | **Nunca se midió.** Ver la advertencia de abajo | `[COMPLETAR]` | `[COMPLETAR]` |
| Presión de lectura medida | Quiebre a 50 VUs; throughput útil cae después | `[COMPLETAR]` | `[COMPLETAR]` |
| Costo de composición en lectura | 1 + 2 viajes por lista de oportunidades, **sin medir** | `[COMPLETAR]` | `[COMPLETAR]` |
| Tolerancia del negocio al desfase | Ventana medida de 66,90 ms en el spike | `[COMPLETAR]` | `[COMPLETAR]` |
| Costo operativo de mantener dos modelos | `ADR-005`: consumidor, idempotencia, monitoreo y pendientes | `[COMPLETAR]` | `[COMPLETAR]` |
| Capacidad del equipo para operarlo | 3 personas, 6-8 h semanales, plan gratuito, **cero observabilidad** | `[COMPLETAR]` | `[COMPLETAR]` |

> **Advertencia sobre el primer criterio, que es el que más se presta a error.** El prerregistro de S11 dice *"80% lecturas calientes, 20% pipeline"*, y es tentador leer ahí una proporción de lecturas contra escrituras. **No lo es: las dos son lecturas.** El script `load.js` hace un solo tipo de llamada, `http.get`, y cero escrituras — verificado el 23/10/2026. El 80/20 reparte entre dos *perfiles de lectura*, no entre lectura y escritura.
>
> Consecuencia: **la asimetría entre lecturas y escrituras, que es el primer argumento a favor de CQRS, nunca se midió en este proyecto.** Si el equipo la usa como criterio, tiene que medirla o declararla como no medida. Afirmarla con el 80/20 sería citar mal la propia evidencia.

**Veredicto:** `[COMPLETAR — EQUIPO]`

**Condiciones que harían reconsiderarlo:** `[COMPLETAR — EQUIPO]` — conviene que sean reproducibles, como las del `ADR-006`, y no metas sin umbral.

## 6. Trampas a evitar

Tres formas de responder mal este punto, puestas acá a propósito:

1. **Llamar CQRS a lo que hay.** Las funciones de lectura y escritura están separadas, pero hay un solo almacén. El repositorio desmiente la afirmación en treinta segundos.
2. **Adoptar CQRS para completar el ejemplo de la lámina.** El `ADR-005` ya fijó el criterio contrario: *"No introducir un broker distribuido solo para completar el ejemplo de la imagen del curso"*. Sería el mismo error de sobreingeniería que el módulo 4 enseñó a evitar — y con cero observabilidad, operar dos modelos sincronizados es la peor idea posible.
3. **Descartarlo diciendo que "el rendimiento alcanza".** No alcanza sin matices: el quiebre está a 50 VUs y el costo de composición nunca se midió. Un descarte honesto se apoya en el **costo operativo y la ausencia de necesidad funcional**, no en un rendimiento que la propia medición no respalda del todo.

## Referencias

- [`adrs/ADR-005-integracion-oportunidades-actividades.md`](adrs/ADR-005-integracion-oportunidades-actividades.md) — las tres alternativas y la regla de honestidad hacia el usuario
- [`experimentos/spike-01-integracion/resultados/RESUMEN.md`](experimentos/spike-01-integracion/resultados/RESUMEN.md) — síncrono contra diferido
- [`../experimentos/crecimiento-S11/README.md`](../experimentos/crecimiento-S11/README.md) — la escalera de 5 a 200 VUs
- [`06-dominio-e-integracion.md`](06-dominio-e-integracion.md) — contextos y contratos del módulo 5
- [`contratos/`](contratos/) — los esquemas de comando y evento
