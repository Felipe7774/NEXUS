# EXP-004 — Circuit breaker de lecturas y decisión del módulo 6

Plan previo: [`PLAN.md`](PLAN.md), commit `5998eff`.
El resultado se conserva después de ejecutar el protocolo; no se presume mejora.

## Reproducir en Docker

```bash
npm ci
npm run docker:test
```

El comando prepara un Supabase local exclusivo, ejecuta Vitest/RLS, el spike M5 y
este experimento, evalúa su fitness y compila la aplicación. Destruye al terminar
solo el stack de pruebas. No requiere credenciales cloud ni un proyecto vinculado.

EXP-004 corre dentro de la imagen Linux, usando el mismo adaptador
`src/lib/supabase-fetch.ts` que los tres clientes reales de la app. La variante
base desactiva únicamente el circuit breaker; conserva apikey, JWT y deadline de
3.000 ms. La táctica usa los valores del código: tres fallos y cooldown de 1.000 ms.
El proxy solo reenvía lecturas al Supabase loopback validado al iniciar.

Salidas locales fuera de Git:

- `artifacts/docker/m6-results.json`: muestras, fases, hipótesis y fitness.
- `artifacts/docker/m6-resources.json`: CPU/memoria/I/O observados con `docker stats`.
- `artifacts/docker/resiliencia-m6.log` y `fitness-m6.log`.
- `artifacts/docker/vitest.json` y `summary.json`: suite y estado global.

La regla también se puede ejecutar sobre un JSON ya generado:

```bash
npm run fitness:m6 -- artifacts/docker/m6-results.json
```

Devuelve código distinto de cero si falta el protocolo o se incumple un umbral.
Las pruebas de la propia regla alteran muestras, latencia, tráfico, RLS, sondas
y limpieza para verificar que esos resultados se rechazan.

## Qué mide y qué no

- 3 rondas ×2 variantes ×2 fases ×120 lecturas = **1.440 muestras principales**.
  Calentamiento, RLS y diez llamadas de recuperación por variante van aparte.
- Cinco trabajadores comparten usuario/adaptador. No se prueba un breaker global
  ni distribuido entre réplicas, regiones, procesos o navegadores.
- Semilla real 20/800/1.000; consultas 80/20 de etapas/pipeline, sin render de React.
- Una caída devuelve errores reales HTTP 503 inyectados en el proxy. No se para
  PostgreSQL: no es un ensayo de failover, saturación del pool o recuperación de datos.
- El throughput útil cuenta solo respuestas 200. Rechazos rápidos siguen siendo
  fallos; no se convierten en mayor disponibilidad o más operaciones completadas.
- Los p95/p99 incluyen fallos en la fase de caída, por separado del estado sano.
- La sonda tiene una demora artificial de 40 ms y se lanza tras una espera
  programada de 1.050 ms. Ese tiempo observado no es RTO ni recuperación autónoma.
- CPU del proceso Node y muestras de Docker no demuestran un ahorro causal de
  CPU o dinero. El equipo, Docker y los otros procesos comparten recursos.
- React Query/Supabase pueden añadir comportamiento de sus capas superiores;
  el harness prueba directamente el adaptador, sin esos reintentos ni UX completa.

El breaker no añade reintentos ni cachea datos. Un error de red/timeout cuenta si
rechaza `fetch` antes de devolver cabeceras; una cancelación voluntaria no cuenta.
Un cuerpo que falle después de cabeceras es un límite de esta táctica. El deadline
del transporte y la gestión de errores de la app siguen aplicando.

Documentación del módulo: [`07-distribucion-y-resiliencia.md`](../../07-distribucion-y-resiliencia.md).
