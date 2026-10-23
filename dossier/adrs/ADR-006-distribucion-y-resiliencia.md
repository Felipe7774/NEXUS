# ADR-006 — Mantener una app y contener fallos de lectura de Supabase

> **Renumerado el 23/10/2026.** Nació como `docs/adr/0004-distribucion-y-resiliencia.md`. Pasó de 0004 a **006** al consolidar los ADR en una sola carpeta, para eliminar el choque con `ADR-004 — Arquitectura monolítica`, que es una decisión distinta. El contenido no se modificó.

Fecha: 16/10/2026; revisión: 17/10/2026. Módulo 6, distribución y resiliencia.

**Estado:** implementado y medido en la rama del módulo 6. **Veredicto técnico:
ajustada** respecto de la base sin circuit breaker. **Veredicto del mini-comité 2:
pendiente de sesión humana.** No equivale a despliegue productivo ni aprobación.

Este ADR corresponde al tema 4 del curso. El [ADR-004 histórico](../../dossier/adrs/ADR-004-arquitectura-monolitica.md)
confirma una unidad monolítica de aplicación; se conserva sin atribuirle los
experimentos o alternativas de hoy como si hubieran sido deliberados antes.

## Contexto y datos

Hay una aplicación TanStack Start/Nitro y una dependencia de red Supabase, con Auth,
RLS y PostgreSQL. La carga histórica de API cumplió p95 <2.000 ms, pero no demostró
necesidad de extraer servicios. El timeout histórico no probó mejora significativa.
El spike M5 separó aceptación de evento y efecto final; su worker productivo sigue
sin existir. Se busca reducir presión de lecturas frente a fallo persistente.

[EXP-004](../../dossier/experimentos/EXP-004-resiliencia/README.md) quedó
preregistrado en `5998eff` y se midió sobre `76ccaba68bc4cf21875808f6c9b776da1909b5bf`.
Semilla 20/800/1.000; tres rondas alternadas; 1.440 muestras principales; proxy
loopback hacia Supabase real con fallos 503 de 120 ms inyectados.

Resultado: 120→5 intentos a dependencia caída por ronda (−95,83%). En sano,
p95 41,830→39,754 ms, errores 0% en ambas; no se presume mejora significativa.
En caída, ambas variantes completan cero lecturas útiles. Una sola sonda seguida
de cinco lecturas correctas valida el retorno en el protocolo, sin medir RTO/RPO.

### Revisión por crecimiento S11

El protocolo e2dc488 se ejecutó sobre 0c4ca72: primer incumplimiento en 50 VUs
por errores en 2/3 corridas, frente a predicción de 150. A 100 VUs p95 mediano
3.000 ms. Esto activa revisión; no se mantiene una afirmación de capacidad suficiente.
La causa exclusiva del SUT no está aislada: generador y DB comparten CPU/host.
[Evidencia y límites](../../experimentos/crecimiento-S11/README.md).

La decisión revisada mantiene una app y Supabase, con cuatro módulos propietarios,
y exige perfilar DB/REST con generador separado antes de definir escalado.
No se adopta microservicios como solución no ensayada a la degradación local.

## Alternativas y decisión técnica

1. **Una unidad de aplicación + Supabase, con breaker local:** conserva propiedad
   y consistencia actuales, añade un control pequeño sin procesos nuevos.
2. **Ventas/Seguimiento como servicios síncronos:** permite independencia de
   despliegue, con costo de red, contratos y operación. No se ejecutó ni midió.
3. **Eventos/outbox + worker:** útil si se acepta consistencia eventual del
   seguimiento; la medición M5 no prueba que se necesite desplegarlo ahora.

Se mantiene la alternativa 1. Se centraliza el transporte duplicado y se activa
el breaker para GET/HEAD REST: tres fallos consecutivos, cooldown 1.000 ms y una
sonda concurrente por instancia/origen. Auth, escrituras, JWT, RLS y deadline de
3.000 ms conservan su función. No se añade caché ni retry de aplicación.

