# Mezcla de lectura y escritura

> **Estado: escrito y prerregistrado, no ejecutado.** El script existe y su protocolo está en [`PLAN.md`](PLAN.md). **Nadie lo corrió todavía**, así que este documento no reporta ningún resultado.

## Qué cierra

El hueco que `dossier/03-mediciones.md` declara como *«asimetría entre lecturas y escrituras: nunca se midió»*. El script de S11 hace un solo tipo de llamada y **cero escrituras**.

Es también el criterio que `dossier/22-cqrs-y-consistencia-eventual.md` tuvo que dejar sin calificar: la asimetría lectura/escritura es el primer argumento a favor de CQRS, y hoy no hay dato.

## Qué mide

| Métrica | Qué responde |
|---|---|
| `mix_read_latency` por escalón | Comparable con S11 |
| `mix_write_latency` por escalón | **El dato que falta** |
| `mix_read_errors` · `mix_write_errors` | Separa el fallo de lectura del de escritura |
| `mix_reads` · `mix_writes` | Confirma que la mezcla aplicada es la pedida |

Tres escalones —5, 50 y 100 VUs— porque S11 ya ubicó el quiebre en 50: interesa debajo, en el quiebre y pasado el quiebre.

## La escritura, y por qué esa

`PATCH /rest/v1/deals?id=eq.<id>` moviendo una oportunidad **entre las dos etapas calientes**.

Es el arrastre del tablero, la escritura más representativa de este CRM, y tiene una propiedad que la hace compatible con las lecturas: la oportunidad sale de una etapa caliente y entra en otra, así que **los conteos de 1.000 y 200 no cambian** y la validación exacta de filas de S11 sigue siendo válida.

Una escritura que insertara, o que moviera a una etapa fría, rompería esa verificación y haría ilegible la medición de lectura.

## Cómo correrlo

Requiere Docker, igual que S11. El runner prepara un Supabase local desechable, siembra y ejecuta calentamiento más tres corridas.

```bash
npm ci
npm run docker:mix
```

Parámetros, todos opcionales:

```bash
MIX_WRITE_RATIO=0.35 MIX_SECONDS=60 npm run docker:mix
```

En PowerShell se configuran antes con `$env:MIX_WRITE_RATIO='0.35'`.

**Antes de la primera corrida válida:** completar la predicción en [`PLAN.md`](PLAN.md) y commitearla. Si se escribe después de ver los datos, el prerregistro no vale nada — y el valor de S11 vino precisamente de haber apostado antes y haberse equivocado.

## Verificación posterior del trigger

El PATCH devuelve la fila nueva, no la anterior, así que desde el cliente **no se distingue** un movimiento real de un PATCH a la etapa en la que la oportunidad ya estaba. Las dos son escrituras, pero solo la primera dispara `handle_deal_stage_change`.

Se cuenta después de la corrida, contra el Supabase local que el runner dejó en pie:

```sql
SELECT count(*) FROM public.deal_stage_history;
```

Antes y después, sobre el mismo proyecto. La diferencia son los movimientos reales.

## Límites que no levanta

- Mide **la API REST**, no la aplicación renderizada.
- Corre **en local**, no en producción: no predice capacidad del plan contratado.
- **No mide el costo de composición** de la modularización: las lecturas van a la tabla cruda, igual que S11.
- El pool de oportunidades que se escriben es acotado, así que **la contención observada no es la de un uso real** con 1.000 repartidas.
- La proporción de escrituras por defecto, 0,20, es un **supuesto de perfil de uso**, no un dato observado. Está como parámetro para que discutirlo no exija tocar el script.
