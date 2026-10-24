# 25 — Acta del mini-comité 2 (Módulo 6)

> **Este documento NO registra una reunión. La prepara.**
>
> Al 23/10/2026 el mini-comité 2 **nunca se celebró**. Lo que hay acá es la agenda con los datos ya verificados y el acta en blanco para llenar **durante** la sesión. El veredicto, las observaciones y los nombres los escribe el equipo en el momento.

## Qué pide el curso, textualmente

> *"El comité incorpora perspectivas técnicas, de seguridad, financieras y operativas. El veredicto —confirmada, ajustada o reconsiderada— se registra en ADR 4 junto con datos, supuestos y observaciones."*

Dos consecuencias prácticas de esa frase:

1. **Pide perspectivas, no un comité externo.** Es distinto del ítem de la semana 8, que era actuar como comité *para otro equipo*. Este lo celebra el propio equipo repartiéndose los cuatro roles: tres personas cubren cuatro perspectivas.
2. **El veredicto va al ADR 4**, que en la numeración de este repositorio es el [`ADR-006`](adrs/ADR-006-distribucion-y-resiliencia.md).

## Regla de integridad — leer antes de llenar

**Celebrarlo tarde y fecharlo con la fecha real es legítimo.** El curso pide que la decisión se tome con estas cuatro perspectivas, no que se haya tomado en la semana 12.

**Fecharlo en la semana 12 no es una opción, y además ya es detectable.** El `ADR-006` que está en `main` declara el acta como pendiente, y ese commit tiene fecha. Un acta fechada hacia atrás quedaría contradicha por el propio historial de Git. Dicho de otro modo: el repositorio protege al equipo de cometer ese error, porque lo haría visible.

No se asignan votos a nadie que no haya estado. Si alguno de los tres no participa, el acta lo dice.

---

## Agenda: lo que cada rol tiene que interrogar

Los datos de abajo están verificados contra el repositorio. **Las preguntas son el insumo; las respuestas se escriben en la sesión.**

### Rol CTO — límites de contexto y condiciones de extracción

**Datos sobre la mesa:**

- El `ADR-006` decidió **mantener una sola aplicación** y contener los fallos de lectura.
- La partición existe y está activa: **4 módulos** con propiedad exclusiva de tablas, 294 líneas, y `src/lib/crm.ts` con **cero accesos directos** a tablas.
- Revertir la partición cuesta tocar **10 archivos** (`ADR-007`).
- La necesidad de separar en servicios **no se demostró**.

**Preguntas a responder:**

1. ¿Qué dato concreto y medible dispararía extraer un contexto a un servicio? `[COMPLETAR]`
2. ¿Los cuatro módulos actuales son los límites correctos, o alguno está mal cortado? `[COMPLETAR]`
3. ¿Se confirma la decisión de una sola unidad de despliegue? `[COMPLETAR]`

### Rol Seguridad — políticas adicionales y cuentas privilegiadas

**Datos sobre la mesa:**

- **40 políticas RLS sobre 14 tablas**, pero la prueba de aislamiento cubre **una sola tabla**. Es el riesgo R4, ya declarado.
- La frontera de `service_role` está verificada **rompiéndola a propósito**, en tres capas.
- Las **11 funciones `SECURITY DEFINER` fijan `search_path`**, sin excepción.
- `config.toml`: MFA TOTP **habilitada para inscripción, no exigida**; `enable_confirmations = false`; registro abierto.
- **Vercel sigue en una sola cuenta.** Supabase se compartió entre los tres el 18/09, después del incidente.
- Antecedente real: el proyecto de Supabase **fue eliminado en septiembre** y nadie se enteró por una alerta.

**Preguntas a responder:**

1. ¿Se acepta el riesgo R4 —40 políticas sin auditar una por una— o se abre trabajo para cerrarlo? `[COMPLETAR]`
2. ¿Se exige MFA a las cuentas administradoras del proveedor? `[COMPLETAR]`
3. ¿Se reparte el acceso a Vercel como se hizo con Supabase? `[COMPLETAR]`

### Rol Finanzas — tarifa, costos actuales e incrementales

**Datos sobre la mesa.** `EXP-004/tco-supuestos.json` tiene la fórmula y declara que son *"supuestos de planificación; no cotización ni tiempo trabajado"*:

```
C_comun + R * (H_desarrollo + 12 * (H_operacion_mensual + H_coordinacion_mensual)) + 12 * I
```

