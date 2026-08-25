# Dossier de arquitectura — Nexo CRM

| Campo | Valor |
|---|---|
| **Proyecto** | Nexo CRM — CRM B2B de contactos, empresas, oportunidades y actividades |
| **Materia** | Arquitectura de Software |
| **Docente** | Nelson Sánchez Sánchez |
| **Equipo** | Carlos Correa, Felipe Piragauta, Santiago Roman |
| **Sistema base** | Este mismo repositorio — [Felipe7774/NEXUS](https://github.com/Felipe7774/NEXUS), rama `main` |
| **Repositorio del dossier** | Mismo repo, carpeta `dossier/` (migrado desde el repo separado `NEXUS-dossier` — ver Historial) |
| **Semana actual** | 4 |

## Evidencias por semana

| Semana | Evidencia | Estado |
|---|---|---|
| 1 | Sistema corriendo localmente + contexto del sistema | [`01-contexto-y-drivers.md`](01-contexto-y-drivers.md) (secciones 1-4) |
| 2 | Riesgos iniciales + drivers preliminares + checkpoint (tests pasando) | [`01-contexto-y-drivers.md`](01-contexto-y-drivers.md) (secciones 5-6) |
| 3 | Matriz de atributos + escenarios de calidad | [`02-escenarios-de-calidad.md`](02-escenarios-de-calidad.md) |
| 4 | Medición de línea base | [`04-evidencia-ejecutable.md`](04-evidencia-ejecutable.md) + [`experimentos/EXP-001-linea-base/`](experimentos/EXP-001-linea-base/) — **medición todavía no ejecutada** |

## Índice de documentos

- [`01-contexto-y-drivers.md`](01-contexto-y-drivers.md) — identificación del sistema, stakeholders, restricciones, drivers y riesgos preliminares.
- [`02-escenarios-de-calidad.md`](02-escenarios-de-calidad.md) — matriz de atributos, trade-offs, escenarios de calidad de 6 partes.
- [`04-evidencia-ejecutable.md`](04-evidencia-ejecutable.md) — resultado de la medición de línea base (pendiente).
- [`experimentos/EXP-001-linea-base/`](experimentos/EXP-001-linea-base/) — script de k6, condiciones experimentales, resultados crudos.
- [`LOG-EDAV-auditoria-ia.md`](LOG-EDAV-auditoria-ia.md) — registro de qué contenido fue propuesto por IA y su estado real de auditoría.

## Trazabilidad Git

Todo el trabajo semanal quedó en Pull Requests contra `main`, revisables en el historial del repo:

```bash
git log --oneline --merges main
```

PRs mergeados: contexto (semana 1), riesgos/drivers (semana 2), tests (Vitest+Docker), esquema de stakeholders, matriz de atributos (semana 3), migración del dossier a esta estructura.

## Flujo de trabajo

Cada entrega semanal se abre como un Pull Request contra `main` y se revisa/mergea antes de pasar a la siguiente semana.

## Historial

Este dossier vivió originalmente en un repositorio aparte ([`NEXUS-dossier`](https://github.com/santiago1500K/NEXUS-dossier)) y se migró acá para mantener todo en un solo lugar junto con el código. La numeración de archivos (`01-04`) se reestructuró en la semana 4 para alinearse con la nomenclatura del tutor de la cátedra (antes: `01-contexto-sistema.md`, `02-riesgos-drivers.md`, `03-atributos-calidad.md`, `04-escenarios-calidad.md` — contenido preservado en el historial de Git).
