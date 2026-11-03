# 20 — Evidencia de participación: Santiago Roman

**Integrante:** Santiago Roman
**Identidad Git:** `santiago1500K`
**Correos:** `55493573+santiago1500K@users.noreply.github.com` y `santiroman7@hotmail.com` (alias `chanty`)
**Fecha de la auditoría:** 23/10/2026

> **Estado: completo.** La evidencia está verificada contra el repositorio y **las justificaciones las escribió el integrante** el 03/11/2026, con la evidencia de cada decisión delante. Son su relato de por qué decidió lo que decidió; nadie más podía escribirlas.

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

Devuelve **una sola identidad** donde antes había dos, que es lo que el `.mailmap` tenía que arreglar y lo único que esta comprobación necesita demostrar.

La tabla de arriba —51 + 35— es la foto del 23/10/2026 que justificó el cambio, y como describe un estado pasado no envejece. **El total vigente no se escribe acá**: crece con cada commit y lo da el comando. Ver la nota de método en [`16-declaracion-uso-ia.md`](16-declaracion-uso-ia.md#cómo-auditar-esta-declaración).

## 2. Decisiones arquitectónicas tomadas por este integrante

Cada fila enlaza la decisión con su consecuencia verificable en el repositorio y con la razón que la sostiene.

| Decisión | Consecuencia verificable | Por qué se decidió así |
|---|---|---|
| **Audiencia de las vistas C4.** Nivel 1 para quien debe entender el sistema sin conocerlo por dentro; Niveles 2 y 3 para quien va a tocar el código | De ese criterio se derivó incluir `client.server.ts` como componente #9. Queda escrito en `modeloc4-nivel.md` como *"criterio derivado de esta decisión"*. PR #23 y #24 | Cada audiencia necesita entender cosas distintas. El Nivel 1 permite comprender qué hace el sistema y cómo se relaciona con su entorno, sin conocer el código; los Niveles 2 y 3 necesitan el detalle para que quien vaya a modificarlo entienda su estructura y sus componentes. Un solo diagrama habría quedado demasiado cargado para alguien no técnico o demasiado general para quien trabaja en el código. **Ese criterio explica también incluir `client.server.ts`:** aunque no tenga consumidores, sus privilegios son relevantes para quien mantiene el sistema, y dejarlo fuera habría ocultado a esa audiencia justo el componente que bypassa RLS. |
| **Registrar la partición por dominio como ADR nuevo**, en vez de editar el `ADR-001` o marcarlo superseded | `ADR-007`. Mantiene el criterio del equipo de no reescribir ADRs retroactivamente, el mismo que se usó con `ADR-005` y `ADR-006`. PR #41 | El `ADR-001` no quedó falso, así que marcarlo *superseded* habría sido incorrecto: *superseded* significa reemplazado, y la partición por dominio no reemplaza a las capas, convive dentro de ellas. **Son ejes distintos** — capas separa por responsabilidad técnica, dominio separa por negocio —, y por eso correspondía un ADR nuevo. Sí se actualizó el **Contexto** del `ADR-001`, con una nota fechada que dice qué cambió y remite al `ADR-007`; la **Decisión** no se tocó. Actualizar el contexto con marca de fecha conserva el registro, reescribir la decisión lo borraría. |
| **Validar el registro de uso de IA del Módulo 3** como exacto y completo | Quedó firmado en `LOG-EDAV-auditoria-ia.md`. PR #26 | **La firma tiene dos mitades que no se apoyan en lo mismo, y conviene decirlo.** *Exacto* se verificó contra el repositorio: los diagramas Mermaid renderizan en GitHub, las rutas citadas existen —21 el 28/08 y 25 el 15/09, ninguna rota— y `client.server.ts` terminó incluido como componente #9 después de que la IA reportara su ausencia. *Completo* se apoya en haber participado directamente en esas sesiones: los cuatro rechazos registrados ocurrieron ahí y no dejaron commit. Se firma declarando esa diferencia, con el mismo criterio que el documento 16 aplica a sus dos últimas filas. |
| **Consolidar los ADR en una sola carpeta** y renumerar solo los dos más nuevos, para no romper 28 referencias | PR #38. Eliminó la ambigüedad de tener dos documentos llamados "ADR 3" | Renumerar los ADR viejos habría roto referencias **irreparables**. Las 165 citas dentro del dossier se arreglan con un reemplazo, pero **27 viven en mensajes de commit** y el historial de Git es inmutable: un `ADR-003` renumerado habría dejado commits apuntando para siempre a un documento que ya no es ese, y la única salida habría sido reescribir la historia. El costo era además asimétrico: el `ADR-005` y el `ADR-006` tenían horas de vida cuando se consolidaron, así que casi nadie los citaba. Renumerar lo nuevo no rompe nada; renumerar lo viejo rompe todo lo escrito antes. |
| **No inflar el historial de los compañeros.** Ante la posibilidad de generar PRs para que otros integrantes figuraran con actividad, se descartó y se repartió trabajo real en issues | Issues #27 a #30, con alcance y criterio de aceptación. Ningún commit fue atribuido a quien no lo escribió | No quise falsificar el historial. Y el repositorio lo desmentiría de todos modos: `git log --author` muestra quién escribió cada commit, así que una actividad inventada no habría sobrevivido a la primera verificación. Repartir trabajo real en issues era la única opción que dejaba evidencia verdadera. |

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

Parte del trabajo de arriba se produjo **con asistencia de Claude Code**, declarada en los commits mediante el trailer `Co-Authored-By`. Esta sección dice qué fue asistido y qué no, en coherencia con [`16-declaracion-uso-ia.md`](16-declaracion-uso-ia.md).

**Qué fue asistido.** La implementación y la documentación. Eso incluye código fuente, no solo archivos del dossier: los commits con trailer tocan cinco archivos de `src/`.

| Archivo de `src/` | Commit |
|---|---|
| `architecture/service-role-boundary.test.ts` | `fea5036` |
| `architecture/persistence-fitness.test.ts` | `65fb1fa` |
| `architecture/persistence-rules.ts` | `e1c5083` |
| `integrations/supabase/rls-isolation.integration.test.ts` | `e1c5083` |
| `routes/__root.tsx` | `ca70927` — corrección del CVE-2026-102989 en producción |

**Qué no fue asistido.** Las cinco decisiones de la sección 2 y las justificaciones que las acompañan.

**Por qué esta declaración no dice «el código es nuestro y la documentación fue asistida».** Porque sería falsa y el repositorio la desmiente en una consulta: los cinco archivos de arriba son código. La distinción que sí se sostiene es otra, y es la que ordena todo el dossier:

> No es **código contra documentación**, sino **decisiones contra implementación**.

La implementación asistida no depende de confianza: las fitness functions se verificaron **rompiéndolas a propósito**, y el aislamiento RLS corre contra Postgres real en cada PR. Lo asistido es verificable por pruebas; lo decidido es de este integrante y está justificado fila por fila arriba.

**Dato objetivo**, sin cifra fija por la razón explicada en el documento 16. La proporción de commits de **esta identidad** que llevan el trailer `Co-Authored-By: Claude`:

```bash
echo "asistidos: $(git log --use-mailmap --author=santiago1500K --grep="Co-Authored-By: Claude" -i --oneline main | wc -l) de $(git log --use-mailmap --author=santiago1500K --oneline main | wc -l)"
```

Y para leerlos uno por uno:

```bash
git log --use-mailmap --author=santiago1500K --grep="Co-Authored-By: Claude" -i --format="%h %ad %s" --date=short main
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
