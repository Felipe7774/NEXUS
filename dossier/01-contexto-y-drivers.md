# 01 — Contexto y drivers arquitectónicos

> Integrantes: Carlos Correa, Felipe Piragauta, Santiago Roman · Docente: Nelson Sánchez Sánchez · Materia: Arquitectura de Software
> Límite: 800 palabras. Ver `LOG-EDAV-auditoria-ia.md` para el detalle completo de qué propuso la IA y su clasificación.

## 1. Identificación y alcance del sistema

**Nexo CRM** — CRM B2B para contactos, empresas, oportunidades y actividades comerciales. Repo: [Felipe7774/NEXUS](https://github.com/Felipe7774/NEXUS) (`main`). Stack: React 19 + TanStack Start (SSR) + Vite 8 + Supabase (PostgreSQL + Auth + RLS). Sin backend separado: la lógica de servidor vive dentro del mismo proceso Vite/Nitro (`src/integrations/supabase/*.server.ts`).

## 2. Contexto

El frontend original del equipo se perdió cuando el compañero a cargo del backend reescribió el proyecto; el repositorio actual es la única fuente de verdad. El sistema ya tiene 11 tablas con RLS habilitado (companies, contacts, deals, activities, pipelines/stages, stakeholders, etc.) y 31+ políticas.

## 3. Stakeholders y sus preocupaciones

| Stakeholder | Preocupación principal |
|---|---|
| Equipo (3 integrantes) | Entregar el CRM funcional y aprobar la materia |
| Usuarios comerciales | Interfaz rápida y sin fricción |
| Dueño del proyecto Supabase | Control de acceso y costos |
| Docente | Calidad del proceso de arquitectura, no solo el código |
| Supabase / Vercel (externos) | Límites de plan, disponibilidad |

## 4. Restricciones

- **Técnica:** stack fijo (React 19 + TanStack Start + Supabase); sin backend independiente desplegable aparte.
- **Técnica:** `service_role` solo en `*.server.ts` — no hay control automatizado (lint/CI) que lo garantice.
- **Económica:** proyecto Supabase en plan free (límites de filas, conexiones, ancho de banda); sin presupuesto para infraestructura paga.
- **Organizacional:** un solo integrante administra la cuenta de Supabase (punto único de dependencia de acceso); cronograma de 4 semanas con checkpoint en semana 2.
- **Organizacional:** el equipo dispone de 6 a 8 horas semanales entre los tres integrantes para el proyecto.

## 5. Drivers arquitectónicos priorizados

`Auditados por el equipo con justificación propia (ciclo EDAV completo) — ver Log EDAV.`

1. Seguridad · 2. Disponibilidad · 3. Mantenibilidad · 4. Rendimiento · 5. Usabilidad

## 6. Riesgos iniciales

`Auditados por el equipo, uno por uno, con clasificación y justificación propia (ciclo EDAV completo) — detalle completo en el Log EDAV.`

Resumen: 4 válidos (R1, R3, R4: fuga de `service_role`, dependencia organizacional única, RLS sin auditar), 3 modificados (R2: mitigado con tests/CI; R5: reformulable como riesgo de escalabilidad; R7: condicionado a que exista una vulnerabilidad de inyección), 2 genéricos (R6, R8), 1 falso (R9).

## 7. Supuestos

- Se asume que el proyecto Supabase seguirá siendo administrado por el mismo integrante durante el resto del curso.
- Se asume que no habrá usuarios concurrentes reales antes de la semana 4 (sin datos de producción).
- Se asume que las 31+ políticas RLS existentes son funcionalmente correctas — **no verificado**, ver punto 9.

## 8. Referencia a la hipótesis inicial

Hipótesis de rendimiento pre-registrada: el tablero Kanban del pipeline responde en p95 < 2000 ms con un volumen de datos representativo. Contrastada y auditada (Válido): p95 real = 92.62ms con 1.000 registros, 127.16ms con 5.000 — ver `04-evidencia-ejecutable.md` y `02-escenarios-de-calidad.md`.

## 9. Qué todavía no ha sido verificado

- Las políticas RLS no fueron auditadas línea por línea, política por política (riesgo R4) — sí se verificó el aislamiento entre usuarios en la práctica (Escenario 1), pero no cada política individualmente.
- El riesgo de sesión en `localStorage` (R7) sigue condicionado a que exista una vulnerabilidad de inyección en el frontend — no confirmada ni descartada.
- La medición de rendimiento (Escenario 3 y 6) se hizo contra la API REST directamente, no contra la app renderizada en el navegador — el tiempo real de carga percibido por un usuario sigue sin medir.

## 10. Trazabilidad

- Contexto y stakeholders: PR `semana-1-contexto-sistema` (mergeado).
- Riesgos y drivers: PR `semana-2-riesgos-drivers` (mergeado), commits `19a54cf`, `3f5057b`, `0c4f667`.
- Migración de esquema (`stakeholders`, `client_documents`, salud de cuenta): PR `add-stakeholders-schema` (mergeado), migración `20260822010000_add_stakeholders_and_client_health.sql`.
- Suite de tests: PR `add-vitest-docker-tests` (mergeado).

## Actualización operativa — Módulo 8

**Hecho reportado por el equipo:** el proyecto original de Supabase dejó de estar disponible y fue sustituido por `nexo-crm` (`xysncmauhogsvqtqeshe`) en otra cuenta. Esta situación incrementa temporalmente el riesgo asociado al control de acceso administrativo, la trazabilidad operativa y la dependencia del proveedor.

**Verificado el 18/09/2026:** la cuenta que ejecutó Supabase CLI puede enlazar el proyecto nuevo y `supabase migration list --linked` reporta aplicadas las mismas cuatro migraciones versionadas en este repositorio (`20260805035001`, `20260805035020`, `20260805035038` y `20260822010000`).

**Verificado el 18/09/2026:** Supabase Auth y la API REST del proyecto nuevo responden correctamente; Email Auth está habilitado y Google Auth no está habilitado. Las variables del proyecto `nexus` en Vercel fueron actualizadas para Production, Preview y Development, preservando `SUPABASE_SERVICE_ROLE_KEY` como secreto solo de servidor en Production y Preview. El redespliegue de producción quedó disponible en `https://nexus-green-xi.vercel.app`; la aplicación respondió HTTP 200 y su bundle referencia el proyecto nuevo, no el eliminado. Las tablas `profiles`, `companies`, `contacts`, `pipelines`, `deals` y `activities` también respondieron correctamente mediante la API.

**Acceso verificado el 18/09/2026:** la organización de Supabase tiene 2 miembros para un equipo académico de 3 integrantes. Ambos miembros tienen rol `Owner` y MFA deshabilitado. Por tanto, existe continuidad de acceso para dos personas, pero el riesgo no está cerrado: falta incorporar al tercer integrante, acordar privilegios mínimos y habilitar MFA en las cuentas administrativas.

**Respaldo y restauración:** el panel y `supabase backups list` no reportan respaldos disponibles. Se intentó preparar una restauración local desechable, pero Docker Desktop 4.49 no logró iniciar por un error local al crear sus sockets de ejecución; no se modificó la base remota. La recuperación ante desastres permanece **no verificada** hasta actualizar o reparar Docker, generar un respaldo lógico y restaurarlo con comprobaciones de esquema y conteos.
