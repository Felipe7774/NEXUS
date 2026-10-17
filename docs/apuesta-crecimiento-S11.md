# Prerregistro de crecimiento S11

Registrado antes de ejecutar k6. La hipótesis es una apuesta, no un resultado.

**Predicción:** la primera violación del presupuesto aparecerá en **150 VUs**,
en la ruta REST de oportunidades (PostgREST/PostgreSQL). Se refuta si ocurre
en otro escalón o no ocurre hasta 200. Los recursos observados podrán apoyar
un diagnóstico, pero no demostrarán por sí solos qué componente causó la demora.

- Entorno: Supabase real en Docker, proyecto desechable `nexus-growth-tests`,
  puertos 56321/56322. No se somete a carga el Supabase remoto.
- Datos: 20 empresas, 800 contactos, 1.000 oportunidades, 200 calientes;
  usuario vendedor autenticado, RLS activa. 80% lecturas calientes, 20% pipeline.
- Instrumento: imagen oficial `grafana/k6:2.3.0`; consultas HTTP directas,
  sin circuit breaker ni reintentos, con validación del cuerpo y número de filas.
- Escalones secuenciales **5, 50, 100, 150 y 200 VUs**, 30 segundos cada uno,
  pausa de 5 segundos entre escalones, think time 100 ms, timeout 3 segundos.
  5→50 representa 10× concurrencia. Modelo cerrado: VUs no equivalen a RPS.
- Una corrida completa de calentamiento descartada y tres corridas válidas.
  p95/p99 por escalón, errores semánticos y throughput útil; resumen como
  mediana de las tres métricas, sin mezclar muestras entre escalones.
- Quiebre: primer escalón con p95 ≥2.000 ms o errores ≥1% en al menos
  dos de tres corridas. Si no ocurre, solo se afirma «no observado hasta 200».
- Registrar recursos del generador y DB/REST/Kong/Auth con Docker stats,
  CPU/memoria asignadas a Docker y métricas de VUs/iteraciones. Si el generador
  está limitado o la evidencia no permite distinguirlo, el límite queda
  inconcluso; no se atribuye automáticamente al sistema.
- La duración de 30 s adapta el ejemplo de rampas del docente al laboratorio
  local y permite comparar mesetas. No es una prueba prolongada de producción.
  `GROWTH_SECONDS=120` permite ampliar las mesetas sin cambiar el script.
- Una violación del presupuesto es un resultado válido. Errores de arranque,
  falta de muestras o credenciales inválidas invalidan una corrida.
- Conservar versión de código, JSON nativo, recursos y gráficas en
  `/experimentos/crecimiento-S11/`. Nunca guardar claves ni JWT en Git.
