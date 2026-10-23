# EXP-004 — Prerregistro del módulo 6

Fecha de diseño: 16/10/2026, Colombia. Base: `a8ab11282ebaac223ff10b1fcc39229e7b25d85f`.
Este plan se registra en Git antes de implementar la táctica y medir resultados.

## Requisito y alcance

Las tres láminas del módulo 6 de AVATA piden: escenario y umbral, experimento de
carga o táctica, comparación con línea base, recursos, fallos/resiliencia, costos,
fitness function y ADR 4 para discutir en el mini-comité 2. La sesión humana y
sus veredictos no pueden sustituirse por una simulación de aprobación.

Se conserva la distribución actual de NEXUS: una aplicación TanStack Start/Nitro
y un backend Supabase externo a ella. Los contextos del módulo 5 son límites
propuestos, no microservicios desplegados ni un monolito modular ya extraído.

## Problema y alternativas de táctica

Los tres adaptadores de Supabase limitan cada petición a 3.000 ms, pero siguen
intentando lecturas ante una dependencia que falla repetidamente. El timeout
actual se toma como línea base; no se atribuye una mejora al resultado histórico
de 2.145 frente a 2.135 ms, cuya diferencia ya fue descartada como significativa.

Se evaluará un circuit breaker para GET/HEAD a `/rest/v1/`: abre tras tres fallos
consecutivos elegibles, suspende lecturas durante 1.000 ms y admite una única
sonda concurrente de recuperación. Cuenta HTTP 502/503/504, error de red y timeout.
No cuenta 4xx, no reintenta ninguna llamada y no intercepta Auth ni escrituras.
La cancelación voluntaria no se considera fallo de la dependencia. Su estado
vive en la instancia del adaptador, sin datos ni caché de respuestas.

No se añaden Redis, broker, servicio nuevo ni escalado horizontal. Retry con
jitter, bulkheads y pool se analizarán como alternativas no implementadas.

## Hipótesis y umbrales definidos antes de medir

- **H1:** durante la fase de fallo persistente, la táctica reduce al menos un
  80% los intentos que llegan a la dependencia simulada, frente a la base.
- **H2:** en estado sano, ambas variantes tienen 0% errores, p95 <2.000 ms
  (presupuesto histórico de API) y p99 <2.500 ms (presupuesto experimental nuevo).
  No se exige ni se presume mejora de rendimiento sano.
- **H3:** tras habilitar la dependencia y esperar el cooldown, cinco lecturas
  concurrentes admiten una sola sonda; tras su éxito, la siguiente tanda de cinco
  lecturas tiene 0% errores. Se mide el tiempo observado hasta la primera lectura
  correcta, no RTO/RPO del sistema.
- **Invariantes:** escrituras y Auth no se suprimen ni repiten; 4xx no abren el
  circuito; no se devuelve una lectura fallida como éxito; RLS permanece activo.

La fitness function rechazará datos incompletos o que violen esos criterios. Un
fallo obliga a revisar implementación o hipótesis mediante un nuevo commit; no
se cambian umbrales silenciosamente para volver verde una corrida.

## Entorno y protocolo

- Docker Linux con el stack `nexus-docker-tests`, separado de desarrollo y cloud.
- Migraciones reales del CRM y usuarios sintéticos autenticados mediante Auth.
- Semilla: 20 empresas, 800 contactos, 1.000 oportunidades; 200 en dos etapas
  calientes. Datos exclusivos del experimento, limpiados al terminar.
- Consulta de oportunidades con proyección `id,title,amount,stage_id`; patrón
  determinista 80% etapas calientes /20% pipeline completo, como EXP-001.
- Proxy HTTP local: en estado sano reenvía a Supabase real con el JWT del dueño;
  en fallo responde HTTP 503 tras 120 ms sin reenviar. Ese fallo representa la
  dependencia inaccesible; no es una caída real de PostgreSQL ni prueba de su pool.
- Tres rondas, orden base/táctica alternado. Cada variante tiene un adaptador
  nuevo y dos llamadas de calentamiento excluidas.
- Por ronda/variante: fase sana y fase de fallo, cada una con 120 operaciones
  (cinco trabajadores ×24 lecturas secuenciales, pausa de 20 ms).
- Los cinco trabajadores comparten adaptador y usuario: modelan lecturas
  concurrentes de un cliente, no cinco navegadores con circuitos independientes.
- En recuperación se habilita el proxy, se espera 1.050 ms y se comprueba la
  sonda y la tanda siguiente. El proxy demora la sonda al menos 40 ms para
  observar la exclusión concurrente, en ambas variantes.
- Timeout por intento: 3.000 ms. Sin reintentos del harness ni React Query.

## Datos, recursos y comparación

Se guardan muestras por operación (duración hasta consumir el cuerpo, HTTP,
éxito/rechazo local y filas), p95/p99 nearest-rank, intentos al proxy y reenvíos
reales, respuestas correctas/s y errores. Las respuestas fallidas no cuentan
como throughput útil. Se distinguen respuesta disponible y disponibilidad
temporal: el cociente de éxitos del ensayo no es uptime del servicio.

Se registra CPU/RSS del runner y muestras `docker stats` de DB, Auth, gateway y
PostgREST durante el experimento. Son observaciones compartidas y esporádicas,
no el pico real, un promedio de toda la corrida ni una prueba de ahorro en CPU.
No se controlan los otros procesos del equipo ni el ahorro energético.

EXP-001 se conserva como referencia histórica (5 VUs, 30 s, p95 92,62 ms), pero
no se comparan porcentajes de mejora con ella: cambian fecha, equipo, red/proxy,
versión y ritmo. La comparación causal de esta táctica usa la nueva base pareada
con el mismo dataset, consulta, proxy y condiciones que la variante protegida.

## Salidas y decisión

- `results.json`, recursos, suite automatizada y veredicto de fitness en CI.
- `dossier/07-distribucion-y-resiliencia.md`: trazabilidad y matrices.
- `docs/adr/0004-distribucion-y-resiliencia.md`: veredicto técnico sustentado,
  manteniendo separado el ADR-004 histórico y la aprobación humana pendiente.
- TCO paramétrico en horas/esfuerzo, separando costos comunes, incrementales,
  supuestos y cargos cloud no consultados. No se inventan facturas ni cotizaciones.
- Preguntas y acta pendiente del comité, sin asignar votos a personas.

Fuentes: [circuit breaker de Microsoft](https://learn.microsoft.com/azure/architecture/patterns/circuit-breaker)
y [timeouts/retries de AWS](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/).
