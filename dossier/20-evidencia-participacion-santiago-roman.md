# 20 — Evidencia de participación: Santiago Roman

**Integrante:** Santiago Roman
**Identidad Git:** `santiago1500K`
**Correos:** `55493573+santiago1500K@users.noreply.github.com` y `santiroman7@hotmail.com` (alias `chanty`)
**Fecha de la auditoría:** 23/10/2026

> **Estado: esqueleto.** La evidencia de abajo está verificada contra el repositorio. Las justificaciones marcadas `[COMPLETAR]` las escribe el integrante: son su relato de por qué decidió lo que decidió, y nadie más puede escribirlas.

## Propósito

Dejar evidencia reproducible de la participación individual, con el mismo criterio que [`18-evidencia-participacion-carlos-correa.md`](18-evidencia-participacion-carlos-correa.md): separar autoría de un cambio, integración mediante merge y decisión arquitectónica.

**No se reescribe el historial ni se atribuyen commits creados por otros integrantes.**

## 1. Normalización de identidad

Hasta el 23/10/2026 el historial mostraba a este integrante como **dos personas distintas**:

| Identidad | Commits |
|---|---|
| `chanty <santiroman7@hotmail.com>` | 51 |
| `santiago1500K <...@users.noreply.github.com>` | 35 |

Se agregó la entrada correspondiente a `.mailmap`, igual que se había hecho con Carlos. **No se modifican autores ni hashes históricos**: `.mailmap` solo afecta cómo los reportes agrupan identidades.

Comprobación:

```bash
git log --format="%aN" main | sort | uniq -c | sort -rn
```

Al momento de la auditoría devolvía **86 commits** bajo una sola identidad, en lugar de 51 + 35 repartidos. **Al cierre del 23/10/2026 son 95**, porque el trabajo del día siguió sumando. La tabla de arriba es la foto que justificó el `.mailmap`; el comando es la cifra vigente.

## 2. Decisiones arquitectónicas tomadas por este integrante

Cada fila enlaza la decisión con su consecuencia verificable en el repositorio. La columna de justificación la completa el integrante.

| Decisión | Consecuencia verificable | Por qué se decidió así |
|---|---|---|
| **Audiencia de las vistas C4.** Nivel 1 para quien debe entender el sistema sin conocerlo por dentro; Niveles 2 y 3 para quien va a tocar el código | De ese criterio se derivó incluir `client.server.ts` como componente #9. Queda escrito en `modeloc4-nivel.md` como *"criterio derivado de esta decisión"*. PR #23 y #24 | `[COMPLETAR]` |
| **Registrar la partición por dominio como ADR nuevo**, en vez de editar el `ADR-001` o marcarlo superseded | `ADR-007`. Mantiene el criterio del equipo de no reescribir ADRs retroactivamente, el mismo que se usó con `ADR-005` y `ADR-006`. PR #41 | `[COMPLETAR]` |
| **Validar el registro de uso de IA del Módulo 3** como exacto y completo | Quedó firmado en `LOG-EDAV-auditoria-ia.md`. PR #26 | `[COMPLETAR]` |
| **Consolidar los ADR en una sola carpeta** y renumerar solo los dos más nuevos, para no romper 28 referencias | PR #38. Eliminó la ambigüedad de tener dos documentos llamados "ADR 3" | `[COMPLETAR]` |
| **No inflar el historial de los compañeros.** Ante la posibilidad de generar PRs para que otros integrantes figuraran con actividad, se descartó y se repartió trabajo real en issues | Issues #27 a #30, con alcance y criterio de aceptación. Ningún commit fue atribuido a quien no lo escribió | `[COMPLETAR]` |

> La última fila es una decisión de integridad, no técnica. Se registra porque la rúbrica evalúa el proceso, y porque la alternativa descartada habría sido detectable en el historial.

## 3. Trabajo de verificación conducido

Además de decidir, este integrante condujo auditorías que encontraron problemas reales. Todos verificables:

| Hallazgo | Cómo se detectó | Dónde se corrigió |
|---|---|---|
| **El entregable de la semana 3 no estaba en el dossier.** Los 6 escenarios de calidad de 6 partes habían quedado solo en el historial tras una reestructuración | Auditoría del dossier contra el repositorio | PR #37, restaurados verbatim |
| **Vulnerabilidad XSS en producción.** `@tanstack/react-start` tenía el CVE-2026-102989; Vercel bloqueaba los deploys hacía una semana | Lectura del log real del deploy, tras descartar que fuera el lockfile o el preset de build | PR #39 |
| **Fuga de credencial recurrente.** El script de siembra reescribía un JWT real en un archivo versionado en cada corrida | Revisión previa al commit de la re-ejecución de EXP-001 | PR #43, corregido en la raíz |
| **El modelo C4 no reflejaba la modularización.** Cuatro módulos de dominio existían en el código y no estaban representados | Medición del código al preparar los ADR | PR #40 |
| **Dos ADR con el mismo número y contenido distinto** | Inventario de ambas carpetas de ADR | PR #38 |
| **La línea base no se reproducía desde el 25/08** | Verificación de que el experimento siguiera siendo ejecutable | PR #43, re-ejecutada |

## 4. Declaración de uso de herramientas

`[COMPLETAR — INTEGRANTE]`

Esta sección debe declarar con qué asistencia se produjo el trabajo de arriba, en coherencia con [`16-declaracion-uso-ia.md`](16-declaracion-uso-ia.md).

Dato objetivo para partir: al cierre del 23/10/2026, de los **95** commits de esta identidad, **25 llevan el trailer `Co-Authored-By: Claude`**. Se listan con:

```bash
git log --grep="Co-Authored-By: Claude" -i --format="%h  %s" main
```

> La distinción que sostiene el dossier no es código contra documentación, sino **decisiones contra implementación**: la implementación y la documentación fueron asistidas y son verificables por tests; las decisiones de la sección 2 son del integrante.

## 5. Comprobaciones para la defensa

```bash
# Commits de este integrante, con identidades unificadas
git log --author="santiago1500K" --format="%h %ad %s" --date=short main | head -20

# Commits con asistencia declarada
git log --grep="Co-Authored-By: Claude" -i --oneline main

# Merges integrados por este integrante
git log --merges --format="%h %aN %s" main | head -15
```
