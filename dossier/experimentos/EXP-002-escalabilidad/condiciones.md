# Condiciones experimentales — EXP-002 (Escalabilidad)

**Estado: ejecutado.** Medición real corrida el 25/08/2026.

| Campo | Valor |
|---|---|
| Fecha y hora | 25/08/2026, ~14:28-14:32 (hora local) |
| Commit exacto evaluado | `c9d15bea63a2887d704240c94ebf8b3f5632eb29`, medido desde la rama `semana-4-escenario-6-escalabilidad` |
| Hardware (CPU, RAM) | Intel Core i5-13420H (13ª gen), 16 GB RAM |
| Alimentación | Corriente directa (AC) |
| Sistema operativo | Windows 11 Home |
| Red | Local (localhost) |
| Build medido | API REST de Supabase local (PostgREST) directamente — misma limitación que EXP-001 |
| Base de datos | PostgreSQL real vía Supabase local en Docker, reseteada antes de sembrar |
| Volumen de datos / semilla | 50 companies, **5.000 contacts**, **1.000 deals** — volumen exacto definido en el Escenario 6 |
| Usuarios virtuales (VUs) k6 | 5 |
| Duración por corrida | 30s |
| Número de corridas | 4 — corrida 1 descartada (calentamiento), corridas 2-4 válidas |

## Qué invalidaría esta medición

- Medir con la laptop en batería (no aplica — AC confirmado).
- No descartar la primera corrida (se descartó).
- Medir contra una base distinta a PostgreSQL real (no aplica).
- Medir contra la API REST y no la app renderizada — **aplica igual que en EXP-001**: esto mide el costo de la consulta con RLS, no el tiempo de render del listado en el navegador.
- No usar el volumen exacto del escenario (5.000/1.000) — no aplica, se usó exactamente ese volumen.
