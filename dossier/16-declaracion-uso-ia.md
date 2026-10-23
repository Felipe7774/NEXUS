# 16 — Declaración de uso crítico de IA

> **Estado:** redactada el 16/10/2026 y **corregida el 23/10/2026** a partir de hechos verificables en el repositorio. Las respuestas de la sección A citan evidencia comprobable; la sección B solo puede completarla el equipo.

## Registro disponible

El repositorio conserva `LOG-EDAV-auditoria-ia.md`, que identifica el material propuesto por IA, su clasificación posterior por el equipo y la evidencia usada para aceptarlo, modificarlo, tratarlo como genérico o descartarlo.

## Cómo auditar esta declaración

Los commits producidos con asistencia de IA en sesiones de Claude Code llevan el trailer `Co-Authored-By`. Para listarlos:

```bash
git log --grep="Co-Authored-By: Claude" -i --format="%h  %s" main
```

Al 23/10/2026 devuelve **14 commits**. Ninguno toca lógica de negocio: son documentación, pruebas y una actualización de dependencia por seguridad.

| Commit | Qué aportó |
|---|---|
| `eeb9409` | Re-verificación de trazabilidad C4 y declaración de uso de IA del módulo |
| `27227d1` | Audiencia de la vista de componentes y modelado de `client.server.ts` |
| `7ebc7aa` | Audiencia de las vistas de contexto y contenedores |
| `a792d25` | Actualización del README del dossier |
| `939c738` | Cierre de la declaración de uso de IA del Módulo 3 |
| `fea5036` | Fitness function de la frontera `service_role` |
| `f94c99e` | Esqueleto de ADR en `docs/adr/` |
| `3fd8473` | Restauración de los 6 escenarios de calidad y corrección de cifras |
| `ae1ce34` | Unificación de los ADR y fin del choque de numeración |
| `ca70927` | **Actualización de `@tanstack/react-start` por CVE-2026-102989 (XSS)** |
| `65fb1fa` | Representación de los módulos de dominio en el C4 |
| `c84d9c9` | Registro de la partición por dominio como `ADR-007` |
| `62ec195` | Actualización del contexto del `ADR-001` |
| `8e536f6` | Re-ejecución de la línea base del Escenario 3 |

## Sección A — Declaración basada en evidencia del repositorio

### 1. ¿Para qué se utilizó IA?

En cuatro modos distintos, con grados de delegación distintos:

- **Generadora de propuestas no verificadas** (semanas 1-4): propuso 9 riesgos, un orden de 5 drivers, la matriz de atributos y 6 escenarios de calidad. Nada de eso se adoptó sin pasar por el ciclo EDAV.
- **Ejecutora técnica** (semanas 2-8): suite de Vitest con Docker, prueba de integración de aislamiento RLS, workflow de CI, timeout defensivo de 3 s en el cliente Supabase, migración de `stakeholders` y la fitness function de la frontera `service_role`. Es implementación verificable por tests, no decisión arquitectónica.
- **Evidencia y verificación** (Módulo 3, C4): listó la estructura real de archivos, verificó que las 25 rutas citadas existieran y transcribió a sintaxis Mermaid el análisis ya redactado por el equipo.
- **Andamiaje documental**: esqueletos de ADR y plantilla de la Matriz de Control EDAV, siempre con las decisiones en blanco.

### 2. ¿Qué decisiones permanecieron en el equipo?

- El orden de los 5 drivers y su justificación.
- La clasificación de los 9 riesgos, incluidas **tres correcciones propias** sobre lo que la IA había sugerido.
- La semilla, los umbrales y el protocolo de los experimentos.
- Las fronteras del modelo C4. La IA **se negó dos veces** a decidirlas cuando el equipo se lo pidió; queda registrado en el Log EDAV.
- La audiencia de cada vista C4 y, derivada de ella, la inclusión de `client.server.ts` como componente #9.
- Los cuatro ADR confirmados y los veredictos de `12-matriz-trade-offs.md`.
- **La decisión de estilo final.** Se tomó sin auditar la propuesta de la IA y, meses después, convergió con ella por otra vía: un spike y mediciones propias. Ver la corrección del 23/10 en el punto 3.

### 3. ¿Qué contenido de IA fue corregido, rechazado o limitado?

