# Análisis de AVATA: semanas 5–8 frente a NEXUS

> **Alcance sustituido tras aclaración del usuario:** este documento se preparó por una interpretación equivocada de la solicitud. Analiza semanas 5–8, no módulos 5–8. El informe del alcance correcto está en `avata-modulos-5-a-8/Analisis_imagenes_modulos_5_a_8.md`.

Fecha de consulta: **16 de octubre de 2026**, hora de Colombia.

## Resultado

NEXUS tiene una base técnica y documental aprovechable: C4 en Mermaid, trazabilidad a archivos, correcciones del modelo, experimentos k6, pruebas RLS, una fitness function y participación mediante PR. **La evidencia publicada todavía no cierra todos los requisitos de las semanas 5–8.** Las brechas principales son la entrega exacta de tres archivos C4, la trazabilidad completa de relaciones, la medición por fronteras, la comparación de estilos y los dos ADR del mini-comité.

Esta evaluación es una comparación documental y de código, no una predicción de nota. Los estados académicos personales no se incluyen en esta copia pública.

## Alcance y versión

- Curso consultado en Chrome: **ARQUITECTURA DE SOFTWARE (702302-1-2S-2026)**.
- Repositorio: [Felipe7774/NEXUS](https://github.com/Felipe7774/NEXUS).
- Rama: `main`.
- Commit: `72622d1b1f247957a6496f6fa2a64e361486d276`.
- La consulta `git ls-remote origin refs/heads/main` devolvió el mismo commit que el checkout local. La comparación de archivos versionados corresponde a la rama publicada.
- Había archivos locales sin seguimiento antes de esta revisión, entre ellos `docs/diagramas-c4.md` y `entregables/`. No cuentan como evidencia publicada en `main`.
- No se ejecutó de nuevo la aplicación, k6 ni las pruebas de integración durante esta revisión. Se inspeccionaron código, resultados conservados, historial y el estado de CI publicado para el commit analizado.

## Qué módulos corresponden a cada semana

El curso organiza ocho módulos de dos semanas cada uno. **Semanas 5–8 corresponden a los módulos 3 y 4**, no a los módulos 5–8.

| Módulo | Semanas | Papel en el proyecto |
|---|---|---|
| 1. Fundamentos | 1–2 | Sistema base ejecutable, contexto, stakeholders, riesgos y drivers. |
| 2. Atributos de calidad | 3–4 | Escenarios verificables y primera medición reproducible. |
| **3. C4 y vistas útiles** | **5–6** | **Representar la arquitectura actual y demostrarla contra código y ejecución.** |
| **4. Estilos arquitectónicos** | **7–8** | **Comparar alternativas, delimitar módulos y defender decisiones mediante ADR.** |
| 5. Dominio, API y eventos | 9–10 | Contratos, integración y spike con ADR asociado. |
| 6. Distribución y resiliencia | 11–12 | Crecimiento, fallos, costo y experimentos de tácticas. |
| 7. Seguridad y operación | 13–14 | Amenazas, despliegue, observabilidad y fitness function en CI. |
| 8. Evaluación final | 15–16 | Trade-offs, consolidación de evidencia, evolución y defensa final. |

Se revisaron los resúmenes generales de los ocho módulos como contexto. La revisión detallada de actividades y materiales se concentró en los módulos 3–4, conforme al intervalo solicitado.

## Lo que exige AVATA en las semanas 5–6

La pregunta central es si el equipo puede señalar en el código qué implementa cualquier caja o flecha del C4. Debe distinguir arquitectura actual (`as-is`) de propuestas futuras (`to-be`). Una ruta existente prueba la existencia de un archivo; por sí sola no prueba la responsabilidad atribuida ni todas sus relaciones.

La semana 5 exige contexto, contenedores, auditoría del modelo, correcciones y especificación del trabajo delegado a IA. El tutor añade una operación reproducible con recorrido y conteo de consultas. La semana 6 profundiza en componentes, Walking Skeleton Trace, audiencia y propósito de las vistas, revisión por otro equipo, defensa individual y conexión entre mediciones y fronteras reales.

El material del tutor de semana 6 solicita plan previo de observación, correlación por petición, distinción entre tiempo inclusivo y exclusivo, resultados crudos, reparto del tiempo y separación entre hechos, inferencias y supuestos. No basta un p95 global para atribuir una causa a un componente.

### La instrucción concreta del Taller 2

El [Taller 2: Modelo C4/Trazabilidad](https://aulasvirtuales.utadeo.edu.co/mod/assign/view.php?id=2601314) es más específico que algunas presentaciones generales: requiere **exactamente estos tres artefactos en `/docs` y los mismos tres archivos en AVATA**:

| Archivo | Contenido obligatorio |
|---|---|
| `docs/05-c4-contexto.md` | Nivel 1, actores, sistemas externos, relaciones, propósito y audiencia. |
| `docs/06-c4-contenedores.md` | Nivel 2, contenedores existentes, tecnologías, responsabilidades, relaciones, propósito y audiencia. |
| `docs/07-c4-componentes.md` | Nivel 3, responsabilidades y relaciones, tabla completa de trazado al final y registro de correcciones/eliminaciones. |

La tabla debe localizar elementos y relaciones mediante archivo y símbolo/configuración verificables, con estado de verificación. La entrega debe identificar repositorio, rama, commit y PR cuando aplique.

Algunas láminas mencionan `03-vistas.md` y una práctica llama opcional al nivel 3; el Taller 2 exige expresamente los tres niveles y los tres nombres anteriores. Para preparar esa entrega, la instrucción de la actividad es la referencia concreta.

## Lo que exige AVATA en las semanas 7–8

La semana 7 requiere comparar **al menos tres estilos** frente a los drivers del sistema, diseñar un mapa modular y criticar la recomendación de IA con evidencia propia. La comparación debe incluir razones de descarte, costo, acoplamiento, cohesión y proporcionalidad al equipo.

La semana 8 requiere dos ADR: decisión de estilo y límites de módulos/persistencia. El material detallado los identifica como `docs/adr/0001-decision-estilo.md` y `docs/adr/0002-aislamiento-persistencia.md`.

Cada ADR debe contener una decisión concreta, contexto y drivers, al menos dos alternativas viables, consecuencias favorables y desfavorables, riesgos, reversibilidad estimada, supuestos, condición medible de revisión y control arquitectónico automatizado. También exige el veredicto fechado del mini-comité y el cambio de seguimiento si la decisión fue ajustada o reconsiderada.

La ficha general sitúa la implementación final de la fitness function a más tardar en semana 14; la presentación detallada del módulo 4 ya la incluye entre las evidencias del mini-comité. NEXUS dispone de un control ejecutable de frontera, aunque falta vincularlo a ADR completos y al mapa modular.

La defensa del mini-comité contempla las perspectivas de CTO, seguridad y finanzas, con máximo cinco diapositivas según la ficha general. La capacidad evaluada incluye re-decidir ante una restricción nueva.

## Matriz de comparación

Los estados describen la evidencia encontrada, no calificaciones: **presente**, **parcial** o **pendiente**.

| Requisito | Evidencia en NEXUS | Estado y brecha |
|---|---|---|
| C4 de contexto, contenedores y componentes | `dossier/modeloc4-nivel.md` contiene los tres niveles en Mermaid. | **Presente en contenido.** Falta el paquete exacto del Taller 2. |
| Tres archivos con nombres exigidos en `/docs` | No aparecen en `git ls-files` ni en el historial local consultado para esas rutas. | **Pendiente.** El documento consolidado no cumple por sí solo ese formato de entrega. |
| Audiencia y propósito por vista | Tabla inicial de `modeloc4-nivel.md`. | **Parcial.** Hay audiencia declarada, pero propósito y exclusiones siguen marcados como borrador por confirmar. |
| Ancla por elemento C4 | Tablas de componentes y archivos en `modeloc4-nivel.md`. | **Parcial.** Buen inventario; falta consolidar símbolo, relación y estado para todos los elementos representados. |
| Evidencia por flecha | Algunas relaciones están explicadas y el flujo de oportunidades tiene trazabilidad concreta. | **Parcial.** No hay una matriz completa que audite todas las relaciones del modelo. |
| Registro de correcciones | Descarte de Storage sin implementación e incorporación de `client.server.ts` como componente privilegiado sin consumidores. | **Presente.** Son ejemplos útiles de auditoría real; deben acompañar la entrega consolidada. |
| Walking Skeleton Trace | `dossier/18-evidencia-participacion-carlos-correa.md` sigue el cambio de etapa de una oportunidad. | **Parcial.** Trazado estático sólido; no incluye captura nueva de ejecución ni medición por tramo. |
| Medición de línea base | EXP-001 con semilla, condiciones, script y tres JSON válidos tras warmup. | **Presente con alcance acotado.** Mide la API REST local de Supabase, no la experiencia completa de React. |
| Re-ejecución de la línea base en semana 6 | Se conservan corridas del 25 de agosto, sobre un commit anterior. | **No verificada.** No se encontró una corrida adicional de semana 6 vinculada al C4 defendido. |
| Conteo y reparto de costo por frontera | El dossier menciona instrumentación pendiente; los experimentos revisados son mediciones agregadas de API. | **Pendiente en la evidencia revisada.** No se encontró tabla de tiempos por frontera ni conteo correlacionado de una operación. |
| Revisión del C4 por otro equipo | [Issue #30](https://github.com/Felipe7774/NEXUS/issues/30) sigue abierto. | **Pendiente de evidencia de cierre.** Una revisión interna del mismo equipo no demuestra esa actividad. |
| Uso de IA en módulo 3 | Sección específica en `LOG-EDAV-auditoria-ia.md`, con acciones, límites y validación del equipo. | **Presente como declaración.** No sustituye la evidencia temporal completa de especificación, salida original, auditoría y resultado. |
| Comparación de tres estilos | ADRs confirmados describen decisiones actuales; `12-matriz-trade-offs.md` evalúa cuatro decisiones. | **Pendiente como comparación de alternativas.** Evaluar decisiones existentes no equivale a comparar tres estilos candidatos. |
| Mapa modular y dependencias permitidas | Hay agrupaciones funcionales en el C4; el mapa del ADR-0002 está vacío. | **Parcial.** Falta formalizar límites, interfaces y dependencias permitidas/prohibidas. |
| ADR 1 de estilo | `docs/adr/0001-decision-estilo.md`. | **Pendiente de cierre.** Título, alternativas, decisión, trade-offs, revisión y veredicto contienen campos por completar. |
| ADR 2 de persistencia/módulos | `docs/adr/0002-aislamiento-persistencia.md`. | **Pendiente de cierre.** Mapa de dependencias y decisión siguen sin completar. |
| Veredicto fechado del mini-comité | Los ADR de `/docs/adr` dicen pendiente; los de `/dossier/adrs` dicen confirmado por el equipo. | **No acreditado como veredicto del comité.** Confirmación interna y acta fechada del mini-comité son evidencias distintas. |
| Riesgos, trade-offs y costo | `dossier/12-matriz-trade-offs.md` conserva tensiones, limitaciones y evaluación cualitativa. | **Parcial.** Falta comparación de estilos, costos de reversión y el cierre pedido en [issue #28](https://github.com/Felipe7774/NEXUS/issues/28). |
| Auditoría de recomendación de IA en módulo 4 | [Issue #29](https://github.com/Felipe7774/NEXUS/issues/29) enumera diez afirmaciones por auditar y sigue abierto. | **Pendiente.** La auditoría de riesgos de módulos anteriores no cubre automáticamente esta propuesta. |
| Fitness function | `src/architecture/service-role-boundary.test.ts`, ejecutada por `npm test` en CI. | **Presente con alcance concreto.** Protege referencias/importaciones directas del cliente privilegiado; no es un verificador completo de módulos o de todas las rutas transitivas. |
| Evidencia de contribución | PR #32 y documento 18; otros PR del equipo en el historial. | **Presente.** El documento distingue correctamente integración, autoría y auditoría posterior. |

> **Nota posterior (23/10/2026).** Las dos filas de ADR 1 y ADR 2 describen un estado que ya no existe: los esqueletos vacios `docs/adr/0001-decision-estilo.md` y `0002-aislamiento-persistencia.md` fueron eliminados y todos los ADR quedaron consolidados en `dossier/adrs/`. Este analisis no se reescribe porque era correcto en su fecha; ver `dossier/adrs/README.md` para el estado vigente.


## Hallazgos que requieren más atención

### 1. Hay dos conjuntos de ADR con estados diferentes

`docs/adr/` conserva los borradores específicos del módulo 4. En cambio, `dossier/adrs/` contiene cuatro ADR confirmados: capas, Supabase, RLS y arquitectura monolítica.

Los ADR confirmados reconocen que no se documentaron alternativas históricas. Esa transparencia debe conservarse, pero **no satisface el requisito de comparar alternativas ni cierra el ADR sobre límites de módulos**. La solución documental es definir qué archivos son canónicos, relacionar los antecedentes y registrar una deliberación actual con fecha real. No se debe reconstruir una discusión antigua como si hubiera ocurrido entonces.

### 2. El contenido C4 es reutilizable, pero la entrega exacta sigue faltando

El Taller 2 exige tres documentos, tabla completa al final del tercero y coincidencia entre AVATA y Git. No basta con presentar `dossier/modeloc4-nivel.md` o un PowerPoint.

`docs/diagramas-c4.md` existe localmente, pero no está versionado. Además, diverge del C4 del dossier: por ejemplo, presenta RLS como contenedor separado. El código revisado muestra RLS como políticas SQL de PostgreSQL, sin evidencia de una unidad ejecutable independiente. Esa representación necesita revisión antes de reutilizarla.

También debe revisarse la afirmación del dossier de que todos los archivos deben estar en la vista de componentes: el material pide los elementos arquitectónicamente relevantes, no un inventario exhaustivo. `client.server.ts` merece consideración por su privilegio y riesgo, no simplemente porque exista un archivo.

### 3. Existe una buena operación para la defensa: mover una oportunidad

El recorrido documentado por Carlos puede comprobarse estáticamente:

| Salto | Ancla observada |
|---|---|
| El vendedor arrastra la oportunidad | `src/routes/_authenticated/pipeline.tsx`: `move.mutate({ id, stage_id })`. |
| El hook solicita la actualización | `src/lib/crm.ts`: `useMoveDeal`, `supabase.from("deals").update(...)`. |
| El cliente configura el acceso | `src/integrations/supabase/client.ts`. |
| La base comprueba acceso | Política `deals_update` en la migración inicial. |
| Se ajusta estado/probabilidad | `apply_deal_stage_defaults` y trigger `deals_stage_defaults`. |
| Se registra el cambio | `handle_deal_stage_change` y trigger `deals_stage_history`. |
| La interfaz vuelve a consultar | Invalidación de la clave `deals` en `useMoveDeal`. |

Esto prueba una correspondencia de código útil. Para convertirla en evidencia de ejecución falta conservar condiciones, acción realizada, resultado observado, identidad de la corrida y, si se atribuyen costos, mediciones correlacionadas por frontera. No se diagnosticó un cuello de botella durante esta revisión.

### 4. Las cifras de rendimiento tienen límites que deben acompañarlas

- EXP-001 reporta mediana de p95 de **92,62 ms** sobre las corridas 2–4.
- EXP-002 reporta **127,16 ms**, con una semilla mayor y un escenario distinto.
- Son pruebas de API local con cinco usuarios virtuales; no demuestran el tiempo de renderizado, la latencia de producción ni el comportamiento de toda la interfaz.
- No son un experimento controlado suficiente para atribuir exclusivamente al volumen el cambio entre ambas cifras: también cambia la mezcla de peticiones.
- El script de EXP-001 consulta una proyección de campos distinta de la consulta `useDeals` de la interfaz. Debe explicarse al defender qué operación fue medida.

El propio `condiciones.md` ya reconoce la limitación de medir la API directamente. Hay que mantener ese alcance y resolver la contradicción con `02-escenarios-de-calidad.md`, que todavía habla de medir el tablero interactivo y conserva textos de auditoría pendiente mientras el README declara seis escenarios auditados.

### 5. Hay evidencia de pruebas en verde, pero no de todos los requisitos

La [ejecución de CI del commit analizado](https://github.com/Felipe7774/NEXUS/actions/runs/35413562468) terminó correctamente en `unit-tests` y `rls-integration-test`. Es evidencia publicada de ese commit, no una prueba nueva ejecutada el día de esta revisión.

El control `service-role-boundary.test.ts` es una evidencia concreta para seguridad. No reemplaza el mapa modular, los ADR completos, la comparación de alternativas ni la revisión por pares.

### 6. Hay trabajo pendiente en otra rama

El [PR #33](https://github.com/Felipe7774/NEXUS/pull/33) está abierto y modifica la declaración de IA. Se inspeccionó su diff como trabajo pendiente; no se contabiliza como contenido integrado a `main`. Aun esa propuesta conserva campos que debe completar el equipo.

## Datos académicos personales

La copia publicada omite estados individuales, calificaciones y retroalimentación del docente.

## Orden propuesto para completar la evidencia

1. **Preparar el paquete del Taller 2:** extraer y revisar las tres vistas en los nombres exactos exigidos, cerrar propósito/audiencia y completar tabla de trazado y correcciones en el tercer documento. Identificar un único commit y su PR. La posibilidad de una entrega tardía depende de lo que permita la actividad/docente; no se intentó enviar.
2. **Cerrar la comparación de estilos:** tres alternativas contextualizadas frente a drivers, costo, seguridad y reversibilidad. Distinguir arquitectura existente de diseño objetivo. Incluir las diez afirmaciones del issue #29 con evidencia y revisión del equipo.
3. **Cerrar ADR-0001 y ADR-0002:** decisión, alternativas, consecuencias negativas, límites, dependencias, costos estimados y condiciones de revisión. Relacionar los ADR ya existentes para evitar dos fuentes contradictorias.
4. **Registrar únicamente un veredicto real del comité:** fecha, participantes o referencia disponible, observaciones y cambio posterior si corresponde. Si no hay acta disponible, conservarlo como no verificado.
5. **Completar la evidencia dinámica:** reproducir el flujo elegido e instrumentar según un plan previo. No convertir las cifras k6 existentes en tiempos por componente mediante inferencia.
6. **Cerrar revisión cruzada y sincronizar el dossier:** resolver el issue #30 cuando exista evidencia, actualizar estados obsoletos y separar material en PR, archivos locales y contenido de `main`.
7. **Preparar la defensa con rutas a evidencia:** abrir código, resultados y commits; explicar qué se sabe, qué se infiere y qué haría cambiar la decisión.

Este informe documenta el diagnóstico. No completa decisiones del equipo, no inventa resultados de experimentos, no registra veredictos nuevos y no publica cambios en GitHub o AVATA.

## Materiales consultados y límites de cobertura

Se inventariaron **15 actividades/recursos en el módulo 3 y 8 en el módulo 4**. La comparación utiliza las instrucciones y el contenido accesible de estas fuentes:

- [Módulo 3, ficha y checklist](https://aulasvirtuales.utadeo.edu.co/course/section.php?id=1051203).
- [Tutor de semana 5](https://aulasvirtuales.utadeo.edu.co/mod/page/view.php?id=2599482): leído desde la presentación Gamma enlazada, al fallar su lectura integrada.
- [Tutor de semana 6](https://aulasvirtuales.utadeo.edu.co/mod/page/view.php?id=2598956): método de observación, tiempos por frontera, repetibilidad y defensa.
- [Fundamentos C4 y zoom cognitivo](https://aulasvirtuales.utadeo.edu.co/mod/page/view.php?id=2598952): presentación consultada. **El video de Simon Brown embebido no se reprodujo ni se transcribió**.
- [Demo Reservas](https://aulasvirtuales.utadeo.edu.co/mod/page/view.php?id=2598953) y [vista dinámica](https://aulasvirtuales.utadeo.edu.co/mod/page/view.php?id=2600030): casos ilustrativos, no implementaciones de NEXUS.
- [Walking Skeleton, primer PDF](https://aulasvirtuales.utadeo.edu.co/mod/resource/view.php?id=2600042): descargado y revisado visualmente en sus 11 páginas. Archivo local: `C:\Users\cobed\Downloads\Modelo C4-Walking Skeleton.pdf`.
- [Walking Skeleton, segundo PDF](https://aulasvirtuales.utadeo.edu.co/mod/resource/view.php?id=2600044): se abrió el visor y se identificó `Libro Ilustrado-demo-reservas.pdf`, pero su descarga no terminó de forma verificable. **No se afirma lectura integral de este segundo PDF**.
- [Prompt para C4 auditado](https://aulasvirtuales.utadeo.edu.co/mod/page/view.php?id=2599486) y [resultados candidatos respaldados por evidencia](https://aulasvirtuales.utadeo.edu.co/mod/page/view.php?id=2599487).
- [Práctica C4](https://aulasvirtuales.utadeo.edu.co/mod/page/view.php?id=2600096) y [tabla de trazado](https://aulasvirtuales.utadeo.edu.co/mod/page/view.php?id=2601333).
- [Evidencias del módulo 3](https://aulasvirtuales.utadeo.edu.co/mod/page/view.php?id=2601318) y [Walking Skeleton Trace](https://aulasvirtuales.utadeo.edu.co/mod/page/view.php?id=2601331).
- Talleres 1 y 2: instrucciones y estado de entrega/calificación.
- [Módulo 4, ficha y checklist](https://aulasvirtuales.utadeo.edu.co/course/section.php?id=1051204).
- [Estilos, modularidad y límites](https://aulasvirtuales.utadeo.edu.co/mod/page/view.php?id=2602724).
- [Stakeholder y driver](https://aulasvirtuales.utadeo.edu.co/mod/page/view.php?id=2602721).
- [Caso de microservicios](https://aulasvirtuales.utadeo.edu.co/mod/resource/view.php?id=2602710): PDF ilustrado de 11 páginas revisado visualmente. Enseña que distribución física no elimina acoplamiento lógico y que la complejidad tiene costo. Archivo local: `C:\Users\cobed\Downloads\Necesitamos_Microservicios.pdf`.
- [Compromisos de diseño](https://aulasvirtuales.utadeo.edu.co/mod/resource/view.php?id=2602712): PDF ilustrado de 11 páginas revisado visualmente. Caso de presupuesto y sacrificios entre atributos. Sus cifras son didácticas, no datos de NEXUS. Archivo local: `C:\Users\cobed\Downloads\AS-03-tradeoffs.pdf`.
- [Ejemplo de ADR](https://aulasvirtuales.utadeo.edu.co/mod/resource/view.php?id=2602726): caso Rapifast, con contexto, alternativas, decisión, consecuencias y gobernanza.
- [Comité técnico y cadena de evidencias](https://aulasvirtuales.utadeo.edu.co/mod/page/view.php?id=2604197).
- Talleres 3 y 4: instrucciones y estado de entrega/calificación.

El material usa muchos ejemplos Java/Spring Boot/ArchUnit. NEXUS es React/TypeScript/TanStack Start/Supabase: los principios de trazabilidad y prueba son aplicables, pero no deben copiarse clases, cifras, puertos o herramientas del caso docente como si existieran en este repositorio.

**Limitación final:** se completó la comparación de los requisitos accesibles con el repositorio publicado. Quedan sin lectura integral el segundo PDF del ejemplo Walking Skeleton y el video embebido; por ello este informe no afirma haber consumido absolutamente todos los medios del curso.
