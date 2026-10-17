# Validación posterior al material ampliado — 17/10/2026

Código ejecutado: `ed7ff5bb10e083cdf74f462c35084437455727cf`.
`workingTreeDirty=true` registra documentación/evidencias en preparación; los
archivos de implementación y pruebas estaban commiteados en ese SHA.

- 40 tests Vitest, 0 fallos y 0 omisiones; incluye CRUD/composición con RLS real,
  borrado lógico propio, rechazo ajeno/anónimo y fitness estructural ArchUnitTS.
- Cuatro controles M5; spike de 48 muestras y cinco verificaciones.
- EXP-004: 1.440 muestras; fitness correcto, RLS y limpieza correctos.
- Reducción de intentos en caída: 120→5 por ronda (95,83%). Sano: p95 mediano
  base 44,934 ms / protegido 46,524 ms; cero errores en ambos. No se afirma mejora
  de latencia sana. Durante caída ambos mantienen 100% errores y cero útiles.
- Build correcto; arranque Docker `/auth` y conexiones Auth/REST HTTP 200.
- TypeScript global conserva dos errores previos de `Path<T>` en `auth.tsx`;
  ver `typescript.txt`. El build no equivale a typecheck satisfactorio.

La integración detectó antes de esta corrida un fallo previo del borrado lógico
por política SELECT/RLS. Se corrigió con tres RPC propietarios autorizados,
manteniendo ocultas las filas borradas; las pruebas verifican los permisos.

`summary.json` y `vitest.json` conservan recuentos; `m6-results.json` los datos
por solicitud; `m6-resources.json` muestras de recursos; `build.txt` y
`fitness.txt` los controles, conservados sin códigos de color de terminal.
`app-smoke.json` registra el arranque posterior.
Esta repetición no sustituye ni reescribe la medición inicial del 16/10.
