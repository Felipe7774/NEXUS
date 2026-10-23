# Condiciones experimentales — EXP-001

**Estado: ejecutado.** Medición real corrida el 25/08/2026.

| Campo | Valor |
|---|---|
| Fecha y hora | 25/08/2026, ~11:55-12:00 (hora local) |
| Commit exacto evaluado | `beca9da54be41c38099703182216f298e0108a08` (main), medido desde la rama `semana-4-medicion-real` |
| Hardware (CPU, RAM) | Intel Core i5-13420H (13ª gen), 16 GB RAM |
| Alimentación | Corriente directa (AC) — confirmado, no batería |
| Sistema operativo | Windows 11 Home |
| Red | Local (localhost), sin red externa de por medio |
| Build medido | API REST de Supabase local directamente (PostgREST), no la app renderizada — ver "Qué invalidaría esta medición" |
| Base de datos | PostgreSQL real vía Supabase local en Docker (`npx supabase start`), reseteada antes de sembrar (`npx supabase db reset`) |
| Volumen de datos / semilla | 20 companies, 800 contacts, 1.000 deals (200 calientes en Negociación/Propuesta enviada, 800 en el resto) — ver `scripts/seed.mjs` |
| Usuarios virtuales (VUs) k6 | 5 |
| Duración por corrida | 30s |
| Número de corridas | 4 — corrida 1 descartada (calentamiento), corridas 2-4 válidas |
| Otros procesos corriendo en la máquina | No controlado explícitamente (no se cerraron navegadores/editores) — ver limitaciones |

## Qué invalidaría esta medición

- **Medir contra la API REST directamente, no contra la app renderizada.** Esta medición mide el costo de la consulta a Supabase (con RLS aplicado), no el tiempo de carga completo del tablero Kanban en el navegador (que suma parseo, render de React, etc.). Es un piso, no el número final que vería un usuario.
- Medir con la laptop en batería (no aplica acá — se confirmó AC).
- No descartar la primera corrida (se descartó).
- Medir contra una base de datos distinta a PostgreSQL real (no aplica acá — Postgres real en Docker).
- Semilla insuficiente o sin sesgo 80/20 definido (no aplica acá — semilla y sesgo aplicados según lo decidido por el equipo).
- No se controlaron otros procesos corriendo en la máquina durante la medición (limitación real, no crítica dado el margen tan grande entre el resultado y el umbral).

---

## Re-ejecución del 23/10/2026

**Motivo.** La medición original era del 25/08/2026 y nunca se había vuelto a correr. El ítem de la semana 6 pide dejarla *lista para reproducir en vivo*, así que se reprodujo el protocolo completo para confirmar que sigue siendo ejecutable.

**Esta corrida no es una reproducción idéntica.** La CLI de Supabase se actualizó entre ambas fechas y exige imágenes más nuevas. Se declara como variación, no se presenta como réplica exacta.

| Campo | 25/08/2026 | 23/10/2026 |
|---|---|---|
| Commit evaluado | `beca9da5` | `2d98a671` |
| PostgreSQL | no registrado | **17.6.1.166** |
| PostgREST | no registrado | **v14.5** |
| GoTrue | no registrado | **v2.196.0** |
| Kong | no registrado | **2.8.1** |
| Hardware | i5-13420H, 16 GB | i5-13420H, 16 GB (misma máquina) |
| Alimentación | AC confirmado | AC confirmado |
| Semilla | 20 / 800 / 1.000 (200 calientes) | idéntica |
| VUs y duración | 5 VUs, 30 s | idénticos |
| Corridas | 4, se descarta la 1ª | idéntico |

> **Corrección de método aplicada.** El `condiciones.md` original no registraba las versiones del stack, de modo que hoy no puede afirmarse con qué PostgREST se midió en agosto. A partir de esta corrida quedan registradas.

### Resultado

| Corrida | p95 | Throughput | Errores |
|---|---|---|---|
| 1 (descartada) | calentamiento | — | — |
| 2 | 57,33 ms | 4,78/s | 0% |
| 3 | 64,45 ms | 4,81/s | 0% |
| 4 | 67,49 ms | 4,70/s | 0% |
| **Mediana (2-4)** | **64,45 ms** | **4,78/s** | **0%** |

Umbral del Escenario 3: p95 < 2.000 ms. **Se cumple con un margen de 31×.**

### Lectura honesta del resultado

El p95 bajó de 92,62 ms a 64,45 ms, una mejora del 30 %. **No se afirma que el sistema haya mejorado:** cambiaron las versiones del stack, el commit y las condiciones de la máquina, y no se aisló ninguna de esas variables. Lo que la corrida sí demuestra es que **el experimento sigue siendo reproducible y que el resultado aguanta un cambio de versiones**, que es una propiedad más fuerte que repetir el número exacto.

Los JSON crudos quedan en `resultados/corrida-20261023-{2,3,4}.json`, junto a los de agosto, que **no fueron sobrescritos**.
