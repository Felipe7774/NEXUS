# 25 — Acta del mini-comité 2 (Módulo 6)

> **Sesión celebrada el 23/10/2026.** Esta acta registra una reunión que ocurrió ese día, con los tres integrantes presentes. No se fecha hacia atrás: el curso pide que la decisión se tome con las cuatro perspectivas, no que se haya tomado en la semana 12. El `ADR-006` en `main` declaraba el acta como pendiente hasta este commit, y esa fecha queda en el historial.

## Qué pide el curso, textualmente

> *"El comité incorpora perspectivas técnicas, de seguridad, financieras y operativas. El veredicto —confirmada, ajustada o reconsiderada— se registra en ADR 4 junto con datos, supuestos y observaciones."*

Pide perspectivas, no un comité externo. El veredicto va al ADR 4, que en este repositorio es el [`ADR-006`](adrs/ADR-006-distribucion-y-resiliencia.md).

## Acta

| Campo | Valor |
|---|---|
| **Fecha** | 23/10/2026 |
| **Duración** | `[COMPLETAR]` |
| **Asistentes** | Santiago Roman, Felipe Piragauta, Carlos Correa — los tres integrantes |
| **Rol CTO** | Santiago Roman |
| **Rol Seguridad** | Felipe Piragauta |
| **Rol Finanzas y Operaciones** | Carlos Correa |
| **Ausentes** | Ninguno |
| **Asistencia de IA** | La sesión fue conducida con Claude Code, que formuló las doce preguntas a partir de la evidencia del repositorio, midió los datos pedidos durante la reunión y levantó esta acta. **Las doce decisiones son del equipo.** Ver [`16-declaracion-uso-ia.md`](16-declaracion-uso-ia.md) |

Tres personas cubren cuatro roles: Carlos tomó Finanzas y Operaciones, porque sus preguntas comparten el mismo presupuesto de horas.

---

## Decisiones por rol

### CTO — Santiago Roman

**1. Disparador para extraer un contexto a un servicio separado.**

Costo de coordinación, medido del historial de Git. Ventana de **8 semanas**, muestra mínima de **6 commits** que toquen `src/modules/`, y se evalúa extraer cuando **más del 40%** toque más de un módulo — tres de seis.

```bash
git log --since="8 weeks ago" --no-merges --name-only main -- src/modules/
```

- **Límite declarado:** con esa muestra la señal es ruidosa y una coincidencia puede dispararla. El umbral abre una **evaluación**, no una extracción automática.
- **No es disparador la carga.** Ni VUs ni p95: el quiebre medido está en PostgreSQL, y **separar la aplicación no separa la base de datos**. Un umbral de concurrencia dispararía un trabajo de 200-400 h que no resuelve el problema medido.
- **Disparador complementario, declarado como no medible hoy:** contención atribuible a un dominio. Requiere instrumentación por dominio — es justo lo que el plan de observabilidad del Módulo 7 debería habilitar.

**2. Los cuatro límites de módulo se confirman.** Respaldo: la fitness function lleva seis días corriendo sin reportar una sola violación de persistencia ajena ni de importación privada. Si las fronteras estuvieran mal cortadas, estaría fallando en cada PR.

**Cambio acordado:** `deal_stage_history` se asigna a **`sales`** en `persistence-rules.ts`. Hoy no tiene dueño y por eso es inalcanzable desde el código. La tabla solo tiene `GRANT SELECT`, así que `sales` podrá leerla pero no escribirla; el trigger sigue siendo el único que inserta.

**3. Una sola unidad de despliegue: se confirma.** Mantenerla cuesta 1 a 4 semanas de capacidad del equipo contra 8 a 22 de extraer dos contextos, y la necesidad de separar no se demostró — con el umbral del punto 1 fijado como condición de revisión.

### Seguridad — Felipe Piragauta

**4. Riesgo R4 — las 40 políticas RLS sin auditar una por una: se abre trabajo.**

Alcance acordado: extender `rls-isolation.integration.test.ts` **de 1 tabla a 4**.

| Tabla | Estado |
|---|---|
| `companies` | Cubierta |
| `contacts` | Por cubrir |
| `deals` | Por cubrir |
| `activities` | Por cubrir |

Son las cuatro con datos de negocio por dueño. `pipelines`, `stages`, `profiles` y `user_roles` quedan fuera del alcance inmediato por ser configuración e identidad.

**5. MFA.** Se exige en las **cuentas administradoras del proveedor** — Supabase, Vercel y GitHub—, porque desde ahí se borra el proyecto, se cambian variables de entorno y se accede a los datos sin pasar por RLS. **No se exige a los usuarios de la aplicación.** Motivo de esa segunda mitad: `[COMPLETAR — FELIPE]`.

Nota: `config.toml` ya declara MFA TOTP con inscripción y verificación habilitadas, lo cual es **disponibilidad opcional para usuarios de la aplicación**, no exigencia, y no cubre las cuentas del proveedor.

**6. Acceso a Vercel: se reparte** entre los tres, igual que se hizo con Supabase el 18/09. El riesgo de cuenta única no es hipotético: ya costó tiempo dos veces, en septiembre y en octubre.

### Finanzas — Carlos Correa

**7. La tarifa `R` se mantiene en `null`,** y el costo se expresa en **semanas de capacidad del equipo**. Con tres personas a 6-8 horas semanales, la capacidad total es de 18 a 24 horas por semana:

| Alternativa | Horas a 12 meses | Semanas de capacidad |
|---|---|---|
| App actual + breaker | 26-64 h | **1 a 4** |
| Outbox y worker | 100-200 h | **4 a 11** |
| Dos contextos en servicios | 200-400 h | **8 a 22** |

