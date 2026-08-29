# Log EDAV — Auditoría de contenido generado por IA

> Registro honesto de qué contenido del dossier fue delegado a un LLM (Claude, vía Claude Code) y cuál es su estado real de auditoría. Este log existe porque gran parte del contenido de `01-contexto-y-drivers.md` y `02-escenarios-de-calidad.md` fue producido en sesiones de trabajo con IA **antes** de que el equipo tuviera el ciclo EDAV formal (E-D-A-V) documentado por la cátedra. Se declara explícitamente para cumplir con el criterio "Auditoría de IA" de la rúbrica, en vez de ocultarlo.

## Qué pasó, en orden

1. El equipo le pidió a Claude ayuda para levantar el proyecto, armar el repositorio del dossier y avanzar las semanas 1-2.
2. Claude propuso: un inventario de 9 riesgos, un orden de 5 drivers arquitectónicos, una matriz de 6 atributos de calidad, y 6 escenarios de calidad de 6 partes (3 basados en el código real, 3 como RNF nuevos porque no apareció el documento de Ingeniería de Software).
3. El equipo confirmó cada propuesta con un "sí"/"así" en el chat — **esto no equivale al paso "A — Auditoría" del ciclo EDAV**, que exige clasificación Válido/Modificado/Genérico/Falso con justificación matemática y empírica propia, no una confirmación conversacional.
4. Recién en la semana 4 el equipo obtuvo el material completo de la cátedra (Módulo 2, rúbrica, definición de EDAV) y detectó la diferencia.

## Estado real de auditoría por pieza de contenido

| Contenido | Propuesto por | Auditado formalmente (matriz Válido/Modificado/Genérico/Falso) | Acción pendiente |
|---|---|---|---|
| 9 riesgos iniciales (R1-R9) | Claude | **Sí** — ver Matriz de Auditoría de Riesgos abajo | Ninguna |
| 5 drivers priorizados | Claude | **Sí** — ver Auditoría de Drivers abajo | Ninguna |
| Matriz de 6 atributos de calidad | Claude | **Sí** — mismo orden y justificación que los drivers (ver abajo) | Ninguna |
| Escenario 1 (Seguridad) | Claude | **Sí** — ver Matriz de Auditoría abajo | Ninguna |
| Escenario 2 (Disponibilidad) | Claude | **Sí** — ver Matriz de Auditoría abajo | Ninguna |
| Escenario 3 (Rendimiento) | Claude | **Sí** — ver Matriz de Auditoría abajo | Ninguna |
| Escenario 4 (Mantenibilidad) | Claude | **Sí** — ver Matriz de Auditoría abajo | Ninguna |
| Escenario 5 (Usabilidad) | Claude | **Sí** — ver Matriz de Auditoría abajo | Ninguna |
| Escenario 6 (Escalabilidad) | Claude | **Sí** — ver Matriz de Auditoría abajo | Ninguna |
| Migración de esquema (`stakeholders`, salud de cuenta) | Claude, propuesta técnica | Sí — validada corriendo Postgres real vía Supabase local, RLS y `security_invoker` verificados | Ninguna — es implementación, no decisión arquitectónica |
| Suite de tests (Vitest + Docker) | Claude, propuesta técnica | Sí — 12 tests corridos y verificados en local y Docker | Ninguna — es implementación |

## Matriz de auditoría de escenarios de IA (ciclo EDAV — paso A)

Clasificación y justificación del equipo, no de la IA. Se completa a medida que se audita cada escenario — no todos están auditados todavía (ver tabla de arriba).

