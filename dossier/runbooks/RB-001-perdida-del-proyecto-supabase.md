# RB-001 — Pérdida del proyecto de Supabase

> **Primer runbook del proyecto.** Elegido en el mini-comité 2 del 23/10/2026, acción 7, por dos razones: es el procedimiento más caro y es el único ya ejecutado —`EXP-003`, 18/09/2026—.
>
> **Estado: procedimiento escrito, RPO y RTO sin medir.**

## Lee esto antes que el procedimiento

El `EXP-003` **no demostró recuperación ante pérdida. Demostró clonación.**

El método empieza con `supabase db dump --linked`, que **necesita que el proyecto origen exista y responda**. En el incidente real de septiembre de 2026 el proyecto fue eliminado: en ese escenario exacto, el paso 1 de este runbook no tiene a qué conectarse.

Verificado el 03/11/2026:

| Pregunta | Respuesta |
|---|---|
| ¿Hay respaldos almacenados en el repositorio? | **No.** Los `.sql` del `EXP-003` se borraron a propósito: `data.sql` contiene hashes y metadatos de autenticación |
| ¿Hay un workflow programado que genere respaldos? | **No.** Ningún workflow tiene `schedule` |
| ¿Qué sobrevive con certeza a un borrado? | **El esquema**, versionado en `supabase/migrations/`, y la configuración de `supabase/config.toml` |
| ¿Qué no sobrevive? | **Los datos.** Usuarios, perfiles, roles y todo contenido del CRM |

**Conclusión operativa:** hoy el equipo puede reconstruir *el sistema*, no *la información*. Las dos rutas del procedimiento están separadas abajo por esa razón.

> **Pendiente que cambia este cuadro:** verificar si el plan contratado de Supabase conserva respaldos propios de la plataforma y con qué retención. Es el dato que decide si la ruta B existe de verdad. Está relacionado con la decisión del mini-comité de no consultar los límites del plan (respuesta 8), que ahora muestra su costo.

---

## Ruta A — el proyecto existe y responde

Es lo que el `EXP-003` ejecutó y verificó. Sirve para clonar a un entorno desechable, para migrar de proyecto, o como respaldo preventivo **antes** de una operación riesgosa.

### 1. Generar los respaldos lógicos

```bash
supabase db dump --linked -f roles.sql --role-only
supabase db dump --linked -f schema.sql
supabase db dump --linked -f data.sql --data-only --schema public,auth
```

### 2. Levantar el destino local

```bash
npx supabase start -x studio,edge-runtime,vector,logflare,imgproxy,mailpit,realtime,storage-api,postgres-meta,supavisor
```

### 3. Confirmar que las migraciones están aplicadas

```bash
npx supabase migration list
```

Deben figurar las migraciones de `supabase/migrations/`. Si faltan, aplicarlas antes de restaurar datos: el esquema va primero.

### 4. Restaurar los datos

Dentro de una transacción y con los disparadores desactivados, porque si no `handle_deal_stage_change` y `apply_deal_stage_defaults` reescribirían los datos que se están restaurando:

```sql
BEGIN;
SET session_replication_role = replica;
\i data.sql
SET session_replication_role = origin;
COMMIT;
```

### 5. Verificar por conteo

Comparar remoto contra local tabla por tabla, como hizo el `EXP-003` con sus 15 conjuntos. **La verificación es el conteo coincidente, no que el comando no haya fallado.**

### 6. Destruir la copia temporal

```bash
rm -f roles.sql schema.sql data.sql
```

**No es opcional.** `data.sql` contiene hashes y metadatos de autenticación. No se versiona, no se comparte, no se deja en el disco.

---

## Ruta B — el proyecto fue eliminado

**Esta ruta no está probada.** Se escribe para que el equipo sepa qué tiene y qué no en el peor caso real, no como procedimiento validado.

### Lo que se puede reconstruir hoy

1. Crear un proyecto nuevo de Supabase.
2. Aplicar el esquema versionado:
   ```bash
   npx supabase link --project-ref <nuevo-ref>
   npx supabase db push
   ```
3. Actualizar las variables de entorno en Vercel y en `.env` local.
4. Verificar que la aplicación levante y que el CI pase, incluido `rls-integration-test`.

Resultado: **el sistema funciona, vacío.** El esquema, las 40 políticas RLS, los triggers y las funciones vuelven completos, porque son código.

### Lo que no se recupera sin un respaldo externo

Usuarios y sesiones, perfiles, roles, y todos los datos del CRM.

### Qué hacer para que esta ruta exista

`[COMPLETAR — EQUIPO]` — decidir y ejecutar una de estas, o declarar que se acepta el riesgo:

- Respaldo automático a almacenamiento externo, con una política de retención.
- Respaldo manual periódico, con responsable y frecuencia definidos.
- Verificar y documentar los respaldos propios del plan de Supabase, si existen.

---

## RPO y RTO

`[COMPLETAR — EQUIPO]` — **ninguno de los dos está medido.** El `EXP-003` lo declara explícitamente en su veredicto.

| Métrica | Qué hay que medir | Valor |
|---|---|---|
| **RPO** — cuántos datos se pierden | La antigüedad del respaldo más reciente disponible en el momento del incidente | `[COMPLETAR]` |
| **RTO** — cuánto tarda volver | Cronómetro desde que se detecta hasta que la aplicación responde con datos | `[COMPLETAR]` |

**Cómo medir el RTO sin inventar nada:** ejecutar la Ruta A de punta a punta con el cronómetro corriendo y anotar el tiempo real de cada paso. El procedimiento ya se hizo una vez; lo único que falta es medirlo.

**Y declarar el límite de esa medición:** el `EXP-003` restauró 15 conjuntos de los cuales **solo cinco tenían filas** — 4 usuarios, 4 perfiles, 4 roles, 1 pipeline y 7 etapas; el resto estaba en cero. El RTO medido sobre ese volumen **no predice el RTO con datos reales**, y conviene decirlo al presentarlo.

---

## Detección

El incidente de septiembre **no lo detectó el sistema: avisó una persona.** Hoy sigue sin haber alerta de disponibilidad del proveedor.

Mientras no exista la observabilidad mínima del `ADR-008`, el disparador de este runbook es que alguien se dé cuenta. Está declarado así a propósito, y es el argumento más concreto a favor de implementar ese ADR.

## Referencias

- [`../experimentos/EXP-003-recuperacion/README.md`](../experimentos/EXP-003-recuperacion/README.md) — la ejecución del 18/09/2026, con los conteos y los hashes
- [`../adrs/ADR-008-observabilidad-minima-y-operacion-compartida.md`](../adrs/ADR-008-observabilidad-minima-y-operacion-compartida.md) — la decisión de agregar detección
- [`../21-seguridad-y-operacion.md`](../21-seguridad-y-operacion.md) — matriz de riesgos operativos
- [`../25-acta-mini-comite-2.md`](../25-acta-mini-comite-2.md) — acción 7, que originó este documento
