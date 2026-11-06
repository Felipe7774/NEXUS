# 03 — Mediciones

> **Qué es este documento.** Un índice consolidado de todo lo que el equipo midió, con su condición, su resultado y **su límite declarado**. No contiene mediciones nuevas: cada cifra remite al experimento que la produjo.
>
> Corresponde al archivo `03-mediciones.md` de la estructura que pide el Módulo 8. Los datos estaban repartidos en seis experimentos; acá se leen juntos.

## Regla de lectura

Tres cosas que valen para toda la tabla, y conviene decirlas antes que los números:

1. **Todas las mediciones de rendimiento se hicieron contra la API REST, no contra la aplicación renderizada.** El tiempo que percibe una persona usando el CRM **no está medido**. Está declarado así desde el `EXP-001`.
2. **Todas corrieron en un Supabase local en Docker**, no en producción. No predicen capacidad real del plan contratado.
3. **Un umbral cumplido no es una garantía**, es una observación bajo las condiciones registradas. Cada fila enlaza esas condiciones.

---

## Resumen

| # | Qué se midió | Resultado | Umbral | Fecha |
|---|---|---|---|---|
| EXP-001 | Línea base de lectura del pipeline | p95 **92,62 ms** → **64,45 ms** | < 2.000 ms | 25/08 y 23/10 |
| EXP-002 | Escalabilidad con volumen mayor | p95 **127,16 ms** | < 2.000 ms | agosto |
| EXP-003 | Restauración de respaldo | **15 conjuntos coincidentes** | — | 18/09 |
| EXP-004 | Resiliencia ante fallo de lectura | Circuito abre a los **3 fallos** | — | 16-17/10 |
| S11 | Escalera de carga, 5 a 200 VUs | Quiebre en **50 VUs** | p95 < 2.000 ms o error < 1% | 17/10 |
| Spike 1 | Síncrono contra diferido | Acuse **51,00 → 4,49 ms** | — | 16/10 |
| Escenario 2 | Efecto del timeout | **2.145 → 2.135 ms** | < 3.000 ms | agosto |
| Escenario 5 | Usabilidad de primer uso | **3:28 min** | < 5 min | agosto |

---

## EXP-001 — Línea base

**Pregunta:** ¿la consulta de oportunidades del pipeline, con RLS aplicada, responde dentro del umbral?

**Condiciones:** semilla de 20 empresas, 800 contactos y 1.000 oportunidades, de las cuales 200 calientes. 5 VUs, 30 segundos, mezcla 80/20. Se descarta la primera corrida y se reporta la **mediana de las corridas 2 a 4**.

| Corrida | p95 | Throughput | Errores |
|---|---|---|---|
| Mediana 2-4, **25/08/2026** | **92,62 ms** | 4,75/s | 0% |
| Mediana 2-4, **23/10/2026** | **64,45 ms** | 4,78/s | 0% |

**Lo que la re-ejecución demuestra, y lo que no.** El p95 bajó un 30%, y el `condiciones.md` lo dice sin adornos: **no se afirma que el sistema haya mejorado**. Cambiaron versiones del stack, el commit y las condiciones, sin aislar variables. Lo que sí demuestra es que **el experimento sigue siendo reproducible dos meses después y aguanta un cambio de versiones** — que para la defensa vale más que el número.

**Límite:** se midió la API, no la aplicación renderizada.

→ [`experimentos/EXP-001-linea-base/`](experimentos/EXP-001-linea-base/)

## EXP-002 — Escalabilidad

**Pregunta:** ¿los listados siguen dentro del umbral cuando la base crece?

**Condiciones:** semilla de 50 empresas, **5.000 contactos** y 1.000 oportunidades. Mismo protocolo que EXP-001.

**Resultado:** p95 de **127,16 ms**, throughput 4,53/s, 0% de errores. Umbral de 2.000 ms, cumplido con holgura.