| Escenario sugerido por IA | Clasificación (equipo) | Justificación técnica (equipo) | Verificación |
|---|---|---|---|
| Escenario 1 — Seguridad (aislamiento entre organizaciones) | **Válido** | Ver justificación completa abajo | `rls-isolation.integration.test.ts`, 2/2 tests pasados contra PostgreSQL real en Docker (`npx supabase start` local), corrida el 25/08/2026. Automatizado en cada PR vía `.github/workflows/ci.yml` (job `rls-integration-test`). |
| Escenario 2 — Disponibilidad | **Válido** | Ver justificación completa e investigación técnica abajo | Ver investigación técnica abajo |
| Escenario 3 — Rendimiento | **Válido** | Ver justificación completa abajo | `experimentos/EXP-001-linea-base/resultados/corrida-{2,3,4}.json` (rama `semana-4-medicion-real`), mediana p95 = 92.62ms contra umbral de 2.000ms, 0% errores en 4 corridas, corrida el 25/08/2026. |
| Escenario 4 — Mantenibilidad | **Válido** | Ver justificación completa e investigación técnica abajo | Ver investigación técnica abajo |
| Escenario 5 — Usabilidad | **Válido** | Ver justificación completa e investigación técnica abajo | Ver investigación técnica abajo |
| Escenario 6 — Escalabilidad | **Válido** | Ver justificación completa e investigación técnica abajo | Ver investigación técnica abajo |

### Investigación técnica — Escenario 5 (Usabilidad)

**Escenario:** un vendedor nuevo, recién dado de alta, crea su primera oportunidad comercial sin ayuda, en menos de 5 minutos desde el primer login.

**Intento 1 (descartado — no siguió el protocolo):** la persona entró a la app sin la consigna exacta, exploró los dashboards y preguntó "¿qué es un CRM?" — eso ya cuenta como pedir ayuda/contexto, y no se confirmó que hubiera llegado a guardar una oportunidad. **No es evidencia válida del escenario**, se descarta.

**Intento 2 (válido — 25/08/2026):** se repitió con la consigna exacta, en una sola frase, sin explicaciones previas: *"Registrate y cargá una oportunidad de venta nueva."* Cronometrado desde ahí:

| Momento | Acción |
|---|---|
| 0:00 | Consigna entregada, arranca el cronómetro |
| 1:05 | Termina el registro y entra a la plataforma |
| 1:45 | Entra a la sección "Oportunidades", sin pedir ayuda |
| — | Selecciona "Nueva oportunidad", completa nombre, cliente, valor estimado y fecha de cierre |
| 3:20 | Presiona "Guardar" |
| 3:28 | La oportunidad aparece confirmada en el listado |

**Resultado:** tarea completada en **3 minutos 28 segundos**, sin pedir ayuda en ningún momento. Umbral del escenario: <5 minutos. **Se cumple, con margen de casi 1:32.**

**Clasificación del equipo: Válido.**

> La prueba comenzó con la consigna: "Registrate y cargá una oportunidad de venta nueva", iniciando el cronómetro en ese momento. La persona tardó 1 minuto y 5 segundos en registrarse e ingresar a la plataforma. Luego observó el menú, ingresó a "Oportunidades" y seleccionó "Nueva oportunidad". Completó los datos necesarios y presionó "Guardar" en el minuto 3:20. La confirmación apareció a los 3 minutos y 28 segundos. Resultado final: completó correctamente la tarea en 3 minutos y 28 segundos, sin pedir ayuda ni recibir indicaciones adicionales.

### Investigación técnica — Escenario 6 (Escalabilidad)

**Semilla:** volumen exacto definido en el escenario — 50 companies, **5.000 contacts**, **1.000 deals** (6.25x más contactos que en EXP-001). Sembrada con `experimentos/EXP-002-escalabilidad/scripts/seed-scale.mjs` contra Supabase local, base reseteada antes de sembrar.

**Medición:** k6 contra la API REST de Supabase local (PostgREST) con RLS activo, alternando 50/50 entre el listado completo de `contacts` y de `deals`. 4 corridas (1 descartada como calentamiento, 3 válidas), 5 VUs, 30s cada una.

| Corrida | p95 | Throughput |
|---|---|---|
| 1 (descartada) | 135.51ms | 4.54/s |
| 2 | 112.89ms | 4.58/s |
| 3 | 129.30ms | 4.53/s |
| 4 | 127.16ms | 4.53/s |
| **Mediana (2-4)** | **127.16ms** | **4.53/s** |

Umbral del escenario: p95 < 2.000ms. Resultado real: **127.16ms**, ~15.7x por debajo del umbral, 0% de errores en las 4 corridas.

**Comparación con EXP-001 (1.000ms → 5.000 contactos):** la mediana de p95 subió de 92.62ms a 127.16ms — un aumento real, pero pequeño, al multiplicar los contactos por 6.25.

