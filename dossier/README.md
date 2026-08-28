# Dossier de arquitectura — Nexo CRM

| Campo | Valor |
|---|---|
| **Proyecto** | Nexo CRM — CRM B2B de contactos, empresas, oportunidades y actividades |
| **Materia** | Arquitectura de Software |
| **Docente** | Nelson Sánchez Sánchez |
| **Equipo** | Carlos Correa, Felipe Piragauta, Santiago Roman |
| **Sistema base** | Este mismo repositorio — [Felipe7774/NEXUS](https://github.com/Felipe7774/NEXUS), rama `main` |
| **Repositorio del dossier** | Mismo repo, carpeta `dossier/` (migrado desde el repo separado `NEXUS-dossier` — ver Historial) |
| **Semana actual** | 4 — Módulo 2 cerrado |

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

## Índice de documentos

- [`01-contexto-y-drivers.md`](01-contexto-y-drivers.md) — identificación del sistema, stakeholders, restricciones, drivers y riesgos preliminares.
- [`02-escenarios-de-calidad.md`](02-escenarios-de-calidad.md) — matriz de atributos, trade-offs, los 6 escenarios de calidad de 6 partes, semilla decidida por el equipo.
- [`04-evidencia-ejecutable.md`](04-evidencia-ejecutable.md) — resultado de la medición de línea base (Escenario 3).
- [`experimentos/EXP-001-linea-base/`](experimentos/EXP-001-linea-base/) — script de siembra + k6, condiciones, 3 corridas válidas.
- [`experimentos/EXP-002-escalabilidad/`](experimentos/EXP-002-escalabilidad/) — mismo paquete, para el Escenario 6 (5.000/1.000 registros).
- [`LOG-EDAV-auditoria-ia.md`](LOG-EDAV-auditoria-ia.md) — el documento más importante: registro completo del ciclo EDAV (E-D-A-V) para los 6 escenarios, incluyendo los errores de medición propios de la IA y cómo se corrigieron con datos reales.

## Trazabilidad Git

Todo el trabajo semanal quedó en Pull Requests contra `main`, revisables en el historial del repo:

```bash
git log --oneline --merges main
```

PRs mergeados: contexto (semana 1), riesgos/drivers (semana 2), tests (Vitest+Docker), esquema de stakeholders, matriz de atributos (semana 3), migración del dossier a esta estructura, prueba RLS + CI, timeout defensivo, medición de línea base, auditoría de Escenarios 4-6.

## Flujo de trabajo

Cada entrega semanal se abre como un Pull Request contra `main`. Desde la semana 4, `main` tiene **branch protection activa**: los checks `unit-tests` y `rls-integration-test` deben pasar antes de poder mergear (probado en vivo, ver Escenario 4 en el Log EDAV).

## Historial

Este dossier vivió originalmente en un repositorio aparte ([`NEXUS-dossier`](https://github.com/santiago1500K/NEXUS-dossier)) y se migró acá para mantener todo en un solo lugar junto con el código. La numeración de archivos (`01-04`) se reestructuró en la semana 4 para alinearse con la nomenclatura del tutor de la cátedra (antes: `01-contexto-sistema.md`, `02-riesgos-drivers.md`, `03-atributos-calidad.md`, `04-escenarios-calidad.md` — contenido preservado en el historial de Git).
