# 00 — Índice de equivalencias con la estructura del curso

> **Para qué sirve.** La lámina del Módulo 8 pide una estructura de **17 archivos, del `00` al `16`**. Los nombres de este dossier no coinciden con esa lista. Esta tabla dice **dónde está cada cosa**, para que nadie concluya que falta algo que existe con otro nombre.
>
> No se renombraron los archivos a propósito: hay **165 referencias cruzadas dentro del dossier y 27 en mensajes de commit**, y el historial de Git es inmutable. Es el mismo criterio con el que se decidió no renumerar los ADR en el PR #38.

## Mapa completo

| Archivo que pide el curso | Contenido pedido | Dónde está en este dossier |
|---|---|---|
| `00-README.md` | Visión y navegación | [`README.md`](README.md) + este índice |
| `01-contexto.md` | Problema, stakeholders, drivers y restricciones | [`01-contexto-y-drivers.md`](01-contexto-y-drivers.md) |
| `02-atributos-y-escenarios.md` | Atributos y escenarios de calidad | [`02-escenarios-de-calidad.md`](02-escenarios-de-calidad.md) |
| `03-mediciones.md` | Línea base y mediciones | [`03-mediciones.md`](03-mediciones.md) — **mismo nombre** |
| `04-arquitectura-as-is.md` | C4 actual | [`modeloc4-nivel.md`](modeloc4-nivel.md) |
| `05-estilos-y-adr12.md` | Comparación de estilos y ADR 1-2 | [`23-comparacion-de-estilos.md`](23-comparacion-de-estilos.md) + [`ADR-001`](adrs/ADR-001-estilo-en-capas.md) y [`ADR-002`](adrs/ADR-002-supabase-autenticacion-y-persistencia.md) |
| `06-dominio-e-integracion.md` | Contextos, contratos y Spike 1 | [`06-dominio-e-integracion.md`](06-dominio-e-integracion.md) — **mismo nombre** + [`contratos/`](contratos/) |
| `07-distribucion-y-resiliencia.md` | Experimento, distribución/resiliencia y ADR 3-4 | [`07-distribucion-y-resiliencia.md`](07-distribucion-y-resiliencia.md) — **mismo nombre** + [`ADR-005`](adrs/ADR-005-integracion-oportunidades-actividades.md) y [`ADR-006`](adrs/ADR-006-distribucion-y-resiliencia.md) |
| `08-seguridad.md` | Amenazas, controles y ADR 5 | [`21-seguridad-y-operacion.md`](21-seguridad-y-operacion.md) + [`24-matriz-stride.md`](24-matriz-stride.md) + [`ADR-008`](adrs/ADR-008-observabilidad-minima-y-operacion-compartida.md) |
| `09-despliegue.md` | Despliegue y costos | [`21-seguridad-y-operacion.md`](21-seguridad-y-operacion.md#7-despliegue-y-alternativas), sección 7 + [`EXP-004/tco-supuestos.json`](experimentos/EXP-004-resiliencia/tco-supuestos.json) |
| `10-observabilidad.md` | Métricas, logs, trazas y alertas | [`21-seguridad-y-operacion.md`](21-seguridad-y-operacion.md#6-plan-de-observabilidad), sección 6 + [`ADR-008`](adrs/ADR-008-observabilidad-minima-y-operacion-compartida.md) |
| `11-fitness-function.md` | Regla y resultados en CI | [`26-demostracion-fitness-function.md`](26-demostracion-fitness-function.md) |
| `12-matriz-trade-offs.md` | Valor, costo, riesgo e impacto | [`12-matriz-trade-offs.md`](12-matriz-trade-offs.md) — **mismo nombre** |
| `13-evaluacion-arquitectonica.md` | Evaluación integral | [`13-evaluacion-arquitectonica.md`](13-evaluacion-arquitectonica.md) — **mismo nombre** |
| `14-plan-evolucion.md` | Roadmap, riesgos y próximos experimentos | [`14-plan-evolucion.md`](14-plan-evolucion.md) — **mismo nombre** |
| `15-evidencia-ejecutable.md` | Índice de artefactos, datos y resultados | [`15-evidencia-ejecutable-consolidada.md`](15-evidencia-ejecutable-consolidada.md) |
| `16-declaracion-ia.md` | Uso crítico de IA | [`16-declaracion-uso-ia.md`](16-declaracion-uso-ia.md) + [`LOG-EDAV-auditoria-ia.md`](LOG-EDAV-auditoria-ia.md) |

**Siete de los diecisiete ya coinciden en nombre.** De los diez restantes, tres se arman combinando documentos —`05`, `08` y `09`— porque el equipo separó el material por módulo del curso y no por el índice final.

## Los tres que se arman combinando, y por qué

**`08-seguridad.md`.** Es el que más se puede perder de vista, porque está en tres lugares: el inventario de activos y controles verificados está en el `21`, el modelado de amenazas en el `24`, y la decisión en el `ADR-008`. Se separaron porque la matriz STRIDE es una hoja de trabajo extensa y mezclarla con el inventario habría hecho ilegibles las dos cosas.

**`09-despliegue.md`** y **`10-observabilidad.md`** son las secciones 7 y 6 del documento `21`. Viven ahí porque el Módulo 7 los pide como un solo entregable —seguridad, despliegue, observabilidad y operación— y partirlos habría roto la trazabilidad con esa lámina.

**`05-estilos-y-adr12.md`.** La comparación está en el `23` y las decisiones en sus ADR, por el criterio del equipo de que un ADR es un registro con identidad propia y no una sección de otro documento.

## Numeración de los ADR

Los números del curso y los del repositorio **no coinciden**, y hay una tabla de equivalencias en [`adrs/README.md`](adrs/README.md). El resumen:

| ADR del curso | ADR del repositorio |
|---|---|
| ADR 1 — estilo | [`ADR-001`](adrs/ADR-001-estilo-en-capas.md) |
| ADR 2 — persistencia | [`ADR-002`](adrs/ADR-002-supabase-autenticacion-y-persistencia.md) y [`ADR-003`](adrs/ADR-003-aislamiento-de-datos-con-rls.md) |
| ADR 3 — integración, módulo 5 | [`ADR-005`](adrs/ADR-005-integracion-oportunidades-actividades.md) |
| ADR 4 — distribución, módulo 6 | [`ADR-006`](adrs/ADR-006-distribucion-y-resiliencia.md) |
| ADR 5 — seguridad y operación, módulo 7 | [`ADR-008`](adrs/ADR-008-observabilidad-minima-y-operacion-compartida.md) |

Quedan dos ADR fuera de esa correspondencia porque el equipo los produjo sin que una lámina los pidiera: [`ADR-004`](adrs/ADR-004-arquitectura-monolitica.md), arquitectura monolítica, y [`ADR-007`](adrs/ADR-007-particion-por-dominio.md), partición por dominio.

## Documentos que el curso no pide y el dossier tiene

No sobran: cubren exigencias que las láminas plantean sin asignarles un archivo numerado.

| Documento | Por qué existe |
|---|---|
| [`17-preparacion-defensa.md`](17-preparacion-defensa.md) y [`19-ensayo-de-defensa.md`](19-ensayo-de-defensa.md) | La lámina pide presentación ejecutiva y defensa. El `19` recoge nueve repreguntas ensayadas |
| [`18-...-carlos-correa.md`](18-evidencia-participacion-carlos-correa.md) y [`20-...-santiago-roman.md`](20-evidencia-participacion-santiago-roman.md) | Contribución individual, que la rúbrica evalúa |
| [`22-cqrs-y-consistencia-eventual.md`](22-cqrs-y-consistencia-eventual.md) | Ítem de la semana 10 que ningún archivo de la estructura final recoge |
| [`25-acta-mini-comite-2.md`](25-acta-mini-comite-2.md) | El veredicto del comité que exige el ADR 4 |
| [`runbooks/RB-001-...`](runbooks/RB-001-perdida-del-proyecto-supabase.md) | El Módulo 7 pide runbooks críticos |
| [`PENDIENTES-DE-DECISION.md`](PENDIENTES-DE-DECISION.md) | Reúne lo que falta decidir, con su evidencia al lado |

## Cómo verificar que esta tabla no miente

```bash
# Todo archivo enlazado desde este índice existe
grep -o '](\([^)]*\.md\))' dossier/00-INDICE-EQUIVALENCIAS.md | sed 's/](//;s/)//' | while read f; do [ -e "dossier/$f" ] || echo "ROTO: $f"; done
```

Sin salida significa que las diecisiete filas resuelven.
