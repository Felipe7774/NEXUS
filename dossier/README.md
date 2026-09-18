# Dossier de arquitectura — Nexo CRM

| Campo | Valor |
|---|---|
| **Proyecto** | Nexo CRM — CRM B2B de contactos, empresas, oportunidades y actividades |
| **Materia** | Arquitectura de Software |
| **Docente** | Nelson Sánchez Sánchez |
| **Equipo** | Carlos Correa, Felipe Piragauta, Santiago Roman |
| **Sistema base** | Este mismo repositorio — [Felipe7774/NEXUS](https://github.com/Felipe7774/NEXUS), rama `main` |
| **Repositorio del dossier** | Mismo repo, carpeta `dossier/` (migrado desde el repo separado `NEXUS-dossier` — ver Historial) |
| **Estado de consolidación** | Módulo 8 — preparación de Semana 15; ver [`SEMANA-15-INVENTARIO.md`](SEMANA-15-INVENTARIO.md) |

## Estado: 6/6 escenarios auditados (ciclo EDAV completo)

| # | Escenario | Clasificación | Verificación |
|---|---|---|---|
| 1 | Seguridad (aislamiento RLS) | **Válido** | `rls-isolation.integration.test.ts`, 2/2, corre en cada PR |
| 2 | Disponibilidad (caída del proveedor) | **Válido** | 2.1s medidos en vivo, umbral ≤3s |
| 3 | Rendimiento (línea base) | **Válido** | k6, p95=92.62ms vs. umbral 2000ms — `experimentos/EXP-001-linea-base/` |
| 4 | Mantenibilidad (CI bloquea merges rotos) | **Válido** | Branch protection probada en vivo bloqueando un merge real |
| 5 | Usabilidad (primer uso sin ayuda) | **Válido** | Persona real, 3:28 min, sin ayuda |
| 6 | Escalabilidad (5.000/1.000 registros) | **Válido** | k6, p95=127.16ms — `experimentos/EXP-002-escalabilidad/` |

Detalle completo de cada auditoría (clasificación, justificación propia del equipo, evidencia) en [`LOG-EDAV-auditoria-ia.md`](LOG-EDAV-auditoria-ia.md).

## Evidencias por semana

| Semana | Evidencia | Estado |
|---|---|---|
| 1 | Sistema corriendo localmente + contexto del sistema | [`01-contexto-y-drivers.md`](01-contexto-y-drivers.md) (secciones 1-4) — completo |
| 2 | Riesgos iniciales + drivers preliminares + checkpoint (tests pasando) | [`01-contexto-y-drivers.md`](01-contexto-y-drivers.md) (secciones 5-6) — completo |
| 3 | Matriz de atributos + escenarios de calidad | [`02-escenarios-de-calidad.md`](02-escenarios-de-calidad.md) — completo |
| 4 | Medición de línea base + escalabilidad | [`04-evidencia-ejecutable.md`](04-evidencia-ejecutable.md) + [`experimentos/EXP-001-linea-base/`](experimentos/EXP-001-linea-base/) + [`experimentos/EXP-002-escalabilidad/`](experimentos/EXP-002-escalabilidad/) — completo |
| 5-6 | Modelo C4 as-is (contexto, contenedores, componentes) + trazabilidad verificada | [`modeloc4-nivel.md`](modeloc4-nivel.md) — diagramas completos; **pendientes declarados**: audiencia/propósito por vista y decisión sobre `client.server.ts` (ver abajo) |
| 7 | Estilos arquitectónicos, modularidad y límites | En curso — matriz comparativa de estilos y crítica de la propuesta de IA (ciclo EDAV) |

## Pendientes declarados

Campos abiertos a propósito, porque son decisiones de autoría del equipo y no se delegan a la IA. **Los tres pendientes del Módulo 3 quedaron cerrados el 15/09/2026:**

| Dónde | Estado |
|---|---|
| [`modeloc4-nivel.md`](modeloc4-nivel.md) — audiencia de las vistas | ✅ Cerrado. Nivel 1 para quien debe entender el sistema sin conocerlo por dentro; Niveles 2 y 3 para quien va a tocar el código |
| [`modeloc4-nivel.md`](modeloc4-nivel.md) — caso `client.server.ts` | ✅ Cerrado. Se incluye como componente #9, derivado del criterio de audiencia del Nivel 3 |
| [`LOG-EDAV-auditoria-ia.md`](LOG-EDAV-auditoria-ia.md) — uso de IA en el Módulo 3 | ✅ Cerrado. El equipo validó el registro como exacto y completo |
| [`modeloc4-nivel.md`](modeloc4-nivel.md) — columnas `[BORRADOR — CONFIRMAR]` | Abierto. Falta que el equipo confirme o reescriba las columnas de propósito y exclusiones de la tabla de audiencia |

Pendientes del Módulo 4 (semanas 7-8): decisión de estilo arquitectónico, mapa modular y el contenido de los dos ADR, cuyo esqueleto ya está en [`docs/adr/`](../docs/adr/). Trabajo repartido en los issues #27 a #30.

## Índice de documentos

- [`01-contexto-y-drivers.md`](01-contexto-y-drivers.md) — identificación del sistema, stakeholders, restricciones, drivers y riesgos preliminares.
- [`02-escenarios-de-calidad.md`](02-escenarios-de-calidad.md) — matriz de atributos, trade-offs, los 6 escenarios de calidad de 6 partes, semilla decidida por el equipo.
- [`modeloc4-nivel.md`](modeloc4-nivel.md) — modelo C4 **as-is** (Módulo 3): contexto, contenedores y componentes en Mermaid, con las 25 rutas de archivo citadas verificadas contra el repo (28/08/2026, re-verificadas el 15/09/2026).
- [`04-evidencia-ejecutable.md`](04-evidencia-ejecutable.md) — resultado de la medición de línea base (Escenario 3).
- [`experimentos/EXP-001-linea-base/`](experimentos/EXP-001-linea-base/) — script de siembra + k6, condiciones, 3 corridas válidas.
- [`experimentos/EXP-002-escalabilidad/`](experimentos/EXP-002-escalabilidad/) — mismo paquete, para el Escenario 6 (5.000/1.000 registros).
- [`experimentos/EXP-003-recuperacion/`](experimentos/EXP-003-recuperacion/) — respaldo lógico, restauración local y comparación de conteos contra el proyecto vigente.
- [`../docs/adr/`](../docs/adr/) — ADR-0001 (estilo) y ADR-0002 (frontera dominio/persistencia) del Módulo 4. Hoy en borrador, con los datos empíricos precargados y las decisiones en blanco.
- [`LOG-EDAV-auditoria-ia.md`](LOG-EDAV-auditoria-ia.md) — el documento más importante: registro completo del ciclo EDAV (E-D-A-V) para los 6 escenarios, incluyendo los errores de medición propios de la IA y cómo se corrigieron con datos reales.
- [`SEMANA-15-INVENTARIO.md`](SEMANA-15-INVENTARIO.md) — estado de preparación de los entregables del Módulo 8.
- [`12-matriz-trade-offs.md`](12-matriz-trade-offs.md) — tensiones documentadas y matriz pendiente de decisión del equipo.
- [`13-evaluacion-arquitectonica.md`](13-evaluacion-arquitectonica.md) — evidencia consolidada y clasificación pendiente del equipo.
- [`14-plan-evolucion.md`](14-plan-evolucion.md) — hallazgos documentados y roadmap pendiente de aprobación.
- [`15-evidencia-ejecutable-consolidada.md`](15-evidencia-ejecutable-consolidada.md) — índice de pruebas, experimentos y registros reproducibles.
- [`16-declaracion-uso-ia.md`](16-declaracion-uso-ia.md) — plantilla de cierre basada en el Log EDAV.
- [`adrs/README.md`](adrs/README.md) — plantilla y criterio para ADRs aún no documentados.
- [`17-preparacion-defensa.md`](17-preparacion-defensa.md) — estructura de presentación, preguntas críticas y límites de cada respuesta.

## Trazabilidad Git

Todo el trabajo semanal quedó en Pull Requests contra `main`, revisables en el historial del repo:

```bash
git log --oneline --merges main
```

PRs mergeados: contexto (semana 1), riesgos/drivers (semana 2), tests (Vitest+Docker), esquema de stakeholders, matriz de atributos (semana 3), migración del dossier a esta estructura, prueba RLS + CI, timeout defensivo, medición de línea base, auditoría de Escenarios 4-6, recuperación del incidente de Supabase (#20), y vistas C4 as-is (#21).

## Flujo de trabajo

Cada entrega semanal se abre como un Pull Request contra `main`. Desde la semana 4, `main` tiene **branch protection activa**: los checks `unit-tests` y `rls-integration-test` deben pasar antes de poder mergear (probado en vivo, ver Escenario 4 en el Log EDAV).

## Historial

Este dossier vivió originalmente en un repositorio aparte ([`NEXUS-dossier`](https://github.com/santiago1500K/NEXUS-dossier)) y se migró acá para mantener todo en un solo lugar junto con el código. La numeración de archivos (`01-04`) se reestructuró en la semana 4 para alinearse con la nomenclatura del tutor de la cátedra (antes: `01-contexto-sistema.md`, `02-riesgos-drivers.md`, `03-atributos-calidad.md`, `04-escenarios-calidad.md` — contenido preservado en el historial de Git).
