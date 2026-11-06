# Prerregistro — Mezcla de lectura y escritura

> **Escrito antes de ejecutar. La predicción la completa el equipo antes de la primera corrida**, no después: ese es el punto de prerregistrar.

## Qué hueco cierra

El dossier declara, en `dossier/03-mediciones.md`, que **la asimetría entre lecturas y escrituras nunca se midió**. El script de S11 hace un solo tipo de llamada, `http.get`, y cero escrituras: su «80% lecturas calientes, 20% pipeline» reparte entre **dos perfiles de lectura**, no entre lectura y escritura.

Eso importa porque la asimetría lectura/escritura es el primer argumento a favor de CQRS, y `dossier/22-cqrs-y-consistencia-eventual.md` tuvo que registrar ese criterio como no medido.

## Por qué no se modifica S11

El protocolo de S11 está prerregistrado y sus resultados conservados. Cambiar su `load.js` invalidaría la reproducibilidad que lo hace valioso. Este es un experimento aparte, con su propio script.

## La escritura elegida, y por qué

**Mover una oportunidad entre las dos etapas calientes**, con `PATCH /rest/v1/deals?id=eq.<id>`.

Es la escritura más representativa de este CRM —el arrastre en el tablero— y tiene una propiedad que la hace compatible con las lecturas de S11:

| Lectura | Conteo esperado | ¿La afecta la escritura? |
|---|---|---|
| `pipeline_id=eq.<pipeline>` | 1.000 | No: la oportunidad no cambia de pipeline |
| `stage_id=in.(<calientes>)` | 200 | No: sale de una caliente y entra en otra |

Por eso las dos lecturas conservan su validación exacta de filas. Una escritura que insertara o moviera a una etapa fría rompería esa verificación y haría ilegible el resultado.

**Dos efectos de base de datos que conviene declarar:**

- `set_updated_at` se dispara en **toda** actualización, así que cada PATCH es una escritura real.
- `handle_deal_stage_change` solo inserta en `deal_stage_history` cuando la etapa **cambia de verdad**. Como el destino alterna por iteración, una parte de los PATCH caerá sobre la etapa en la que la oportunidad ya está: esas no disparan el trigger.

  **El script no puede contar eso**: el PATCH devuelve la fila nueva, no la anterior, así que desde el cliente no se distingue un movimiento de un no-movimiento. Se cuenta **después de la corrida**, comparando filas de `deal_stage_history` antes y después. Queda como paso del README, no como métrica de k6.

## Método

- **Escalones:** 5, 50 y 100 VUs, 30 s cada uno, 5 s de pausa. Se eligen esos tres porque S11 ya ubicó el quiebre en 50: interesa el comportamiento por debajo, en el quiebre y pasado el quiebre.
- **Mezcla:** `MIX_WRITE_RATIO`, por defecto **0,20**. Es un supuesto de perfil de uso, no un dato observado; se declara como parámetro para que cambiarlo no exija tocar el script.
- **Validación de lectura:** idéntica a S11 — estado 200, arreglo, conteo exacto y forma de cada fila.
- **Validación de escritura:** estado 2xx y cuerpo devuelto con la etapa pedida.
- **Corridas:** una de calentamiento descartada y tres válidas. Se reporta la **mediana de los tres p95** por escalón y por tipo de operación.
- **Entorno:** Supabase local en Docker, proyecto desechable, igual que S11.

## Qué se mide

| Métrica | Para qué |
|---|---|
| `mix_read_latency` por escalón | Comparable con S11 |
| `mix_write_latency` por escalón | **El dato que falta hoy** |
| `mix_write_ratio` observado | Confirma que la mezcla aplicada es la pedida |
| `mix_errors` por tipo | Separa el fallo de lectura del de escritura |

## Predicción — `[COMPLETAR — EQUIPO, ANTES DE CORRER]`

Escribir aquí, **antes de la primera corrida válida**, y commitear antes del código de resultados:

- ¿En qué escalón se rompe el presupuesto para las **escrituras**? `[COMPLETAR]`
- ¿El p95 de escritura será mayor, igual o menor que el de lectura, y por qué? `[COMPLETAR]`
- ¿Qué resultado **refutaría** la predicción? `[COMPLETAR]`

> Si el dato después la desmiente, **no se corrige la predicción**: se registra la refutación, como se hizo en S11 con los 150 VUs que resultaron ser 50.

## Límites que este experimento no levanta

- Sigue midiendo **la API REST, no la aplicación renderizada**.
- Sigue corriendo **en local, no en producción**: no predice capacidad del plan contratado.
- No mide el **costo de composición** de la modularización: las lecturas van a la tabla cruda, igual que en S11.
- Una escritura concurrente sobre la misma fila es contención real, pero el pool de oportunidades es acotado: la contención observada **no es la de un uso real** con 1.000 oportunidades repartidas.