| Alternativa | Horas a 12 meses, con coordinación | Infraestructura extra |
|---|---|---|
| App actual + breaker | **26-64 h** | 0 |
| Outbox y worker de seguimiento | **100-200 h** | sin cuantificar |
| Dos contextos extraídos en servicios | **200-400 h** | sin cuantificar |

- La **tarifa horaria `R` está en `null`**: sin ella la fórmula no produce un número.
- El costo de hosting y Supabase figura como *"no consultado; común a las alternativas"*.

**Preguntas a responder:**

1. ¿Qué valor toma `R`, aunque sea una tarifa de referencia declarada como supuesto? `[COMPLETAR]`
2. ¿Se consultan los límites y costos reales del plan contratado? `[COMPLETAR]`
3. ¿El orden de magnitud entre 26-64 h y 200-400 h basta para descartar la extracción, o hace falta cuantificar la infraestructura? `[COMPLETAR]`

### Rol Operaciones — tolerancia al cooldown y SLO

**Datos sobre la mesa:**

- Circuit breaker: abre tras **3 fallos**, enfría **1.000 ms**. Durante el cooldown **rechaza lecturas**.
- Timeout de lectura: **3.000 ms**.
- Degradación medida: 61 ms a 5 VUs · 347 ms y 1,1% de error a 50 · **3.000 ms y 5,8% a 100** · 16,4% de error a 200. El **throughput útil cae después de 50 VUs**.
- **No hay SLO, ni alertas, ni runbooks, ni métricas.** `EXP-003` restauró el respaldo pero **RPO y RTO no se midieron**.
- La traza de auditoría de cambios de etapa existe en `deal_stage_history` y **la aplicación no la lee**.

**Preguntas a responder:**

1. ¿Es tolerable que durante 1.000 ms de cooldown se rechacen lecturas? `[COMPLETAR]`
2. ¿Cuál es el SLO comprometido, con número? `[COMPLETAR]`
3. ¿Qué runbook se escribe primero? `[COMPLETAR]`

---

## Acta — llenar en la sesión

| Campo | Valor |
|---|---|
| **Fecha y hora reales** | `[COMPLETAR]` |
| **Duración** | `[COMPLETAR]` |
| **Asistentes** | `[COMPLETAR]` |
| **Rol CTO** | `[COMPLETAR]` |
| **Rol Seguridad** | `[COMPLETAR]` |
| **Rol Finanzas** | `[COMPLETAR]` |
| **Rol Operaciones** | `[COMPLETAR]` |
| **Ausentes, si los hubo** | `[COMPLETAR]` |

### Observaciones planteadas

`[COMPLETAR]` — una línea por observación, con el rol que la planteó. Las que no se resuelvan en la sesión se registran como abiertas, no se omiten.

### Decisiones tomadas

`[COMPLETAR]`

---

## Veredicto sobre el `ADR-006`

**Marcar uno:**

- [ ] **Confirmada** — la decisión se mantiene tal como está documentada.
- [ ] **Ajustada** — se mantiene con cambios. Detallar cuáles: `[COMPLETAR]`
- [ ] **Reconsiderada** — se revierte o se reemplaza. Detallar por qué: `[COMPLETAR]`

**Justificación del veredicto, atada a los datos de la agenda:** `[COMPLETAR]`

**Condición reproducible que obligaría a revisarlo de nuevo:** `[COMPLETAR]` — con umbral medible, no una meta sin número.

---

## Después de la sesión: cuatro pasos

1. Llenar este documento con la **fecha real** y commitearlo el mismo día.
2. Actualizar la sección *Mini-comité 2* del [`ADR-006`](adrs/ADR-006-distribucion-y-resiliencia.md), reemplazando *"están pendientes"* por el veredicto y enlazando esta acta.
3. Actualizar la sección 9 de [`07-distribucion-y-resiliencia.md`](07-distribucion-y-resiliencia.md), que hoy dice *"material listo; sesión humana pendiente"*.
4. Marcar el ítem **A5** de la autoevaluación del módulo 6, que hasta entonces **no se cumple**: el `ADR-006` tiene fuentes, pero no veredicto.

> Mientras estos cuatro pasos no estén hechos, lo correcto es declarar A5 como incumplido. Es un punto menos; afirmarlo sin acta es un problema de integridad, que cuesta bastante más.
