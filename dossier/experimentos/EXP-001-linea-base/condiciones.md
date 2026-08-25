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
