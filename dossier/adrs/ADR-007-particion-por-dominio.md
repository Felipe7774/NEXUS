# ADR-007 — `[COMPLETAR — EQUIPO: la decisión concreta, no el tema]`

> El título debe nombrar una decisión, no un área.
> ❌ "ADR-007: Módulos" — es un tema.
> ✅ "ADR-007: Adopción de partición por dominio con propiedad exclusiva de tablas" — es una decisión.

## Estado

`Propuesto.` Este documento registra una partición por dominio que **ya existe y está activa en el código** desde el PR #35. Queda como propuesto hasta que el equipo redacte y apruebe su decisión, alternativas y trade-offs.

## Contexto

### Por qué hace falta este ADR

`ADR-001` documenta el estilo en capas y sigue vigente: ningún módulo importa hacia presentación ni composición, y esa regla hoy se verifica en CI. Pero el sistema adquirió un **segundo eje de organización** que ningún ADR describe: la partición por dominio con propiedad exclusiva de tablas.

Sin este registro, un lector que compare `ADR-001` contra el código encuentra una estructura que el ADR no menciona.

### Lo que existe hoy (verificado el 23/10/2026)

Cuatro módulos de dominio en `src/modules/`, **294 líneas en 6 archivos**, cada uno dueño exclusivo de sus tablas:

| Módulo | Tablas que posee | API |
|---|---|---|
| `sales` | `deals`, `pipelines`, `stages` | `src/modules/sales/api.ts` |
| `relationships` | `companies`, `contacts` | `src/modules/relationships/api.ts` |
| `identity` | `profiles`, `user_roles` | `src/modules/identity/api.ts` |
| `followup` | `activities` | `src/modules/followup/api.ts` |

**No hay solapamiento**: ninguna tabla aparece en dos módulos.

### Cómo se resuelven las consultas entre dominios

`src/lib/crm-composition.ts` (36 líneas) compone datos de varios dominios —por ejemplo, oportunidades con su empresa y su contacto— **sin que los módulos se importen entre sí**. Esa es la razón de que no existan ciclos.

### Estructura resultante

```
Presentación     src/routes/ · src/components/
      ↓
Composición      src/lib/crm.ts (18 hooks) · src/lib/crm-composition.ts
      ↓
Dominio          src/modules/{sales,relationships,identity,followup} + contracts.ts
      ↓
Integración      src/integrations/supabase/
      ↓
Persistencia     supabase/migrations/
```

Como efecto de la partición, `src/lib/crm.ts` pasó de **419 a 216 líneas** y dejó de ser el único punto de acceso a datos.

## Decisión del equipo

`[COMPLETAR — EQUIPO]` En voz activa: *"Nosotros implementaremos…"*. Debe responder, como mínimo:

- Qué regla define la propiedad de una tabla por un módulo.
- Qué dependencias entre módulos están permitidas y cuáles prohibidas.
- Cómo accede un módulo a datos de otro dominio, y por qué esa vía y no un JOIN directo.

## Alternativas consideradas

`[COMPLETAR — EQUIPO]` Mínimo dos opciones viables, con su punto de sensibilidad y pros/contras atados a los drivers medidos.

> Nota de método: a diferencia de los ADR-001 a 004, acá **sí corresponde registrar alternativas**, porque esta decisión se tomó en octubre de 2026 y el equipo sí tuvo opciones frente a sí. No aplica la cláusula de "no inventar una alternativa retroactiva".

Candidatas que el equipo puede evaluar o descartar — **ninguna está elegida**:

| Alternativa | Qué implicaría |
|---|---|
| Mantener el acceso a datos centralizado en `crm.ts` | Es el estado anterior al PR #35; 419 líneas y 6 entidades en un archivo |
| Partición por dominio sin propiedad exclusiva de tablas | Módulos que comparten tablas; evita mover consultas, pero no elimina el acoplamiento por datos |
| Separar los módulos en paquetes o servicios desplegables | Cambia la unidad de despliegue y contradice `ADR-004` |

## Consecuencias y trade-offs

`[COMPLETAR — EQUIPO]` Esta sección necesita al menos una fila "Degradado": un ADR sin consecuencias negativas no es defendible.

| Atributo (ISO/IEC 25010) | Efecto | Evidencia o estimación |
|---|---|---|
| `[COMPLETAR]` | Favorecido | `[COMPLETAR]` |
| `[COMPLETAR]` | Degradado | `[COMPLETAR]` |

### Costo de reversibilidad (medido, no estimado a ojo)

Deshacer la partición exige tocar **10 archivos** que hoy importan `@/modules/`:

| Archivo | Rol |
|---|---|
| `src/lib/crm.ts` · `src/lib/crm-composition.ts` | Composición |
| `src/hooks/use-auth.ts` | Autenticación |
| `src/modules/{sales,relationships,identity,followup}/api.ts` | Los módulos mismos |
| `src/architecture/module-apis.integration.test.ts` · `persistence-fitness.test.ts` · `persistence-rules.ts` | Reglas de gobernanza |

Son 294 líneas de módulos más sus consumidores. `[COMPLETAR — EQUIPO]` la traducción a horas de ingeniería del equipo.

### Costo de implementación (trazable en el historial)

El trabajo se concentró entre el **16 y el 17/10/2026**, en commits identificables:

- `e5e6a80` — *refactor(m6): aislar persistencia por modulo y proteger fronteras en CI*
- `9255129` — *fix(crm): permitir borrado logico autorizado sin exponer filas eliminadas*
- *test(m6): verificar ciclo deliberado y corregir tipos del fixture*

`[COMPLETAR — EQUIPO]` las horas reales invertidas; el historial da las fechas, no el esfuerzo.

## Evidencia y trazabilidad

- **PR #35** — introduce los módulos y las reglas de frontera.
- **PR #40** — los representa en el modelo C4 como componentes 10 a 13.
- `dossier/modeloc4-nivel.md`, vista de componentes de la aplicación web.

## Mecanismo de gobernanza

Esta es la sección más fuerte del ADR, porque **las reglas no son una intención escrita: fallan el CI cuando se violan.**

`src/architecture/persistence-fitness.test.ts` verifica en cada PR que:

1. Todas las consultas productivas respeten al propietario de la tabla y sus JOINs.
2. No existan ciclos entre módulos (vía ArchUnitTS).
3. Los módulos no dependan de composición ni de presentación — o sea, que el eje de capas del `ADR-001` se siga respetando.

Además, la prueba **introduce un ciclo deliberado** para confirmar que la regla falla cuando debe. Una fitness function que nunca falla no prueba nada.

Corre en el job `unit-tests` de `.github/workflows/ci.yml`.

## Supuestos y seguimiento

`[COMPLETAR — EQUIPO]` Un supuesto no verificado y la métrica exacta que obligaría a reabrir este ADR.

| Supuesto no verificado | Métrica que dispara la reapertura |
|---|---|
| `[COMPLETAR]` | `[COMPLETAR]` |

## Relación con otros ADR

- **`ADR-001` (estilo en capas):** no se contradice. Las capas siguen vigentes y ahora están verificadas; este ADR documenta un eje distinto que se superpone al de capas.
- **`ADR-004` (arquitectura monolítica):** no se contradice. La partición es lógica, dentro de una única unidad de despliegue.