**Misma limitación que el Escenario 3:** se midió la API REST directamente, no la app renderizada en el navegador — no hay evidencia sobre cómo se comporta React renderizando 5.000 filas en el DOM (paginación, virtualización, etc., si es que la interfaz las tiene).

**Clasificación del equipo: Válido.**

> La prueba se ejecutó con el volumen exacto definido en el escenario: 50 empresas, 5.000 contactos y 1.000 oportunidades. En cuatro corridas no se presentaron errores y la mediana obtenida fue de 127,16 ms, aproximadamente 15,7 veces por debajo del umbral de 2.000 ms. Aunque el volumen de contactos aumentó 6,25 veces frente a la prueba anterior, el tiempo solo pasó de 92,62 ms a 127,16 ms, lo que evidencia un comportamiento estable y una buena capacidad de escalamiento en la API.

### Investigación técnica — Escenario 4 (Mantenibilidad)

**Escenario:** "el cambio se implementa y el suite de tests corre sin fallos antes del merge" — medida de respuesta: `npm test` pasa al 100% antes de cada merge, y el cambio toma menos de 1 día-persona.

**Verificación en vivo (25/08/2026):**

1. Se confirmó que existía CI (`unit-tests`, `rls-integration-test`) corriendo en cada PR — **pero sin branch protection**, GitHub mostraba "Classic branch protections have not been configured". O sea: el CI corría e informaba, pero no bloqueaba nada — cualquiera podía mergear con el CI en rojo.
2. El compañero (Felipe, dueño del repo) activó branch protection en `main`, exigiendo que `unit-tests` y `rls-integration-test` pasen antes de poder mergear.
3. Se probó de verdad: se creó la rama `test-branch-protection` con un test roto a propósito (`src/lib/utils.test.ts`), se pusheó y se abrió un PR. Resultado real, confirmado por captura de pantalla: **"Merging is blocked due to failing merge requirements"**, con los dos checks en rojo y el botón de merge deshabilitado.
4. El PR de prueba se cerró sin mergear y la rama se borró — el test roto nunca llegó a `main`.

**Hallazgo no esperado:** en esa misma corrida, `rls-integration-test` también falló, sin que se hubiera tocado ningún archivo relacionado a RLS (solo se rompió un test de `utils.ts`, un job distinto). Podría ser inestabilidad puntual del runner de GitHub Actions al levantar Supabase (timing), no necesariamente un problema real de la prueba — **pendiente de investigar si vuelve a pasar**.

**Lo que sigue sin ser verificable por una prueba:** "el cambio toma menos de 1 día-persona" es una estimación de esfuerzo humano, no algo medible por un script.

**Clasificación del equipo: Válido.**

> La implementación cumple con el control principal de mantenibilidad, ya que se configuró la protección de la rama main para exigir que las pruebas unit-tests y rls-integration-test finalicen correctamente antes de permitir un merge. La verificación práctica confirmó que, al subir una rama con un test fallando intencionalmente, GitHub bloqueó la integración y deshabilitó el botón de merge. Posteriormente, la rama de prueba fue cerrada sin fusionarse, por lo que main no se vio afectada.

### Investigación técnica — Escenario 2 (Disponibilidad)

Registro completo de la verificación en vivo, incluyendo los errores de medición cometidos por la IA antes de llegar al dato correcto — se documentan a propósito, porque son justo el tipo de cosa que el ciclo EDAV debe capturar.

**Umbral propuesto originalmente:** ≤3 segundos, sin dato empírico.

**Intento 1 (descartado — método de medición defectuoso):** se simuló la caída apuntando `.env` a `http://127.0.0.1:1` y se midió el tiempo repartiendo la acción en varias llamadas de herramienta separadas (enviar formulario → esperar → revisar resultado). Resultado: 11,456 ms. **Este número es inválido**: la latencia entre llamadas de herramienta (infraestructura de esta sesión, no la app) se sumó a la medición.

**Intento 2 (descartado — mismo error de método, además puerto mal elegido):** se implementó un timeout en el cliente de Supabase (`AbortSignal.timeout(3000)` en `client.ts`, `client.server.ts`, `auth-middleware.ts`) basado en el intento 1, y se volvió a medir con el mismo método defectuoso. Resultado: 46,077 ms — peor, no mejor. Se detectó además que el puerto 1 es tratado como "puerto inseguro" por Chrome (`ERR_UNSAFE_PORT`), que rechaza la conexión al instante — no simula una caída real de un proveedor que no responde.