## Consecuencias, sensibilidad y costos

- Favorece contención de fallos repetidos; no ofrece datos frescos mientras la
  dependencia está caída. Los errores siguen siendo HTTP 503 explícitos.
- Cooldown y exclusión de sondas pueden rechazar llamadas a una dependencia que
  ya se recuperó. En la primera tanda de recuperación, cuatro de cinco lecturas
  protegidas esperan una llamada posterior al rechazo; no se encolan.
- El circuito no reduce la latencia de las primeras peticiones en vuelo: p99 de
  caída protegido 122,724 ms frente a 125,536 ms de base.
- Estado por adaptador/origen, sin coordinación entre réplicas. Middleware de
  vida corta no conserva historia entre invocaciones. Las políticas superiores
  de React Query/SDK deben considerarse antes de afirmar latencia de UX.
- El modelo de 12 meses estima 26–64 h incrementales, incluyendo coordinación para esta opción,
  200–400 h para extraer servicios y 100–200 h para outbox/worker. Son supuestos,
  no horas verificadas ni precios. [TCO, parámetros y riesgos](../../dossier/07-distribucion-y-resiliencia.md#7-tco-paramétrico-sin-cotizaciones-inventadas).
- Revertir implica desactivar `circuitBreaker` en el adaptador compartido y
  repetir la validación. Estimación de reversibilidad: 1–3 h de equipo, no medida;
  sin migración de datos, broker o formato de evento que deshacer.

Puntos sensibles: umbral de fallos, duración del cooldown y ámbito de la instancia.
Si los parámetros se endurecen, bajan los intentos pero sube el riesgo de rechazo
de dependencia sana. No se ajustan sin repetir un protocolo registrado.

## Gobernanza y condiciones de revisión

La fitness de `dossier/experimentos/EXP-004-resiliencia/fitness.mjs` corre en
`npm run docker:test` y `.github/workflows/docker-local.yml`. Rechaza muestras
incompletas, p95 sano ≥2.000/p99 ≥2.500 ms, errores sanos, reducción de intentos
<80%, varias sondas, pérdida de RLS o limpieza fallida. Las pruebas negativas
verifican que esos defectos se detectan. La regla previa `service_role` permanece.

Reabrir si una corrida reproducible viola esos presupuestos, se requieren
escrituras disponibles durante caída, se exige un RTO/RPO contractual o una
funcionalidad necesita escalado/despliegue independiente demostrado. Ante múltiples
réplicas y sondas sincronizadas, experimentar jitter/coordinación antes de añadirlos.
Revisar además los supuestos de TCO cuando existan costos y demanda verificados.

### Fronteras y costo organizacional

La fitness estructural `src/architecture/persistence-fitness.test.ts` usa
ArchUnitTS y AST: propietario por tabla, sin JOINs entre contextos, sin ciclos.
La composición por APIs mantiene UI/CRUD pero añade llamadas y pierde snapshot
único. No elimina FKs ni comparte menos infraestructura SQL automáticamente.
El borrado lógico se canaliza por tres RPC con autorización explícita para evitar
un fallo previo de UPDATE/RLS sin ampliar la visibilidad de filas borradas.
Reversibilidad de esta modularización: supuesto 4–8 h más validación, no medido.

La matriz de infraestructura/operación/Conway y categorías docentes O(1)/O(10)/O(100)
está en dossier 07 §7.1. Son supuestos comparativos; no multiplicadores medidos.

## Mini-comité 2

Preparados resultados, matrices y argumentos por rol en el
[dossier M6](../../dossier/07-distribucion-y-resiliencia.md#9-mini-comité-2-material-listo-sesión-humana-pendiente).
Fecha, asistentes, preguntas, observaciones y decisión colegiada están pendientes.
El equipo debe registrar si **confirma, ajusta o reconsidera** esta decisión
técnica. No se inventan votos ni una aprobación para cerrar el documento.
