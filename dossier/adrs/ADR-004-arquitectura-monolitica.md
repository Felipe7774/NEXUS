# ADR-004 — Arquitectura monolítica

## Estado

**Confirmado.** El equipo confirma una arquitectura monolítica para la aplicación de Nexus.

## Contexto

El frontend, la lógica de servidor disponible en TanStack Start/Nitro y las integraciones de Supabase se mantienen dentro del mismo repositorio y unidad de despliegue. No existe un backend independiente desplegado como servicio propio.

## Decisión del equipo

El CRM mantiene una arquitectura monolítica: una única aplicación contiene la presentación, las operaciones de servidor y las integraciones con Supabase.

## Alternativas consideradas

No se proporcionó una alternativa considerada de forma histórica. La siguiente comparación es una **evaluación retrospectiva** aprobada el 29/10/2026; no se presenta como parte de la decisión original.

| Alternativa retrospectiva | Evaluación actual |
|---|---|
| Frontend y backend como servicios independientes | No se adopta. Dividir TanStack Start/Nitro y Supabase agregaría despliegues, contratos y observabilidad sin evidencia de que hagan falta. |
| Microservicios por dominio | No se adopta. El equipo es pequeño, el alcance es académico y no existe una necesidad demostrada de despliegue o escalamiento independiente. |

### Costo y reversibilidad

El costo verificable actual es una sola aplicación para desarrollo, pruebas y despliegue. El repositorio no registra el costo histórico de elegir este estilo, por lo que el ADR no declara horas ni ahorro económico como hechos.

Extraer un módulo exigiría definir contratos remotos, autenticación entre servicios, despliegue independiente, observabilidad y adaptar composición e integración. Es reversible, pero de costo alto y mayor riesgo operativo.

## Consecuencias y trade-offs

- La unidad de desarrollo, pruebas y despliegue se mantiene concentrada en un solo repositorio y aplicación.
- La organización en capas aplica dentro de esa unidad monolítica; ambos ADRs no se contradicen.
- No hay evidencia que demuestre que esta decisión escale mejor o peor que una arquitectura distribuida para este sistema.
- Si el contexto del sistema cambia, el equipo debe evaluar con nueva evidencia si la unidad actual continúa siendo suficiente.

### Evaluación aprobada por el equipo

| Valor | Costo | Riesgo residual | Impacto en calidad | Veredicto |
|---|---|---|---|---|
| 🟢 | 🟢 | 🟡 | 🟢 | Confirmada |

El equipo justifica esta evaluación porque la solución reduce complejidad operacional, es adecuada para el tamaño actual del equipo y evita el costo de microservicios. La escalabilidad futura conserva un riesgo moderado que no se presenta como evidencia ya demostrada.

## Evidencia y trazabilidad

- `src/routes/`
- `src/lib/`
- `src/integrations/supabase/`
- `vite.config.ts`
- `README.md`, secciones Arquitectura y Despliegue
- `dossier/01-contexto-y-drivers.md`, sección 1

## Supuestos y seguimiento

La decisión se sostiene para el alcance actual del CRM. El ADR se reabre si un módulo necesita desplegarse de forma independiente o una prueba reproducible demuestra un cuello de botella que no puede resolverse dentro del monolito. Las necesidades futuras de despliegue, integración o escalamiento deben evaluarse antes de introducir servicios separados.
