# ADR-0002: `[COMPLETAR — la decisión concreta sobre la frontera dominio/persistencia]`

> Este ADR define la frontera entre los módulos lógicos de dominio y la infraestructura de PostgreSQL. Depende del estilo que fije [ADR-0001](0001-decision-estilo.md): conviene cerrarlo después.

| Campo | Valor |
|---|---|
| **Estado** | Borrador |
| **Fecha** | `[COMPLETAR]` |
| **Autores** | `[COMPLETAR]` |
| **Veredicto del Mini-comité 1** | Pendiente (ver sección 7) |
| **Depende de** | [ADR-0001](0001-decision-estilo.md) |

---

## 1. Contexto y drivers

### Datos ya disponibles (precargados, verificables)

**Cómo se accede hoy a la persistencia:**

| Hecho | Valor verificado |
|---|---|
| Archivos de `src/` que llaman a `supabase.from(...)` | 1 — `src/lib/crm.ts` |
| Tamaño de ese archivo | 419 líneas |
| Entidades que atiende | 6 (profiles, companies, contacts, pipelines/stages, deals, activities) |
| Exportaciones | 17 funciones (hooks de React Query) y 15 tipos/constantes |
| Clases en `src/` fuera de `components/ui` | 0 |
| Tipos de la base | Generados desde Supabase en `src/integrations/supabase/types.ts` |

**Rutas de acceso a los datos que existen hoy:**

| Ruta | Archivo | Sujeta a RLS | Quién la usa y para qué |
|---|---|---|---|
| Cliente normal | `src/integrations/supabase/client.ts` | Sí | **Datos** (`.from()`): solo `src/lib/crm.ts`. **Autenticación** (`.auth.*`): `routes/auth.tsx`, `routes/__root.tsx`, `routes/_authenticated/route.tsx`, `hooks/use-auth.ts`, `components/app-header.tsx` |
| Cliente privilegiado (`service_role`) | `src/integrations/supabase/client.server.ts` | **No — bypassa RLS** | Ninguno hoy |

> Distinción relevante para la decisión: la frontera de **persistencia** hoy está concentrada en un solo archivo, pero el **cliente** de Supabase lo importan seis. Un aislamiento que solo mire `crm.ts` deja afuera las cinco importaciones de autenticación.

**Protección de los datos:** 40 políticas RLS sobre 14 tablas (`supabase/migrations/`). El aislamiento entre usuarios se verifica en CI con `rls-isolation.integration.test.ts`.

**Driver más relevante para esta decisión:** Seguridad (#1). El riesgo R1 (fuga de `service_role`) ya tiene un control automatizado; el R4 (RLS sin auditar política por política) sigue abierto.

### Fuerzas en tensión

`[COMPLETAR — EQUIPO]` ¿Qué se gana y qué se pierde al separar el dominio de la persistencia en este sistema concreto?

---

## 2. Alternativas consideradas

> Mínimo dos opciones viables, con pros/contras atados a los datos de arriba.

### Alternativa A — `[COMPLETAR]`

- **Descripción técnica:** `[COMPLETAR]`
- **Punto de sensibilidad (ATAM):** `[COMPLETAR]`
- **A favor:** `[COMPLETAR]`
- **En contra:** `[COMPLETAR]`

### Alternativa B — `[COMPLETAR]`

- **Descripción técnica:** `[COMPLETAR]`
- **Punto de sensibilidad (ATAM):** `[COMPLETAR]`
- **A favor:** `[COMPLETAR]`
- **En contra:** `[COMPLETAR]`

---

## 3. Decisión

> En voz activa: *"Nosotros implementaremos…"*. Tiene que responder, como mínimo:
> - Qué módulos de dominio existen y qué entidades le corresponden a cada uno
> - Qué **dependencias están permitidas** entre módulos, y cuáles prohibidas
> - Cómo un módulo accede a datos de otro: la diapositiva del Monolito Modular prohíbe los `JOIN` entre tablas de módulos distintos y exige interfaces públicas

`[COMPLETAR — EQUIPO]`

**Mapa de dependencias permitidas:**

| Módulo | Puede depender de | No puede depender de |
|---|---|---|
| `[COMPLETAR]` | `[COMPLETAR]` | `[COMPLETAR]` |

---

## 4. Consecuencias y trade-offs (ATAM)

| Atributo (ISO/IEC 25010) | Efecto | Evidencia o estimación |
|---|---|---|
| `[COMPLETAR]` | Favorecido | `[COMPLETAR]` |
| `[COMPLETAR]` | Degradado | `[COMPLETAR]` |

**Riesgos que introduce:** `[COMPLETAR]`

**Costo de reversibilidad:** `[COMPLETAR]` horas de ingeniería. Base de cálculo: `[COMPLETAR]`.

> Ojo con la base de cálculo: el costo tiene que estimarse sobre **este** código (funciones y tipos de TypeScript), no sobre cifras de ejemplos en Java. Ver hallazgo de la fila 2 de la Matriz de Control EDAV.

---

## 5. Supuestos y condición de revisión

| Supuesto no verificado | Métrica que dispara la reapertura |
|---|---|
| `[COMPLETAR]` | `[COMPLETAR — métrica y valor concreto]` |

---

## 6. Mecanismo de gobernanza

> La regla de dependencias de la sección 3, convertida en una prueba que falle en CI.

- **Regla:** `[COMPLETAR — traducción ejecutable del mapa de dependencias]`
- **Prueba de control:** `[COMPLETAR — ruta exacta]`
- **Dónde corre:** job `unit-tests` de `.github/workflows/ci.yml`

**Control que ya existe y que este ADR puede extender:** `src/architecture/service-role-boundary.test.ts` hoy impide que código que no sea `*.server.ts` importe el cliente privilegiado. Es una regla de frontera de persistencia, así que el mapa de dependencias de este ADR puede sumarse en la misma carpeta con el mismo formato.

---

## 7. Veredicto del Mini-comité Técnico 1

| Campo | Valor |
|---|---|
| **Fecha del comité** | `[COMPLETAR]` |
| **Veredicto** | `[Confirmed / Adjusted / Reconsidered]` |
| **Observaciones del comité** | `[COMPLETAR]` |
| **Cambios comprometidos** | `[COMPLETAR — si fue Adjusted, el commit de seguimiento]` |
