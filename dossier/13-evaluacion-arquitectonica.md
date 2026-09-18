# 13 — Evaluación arquitectónica basada en evidencia

> **Estado:** inventario de evidencia para la deliberación del equipo. No es un veredicto arquitectónico final.

## Evidencia consolidada

| Aspecto | Hecho verificable | Fuente reproducible | Límites que deben mantenerse en la defensa |
|---|---|---|---|
| Seguridad | Un usuario autenticado no lee una empresa de otro usuario en la prueba de integración disponible. | `src/integrations/supabase/rls-isolation.integration.test.ts`; `.github/workflows/ci.yml` | No constituye auditoría línea por línea de todas las políticas RLS. |
| Disponibilidad | El comportamiento ante caída del proveedor fue documentado en el ciclo EDAV. | `LOG-EDAV-auditoria-ia.md`, Escenario 2; `auth-middleware.ts` | No prueba disponibilidad del proveedor ni una recuperación multi-región. |
| Rendimiento | EXP-001 reporta mediciones p95 de la API REST local con RLS y una semilla definida. | `experimentos/EXP-001-linea-base/` | No mide el render completo del Kanban ni latencia de red hacia producción. |
| Escalabilidad | EXP-002 registra mediciones locales con 5.000 contactos y 1.000 oportunidades. | `experimentos/EXP-002-escalabilidad/` | No representa concurrencia o infraestructura cloud a escala de producción. |
| Mantenibilidad | El repositorio contiene pruebas y CI para pull requests y `main`. | `package.json`; `.github/workflows/ci.yml` | No se cuantificó el costo de mantenimiento ni la cobertura total. |
| Usabilidad | El ciclo EDAV documenta una prueba real de primer uso. | `LOG-EDAV-auditoria-ia.md`, Escenario 5 | Una sola observación no permite generalizar a todos los usuarios. |
| Acceso operativo | El equipo confirmó acceso para los 3 integrantes; la revisión previa mostró dos cuentas `Owner` sin MFA. | Panel Team y confirmación del equipo, 18/09/2026. | Falta verificar privilegios mínimos y MFA para todas las cuentas administrativas. |
| Recuperación | Un respaldo lógico fue restaurado localmente y los conteos de Auth y 14 tablas públicas coincidieron con producción. | `experimentos/EXP-003-recuperacion/README.md` | No demuestra recuperación automática, almacenamiento externo, RPO/RTO ni recuperación regional. |

## Clasificación propuesta para validación del equipo

| Atributo | Estado | Justificación y límite | Referencia |
|---|---|---|---|
| Seguridad | **Verificado con alcance acotado** | Existen migraciones RLS y una prueba de integración que verifica que un usuario no lee la empresa de otro. No se auditó cada política línea por línea. | ADR-003; `rls-isolation.integration.test.ts`; CI |
| Mantenibilidad | **Verificado parcialmente** | Hay arquitectura en capas, pruebas automatizadas y CI. No se midió cobertura, costo de mantenimiento ni tiempo de cambio. | ADR-001; `.github/workflows/ci.yml`; `package.json` |
| Consistencia | **No verificado** | Centralizar el acceso en Supabase no demuestra consistencia como atributo de calidad. No hay escenario ni medición de consistencia documentados. | Plan de evolución |
| Rendimiento | **Verificado con alcance acotado** | EXP-001 y EXP-002 miden la API REST local con RLS y semillas registradas. No miden render completo del Kanban ni latencia de red en producción. | `04-evidencia-ejecutable.md`; EXP-001; EXP-002 |
| Disponibilidad | **Verificado con alcance acotado** | Se documentó y midió el manejo de caída del proveedor. No demuestra uptime del proveedor, failover ni recuperación multi-región. | `LOG-EDAV-auditoria-ia.md`, Escenario 2 |
| Escalabilidad | **Verificado con alcance acotado** | EXP-002 registra un escenario local con 5.000 contactos y 1.000 oportunidades. No demuestra crecimiento ilimitado ni capacidad cloud. | EXP-002; ADR-004 |
| Recuperación ante desastres | **Verificado con alcance acotado** | Se restauraron esquema y datos en un entorno local desechable y coincidieron todos los conteos evaluados. No existen respaldos automáticos disponibles ni se midieron RPO/RTO. | EXP-003; plan de evolución |
| Multi-región | **No aplica al alcance actual** | El alcance académico actual no incluye despliegue multi-región. Si el alcance cambia, debe abrirse un escenario y evidencia nuevos. | ADR-002; plan de evolución |

## Preguntas para la evaluación tipo comité

1. ¿Qué decisión específica respalda cada resultado medido?
2. ¿Qué limitación impide extrapolar la medición local a producción?
3. ¿Qué evidencia contradice o pone en duda una decisión actual?
4. ¿Qué supuesto debe quedar explícito en el plan de evolución?
