# Material nuevo del módulo 6 y trazabilidad

Revisado en Chrome/AVATA el 17/10/2026. La presentación central y el glosario se
leyeron, además de las tres imágenes originales y seis nuevas imágenes de
«El espejismo de la ciudad fragmentada». Se descargaron y extrajeron los PDF
central (25 páginas) y guía previa. La analogía metropolitana se leyó en Gamma.
Las descargas de LogiFast, Hype-Driven Development y el PDF de la analogía no
pudieron completarse: no se atribuye a esos tres archivos una lectura realizada.

Fuentes del curso:

- [Presentación central](https://aulasvirtuales.utadeo.edu.co/mod/page/view.php?id=2607751).
- [Glosario](https://aulasvirtuales.utadeo.edu.co/mod/page/view.php?id=2607750).
- [Analogía metropolitana](https://aulasvirtuales.utadeo.edu.co/mod/page/view.php?id=2607753), modificada el 16/10 a las 19:50.
- [Ciudad fragmentada](https://aulasvirtuales.utadeo.edu.co/mod/page/view.php?id=2607860), modificada el 16/10 a las 19:55.
- [Carpeta de presentaciones](https://aulasvirtuales.utadeo.edu.co/mod/folder/view.php?id=2607940).

## Lo que cambia respecto del análisis inicial

| Requisito ampliado                                                             | Entrega                                                                                                  |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Apuesta previa sobre componente y escalón                                      | `docs/apuesta-crecimiento-S11.md`, commit e2dc488 anterior a mediciones                                  |
| Crecimiento real en 50/100/150/200 VUs, 3 corridas y descarte de calentamiento | `npm run docker:growth`, además de base 5 VUs para 10×                                                   |
| p95, degradación, punto de quiebre y distinguir límite del instrumento         | JSON nativo, recursos, gráficas e interpretación en `experimentos/crecimiento-S11/`                      |
| Matrices de fallos/resiliencia                                                 | `docs/resilience_matrix.md`                                                                              |
| Propiedad de persistencia protegida automáticamente                            | `src/modules/*/api.ts`, `src/architecture/persistence-fitness.test.ts`; ArchUnitTS adaptado a TypeScript |
| Distribución y costo: infraestructura, operación y coordinación/Conway         | Dossier 07 y ADR 0004; supuestos separados de mediciones                                                 |
| Crítica de propuesta IA con EDAV 2                                             | Log EDAV, clasificación técnica propuesta; revisión humana pendiente                                     |
| Defensa individual de 7–10 minutos                                             | `docs/defensa-modulo-6.md`, guion de 9 minutos                                                           |
| Comité, participación, PR y merge en main                                      | Pendientes de equipo; el usuario indicó subir la rama sin abrir PR ni mezclar en main                    |

La duración de la carga se adapta a mesetas de 30 s, en vez del ejemplo docente
con rampas de minutos. Se conserva el alcance de concurrencia y se declara el
límite temporal. El generador usa HTTP contra la ruta real de Supabase; no prueba
renderizado del navegador ni promete capacidad de producción.

## Transferencia de las seis imágenes a NEXUS

1. Llamada local: organizar módulos dentro de una aplicación reduce coordinación
   de despliegue. NEXUS ya tiene red hacia Supabase; no confundirlo con memoria compartida.
2. Fragmentación prematura: extraer Ventas y Seguimiento añade contratos y saltos.
   No elimina automáticamente sus dependencias ni las claves foráneas.
3. Ventanillas/colas: demora y timeouts pueden indicar contención; las cifras de
   la fábula no son mediciones del CRM ni identifican nuestro pool como causa.
4. Barreras/compartimentos: el breaker implementado reduce intentos; bulkheads
   siguen siendo una alternativa por medir. No equivalen a reparar la dependencia.
5. Costo/datos: servicios nuevos exigen observación, migración, consistencia y
   coordinación; el TCO debe incluir personas además de infraestructura.
6. Decisión: mantener simplicidad mientras la demanda y la organización no
   justifiquen extracción, con hipótesis falsables y condición explícita de revisión.