**Medición correcta:** se corrigió el método (un único script ejecutado dentro del navegador, con `performance.now()`, sin depender de llamadas externas) y se usó un puerto no bloqueado y sin nada escuchando (`127.0.0.1:19999`) para simular una caída real.

| Condición | Resultado |
|---|---|
| Sin el cambio de timeout (código original) | **2,145 ms** |
| Con el cambio de timeout (`AbortSignal.timeout(3000)`) | **2,135 ms** |

**Conclusión técnica:** la diferencia entre ambas mediciones (10 ms) no es significativa — el cambio de timeout no tuvo efecto medible en este escenario de falla. El umbral original de ≤3 segundos **se cumple con el código sin modificar**; el problema de disponibilidad no existía tal como se había medido inicialmente. El código del timeout se mantuvo en el repositorio (no genera daño y es una práctica defensiva razonable para otros tipos de falla), pero no debe presentarse como "la solución a un problema de 11.5 segundos", porque ese número nunca fue real.

**Clasificación del equipo: Válido.**

> La implementación cumple satisfactoriamente con el escenario planteado. Al simular una caída real del proveedor externo, la aplicación mostró un mensaje de error identificable en lugar de presentar una pantalla en blanco o finalizar de manera silenciosa. Además, la respuesta se produjo en aproximadamente 2,1 segundos, tanto con el código original como con el timeout defensivo, por lo que se cumple el umbral establecido de máximo 3 segundos. Las mediciones anteriores de 11,5 y 46 segundos fueron descartadas porque estuvieron afectadas por errores en el método de prueba y no reflejaban el comportamiento real del sistema. En consecuencia, la evidencia válida confirma que la aplicación maneja correctamente la indisponibilidad del proveedor y responde dentro del tiempo esperado.

### Investigación técnica y justificación — Escenario 3 (Rendimiento)

**Semilla decidida por el equipo (25/08/2026):** 20 companies, 800 contacts, 1.000 deals (200 en etapas calientes "Negociación"/"Propuesta enviada", distribución 80/20). Sembrada con `experimentos/EXP-001-linea-base/scripts/seed.mjs` contra Supabase local.

**Medición:** k6 contra la API REST de Supabase local (PostgREST) con RLS activo, 4 corridas (protocolo: 1 descartada como calentamiento, 3 válidas), 5 VUs, 30s cada una.

| Corrida | p95 | Throughput |
|---|---|---|
| 1 (descartada) | 120.31ms | 4.75/s |
| 2 | 92.62ms | 4.77/s |
| 3 | 96.79ms | 4.75/s |
| 4 | 89.64ms | 4.74/s |
| **Mediana (2-4)** | **92.62ms** | **4.75/s** |

Umbral auditado: p95 < 2.000ms. Resultado real: **92.62ms**, ~21x por debajo del umbral, 0% de errores.

**Clasificación del equipo: Válido.**

> La evidencia obtenida demuestra que la API REST de Supabase responde satisfactoriamente bajo la carga de datos establecida. La prueba se realizó con 20 empresas, 800 contactos y 1.000 oportunidades, de las cuales 200 se encontraban en las etapas "Negociación" o "Propuesta enviada". En cuatro corridas no se presentaron errores y la mediana obtenida fue de 92,62 ms, aproximadamente 21 veces por debajo del límite auditado de 2.000 ms. Sin embargo, la medición se efectuó directamente sobre la API con las políticas RLS aplicadas y no sobre la aplicación completa renderizada en el navegador. Por lo tanto, el resultado confirma que la consulta y el backend cumplen ampliamente con el umbral, pero no permite asegurar todavía que el usuario visualice el Kanban en menos de dos segundos.

### Justificación completa — Escenario 1 (equipo)

