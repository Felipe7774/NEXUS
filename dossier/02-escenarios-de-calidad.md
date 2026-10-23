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

Estructura SEI de 6 partes (Bass, Clements &amp; Kazman): **fuente del estímulo, estímulo, artefacto, entorno, respuesta y medida de la respuesta.**

> **Nota de restauración (22/10/2026).** Hasta hoy esta sección contenía solo una lista de seis títulos y remitía al historial de Git. Los seis escenarios completos se restauran abajo **transcritos verbatim de como el equipo los redactó en la semana 3** (archivo `03-atributos-calidad.md`, previo a la reestructuración del commit `27668e2`). No se corrigen sus cifras ni su estado: lo que cambió después se registra aparte, al final de la sección, para no alterar el texto original.
>
> Los primeros 3 fueron propuestos por IA y reformulados por el equipo para que la medida de respuesta fuera concreta y no un placeholder. Los 3 siguientes son RNF definidos para Nexo CRM en ese mismo ciclo, derivados del esquema y el código real.

### Escenario 1 — Seguridad (aislamiento entre organizaciones)

- **Fuente:** un usuario autenticado del CRM.
- **Estímulo:** intenta leer, vía la API de Supabase, contactos que pertenecen a otra organización/usuario.
- **Artefacto:** capa de datos (PostgreSQL + políticas RLS).
- **Entorno:** operación normal.
- **Respuesta:** la política RLS bloquea la consulta; no se devuelve ninguna fila ajena.
- **Medida de respuesta:** 0 filas ajenas devueltas en el 100% de los intentos, verificado con una prueba automatizada sobre las 11+ tablas con RLS, corrida en cada PR (no manual).

### Escenario 2 — Disponibilidad (caída del proveedor)

- **Fuente:** Supabase (proveedor externo).
- **Estímulo:** degradación o corte del servicio.
- **Artefacto:** la aplicación completa (frontend + server functions).
- **Entorno:** producción, horario laboral.
- **Respuesta:** la app muestra un estado de error identificable en vez de una pantalla en blanco o un crash silencioso.
- **Medida de respuesta:** el usuario ve un mensaje de error identificable en ≤3 segundos desde el fallo del proveedor, sin pantalla en blanco.

### Escenario 3 — Rendimiento (carga del pipeline)

- **Fuente:** usuario comercial.
- **Estímulo:** abre el tablero Kanban de pipeline con oportunidades cargadas.
- **Artefacto:** vista de pipeline (React Query + consulta a Supabase).
- **Entorno:** carga normal, conexión de oficina.
- **Respuesta:** el tablero termina de renderizarse e interactivo.
- **Medida de respuesta:** con 200 oportunidades cargadas, el tablero queda interactivo en ≤2 segundos, medido contra el build de producción (`npm run preview`), no contra `npm run dev`. Se contrasta con el dato real en la semana 4.

### Escenario 4 — Mantenibilidad (agregar un campo sin romper nada)

- **Fuente:** desarrollador del equipo.
- **Estímulo:** necesita agregar un campo nuevo a una tabla existente (como se hizo esta semana con los campos de salud de cuenta en `companies`).
- **Artefacto:** migración de base de datos + suite de tests.
- **Entorno:** desarrollo, antes de mergear a `main`.
- **Respuesta:** el cambio se implementa y el suite de tests corre sin fallos antes del merge.
- **Medida de respuesta:** `npm test` pasa al 100% antes de cada merge a `main`, y el cambio completo (migración + validación) toma menos de 1 día-persona.

### Escenario 5 — Usabilidad (primer uso sin capacitación)

- **Fuente:** un vendedor nuevo (rol `vendedor`, recién dado de alta en el sistema).
- **Estímulo:** necesita cargar su primera oportunidad comercial sin ayuda de un compañero.
- **Artefacto:** formulario de creación de oportunidad (pipeline).
- **Entorno:** primer uso, sin capacitación formal previa.
- **Respuesta:** logra crear la oportunidad completando el formulario por su cuenta.
- **Medida de respuesta:** lo logra en menos de 5 minutos desde el primer login, sin pedir ayuda — a validar con una prueba de usuario real, todavía no ejecutada.

### Escenario 6 — Escalabilidad (crecimiento de datos)

- **Fuente:** crecimiento normal del negocio.
- **Estímulo:** la base de una empresa crece a 5.000 contactos y 1.000 oportunidades.
- **Artefacto:** vistas de listado de `contacts` y `deals`.
- **Entorno:** uso normal, sin cambios de infraestructura.
- **Respuesta:** las vistas de listado siguen respondiendo sin degradación perceptible.
- **Medida de respuesta:** tiempo de respuesta del listado ≤2 segundos con ese volumen — a medir cuando exista un dataset de ese tamaño (no aplica todavía con datos reales).

### Estado de cada escenario al 22/10/2026

Lo que se midió después de redactarlos. El texto de arriba no se modificó.

| # | Umbral redactado en la semana 3 | Resultado real | Dónde |
|---|---|---|---|
| 1 | 0 filas ajenas en el 100% de los intentos | Cumplido; la prueba corre en cada PR | `rls-isolation.integration.test.ts` |
| 2 | ≤3 s para ver el error | 2,1 s medidos | Log EDAV, Escenario 2 |
| 3 | ≤2 s con 200 oportunidades | p95 = 92,62 ms | `experimentos/EXP-001-linea-base/` |
| 4 | Tests al 100% antes de cada merge | Cumplido; branch protection probada bloqueando un merge real | Log EDAV, Escenario 4 |
| 5 | <5 min sin pedir ayuda | 3 min 28 s, con una persona real | Log EDAV, Escenario 5 |
| 6 | ≤2 s con 5.000/1.000 | p95 = 127,16 ms | `experimentos/EXP-002-escalabilidad/` |

### Cifras del texto original que envejecieron

Se dejan a la vista en lugar de corregirlas dentro del texto de la semana 3:

- El Escenario 1 dice *"las 11+ tablas con RLS"*. Al 22/10/2026 son **14 tablas y 40 políticas**, contadas sobre `supabase/migrations/`.
- Los Escenarios 5 y 6 dicen *"todavía no ejecutada"* y *"no aplica todavía"*. **Ambos se ejecutaron en la semana 4**, con los resultados de la tabla anterior.

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
