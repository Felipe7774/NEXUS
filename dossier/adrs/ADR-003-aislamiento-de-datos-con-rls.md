# ADR-003 — Aislamiento de datos mediante RLS

## Estado

**Confirmado.** El equipo confirma el uso de políticas Row Level Security (RLS) para aislar el acceso a los datos del CRM.

## Contexto

Las migraciones del proyecto habilitan y definen políticas RLS. La aplicación asocia datos con el usuario propietario y existe una prueba de integración contra Supabase local que comprueba que un usuario autenticado no puede leer una empresa creada por otro usuario.

## Decisión del equipo

El CRM aplica RLS en la capa de persistencia para controlar el acceso a los datos según el usuario autenticado y las reglas definidas en la base de datos.

## Alternativas consideradas

No se proporcionó una alternativa considerada de forma histórica. La siguiente comparación es una **evaluación retrospectiva** aprobada el 29/10/2026; no se presenta como parte de la decisión original.

| Alternativa retrospectiva | Evaluación actual |
|---|---|
| Autorización solo desde la aplicación o un backend | No se adopta. Un error de interfaz, API o consulta podría exponer datos; RLS aplica la regla directamente en PostgreSQL. |
| Filtros manuales por `user_id` en cada consulta | No se adopta. Cada consulta nueva dependería de disciplina humana; RLS protege incluso cuando una consulta omite el filtro esperado. |

### Costo y reversibilidad

El costo verificable actual es de 40 políticas RLS sobre 14 tablas, migraciones versionadas y una prueba de integración que corre en CI. No se afirma que las 40 políticas ya estén auditadas individualmente.

Quitar RLS obligaría a reemplazar 40 políticas por controles equivalentes en la aplicación y a volver a probar cada ruta de acceso. Es reversible, pero de costo alto y riesgo elevado de regresiones de seguridad.

## Consecuencias y trade-offs

- El control de acceso se aplica en la base de datos y no depende únicamente de la interfaz.
- La prueba disponible verifica un caso de aislamiento entre dos usuarios y se ejecuta en CI.
- La prueba no sustituye una auditoría individual de todas las políticas RLS.
- El costo de las consultas asociadas a `can_access_owner()` a mayores volúmenes sigue documentado como tensión de rendimiento no medida.

### Evaluación aprobada por el equipo

| Valor | Costo | Riesgo residual | Impacto en calidad | Veredicto |
|---|---|---|---|---|
| 🟢 | 🟡 | 🟡 | 🟢 | Confirmada |

El equipo justifica esta evaluación porque RLS aporta valor directo a la seguridad y está respaldado por migraciones y pruebas. Una configuración incorrecta o el costo de consultas a mayor volumen conservan riesgos moderados que deben vigilarse.

## Evidencia y trazabilidad

- `supabase/migrations/`
- `src/integrations/supabase/rls-isolation.integration.test.ts`
- `.github/workflows/ci.yml`, job `rls-integration-test`
- `dossier/02-escenarios-de-calidad.md`, sección 4
- `dossier/LOG-EDAV-auditoria-ia.md`, Escenario 1

## Supuestos y seguimiento

La corrección de cada política no se da por demostrada fuera de los casos cubiertos por la evidencia disponible. Nuevos recursos o políticas requieren pruebas equivalentes y revisión de sus implicaciones de rendimiento. El ADR se reabre si una auditoría política por política encuentra acceso indebido, o si un requisito de colaboración entre usuarios no puede expresarse con políticas RLS verificables.