**Límite que conviene decir primero:** EXP-002 aumentó el **volumen de datos**, no la **concurrencia** — siguió con 5 VUs. Por sí solo **no demuestra resistencia a más usuarios simultáneos**. Eso lo midió S11, y con otro resultado.

→ [`experimentos/EXP-002-escalabilidad/`](experimentos/EXP-002-escalabilidad/)

## EXP-003 — Restauración de respaldo

**Condiciones:** 18/09/2026, Supabase CLI 2.117.0, destino PostgreSQL local aislado en Docker. Respaldos lógicos de roles, esquema y datos; restauración dentro de una transacción con `session_replication_role = replica`.

**Resultado:** **15 conjuntos con conteos coincidentes** entre remoto y local, incluidos 4 usuarios de `auth.users`, 4 perfiles y 4 roles.

**Dos límites que cambian cómo se lee este resultado:**

- **De los 15 conjuntos, solo cinco tenían filas.** El resto estaba en cero. La restauración se verificó sobre un volumen mínimo.
- **No demuestra recuperación ante pérdida, sino clonación.** El método arranca con `supabase db dump --linked`, que necesita que el proyecto origen exista — justo lo que no ocurre en un borrado. Está desarrollado en [`runbooks/RB-001`](runbooks/RB-001-perdida-del-proyecto-supabase.md).

**RPO y RTO: sin medir.**

→ [`experimentos/EXP-003-recuperacion/`](experimentos/EXP-003-recuperacion/)

## EXP-004 — Resiliencia

**Condiciones:** 16 y 17/10/2026, Supabase real local tras un proxy loopback controlado. 5 workers, fallo inyectado de 120 ms, circuito con umbral de **3 fallos** y enfriamiento de **1.000 ms**. Dos modalidades, `baseline` y `circuit`, 6 corridas.

**Resultado:** el circuito abre tras 3 fallos y rechaza lecturas durante el enfriamiento. **Los errores siguen siendo errores**: no se los disfraza de éxito vacío.

**Límite:** el fallo fue **inyectado**, no observado en producción. Y **no se midió cuántas lecturas legítimas se rechazan** durante un enfriamiento — queda registrado como riesgo aceptado en el mini-comité 2, respuesta 10.

→ [`experimentos/EXP-004-resiliencia/`](experimentos/EXP-004-resiliencia/)

## S11 — Escalera de carga

**Es la medición más valiosa del dossier, y no por el número.**

**Condiciones:** hipótesis **prerregistrada antes de medir**, commit `5998eff`. Cinco escalones secuenciales, tres corridas por escalón, calentamiento descartado. Quiebre definido de antemano: primer escalón con p95 ≥ 2.000 ms **o** errores ≥ 1% en dos de tres corridas.

| Carga | p95 | Error | Throughput útil |
|---|---|---|---|
| 5 VUs | 61 ms | 0% | 41/s |
| **50 VUs** | **347 ms** | **1,12%** | **177/s** |
| 100 VUs | 3.000 ms | 5,75% | 137/s |
| 150 VUs | 3.003 ms | 9,15% | 136/s |
| 200 VUs | 3.034 ms | 16,43% | 132/s |

**Dos lecturas que hay que dar juntas:**

- **El quiebre está en 50 VUs**, por tasa de error, no por latencia.
- **El throughput útil toca máximo a 50 VUs y después cae.** Más carga produce **menos** trabajo útil.

**Y el resultado que más pesa: la predicción se refutó.** El prerregistro apostaba al quiebre en **150 VUs**; ocurrió en **50**. El `summary.json` lo registra en frío: `predictionConfirmed: false`.

> Una hipótesis registrada antes de medir, que después los datos desmienten, es la evidencia más fuerte de que el método no se acomodó al resultado. Conviene presentarla así y no esconderla.

