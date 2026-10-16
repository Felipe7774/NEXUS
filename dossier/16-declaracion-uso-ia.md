# 16 — Declaración de uso crítico de IA

> **Estado:** redactada el 16/10/2026 a partir de hechos verificables en el repositorio. Las respuestas de la sección A citan evidencia comprobable; la sección B solo puede completarla el equipo.

## Registro disponible

El repositorio conserva `LOG-EDAV-auditoria-ia.md`, que identifica el material propuesto por IA, su clasificación posterior por el equipo y la evidencia usada para aceptarlo, modificarlo, tratarlo como genérico o descartarlo.

## Cómo auditar esta declaración

Los commits producidos con asistencia de IA en sesiones de Claude Code llevan el trailer `Co-Authored-By`. Para listarlos:

```bash
git log --grep="Co-Authored-By: Claude" -i --format="%h  %s" main
```

Al 16/10/2026 devuelve **7 commits**, todos de documentación o de pruebas:

| Commit | Qué aportó |
|---|---|
| `fea5036` | Fitness function de la frontera `service_role` |
| `eeb9409` | Re-verificación de trazabilidad C4 y declaración de uso de IA del módulo |
| `27227d1` | Audiencia de la vista de componentes y modelado de `client.server.ts` |
| `7ebc7aa` | Audiencia de las vistas de contexto y contenedores |
| `a792d25` | Actualización del README del dossier |
| `939c738` | Cierre de la declaración de uso de IA del Módulo 3 |
| `f94c99e` | Esqueleto de ADR en `docs/adr/` |

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
- **La decisión de estilo final**, que no coincide con la que propuso la IA (ver punto 3).

### 3. ¿Qué contenido de IA fue corregido, rechazado o limitado?

| Contenido de la IA | Qué pasó | Dónde consta |
|---|---|---|
| Propuesta de estilo "Monolito Modular" | **Rechazada de hecho.** El equipo documentó estilo en capas (ADR-001) y arquitectura monolítica (ADR-004). | `dossier/adrs/` |
| Clasificación inicial de tres riesgos | **Corregida por el equipo:** R2 de Falso a Modificado, R8 de Falso a Genérico, R9 de Genérico a Falso. | Log EDAV, matriz de riesgos |
| Dos mediciones del Escenario 2 (11,5 s y 46 s) | **Descartadas por error de método de la propia IA** antes de llegar al dato real de 2,1 s. | Log EDAV, Escenario 2 |
| Dos pedidos de que la IA decidiera las fronteras del C4 | **Rechazados por la IA.** | Log EDAV, declaración del Módulo 3 |
| Afirmación de que solo `crm.ts` usa el cliente de Supabase | **Error fáctico corregido antes de mergear:** lo importan seis archivos; uno accede a datos y cinco solo a autenticación. | PR #31 y `docs/adr/0002` |
| Costo "~14 clases nuevas de mapeo por módulo" | **Supuesto falso detectado:** la cifra venía de un ejemplo en Java del material de cátedra, y este repositorio no tiene ninguna clase en `src/` fuera de `components/ui`. | ⚠️ Solo en sesión — la auditoría de esa fila nunca se commiteó (issue #29 abierto) |
| Etiqueta "Válido" en los Escenarios 2 y 4 | **Inconsistencia señalada y corregida:** la etiqueta contradecía el texto de la propia justificación. | ⚠️ Solo en sesión — el repositorio conserva ya la versión corregida, no el intercambio |

Las dos últimas filas se declaran con su limitación a la vista: ocurrieron durante el trabajo, pero **no dejaron rastro commiteado**, así que no pueden presentarse como evidencia verificable. Se incluyen porque omitirlas sería una declaración incompleta; afirmarlas como evidencia sería una declaración falsa.

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

`[COMPLETAR — EQUIPO]`

Esta declaración solo puede cubrir con evidencia el trabajo trazable por el trailer `Co-Authored-By`. Los documentos `12` a `18` y la consolidación del Módulo 8 se produjeron en commits sin ese trailer, de modo que **únicamente sus autores pueden declarar qué herramientas usaron**.

Dato público que conviene no omitir: la rama `codex/carlos-auditoria-participacion`, mergeada en el PR #32, deja el nombre de una herramienta visible en el historial del repositorio de forma permanente. Si hubo asistencia de IA en ese trabajo y la declaración no la menciona, cualquier revisor puede encontrar la discrepancia por su cuenta — y eso pondría en duda el resto de este documento, que sí está respaldado.

| Trabajo | Herramienta utilizada | Qué decidió el equipo |
|---|---|---|
| Documentos `12` a `17` (consolidación del Módulo 8) | `[COMPLETAR]` | `[COMPLETAR]` |
| Documento `18` y rama `codex/...` (PR #32) | `[COMPLETAR]` | `[COMPLETAR]` |

## Regla de honestidad

No declarar como evidencia histórica contenido creado después de una medición. No presentar una sugerencia de IA como decisión o hallazgo del equipo sin justificación, fuente y trazabilidad propias.
