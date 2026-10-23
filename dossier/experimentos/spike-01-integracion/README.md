# Spike 1 — Ventas → Seguimiento

**Estado:** ejecutado y verificado en GitHub Actions el 16/10/2026.
Resultado, condiciones, intento fallido y límites: [resumen](resultados/RESUMEN.md).
La corrida válida contiene 48 muestras y cinco verificaciones funcionales exitosas.
Plan anterior al código: [`PLAN.md`](PLAN.md), commit `e348616`.

## Qué ejecuta

Usa las migraciones, Auth, RLS, oportunidades, actividades y triggers reales de NEXUS
en un **Supabase local desechable**. Añade solo allí un registro durable y dos RPC.
Un receptor HTTP local con demora controlada materializa una actividad real.

Compara coordinación síncrona (esperar la actividad) y asíncrona (aceptar evento y
entregar después). Ambas escriben el evento durable; el consumidor del laboratorio
se ejecuta después del acuse, con una espera controlada de 20 ms. No hay broker ni
worker desplegado continuamente. Es una prueba del corte de integración y sus
fallos, no de capacidad de colas, recuperación productiva o UX de React.

Los códigos de aceptación los representa el coordinador del harness: una RPC de
PostgREST exitosa devuelve HTTP 200 y se representa como aceptación lógica 202 en
modo asíncrono. El receptor sí devuelve HTTP 200/503 reales. No se publica un
endpoint nuevo que responda 202 ni se mide su overhead de red.

## Archivos

- `fixture.sql`: tabla y RPC temporales, fuera de `supabase/migrations`.
- `run.mjs`: semilla sintética, coordinaciones, receptor, fallos y salida JSON.
- `metrics.mjs`: percentiles nearest-rank, mediana y guardia loopback.
- `metrics.test.mjs`: controles de cálculo y rechazo de destinos no locales.
- `resultados/`: corrida de referencia, cuando exista, con trazabilidad a CI/SHA.

## Reproducir

Con Docker Desktop instalado, el flujo automatizado y aislado es
`npm ci` seguido de `npm run docker:test` desde la raíz del repositorio.
Incluye las pruebas RLS y la compilación dentro de contenedores Linux.
Ver [instrucciones de Docker](../../../docs/docker-local.md) y
[evidencia local](resultados/docker-local-2026-10-16/README.md).

1. `npm ci` y `npm run test:spike-m5`.
2. Levantar un Supabase **local de pruebas**, con las migraciones de este repo:
   `npx supabase start -x studio,edge-runtime,vector,logflare,imgproxy,mailpit,realtime,storage-api,postgres-meta,supavisor`.
3. Cargar `fixture.sql` en el contenedor PostgreSQL de ese stack (nunca con `--linked`).
   La implementación reproducible en Linux está en
   [el workflow](../../../.github/workflows/modulo-5-spike.yml).
4. Exportar `SUPABASE_URL_TEST`, `SUPABASE_ANON_KEY_TEST` y
   `SUPABASE_SERVICE_ROLE_KEY_TEST` del stack local. No guardarlas ni imprimirlas.
5. `npm run spike:m5 -- --output artifacts/modulo-5/results.json`.
6. Conservar el JSON y detener Supabase. El runner elimina sus usuarios y datos
   sintéticos; las tablas fixture viven hasta descartar el stack de pruebas.

La misma secuencia corre en GitHub Actions y publica solo `results.json`. No sube
el archivo de estado de Supabase, JWT ni datos de Auth.

## Protocolo e interpretación

Dos operaciones de calentamiento por modalidad excluidas; tres corridas de ocho
operaciones por modalidad; concurrencia 1; orden alternado. Receptor 40 ms y espera
del consumidor 20 ms. Cada operación debe terminar con una actividad y el estado
correcto. La identidad se prueba con un segundo vendedor.

- `ackMs`: desde el comando hasta su confirmación, con significado distinto por modo.
- `completionMs`: desde el comando hasta completar la entrega HTTP y la transacción.
- `windowMs`: intervalo observado tras aceptación hasta finalizar entrega, cero en
  síncrono. No es una medida de replicación PostgreSQL.
- Throughput: operaciones terminadas / tiempo completo de la corrida; incluye las
  consultas de comprobación, y no es la capacidad máxima del sistema.
- p95: nearest-rank por corrida. Con ocho muestras equivale al máximo; se informa
  la mediana de tres p95. Muestra pequeña, sin intervalos de confianza.
- Los casos de fallo están fuera de la distribución de latencia exitosa.

Se verifica persistencia tras caída, reinicio del receptor, reintento del mismo
comando, entrega repetida, aislamiento por usuario y rechazo de etapas ajenas al
pipeline. El ID de actividad equivale al ID de evento para hacer el efecto idempotente.
Las pruebas no cubren varios workers, bloqueo prolongado, crash en cada instrucción,
orden global, reintentos automáticos ilimitados ni cola de fallos definitiva.

## Validez

Estas cifras pertenecen al corte experimental y a su receptor artificial. No se
comparan directamente con k6/EXP-001/002, ni se extrapolan al despliegue cloud.
Una menor latencia de aceptación asíncrona no demuestra menor tiempo al efecto final.
Los scripts trabajan con tablas reales del CRM, pero la funcionalidad automática
de seguimiento sigue siendo propuesta y no se activa en la app.
