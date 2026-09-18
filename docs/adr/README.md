# Registros de Decisión Arquitectónica (ADR)

Evidencias 1 y 2 del Mini-comité Técnico 1 (Módulo 4, semanas 7-8).

| ADR | Decisión | Estado | Veredicto del comité |
|---|---|---|---|
| [0001](0001-decision-estilo.md) | Estilo arquitectónico | Borrador | Pendiente |
| [0002](0002-aislamiento-persistencia.md) | Frontera entre dominio y persistencia | Borrador · depende de 0001 | Pendiente |

## Estructura obligatoria de cada ADR

1. Contexto y drivers — con los datos empíricos de la Semana 4
2. Alternativas consideradas — mínimo dos, con punto de sensibilidad ATAM
3. Decisión — en voz activa: *"Nosotros implementaremos…"*
4. Consecuencias y trade-offs — atributos ISO/IEC 25010 favorecidos **y degradados**, costo de reversibilidad en horas
5. Supuestos y condición de revisión — con la métrica exacta que obliga a reabrir el ADR
6. Mecanismo de gobernanza — regla automatizada en CI, con la ruta del test de control
7. Veredicto del comité — Confirmed, Adjusted o Reconsidered

## Qué está precargado y qué no

Los datos que ya existían (mediciones, drivers, restricciones, hechos verificables del código) están cargados en la sección 1 de cada ADR. **Las alternativas, la decisión, los trade-offs y el título son del equipo** y están marcados `[COMPLETAR]`.
