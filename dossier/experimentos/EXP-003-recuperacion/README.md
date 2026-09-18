# EXP-003 — Respaldo y restauración de Supabase

## Objetivo

Comprobar que el esquema versionado y un respaldo lógico del proyecto Supabase vigente permiten reconstruir los datos del CRM en un entorno local desechable, sin modificar producción.

## Fecha y entorno

- Fecha: 18/09/2026.
- Proyecto origen: `nexo-crm` (`xysncmauhogsvqtqeshe`).
- Supabase CLI: 2.117.0.
- Docker Desktop: 4.91.0.
- Docker Engine: 29.8.0.
- Destino: PostgreSQL local de Supabase, aislado en Docker.

## Método reproducible

1. Generar respaldos lógicos de roles, esquema `public` y datos de `public,auth` mediante `supabase db dump --linked`.
2. Iniciar Supabase local con los servicios no requeridos excluidos.
3. Confirmar que las cuatro migraciones versionadas están aplicadas localmente.
4. Restaurar los datos dentro de una transacción y con disparadores temporalmente deshabilitados mediante `session_replication_role = replica`.
5. Comparar conteos remotos y locales usando la API administrativa/REST y consultas SQL locales.
6. Eliminar la copia temporal porque contiene información de autenticación; conservar únicamente hashes y resultados no sensibles.

## Integridad del respaldo temporal

| Artefacto | Tamaño | SHA-256 |
|---|---:|---|
| `roles.sql` | 370 B | `168A95A9C745AF5ED4679751F90419AC9DC434240A213B03E32A06D5664C2308` |
| `schema.sql` | 40.746 B | `E8243AE32B4B1B729B064C7CAE1A6E41654FE708404E5C2A4B7DB091F2726E77` |
| `data.sql` | 21.082 B | `F2DC8F36B06489A11E4C0BE5C17B0C60EDF436E38E5F0EC885AB4376A9228A1F` |

Los archivos SQL no se incorporan al repositorio porque `data.sql` contiene hashes y metadatos de autenticación.

## Resultado

| Tabla o conjunto | Remoto | Restaurado local | Coincide |
|---|---:|---:|:---:|
| `auth.users` | 4 | 4 | Sí |
| `profiles` | 4 | 4 | Sí |
| `companies` | 0 | 0 | Sí |
| `contacts` | 0 | 0 | Sí |
| `pipelines` | 1 | 1 | Sí |
| `stages` | 7 | 7 | Sí |
| `deals` | 0 | 0 | Sí |
| `activities` | 0 | 0 | Sí |
| `client_documents` | 0 | 0 | Sí |
| `deal_stage_history` | 0 | 0 | Sí |
| `stakeholders` | 0 | 0 | Sí |
| `stakeholder_relationships` | 0 | 0 | Sí |
| `tags` | 0 | 0 | Sí |
| `taggables` | 0 | 0 | Sí |
| `user_roles` | 4 | 4 | Sí |

**Veredicto:** recuperación lógica verificada para el esquema y volumen actuales. El ejercicio no demuestra recuperación automática, RPO/RTO contractual, almacenamiento externo del respaldo ni recuperación regional.