> La implementación es correcta porque garantiza el aislamiento de la información entre usuarios mediante Row Level Security (RLS). La prueba automatizada confirmó que el propietario puede consultar su propia empresa, mientras que otro usuario autenticado no puede acceder a ella y recibe un resultado vacío. Además, al realizar la misma consulta con la clave administrativa service_role, que omite las políticas RLS de forma intencional, la empresa sí aparece. Este contraste demuestra que el registro existe correctamente en la base de datos y que su ausencia para el Usuario B no corresponde a un error en los datos ni en la consulta, sino al funcionamiento esperado de las políticas de seguridad. Por lo tanto, se valida que cada usuario solamente puede acceder a la información que le corresponde, evitando la exposición de datos entre empresas o usuarios diferentes. La prueba automatizada finalizó satisfactoriamente con dos casos aprobados de dos ejecutados.

## Matriz de auditoría de riesgos (ciclo EDAV — paso A)

Clasificación y justificación del equipo (25/08/2026), no de la IA. Reemplaza la clasificación preliminar de la semana 2 (que usaba confirmación rápida, no justificación individual propia).

| # | Riesgo propuesto por IA | Clasificación (equipo) | Justificación (equipo) |
|---|---|---|---|
| R1 | Fuga de `service_role` si se importa mal fuera de `*.server.ts` | **Válido** | "La separación de `client.server.ts` deja un riesgo concreto de importar accidentalmente `service_role` en un contexto incorrecto, y no existe un control automático que lo impida." |
| R2 | Sin tests, un refactor rompe algo sin avisar | **Modificado** | "El riesgo ya está mitigado mediante 12 tests, integración continua y protección de ramas." — era válido cuando se propuso (cero tests); la situación cambió, no la afirmación original. |
| R3 | Un solo integrante administra Supabase | **Válido** | "Que una sola persona administre Supabase genera dependencia operativa y un punto único de conocimiento/acceso." |
| R4 | Política RLS mal escrita expone datos de otra organización | **Válido** | "La cantidad de tablas y políticas RLS sin auditoría detallada representa un riesgo real de exposición de datos." |
| R5 | Límites del plan free cortan el servicio bajo carga | **Modificado** | "El límite económico del plan es real, pero debería expresarse como riesgo de escalabilidad o saturación, ya que todavía no fue validado con pruebas de carga." |
| R6 | Dependencias muy nuevas traen bugs de tooling | **Genérico** | "Las dependencias nuevas pueden generar problemas en cualquier proyecto; no hay evidencia específica de que estén afectando a Nexo." |
| R7 | Sesión en `localStorage`, riesgo si hay XSS | **Modificado** | "Guardar la sesión en `localStorage` aumenta el impacto de una vulnerabilidad XSS, pero no demuestra por sí mismo que exista una vulnerabilidad activa." |
| R8 | Nombre de paquete `"tanstack_start_ts"` sin cambiar | **Genérico** | "El nombre del paquete es un detalle cosmético y no representa un riesgo funcional, técnico ni operativo." |
| R9 | "El servidor de Supabase podría estar caído en algún país" | **Falso** | "La posible caída regional de Supabase es un riesgo general del proveedor, sin evidencia específica relacionada con este sistema." |

## Auditoría de drivers arquitectónicos y atributos de calidad (ciclo EDAV — paso A)

El equipo ratificó el orden propuesto, con justificación propia por driver (25/08/2026). El mismo orden aplica a la matriz de 6 atributos de calidad de `02-escenarios-de-calidad.md` (que agrega Escalabilidad como 6to atributo, no cubierto por los 5 drivers).

1. **Seguridad** — "Protege credenciales y datos; una falla puede generar exposición o accesos no autorizados."
2. **Disponibilidad** — "El sistema debe permanecer accesible para sostener la operación."
3. **Mantenibilidad** — "Facilita corregir errores, incorporar cambios y reducir la dependencia de una sola persona."
4. **Rendimiento** — "Es importante para el crecimiento, pero todavía no hay evidencia de problemas bajo carga real."
5. **Usabilidad** — "Afecta la experiencia, aunque tiene menor impacto que los riesgos técnicos y operativos anteriores."

## Instrucción para el equipo

Usar este log como entrada para el ciclo EDAV real: tomar cada fila de la tabla de arriba, pedirle al LLM (este mismo u otro) que vuelva a sugerir el escenario/driver/riesgo de forma aislada si hace falta, y completar la clasificación con la matriz oficial (`Válido / Modificado / Genérico / Falso`) con justificación propia — no delegarle esa clasificación a la IA.
