# ADR-0001: `[COMPLETAR — la decisión concreta, no un tema]`

> El título tiene que nombrar una decisión, no un área.
> ❌ "ADR-0001: Estilo arquitectónico" — es un tema.
> ✅ "ADR-0001: Adopción de `<estilo>` con `<rasgo distintivo>`" — es una decisión.

| Campo | Valor |
|---|---|
| **Estado** | Borrador |
| **Fecha** | `[COMPLETAR]` |
| **Autores** | `[COMPLETAR]` |
| **Veredicto del Mini-comité 1** | Pendiente (ver sección 7) |
| **Relacionado** | [ADR-0002](0002-aislamiento-persistencia.md) · `dossier/05-riesgos-tradeoffs-costo.md` (todavía no existe — issue #28) · Matriz de Control EDAV (issue #29) |

---

## 1. Contexto y drivers

### Datos ya disponibles (precargados, verificables)

**Drivers priorizados por el equipo en el Módulo 2** (`dossier/01-contexto-y-drivers.md`):

1. Seguridad · 2. Disponibilidad · 3. Mantenibilidad · 4. Rendimiento · 5. Usabilidad

**Mediciones empíricas de la Semana 4:**

| Experimento | Volumen | p95 | Umbral | Fuente |
|---|---|---|---|---|
| EXP-001 | 1.000 oportunidades | 92.62 ms | 2.000 ms | `dossier/experimentos/EXP-001-linea-base/` |
| EXP-002 | 5.000 contactos / 1.000 oportunidades | 127.16 ms | 2.000 ms | `dossier/experimentos/EXP-002-escalabilidad/` |

Condiciones de esas mediciones: Supabase local en Docker (localhost, sin red externa), API REST directa, 5 usuarios virtuales. El propio `condiciones.md` las describe como *"un piso, no el número final que vería un usuario"*.

**Restricciones del negocio:**

- Equipo de 3 integrantes con 6 a 8 horas semanales en total
- Supabase en plan free, sin presupuesto para infraestructura paga
- Stack fijo: React 19 + TanStack Start + Supabase, sin backend independiente

**Hechos verificables del sistema actual:**

- Una sola unidad de despliegue: el proceso SSR de TanStack Start, en Vercel
- Todas las llamadas `supabase.from(...)` de `src/` están en un único archivo, `src/lib/crm.ts` (419 líneas, 6 entidades)
- Aislamiento de datos: 40 políticas RLS sobre 14 tablas, verificado en CI por `rls-isolation.integration.test.ts`

> La *etiqueta* de estilo del sistema actual y el diagnóstico de su cohesión están en auditoría (issue #29, filas 8 y 1). Usá los hechos de arriba; la interpretación todavía no está validada.

### Fuerzas en tensión

`[COMPLETAR — EQUIPO]` ¿Qué problema de negocio obliga a tomar esta decisión ahora? ¿Qué drivers tiran en direcciones opuestas?

---

## 2. Alternativas consideradas

> Mínimo dos opciones viables. Cada una con descripción técnica, su punto de sensibilidad ATAM y pros/contras **atados a los drivers medidos**, no genéricos.

### Alternativa A — `[COMPLETAR]`

- **Descripción técnica:** `[COMPLETAR]`
- **Punto de sensibilidad (ATAM):** `[COMPLETAR]`
- **A favor, según los drivers medidos:** `[COMPLETAR]`
- **En contra, según los drivers medidos:** `[COMPLETAR]`

### Alternativa B — `[COMPLETAR]`

- **Descripción técnica:** `[COMPLETAR]`
- **Punto de sensibilidad (ATAM):** `[COMPLETAR]`
- **A favor, según los drivers medidos:** `[COMPLETAR]`
- **En contra, según los drivers medidos:** `[COMPLETAR]`

---

## 3. Decisión

> En voz activa e imperativa: *"Nosotros implementaremos…"*, con la justificación técnica frente al problema de negocio.

`[COMPLETAR — EQUIPO]`

---

## 4. Consecuencias y trade-offs (ATAM)

> Un ADR sin consecuencias negativas es propaganda. Esta sección tiene que tener al menos una fila "Degradado".

| Atributo (ISO/IEC 25010) | Efecto | Evidencia o estimación |
|---|---|---|
| `[COMPLETAR]` | Favorecido | `[COMPLETAR]` |
| `[COMPLETAR]` | Degradado | `[COMPLETAR]` |

**Riesgos que introduce esta decisión:** `[COMPLETAR]`

**Costo de reversibilidad:** `[COMPLETAR]` horas de ingeniería del equipo, estimadas a partir de `[COMPLETAR — qué base de cálculo]`.

---

## 5. Supuestos y condición de revisión

> Un supuesto que todavía no se verificó empíricamente, y la métrica exacta que obligaría a reabrir este ADR.

| Supuesto no verificado | Métrica que dispara la reapertura |
|---|---|
| `[COMPLETAR]` | `[COMPLETAR — métrica y valor concreto]` |

---

## 6. Mecanismo de gobernanza

> Una regla automatizada en CI, con la ruta exacta de la prueba de control. Una regla que depende de que alguien la revise a mano en code review no cuenta.

- **Regla:** `[COMPLETAR]`
- **Prueba de control:** `[COMPLETAR — ruta exacta del archivo de test]`
- **Dónde corre:** job `unit-tests` de `.github/workflows/ci.yml`

Precedente en este repo: `src/architecture/service-role-boundary.test.ts` (PR #25) ya aplica este formato a la frontera del cliente `service_role`.

---

## 7. Veredicto del Mini-comité Técnico 1

| Campo | Valor |
|---|---|
| **Fecha del comité** | `[COMPLETAR]` |
| **Veredicto** | `[Confirmed / Adjusted / Reconsidered]` |
| **Observaciones del comité** | `[COMPLETAR]` |
| **Cambios comprometidos** | `[COMPLETAR — si fue Adjusted, el commit de seguimiento]` |
