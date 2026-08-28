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

## 5. Drivers arquitectónicos preliminares

`PROPUESTO POR IA (Claude) — auditado por el equipo con confirmación informal, no con el ciclo EDAV completo (ver Log). Pendiente re-auditoría formal antes de tratarlo como definitivo.`

1. Seguridad · 2. Disponibilidad · 3. Mantenibilidad · 4. Rendimiento · 5. Usabilidad

## 6. Riesgos iniciales

`PROPUESTOS POR IA (9 candidatos) — el equipo clasificó cada uno con un "sí" de confirmación rápida, no con justificación matemática/empírica propia. Detalle completo, evidencia y clasificación original en el Log EDAV.`

Resumen: 5 válidos (fuga de `service_role`, ausencia de tests, dependencia organizacional única, RLS sin auditar, límites del plan free), 2 genéricos, 1 irrelevante/falso, 1 válido-condicionado.

## 7. Supuestos

- Se asume que el proyecto Supabase seguirá siendo administrado por el mismo integrante durante el resto del curso.
- Se asume que no habrá usuarios concurrentes reales antes de la semana 4 (sin datos de producción).
- Se asume que las 31+ políticas RLS existentes son funcionalmente correctas — **no verificado**, ver punto 9.

## 8. Referencia a la hipótesis inicial

Hipótesis de rendimiento pre-registrada (a contrastar en `04-evidencia-ejecutable.md`): el tablero Kanban del pipeline responde en p95 < 2000 ms con un volumen de datos representativo. Esta hipótesis todavía no fue auditada con el ciclo EDAV completo — ver `02-escenarios-de-calidad.md`.

## 9. Qué todavía no ha sido verificado

- Las políticas RLS no fueron auditadas línea por línea (riesgo R4).
- No hay medición real de rendimiento — solo hipótesis.
- El riesgo de sesión en `localStorage` (R7) depende de que exista una vulnerabilidad de inyección no confirmada.
- Los escenarios propuestos por IA en `02-escenarios-de-calidad.md` no pasaron todavía por el paso "A — Auditoría" completo del ciclo EDAV con la matriz Válido/Modificado/Genérico/Falso.

## 10. Trazabilidad

- Contexto y stakeholders: PR `semana-1-contexto-sistema` (mergeado).
- Riesgos y drivers: PR `semana-2-riesgos-drivers` (mergeado), commits `19a54cf`, `3f5057b`, `0c4f667`.
- Migración de esquema (`stakeholders`, `client_documents`, salud de cuenta): PR `add-stakeholders-schema` (mergeado), migración `20260822010000_add_stakeholders_and_client_health.sql`.
- Suite de tests: PR `add-vitest-docker-tests` (mergeado).
