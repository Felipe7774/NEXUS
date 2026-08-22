# 02 — Inventario de riesgos y drivers preliminares

## Inventario de riesgos propuestos por IA (para clasificar en equipo)

> Consigna: marcar cada uno como **Válido**, **Genérico**, **Irrelevante** o **Falso**, y justificar en una línea. Algunos de estos riesgos fueron incluidos deliberadamente como ejemplos de cada categoría — no asuman que todos son "válidos".

| ID | Riesgo propuesto | Evidencia en el código | Clasificación | Justificación |
|---|---|---|---|---|
| R1 | La clave `service_role` podría filtrarse al bundle del cliente si algún día se importa fuera de un archivo `*.server.ts`. | `src/integrations/supabase/client.server.ts` está separado a propósito del cliente público (`client.ts`), pero nada impide un import erróneo futuro. | **Válido** | Patrón de falla conocido en apps con Supabase; hoy la separación existe pero no hay ningún control (lint/CI) que la haga cumplir a futuro. |
| R2 | Sin tests automatizados, un refactor puede romper el login o la creación de oportunidades sin que nadie lo note antes de un merge. | `package.json` no tiene script `test`; no hay Vitest/Jest instalado. | **Válido** | Confirmado directamente en el repo: cero tests. Es el riesgo más concreto y accionable que tienen hoy. |
| R3 | Punto único de dependencia organizacional: solo un integrante tiene acceso administrativo al proyecto Supabase. | Confirmado en la conversación del equipo (no en el código). | **Válido** | Ya lo vivieron en la práctica: hubo que pedir la clave anon por chat porque solo un integrante podía generarla. |
| R4 | Alguna política RLS mal escrita podría exponer filas de otra organización/usuario. | Hay 11 tablas con RLS habilitado y 31 políticas en `supabase/migrations/` — no fueron auditadas línea por línea todavía. | **Válido (sin verificar)** | El riesgo existe en potencia por el volumen de políticas sin auditar; no hay evidencia de que alguna esté mal, así que queda como tarea de revisión, no como hallazgo cerrado. |
| R5 | Los límites del plan free de Supabase (conexiones, almacenamiento) podrían cortar el servicio bajo carga real. | Restricción económica documentada en `01-contexto-sistema.md`. | **Válido** | Restricción económica real del proyecto; puede materializarse justamente en la prueba de carga de la semana 4. |
| R6 | Dependencias en versiones muy nuevas (React 19, Vite 8, TanStack Start) pueden traer bugs de tooling ajenos al código propio. | `package.json`: `react@^19.2.0`, `vite@^8.1.5`. | **Genérico** | Es cierto para cualquier proyecto con dependencias bleeding-edge; no aporta nada específico sobre Nexo CRM más allá de "usa versiones nuevas". |
| R7 | La sesión persiste en `localStorage`; una vulnerabilidad de inyección en el frontend podría permitir robo de sesión. | `client.ts`: `storage: window !== undefined ? localStorage : undefined`. | **Válido (condicionado)** | Es un riesgo real solo si existe una vulnerabilidad de inyección en el front; hoy no hay evidencia de que exista una, así que queda condicionado a ese hallazgo. |
| R8 | El nombre del paquete en `package.json` sigue siendo `"tanstack_start_ts"`, residuo del scaffold inicial. | `package.json` línea 2. | **Genérico / cosmético** | Real pero sin impacto funcional ni de seguridad — deuda cosmética, no riesgo de arquitectura. |
| R9 | El servidor de Supabase podría estar caído en algún país. | Sin evidencia concreta para este proyecto puntual. | **Irrelevante / Falso** | Afirmación sin ningún vínculo específico con este sistema (no dice qué país ni por qué importaría) — se descarta del inventario. |

*(R8 y R9 están ahí a propósito: uno es un dato real pero de impacto cosmético, el otro es una afirmación genérica sin vínculo con este sistema — buenos candidatos para practicar "genérico" e "irrelevante"/"falso" respectivamente.)*

## Drivers arquitectónicos priorizados

1. **Seguridad** — es donde más riesgos validados cayeron (R1: fuga de `service_role`; R4: 31 políticas RLS sin auditar). La tabla `stakeholders` agregada esta semana suma RLS nuevo que también habrá que revisar. El sistema maneja datos comerciales de terceros: es lo que más expone al negocio si falla.
2. **Disponibilidad** — R3 (un solo integrante con acceso admin a Supabase) ya se vivió en la práctica esta semana al conseguir las claves; R5 (límites del plan free) es una restricción económica real, no hipotética.
3. **Mantenibilidad** — R2 era el riesgo más concreto (cero tests). Ya no está en cero — 12 tests de `src/lib` corriendo en Docker (PR `add-vitest-docker-tests`) — pero sigue en tercer lugar porque todavía no cubre `crm.ts` ni componentes.
4. **Rendimiento** — el tablero Kanban y los reportes hacen consultas agregadas que podrían degradarse con volumen, pero sin evidencia todavía: la medición real recién es la semana 4.
5. **Usabilidad** — uso diario por equipos comerciales, fricción tiene costo operativo directo, pero no es lo que esta evaluación de arquitectura mide este ciclo.