**Límite importante:** el script consulta `/rest/v1/deals?select=id,title,amount,stage_id` — **la tabla cruda con un select plano**. No ejerce el camino real de lectura de la interfaz, que suma dos viajes de composición. **El costo de la modularización no está medido.** Y el script **no hace ninguna escritura**: el "80% lecturas / 20% pipeline" del prerregistro reparte entre dos perfiles de lectura, no entre lectura y escritura.

→ [`../experimentos/crecimiento-S11/`](../experimentos/crecimiento-S11/) · [`../docs/apuesta-crecimiento-S11.md`](../docs/apuesta-crecimiento-S11.md)

## Spike 1 — Síncrono contra diferido

**Condiciones:** plan prerregistrado en el commit `e348616`, **anterior al código y a las corridas**; la cadena de ancestría lo confirma. 24 muestras por modalidad, 48 en total.

| Métrica | Síncrono | Diferido |
|---|---|---|
| Aceptación | 51,00 ms | **4,49 ms** |
| Finalización de la actividad | 51,00 ms | **71,84 ms** |
| Ventana posterior al acuse | 0,00 ms | **66,90 ms** |

**Lectura:** diferir **acelera el acuse once veces y retrasa el efecto final**. No es una mejora, es un traslado del costo. Esa ventana de 66,90 ms **es** la consistencia eventual, medida.

**Límite que hay que declarar primero:** con ocho muestras por corrida, **el p95 es el máximo de cada corrida**. Está escrito en el `RESUMEN.md`; si lo encuentra el comité antes de que lo digan ustedes, parece escondido.

→ [`experimentos/spike-01-integracion/resultados/RESUMEN.md`](experimentos/spike-01-integracion/resultados/RESUMEN.md)

## Escenario 2 — Efecto del timeout

Única medición **antes y después** de aplicar una táctica.

| Variante | Tiempo hasta el error visible |
|---|---|
| Sin el cambio | **2.145 ms** |
| Con `AbortSignal.timeout(3000)` | **2.135 ms** |

**Conclusión registrada:** 10 ms de diferencia **no es significativo**. La táctica **no tuvo efecto medible** en ese escenario. Se conserva porque existe evidencia de evaluación, no de mejora demostrada.

Antes de llegar a este dato se descartaron **dos mediciones erróneas** —11,5 s y 46 s— por un error de método de la propia IA. Queda en el Log EDAV.

→ [`LOG-EDAV-auditoria-ia.md`](LOG-EDAV-auditoria-ia.md)

## Escenario 5 — Usabilidad de primer uso

Persona real, primer contacto con el sistema, sin ayuda: creó y guardó una oportunidad en **3:28 min**, contra un umbral de 5 minutos.

Se descartó un primer intento por no seguir el protocolo. Es la única medición con una persona y no con una herramienta.

→ [`02-escenarios-de-calidad.md`](02-escenarios-de-calidad.md)

---

## Lo que no se midió

Esta sección importa tanto como la tabla, y es la que un comité va a buscar:

| Qué | Por qué falta |
|---|---|
| Tiempo percibido en la aplicación renderizada | Todas las mediciones van contra la API REST |
| Costo de composición de la modularización | El script de carga consulta la tabla cruda |
| Asimetría entre lecturas y escrituras | `load.js` de S11 no hace una sola escritura. **Experimento escrito y prerregistrado**, sin ejecutar: [`mezcla-lectura-escritura`](../experimentos/mezcla-lectura-escritura/) |
| Comportamiento bajo ataque | Se midió carga, que no es lo mismo |
| RPO y RTO | Nunca se cronometró la recuperación |
| Lecturas legítimas perdidas en el enfriamiento | El fallo fue inyectado, sin contar el descarte |
| Capacidad real del plan contratado | Los límites del plan no se consultaron |
| Comportamiento entre 5 y 50 VUs | La escalera saltó de uno a otro |

Ese último hueco es el que acota el SLO comprometido: `p95 < 2.000 ms` y error `< 1%` **solo hasta 5 VUs**, porque es el único escalón con 0% de error. Subirlo exige medir el tramo intermedio.
