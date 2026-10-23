# Resultado del Spike 1 — 16/10/2026

**Veredicto experimental: pasó.** No equivale a adopción productiva ni a veredicto del comité.

Validación adicional en el equipo Windows con Docker Desktop:
[corrida local del 16/10/2026](docker-local-2026-10-16/README.md).
Ejecutó 18 pruebas NEXUS sin omisiones, cuatro controles del spike, 48 mediciones,
cinco verificaciones de integración, build y conectividad de la app en Docker.
La referencia de CI y sus cifras de abajo se conservan por separado.

## Procedencia

- Plan previo: `e348616` (anterior al código y a las corridas).
- Código de rama medido: `47dcb1f6ad99f0dcaa84cdb0175ed63ce29eb5b9`.
- Commit de integración probado por CI: `14307fc14507ff56ad8a4bff1b2463af7dc6d55a`.
- [Ejecución de GitHub Actions](https://github.com/Felipe7774/NEXUS/actions/runs/38987811793).
- [Datos crudos completos](ci-38987811793/results.json).
- Ejecución: 16/10/2026, 19:46:54–19:46:59, Colombia (ISO UTC conservado en JSON).
- Runner Linux x64, Node 22.23.3, 4 CPU, 16.766.414.848 bytes de RAM reportados.
- Supabase local con migraciones del CRM, Auth, RLS y PostgreSQL reales; sin acceso cloud.
- Semilla propia: dos vendedores, dos pipelines, tres etapas y una oportunidad.
- Demora artificial del receptor: 40 ms. Espera del consumidor después del acuse: 20 ms.
- Concurrencia 1; dos calentamientos por modalidad; tres corridas de ocho operaciones
  por modalidad. 48 muestras medidas en total, más cuatro calentamientos excluidos.

## Métricas observadas

Cada columna de latencia es la **mediana de los tres p95 por corrida**. Se usa
nearest-rank; con ocho muestras el p95 es el máximo de cada corrida. Las cifras no
son percentiles de toda la población del CRM ni tienen intervalo de confianza.

| Métrica                                    |    Síncrono |   Asíncrono |
| ------------------------------------------ | ----------: | ----------: |
| Muestras medidas                           |          24 |          24 |
| Aceptación, mediana de p95                 |    51,00 ms |     4,49 ms |
| Finalización de actividad, mediana de p95  |    51,00 ms |    71,84 ms |
| Ventana posterior al acuse, mediana de p95 |     0,00 ms |    66,90 ms |
| Throughput terminado, mediana por corrida  | 18,08 ops/s | 13,04 ops/s |

El throughput incluye consultas de comprobación y espera artificial; el harness es
secuencial. **No mide capacidad máxima**, ni prueba que una alternativa escale mejor.
Los p95 de aceptación y finalización se calculan por separado: restar sus medianas
no reconstruye el p95 de la ventana.

## Cinco verificaciones funcionales que pasaron

`initialStatus` registra la salida del coordinador de pruebas. En asíncrono,
202 es su representación lógica de aceptación tras una RPC HTTP 200 de PostgREST;
no es una respuesta de un endpoint productivo 202. Los 200/503 del receptor son
respuestas HTTP reales. La medición de aceptación abarca esa RPC y la política
de coordinación del harness, no una API productiva nueva.

| Caso                                       | Observación comprobada                                                                                                                         |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Síncrono: caída, reintento y recuperación  | Respuesta inicial 503; evento pendiente; reintentar el comando no duplica historial; tras reinicio del receptor y dos entregas, una actividad. |
| Asíncrono: caída, reintento y recuperación | Acuse 202 con evento durable aunque el receptor devuelve 503; tarea ausente hasta recuperación; tras reinicio y dos entregas, una actividad.   |
| Etapa de otro pipeline                     | Rechazo; oportunidad sin cambiar y cero eventos para ese intento.                                                                              |
| Otro vendedor                              | No puede mover la oportunidad, consultar eventos ajenos ni entregarlos; no crea un evento.                                                     |
| Triggers del CRM                           | Los cambios conservan probabilidad y el historial con identidad del vendedor.                                                                  |

El runner comprobó además una sola actividad por muestra exitosa y limpió su semilla.
No se inyectó caída de PostgreSQL ni crash en cada instrucción de la transacción.

## Interpretación y decisión propuesta

H1 se confirmó **en estas condiciones controladas**: la aceptación asíncrona evitó
esperar el receptor de 40 ms. Sin embargo, el efecto final tardó más por la entrega
diferida, y el throughput observado fue menor. Aceptar rápido y terminar rápido son
medidas distintas; estos datos no justifican decir que la asincronía es más rápida
en general.

El ensayo demuestra el corte propuesto, persistencia de pendientes, aislamiento y
efecto idempotente. Agrega operación de pendientes, consumidor, espera y contrato.
La recomendación del [ADR de integración](../../../adrs/ADR-005-integracion-oportunidades-actividades.md)
es conservar el comportamiento actual hasta aprobar la necesidad de seguimiento
automático y definir el plazo aceptable para el efecto. La outbox queda como
alternativa ensayada para ese requisito; no se instala en producción por este PR.

## Intento anterior conservado

[La primera ejecución](https://github.com/Felipe7774/NEXUS/actions/runs/38987478114)
falló durante la semilla: el insert masivo de etapas tenía un objeto con campos
distintos y PostgREST devolvió HTTP 400. No produjo muestras ni verificaciones y no
se usa en las estadísticas. [Su JSON](ci-38987478114/results.json) conserva fallo y
limpieza. La semilla se homogeneizó en `47dcb1f`, antes de la corrida válida.

## Límites de validez

No se midieron la UI de React, una cola/broker productivo, varios workers, carga
concurrente, un servicio externo real, TCO cloud, ventanas de replicación, RPO/RTO
ni una mejora respecto a EXP-001/002. El modo síncrono del experimento también
escribe el registro durable: se compara acoplamiento temporal manteniendo esa
persistencia común. No representa el tiempo del `useMoveDeal` actual por sí solo.
