# Condiciones experimentales — EXP-001

**Estado: no ejecutado todavía.** Completar esto en el momento exacto de correr el experimento, no antes ni de memoria después.

| Campo | Valor |
|---|---|
| Fecha y hora | `PENDIENTE` |
| Commit exacto evaluado | `PENDIENTE` |
| Hardware (CPU, RAM) | `PENDIENTE` |
| Alimentación | `PENDIENTE` — debe ser corriente directa, no batería (factor de invalidez si no se cumple) |
| Red | `PENDIENTE` |
| Build medido | `PENDIENTE` — debe ser `npm run preview`, no `npm run dev` |
| Base de datos | PostgreSQL real vía Supabase local en Docker (`npx supabase start`) — no una base en memoria |
| Volumen de datos / semilla | `PENDIENTE` — no definida (ver `dossier/02-escenarios-de-calidad.md`, punto 8) |
| Usuarios virtuales (VUs) k6 | 5 (provisorio, en `scripts/load-test.js`) |
| Duración por corrida | 30s |
| Número de corridas | `PENDIENTE` — protocolo exige mínimo 3, descartando la primera |
| Otros procesos corriendo en la máquina | `PENDIENTE` — cerrar navegadores, editores pesados y compiladores antes de medir |

## Qué invalidaría esta medición

- Medir con la laptop en batería (el CPU reduce frecuencia de reloj).
- Medir contra `npm run dev` en vez del build de producción.
- No descartar la primera corrida (V8/Node no está "caliente" todavía).
- Medir con una base de datos distinta a PostgreSQL real (por ejemplo, una base en memoria).
- No tener la semilla 80/20 definida antes de correr — sin eso, el resultado no es comparable contra el umbral propuesto.
