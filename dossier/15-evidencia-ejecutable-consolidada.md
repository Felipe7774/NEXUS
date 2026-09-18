# 15 — Evidencia ejecutable consolidada

> Índice de navegación. No duplica resultados: enlaza los artefactos originales y reproducibles.

| Evidencia | Qué permite demostrar | Ubicación | Commit o trazabilidad disponible |
|---|---|---|---|
| Pruebas unitarias | Comportamiento de utilidades y formato cubierto por Vitest. | `src/lib/*.test.ts`; `package.json` | CI en `.github/workflows/ci.yml` |
| Prueba RLS | Aislamiento entre dos usuarios en una instancia local de Supabase. | `src/integrations/supabase/rls-isolation.integration.test.ts` | Escenario 1, `LOG-EDAV-auditoria-ia.md` |
| Línea base de rendimiento | Resultado k6 bajo semilla y condiciones registradas. | `experimentos/EXP-001-linea-base/` | Escenario 3, `04-evidencia-ejecutable.md` |
| Escalabilidad | Resultado k6 con semilla ampliada y condiciones registradas. | `experimentos/EXP-002-escalabilidad/` | Escenario 6, `LOG-EDAV-auditoria-ia.md` |
| Disponibilidad | Registro del experimento y sus intentos descartados. | `LOG-EDAV-auditoria-ia.md` | Escenario 2 |
| Usabilidad | Registro de prueba real y sus límites. | `LOG-EDAV-auditoria-ia.md` | Escenario 5 |
| Mantenibilidad | CI y evidencia de la prueba de branch protection. | `.github/workflows/ci.yml`; `LOG-EDAV-auditoria-ia.md` | Escenario 4 |
| Integración desplegada | Frontend en producción enlazado al proyecto Supabase vigente; Auth, RLS y tablas principales accesibles. | `https://nexus-green-xi.vercel.app`; proyecto Supabase `xysncmauhogsvqtqeshe` | Verificación operativa del 18/09/2026 |
| Acceso de equipo | Dos miembros con acceso, ambos `Owner`; el tercer integrante y MFA siguen pendientes. | Panel Team de la organización Supabase | Revisión de solo lectura del 18/09/2026 |
| Recuperación | No hay respaldo disponible; el intento de preparar una restauración local quedó bloqueado por el arranque de Docker Desktop 4.49. | `supabase backups list`; diagnóstico local de Docker | Evidencia negativa: no declarar recuperación como verificada |

## Verificación antes de entregar

### CI

- El pipeline debe ejecutar correctamente.
- El build y las pruebas deben finalizar sin errores.
- La evidencia del resultado debe corresponder al commit que se defiende.

### RLS

- El usuario A no debe poder leer datos del usuario B en el caso cubierto por la prueba.
- La prueba debe ejecutarse contra Supabase local, tal como define el workflow de CI.
- No afirmar que todas las políticas están auditadas si solo se ejecutó el caso disponible.

### Experimentos

- Ejecutar los comandos desde el README de cada experimento, sin alterar las condiciones registradas.
- Confirmar que el commit citado en cada medición existe en Git.
- Verificar que resultados, semilla y corridas válidas estén presentes.
- Presentar las limitaciones junto al resultado; no convertir datos locales en afirmaciones de producción.

### Integración de producción

- El despliegue debe responder HTTP 200 en `/`, `/login` y `/signup`.
- El bundle del frontend debe contener la referencia `xysncmauhogsvqtqeshe` y no la referencia del proyecto eliminado.
- Supabase Auth y una consulta anónima protegida por RLS deben responder HTTP 200.
- No exponer ni registrar `SUPABASE_SERVICE_ROLE_KEY` en el repositorio, el bundle del navegador o las evidencias.
- Resultado observado el 18/09/2026: verificación satisfactoria. Email Auth habilitado; Google Auth deshabilitado por decisión/configuración vigente del equipo.