| Contenido de la IA | Qué pasó | Dónde consta |
|---|---|---|
| Propuesta de estilo "Monolito Modular" | **No adoptada en su momento; convergente después.** Ver la nota al pie de esta tabla: esta fila se corrigió el 23/10/2026. | `dossier/adrs/`, `src/modules/` |
| Clasificación inicial de tres riesgos | **Corregida por el equipo:** R2 de Falso a Modificado, R8 de Falso a Genérico, R9 de Genérico a Falso. | Log EDAV, matriz de riesgos |
| Dos mediciones del Escenario 2 (11,5 s y 46 s) | **Descartadas por error de método de la propia IA** antes de llegar al dato real de 2,1 s. | Log EDAV, Escenario 2 |
| Dos pedidos de que la IA decidiera las fronteras del C4 | **Rechazados por la IA.** | Log EDAV, declaración del Módulo 3 |
| Afirmación de que solo `crm.ts` usa el cliente de Supabase | **Error fáctico corregido antes de mergear:** lo importan seis archivos; uno accede a datos y cinco solo a autenticación. | PR #31 y `docs/adr/0002` |
| Costo "~14 clases nuevas de mapeo por módulo" | **Supuesto falso detectado:** la cifra venía de un ejemplo en Java del material de cátedra, y este repositorio no tiene ninguna clase en `src/` fuera de `components/ui`. | ⚠️ Solo en sesión — la auditoría de esa fila nunca se commiteó (issue #29 abierto) |
| Etiqueta "Válido" en los Escenarios 2 y 4 | **Inconsistencia señalada y corregida:** la etiqueta contradecía el texto de la propia justificación. | ⚠️ Solo en sesión — el repositorio conserva ya la versión corregida, no el intercambio |

Las dos últimas filas se declaran con su limitación a la vista: ocurrieron durante el trabajo, pero **no dejaron rastro commiteado**, así que no pueden presentarse como evidencia verificable. Se incluyen porque omitirlas sería una declaración incompleta; afirmarlas como evidencia sería una declaración falsa.

#### Corrección del 23/10/2026 — la propuesta de estilo

La versión anterior de esta declaración afirmaba que la propuesta de la IA había sido **"rechazada de hecho"**. Esa afirmación era correcta en octubre, cuando se redactó, y **dejó de serlo**. Se corrige en vez de dejarla pasar.

Qué ocurrió, en orden:

1. **Septiembre.** La IA propuso evolucionar a un *Monolito Modular (Domain-Partitioned)*: mantener una sola unidad de despliegue y particionar `src/lib/crm.ts` en módulos por dominio con interfaces explícitas. El equipo **no la adoptó ni la auditó**; la Matriz de Control quedó sin completar (issue #29).
2. **Octubre.** El equipo documentó `ADR-001` (estilo en capas) y `ADR-004` (arquitectura monolítica), sin referencia a esa propuesta.
3. **16-17/10.** Trabajando el Módulo 6, el equipo implementó una partición por dominio con propiedad exclusiva de tablas, respaldada por un spike y por mediciones propias, y la protegió con una fitness function en CI. Quedó registrada en `ADR-007`.

El resultado final **coincide con lo que la IA había propuesto**: partición por dominio dentro de un monolito, con APIs explícitas por módulo.

**Lo que esto no significa.** No significa que la IA "tuviera razón" ni que el equipo haya seguido su recomendación. La decisión de octubre se tomó por otra vía —un experimento propio— y su justificación no cita la propuesta de septiembre. Significa que **dos caminos independientes llegaron a la misma estructura**, y que el camino del equipo es el que tiene evidencia detrás.

**Lo que sigue pendiente.** Que la propuesta coincida con el resultado no sustituye la auditoría: las 10 filas de la Matriz de Control siguen sin clasificar, y el issue #29 continúa abierto. Una coincidencia posterior no es una verificación.

### 4. ¿Cómo se verificaron las afirmaciones conservadas?

| Afirmación | Verificación |
|---|---|
| Aislamiento entre usuarios | `rls-isolation.integration.test.ts`, ejecutado en cada PR por el job `rls-integration-test` |
| Rendimiento y escalabilidad | EXP-001 y EXP-002 con k6, con semilla, condiciones y JSON por corrida |
| Recuperación ante pérdida del proyecto | EXP-003: respaldo restaurado en entorno local, con conteos coincidentes de 14 tablas y 4 usuarios |
| CI bloquea merges rotos | Probado en vivo rompiendo un test a propósito |
| Frontera del cliente `service_role` | Fitness function verificada rompiéndola a propósito: con una violación deliberada falla y nombra el archivo |
| Trazabilidad del C4 | Las 25 rutas citadas verificadas una por una; los diagramas Mermaid comprobados renderizando en GitHub |
| Usabilidad de primer uso | Prueba con una persona real, con un primer intento descartado por no seguir el protocolo |

## Sección B — Uso de herramientas en commits fuera de estas sesiones

Esta declaración solo puede cubrir con evidencia el trabajo trazable por el trailer `Co-Authored-By`. El resto se produjo en commits sin ese trailer, de modo que **únicamente sus autores pueden declarar qué herramientas usaron**.

**Parte de esta sección ya está respondida por el propio repositorio.** El `LOG-EDAV-auditoria-ia.md` declara, en su ampliación del Módulo 5, que *"el usuario autorizó en Codex preparar los pendientes del módulo 5"*, y describe qué hizo la herramienta y qué afirmaciones suyas se rechazaron. Esa autodeclaración es el modelo a seguir para las filas que faltan.

Además, el historial deja **tres ramas con el nombre de la herramienta a la vista de forma permanente**: `codex/carlos-auditoria-participacion` (PR #32), `codex/modulo-5-dominio-integracion` y `codex/modulo-6-distribucion-resiliencia` (PR #35). Si hubo asistencia de IA en ese trabajo y la declaración no la menciona, cualquier revisor encuentra la discrepancia solo — y eso pondría en duda el resto de este documento, que sí está respaldado.

| Trabajo | Herramienta utilizada | Qué decidió el equipo |
|---|---|---|
| Módulo 5 — dominio, contratos y spike (PR #35) | **Codex**, ya declarado en el Log EDAV | Ver la tabla de afirmaciones rechazadas en el Log EDAV |
| Módulo 6 — distribución y resiliencia (PR #35) | `[COMPLETAR]` | `[COMPLETAR]` |
| Documentos `12` a `17` (consolidación del Módulo 8) | `[COMPLETAR]` | `[COMPLETAR]` |
| Documento `18` y rama `codex/...` (PR #32) | `[COMPLETAR]` | `[COMPLETAR]` |

## Regla de honestidad

No declarar como evidencia histórica contenido creado después de una medición. No presentar una sugerencia de IA como decisión o hallazgo del equipo sin justificación, fuente y trazabilidad propias.
