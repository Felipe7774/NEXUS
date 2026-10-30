# ADR-007 — Adopción de partición por dominio con propiedad exclusiva de tablas

## Estado

`Confirmado.` El equipo aprobó esta decisión el 29/10/2026. La partición por dominio existe y está activa en el código desde el PR #35.

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

Adoptamos una partición por dominio dentro del monolito. Cada tabla, RPC y consulta productiva tiene un único módulo propietario en `src/modules/`.

Los módulos pueden usar contratos compartidos y APIs públicas de otros módulos, pero no importan implementaciones privadas ni ejecutan consultas sobre tablas ajenas.

Las vistas que necesitan datos de varios dominios usan `src/lib/crm-composition.ts`, que llama las APIs públicas de cada módulo. Así evitamos JOINs directos entre dominios y ciclos de dependencias.

Mantendremos estas reglas mediante las fitness functions del CI.

## Alternativas consideradas

| Alternativa | Veredicto | Razón y punto de sensibilidad |
|---|---|---|
| Mantener el acceso centralizado en `crm.ts` | Descartada | Era más simple al inicio, pero concentraba seis entidades en 419 líneas y no definía propiedad de datos. Se volvería a evaluar solo si el costo de composición supera el beneficio de las fronteras. |
| Particionar sin propiedad exclusiva de tablas | Descartada | Ordena carpetas, pero permite que varios módulos consulten la misma tabla; el acoplamiento por datos permanece sin una regla verificable. |
| Separar módulos en paquetes o servicios desplegables | Postergada | Daría independencia de despliegue, pero aumenta el costo operativo, contradice ADR-004 y no se justifica con el tamaño del equipo ni la evidencia actual. |
| Partición por dominio con propiedad exclusiva de tablas | Adoptada | Reduce acoplamiento, conserva una sola unidad de despliegue y permite verificar las fronteras automáticamente en CI. |

## Consecuencias y trade-offs

| Atributo (ISO/IEC 25010) | Efecto | Evidencia o estimación |
|---|---|---|
| Mantenibilidad | Favorecido | `crm.ts` pasó de 419 a 216 líneas; existen cuatro módulos y fronteras verificadas en CI. |
| Seguridad | Favorecido | La propiedad exclusiva reduce consultas accidentales fuera del dominio; RLS sigue siendo la barrera de seguridad en tiempo de ejecución. |
| Rendimiento | Degradado potencial | La composición consulta APIs públicas de varios módulos. Evita JOINs entre dominios, pero puede generar más consultas que un JOIN directo. Ese costo todavía no se midió. |
| Operación | Conservado | La aplicación mantiene una única unidad de despliegue, coherente con ADR-004. |

### Costo de reversibilidad (medido, no estimado a ojo)

Deshacer la partición exige tocar **10 archivos** que hoy importan `@/modules/`:

| Archivo | Rol |
|---|---|
| `src/lib/crm.ts` · `src/lib/crm-composition.ts` | Composición |
| `src/hooks/use-auth.ts` | Autenticación |
| `src/modules/{sales,relationships,identity,followup}/api.ts` | Los módulos mismos |
| `src/architecture/module-apis.integration.test.ts` · `persistence-fitness.test.ts` · `persistence-rules.ts` | Reglas de gobernanza |

Son 294 líneas de módulos más sus consumidores. La reversión es posible, pero tiene un costo medio: exige adaptar los consumidores y las pruebas de gobernanza. No se declara una estimación de horas porque el repositorio no registra el esfuerzo real.

### Costo de implementación (trazable en el historial)

El trabajo se concentró entre el **16 y el 17/10/2026**, en commits identificables:

- `e5e6a80` — *refactor(m6): aislar persistencia por modulo y proteger fronteras en CI*
- `9255129` — *fix(crm): permitir borrado logico autorizado sin exponer filas eliminadas*
- *test(m6): verificar ciclo deliberado y corregir tipos del fixture*

El historial registra dos días calendario de trabajo y el tamaño del cambio, pero no horas efectivas. Por rigor, este ADR conserva esas medidas verificables y no convierte días calendario en horas de ingeniería.

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

| Supuesto no verificado | Métrica que dispara la reapertura |
|---|---|
| Las APIs públicas y la capa de composición resuelven las necesidades entre dominios sin volver costosas las consultas. | Una prueba reproducible de una vista que compone varios dominios supera un p95 de 300 ms bajo una carga y semilla documentadas, o una funcionalidad requiere romper la propiedad exclusiva de una tabla. |

## Relación con otros ADR

- **`ADR-001` (estilo en capas):** no se contradice. Las capas siguen vigentes y ahora están verificadas; este ADR documenta un eje distinto que se superpone al de capas.
- **`ADR-004` (arquitectura monolítica):** no se contradice. La partición es lógica, dentro de una única unidad de despliegue.
