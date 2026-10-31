# 26 — Demostración de la fitness function: regla, umbral y fallo real

> **Estado: demostración ejecutada y conservada.** Responde al ítem **A6** de la autoevaluación del Módulo 6, que pide *"demostrar que CI pasa cuando se cumple la regla y falla cuando se introduce una violación deliberada, conservando logs y commits"*.

La diferencia entre un control declarado y uno verificado es que el segundo se probó rompiéndolo. Este documento conserva esa prueba.

## 1. La regla

Vive en [`src/architecture/persistence-rules.ts`](../src/architecture/persistence-rules.ts), no en el test: **cada tabla y cada RPC tienen un dueño declarado**.

| Módulo | Tablas que posee |
|---|---|
| `identity` | `profiles`, `user_roles` |
| `relationships` | `companies`, `contacts` |
| `sales` | `deals`, `pipelines`, `stages`, `deal_stage_history` |
| `followup` | `activities` |

Lo que la regla rechaza:

- Consultar una tabla de otro módulo — *persistencia ajena*.
- Hacer `JOIN` hacia una tabla de otro dominio — *JOIN ajeno*.
- Importar algo privado de otro módulo; solo se admiten `contracts`, `lookup` y `*/api`.
- Calcular el nombre de tabla o columna en tiempo de ejecución.
- Invocar un RPC sin dueño declarado.

**Alcance que conviene declarar:** el análisis es estático sobre TypeScript (`persistenceViolations` recorre el AST). No crea bases físicas por servicio ni roles SQL por módulo. **RLS sigue siendo la frontera de seguridad en ejecución**; esto es gobernanza de acoplamiento, no un sandbox.

## 2. El umbral

**Cero violaciones, sin tolerancia.** No hay porcentaje aceptable ni lista de excepciones.

El test recorre **todo `src/`**, no solo los módulos. Y como `persistenceViolations` deriva el módulo del patrón `src/modules/<nombre>/api.ts`, cualquier `.from()` fuera de esos cuatro archivos no tiene dueño que coincida y **se cuenta como violación**. El efecto es que la persistencia queda confinada a cuatro archivos de todo el repositorio.

## 3. La condición de fallo

El job **`unit-tests`** ejecuta `npm test`. Si hay una violación, falla y **nombra el archivo y la tabla**. Como `main` tiene branch protection con `unit-tests` y `rls-integration-test` como checks requeridos, **el merge queda bloqueado**.

## 4. La demostración, con su evidencia

### Caso A — la regla se cumple: CI pasa

Cualquier corrida sobre `main`. Ejemplo verificable: el PR #59, job `unit-tests` en verde junto a `rls-integration-test` con 8 casos de aislamiento RLS.

### Caso B — violación deliberada: CI falla

**Commit:** `8672026` en la rama `demo-violacion-deliberada-fitness`
**Pull request:** [#60](https://github.com/Felipe7774/NEXUS/pull/60), abierto el 24/10/2026 y **cerrado sin mergear**
**Corrida:** [Actions 40051537724](https://github.com/Felipe7774/NEXUS/actions/runs/40051537724), job `unit-tests`

Se agregó a `src/modules/followup/api.ts` una consulta a `companies`, cuyo dueño declarado es `relationships`:

```ts
export const violacionDeliberada = async () => {
  const { data } = await supabase.from("companies").select("id");
  return data;
};
```

Salida real del job:

```
 FAIL  src/architecture/persistence-fitness.test.ts > ADR-006: propiedad de persistencia
       > todas las consultas productivas respetan al propietario y sus JOINs

+   "src/modules/followup/api.ts: Persistencia ajena: companies",

 Test Files  1 failed | 5 passed | 2 skipped (8)
      Tests  1 failed | 36 passed | 9 skipped (46)
```

**Tres cosas que vale la pena señalar de esa salida:**

1. **Falló solo la prueba correcta.** 36 pasaron, 1 falló. No es un fallo genérico del build.
2. **El mensaje nombra el archivo y la tabla.** No dice "violación de arquitectura": dice `followup/api.ts: Persistencia ajena: companies`. Quien lo rompe sabe dónde y por qué.
3. **El PR quedó bloqueado por branch protection**, que es el comportamiento que el control promete.

### Reproducirlo en treinta segundos

```bash
git checkout -b prueba-violacion
printf '\nexport const x = async () => (await supabase.from("companies").select("id")).data;\n' >> src/modules/followup/api.ts
npx vitest run src/architecture/persistence-fitness.test.ts
git checkout -- src/modules/followup/api.ts
```

## 5. Las otras pruebas de arquitectura

La suite no es una sola regla. Son cuatro archivos en [`src/architecture/`](../src/architecture/):

| Archivo | Qué enforca | ¿Verificada rompiéndola? |
|---|---|---|
| `persistence-fitness.test.ts` | Propiedad de datos, JOIN ajenos, ciclos entre módulos | **Sí** — esta demostración, más un **ciclo deliberado** que el propio test crea y borra |
| `service-role-boundary.test.ts` | `service_role` solo en `*.server.ts`, y el cliente privilegiado donde el C4 dice | **Sí** — verificada rompiéndola en el PR #25 |
| `resilience-fitness.test.ts` | Rechaza evidencia incompleta: faltan muestras, o una caída disfrazada de éxito | Sí, por casos negativos propios |
| `module-apis.integration.test.ts` | Que la partición no rompiera CRUD ni el aislamiento entre usuarios | Prueba de integración |

El caso del **ciclo deliberado** merece mención aparte: `persistence-fitness.test.ts` crea dos archivos que se importan mutuamente, comprueba que ArchUnitTS los detecta, y los borra. Es decir, **el detector se verifica a sí mismo en cada corrida**, no solo una vez.

## 6. Qué no demuestra esto

- **No demuestra que el código sea seguro.** Demuestra que una clase concreta de acoplamiento no entra a `main`.
- **No reemplaza a RLS.** Un atacante no pasa por el compilador de TypeScript.
- **No cubre SQL ni migraciones.** Una migración que rompa la propiedad de tablas no la detecta esta regla.

## Referencias

- [`src/architecture/persistence-rules.ts`](../src/architecture/persistence-rules.ts) — la regla
- [`src/architecture/persistence-fitness.test.ts`](../src/architecture/persistence-fitness.test.ts) — el test
- [`adrs/ADR-007-particion-por-dominio.md`](adrs/ADR-007-particion-por-dominio.md) — la decisión que la regla protege
- [`../docs/resilience_matrix.md`](../docs/resilience_matrix.md) — fila *"Consulta a tablas de otro módulo"*