Motivo de dejar `R` en `null`: el equipo no factura horas, así que una tarifa de mercado sería un supuesto inventado. Las semanas de capacidad son una unidad real y verificable. **22 semanas son más de cinco meses: más de lo que queda del curso.**

**8. Los límites y costos del plan contratado se mantienen declarados como no consultados,** con el argumento de que son comunes a las alternativas y se cancelan al compararlas. Consecuencia aceptada: el SLO no puede comprometerse sobre disponibilidad del proveedor.

**9. El orden de magnitud basta para descartar la extracción;** no hace falta cuantificar la infraestructura extra, que hoy figura como `null`. Razón registrada: **sumar costo al lado caro no invierte la relación** de 1-4 semanas contra 8-22.

### Operaciones — Carlos Correa

**10. El cooldown de 1.000 ms se acepta.** Límite declarado: **no se midió cuántas lecturas legítimas se rechazan** mientras el circuito está abierto. El `EXP-004` provocó el fallo artificialmente.

**11. SLO comprometido: `p95 < 2.000 ms` y tasa de error `< 1%`, acotado a 5 VUs.**

Es el único escalón de la escalera de S11 totalmente respaldado: 64,45 ms y **0% de error**. Se eligió deliberadamente sobre alternativas más ambiciosas, porque a 50 VUs la medición da **1,12% de error** y el propio protocolo prerregistrado declaró ahí el punto de quiebre: comprometerse a `< 1%` en ese escalón habría sido contradecir la propia evidencia.

- **Capacidad de medición: pendiente.** Hoy no hay métricas ni alertas, así que el cumplimiento de este SLO **no se puede verificar**. Depende del plan de observabilidad del Módulo 7.
- **Camino para subirlo:** medir entre 5 y 50 VUs, el tramo que la escalera nunca exploró.

**12. Primer runbook: recuperación del proyecto del proveedor.** Se eligió por dos motivos: es el procedimiento más caro, y **ya está probado** — `EXP-003` restauró el respaldo en local el 18/09 con conteos coincidentes de 14 tablas y 4 usuarios. Escribirlo es en buena medida transcribir lo ejecutado. **Falta medir RPO y RTO**, que siguen sin número.

---

## Observaciones registradas

Tres surgieron del repaso de evidencia durante la sesión y **cambiaron una respuesta ya dada**. Se registran porque el proceso de corrección es parte del resultado:

1. **Un umbral de extracción basado en carga habría sido incorrecto.** El quiebre medido está en la capa de datos; separar la aplicación no separa PostgreSQL. La respuesta 1 se reformuló sobre costo de coordinación.
2. **El umbral inicial era inalcanzable.** Se propuso un mínimo de 15 commits en 8 semanas; al medir, el ritmo real resultó ser de **2 commits cada 8 semanas** sobre la capa de datos, y **10 sobre todo `src/`**. El indicador nunca habría salido de «no concluyente». Se bajó el mínimo a 6.
3. **El SLO inicial contradecía la medición.** Se propuso error `< 1%` hasta 50 VUs, nivel en el que se midió **1,12%** y que el protocolo prerregistrado ya había declarado como punto de quiebre. Se acotó a 5 VUs.

Una cuarta observación venía de la auditoría del mismo día: **`deal_stage_history` no tenía dueño declarado**, y por eso la traza de auditoría que sí existe es inalcanzable desde la aplicación.

---

## Veredicto sobre el `ADR-006`

- [x] **Confirmada** — la decisión se mantiene tal como está documentada.
- [ ] Ajustada
- [ ] Reconsiderada

**Justificación.** Mantener una sola unidad de despliegue cuesta 1 a 4 semanas de capacidad del equipo contra 8 a 22 de extraer dos contextos, y la necesidad de separar no se demostró. La decisión se confirma **con una condición de revisión que antes no existía**: el umbral de costo de coordinación de la respuesta 1. El cooldown y el timeout se aceptan con sus límites declarados.

**Condición reproducible que obligaría a revisarlo:** que en una ventana de 8 semanas, con un mínimo de 6 commits sobre `src/modules/`, más del 40% toque más de un módulo. Verificable con el comando de la respuesta 1.

---

## Acciones derivadas

| # | Acción | Rol |
|---|---|---|
| 1 | Agregar `deal_stage_history: "sales"` al mapa de `owners` en `persistence-rules.ts` | CTO |
| 2 | Extender `rls-isolation.integration.test.ts` a `contacts`, `deals` y `activities` | Seguridad |
| 3 | Activar MFA en Supabase, Vercel y GitHub | Seguridad |
| 4 | Repartir el acceso a Vercel entre los tres | Seguridad |
| 5 | Escribir el motivo de no exigir MFA a los usuarios de la aplicación | Seguridad |
| 6 | Registrar las semanas de capacidad en `tco-supuestos.json` y el motivo de `R = null` | Finanzas |
| 7 | Escribir el runbook de recuperación del proveedor y medir RPO y RTO | Operaciones |
| 8 | Llevar el SLO y su dependencia de medición al plan de observabilidad del Módulo 7 | Operaciones |

> La acción 3 es un interruptor, no un proyecto. Si esta acta dice que se exige MFA y nadie la activa, el acta queda desmentida por la realidad.

## Cierre del ítem A5

La autoevaluación del Módulo 6 pedía que el ADR 4 *"registre el veredicto real del comité"*. Con esta acta, el `ADR-006` tiene fuentes **y** veredicto. **A5 se cumple** una vez actualizado el propio `ADR-006` y la sección 9 de [`07-distribucion-y-resiliencia.md`](07-distribucion-y-resiliencia.md), que hasta hoy decía *"material listo; sesión humana pendiente"*.
