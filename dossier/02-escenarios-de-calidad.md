# 02 — Escenarios de calidad

> Ver `LOG-EDAV-auditoria-ia.md` para la trazabilidad de qué contenido de este archivo fue delegado a IA (paso D) y cuál es su estado de auditoría (paso A) — todavía **no completado** con la matriz formal Válido/Modificado/Genérico/Falso.

## 1. Atributos de calidad considerados

Seguridad, Disponibilidad, Mantenibilidad, Rendimiento, Usabilidad, Escalabilidad — el set estándar de ISO/IEC 25010 usado por la cátedra.

## 2. Relación con stakeholders/contexto

Ver `01-contexto-y-drivers.md` (secciones 3-4). Seguridad y Disponibilidad se derivan directamente de las restricciones organizacionales/económicas ya documentadas (punto único de administración de Supabase, plan free). Mantenibilidad se deriva de un incidente real: la pérdida del frontend original del equipo.

## 3. Priorización realizada por el equipo

`PENDIENTE DE AUDITORÍA EDAV FORMAL.` La priorización actual (Seguridad y Disponibilidad = Alta; Mantenibilidad = Media; Rendimiento = Media; Usabilidad = Media-Baja; Escalabilidad = Baja) fue propuesta por IA y confirmada de forma rápida, no con el ciclo completo. Detalle y justificación original en `LOG-EDAV-auditoria-ia.md`.

## 4. Trade-offs identificados

- **Seguridad (RLS) vs. Rendimiento:** cada política RLS de `can_access_owner()` ejecuta una subconsulta contra `profiles`/`team_member_ids` por fila evaluada. Más aislamiento de datos entre usuarios implica más costo de cómputo por consulta — no medido todavía, es una tensión estructural del diseño actual, verificable revisando `supabase/migrations/`.
- **Disponibilidad/Rendimiento vs. Costo operativo:** pasar del plan free de Supabase a un plan pago con más conexiones/réplicas de lectura mejoraría ambos atributos, pero tiene costo mensual directo — restricción económica ya documentada en `01-contexto-y-drivers.md`.

## 5. Escenarios de calidad

Estructura SEI de 6 partes. Los 6 escenarios completos (fuente, estímulo, artefacto, entorno, respuesta, medida de respuesta) están en el histórico de este dossier — **pendientes de re-auditar con el ciclo EDAV formal antes de darlos por definitivos**:

1. Seguridad — aislamiento entre organizaciones vía RLS.
2. Disponibilidad — caída del proveedor externo (Supabase).
3. Rendimiento — carga del tablero Kanban de pipeline.
4. Mantenibilidad — agregar un campo sin romper tests existentes.
5. Usabilidad — un vendedor nuevo crea su primera oportunidad sin ayuda.
6. Escalabilidad — crecimiento a 5.000 contactos / 1.000 oportunidades.

## 6. Escenario seleccionado para semana 4

**Escenario 3 (Rendimiento).** No es una elección arquitectónica del equipo todavía — es el único de los 6 para el que ya existe instrumento de medición preparado (script k6 en `experimentos/EXP-001-linea-base/`). Los escenarios 1 y 2 requieren pruebas de otro tipo (automatizadas de seguridad, simulación de caída de proveedor); 4 se mide con `npm test`, no con k6; 5 requiere prueba de usuario real; 6 requiere un dataset que no existe todavía. **El equipo debe confirmar si este es efectivamente el escenario prioritario a medir.**

## 7. Métrica y umbral previamente definidos

`PROPUESTO POR IA, NO AUDITADO FORMALMENTE:` p95 de latencia < 2000 ms, con el tablero interactivo, medido contra `npm run preview` (build de producción), no contra `npm run dev`.

## 8. Características necesarias de la semilla

**Decidido por el equipo (25/08/2026):**

- Volumen: 20 `companies`, 800 `contacts`, 1.000 `deals`.
- Entidades calientes (20%): las ~200 oportunidades en las etapas activas "Negociación" y "Propuesta enviada" del pipeline por defecto — son las que un vendedor revisa obsesivamente porque están cerca de cerrarse.
- Las 800 oportunidades restantes se distribuyen entre las otras 5 etapas (Prospecto, Contacto inicial, Calificado, Ganado, Perdido).
- Semilla 80/20 aplicada como: 80% de las peticiones de k6 consultan las etapas calientes; 20% consultan el tablero completo sin filtrar.
- Volumen menor al de referencia de la cátedra (50.000-100.000) a propósito: mide uso normal de un CRM chico en etapa académica, no un escenario de estrés — eso se reserva para el Escenario 6 (Escalabilidad), que ya usa 5.000/1.000 como volumen de stress test.

## 9. Instrumento previsto

- **k6** — mismo instrumento que usa la cátedra, aplica igual (no depende del stack del backend).
- **`pg_stat_statements`** (extensión de PostgreSQL) — aplica igual porque Supabase corre PostgreSQL real.
- **Spring Boot Actuator NO aplica** — el sistema es TanStack Start/Node, no Spring/Java. Esta es una sustitución técnica obligatoria, no una decisión de arquitectura: no hay equivalente directo instalado todavía: **pendiente que el equipo decida si instrumenta algo propio o mide únicamente desde k6 + `pg_stat_statements`**.

## 10. Relación con la hipótesis previa

La hipótesis pre-registrada en `01-contexto-y-drivers.md` (punto 8) es la que este escenario busca contrastar en `04-evidencia-ejecutable.md`. Todavía no hay medición real ejecutada.
