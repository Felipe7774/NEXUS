# 04 — Evidencia ejecutable

> Límite: 1000 palabras. Evidencia cruda (scripts, JSON de corridas, logs) vive en `experimentos/EXP-001-linea-base/`, no acá.

**Estado: PENDIENTE.** Todavía no se ejecutó la medición real (paso "V — Verificación" del ciclo EDAV). Este documento es la plantilla a completar una vez corrida `EXP-001-linea-base` — no se debe llenar con datos inventados o estimados.

## 1. Sistema y commit medido

`PENDIENTE` — completar con el hash del commit exacto de `main` al momento de correr el experimento.

## 2. Escenario medido

Escenario 3 (Rendimiento) de `02-escenarios-de-calidad.md` — pendiente de confirmación por el equipo (ver punto 6 de ese documento).

## 3. Hipótesis previa que se contrasta

p95 de latencia < 2000 ms en el tablero de pipeline (ver `01-contexto-y-drivers.md`, punto 8) — **umbral propuesto por IA, no auditado formalmente todavía**.

## 4. Semilla utilizada

`PENDIENTE` — el equipo no definió volumen ni distribución 80/20 (ver `02-escenarios-de-calidad.md`, punto 8).

## 5. Instrumento utilizado

k6 + `pg_stat_statements`. Ver justificación de por qué Spring Boot Actuator no aplica en `02-escenarios-de-calidad.md`, punto 9.

## 6. Condiciones

`PENDIENTE` — completar en `experimentos/EXP-001-linea-base/condiciones.md`: hardware, alimentación (corriente, no batería), build medido, hora.

## 7. Validación del instrumento

`PENDIENTE` — confirmar que k6 corre contra PostgreSQL real en Docker (no una base en memoria) y que el sistema responde HTTP 200 antes de medir en serio.

## 8. Número de corridas

`PENDIENTE` — protocolo exigido: mínimo 3 corridas, la primera descartada (warm-up de V8/Node, equivalente al calentamiento de JVM que pide la cátedra para su stack de referencia).

## 9. Resultado reportado

`PENDIENTE` — mediana del p95 y throughput de las corridas 2 y 3 (descartando la 1).

## 10. Comparación con el criterio previo

`PENDIENTE` — contrastar el resultado real contra el umbral de <2000 ms propuesto.

## 11. Qué puede afirmarse

`PENDIENTE` — solo completar después de tener el dato real.

## 12. Qué todavía no puede afirmarse

- Nada sobre rendimiento bajo carga concurrente real (no hay usuarios de producción).
- Nada sobre los escenarios 1, 2, 4, 5 y 6 — no tienen medición ejecutada, solo hipótesis.

## 13. Limitaciones

- Medición contra un dataset pequeño (sin la semilla 80/20 definida todavía).
- Ambiente de desarrollo local, no producción.
- Plan free de Supabase — resultados no necesariamente representativos de un plan pago.

## 14. Evidencia reproducible

`experimentos/EXP-001-linea-base/` — ver ese directorio para script, condiciones y resultados crudos.
