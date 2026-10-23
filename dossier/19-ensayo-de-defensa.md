# 19 — Ensayo de defensa: las preguntas que duelen

> **Qué es esto y qué no.** `17-preparacion-defensa.md` reúne las preguntas esperables con su respuesta respaldada. Este documento es lo otro: **las repreguntas**, las que llegan después de que uno ya contestó bien.
>
> Está armado a partir de un ensayo real con las debilidades que salieron de auditar el dossier contra el código, no de preguntas inventadas.
>
> **Ninguna respuesta de acá se memoriza.** Se practican en voz alta hasta que salga el reflejo de citar la evidencia. Una respuesta recitada se cae en la segunda repregunta, que es exactamente lo que la rúbrica mide.

## Las tres reglas que salieron del ensayo

**1. Nombrá el límite antes de que te lo nombren.**
Cuando uno declara la limitación, es riguroso. Cuando se la encuentran, es descuidado. El dato es el mismo. Este dossier tiene casi todos sus límites declarados por escrito — hay que saberlos de memoria y decirlos primero.

**2. Una acusación de proceso no se responde con una afirmación: se responde con un commit, una fecha o un archivo.**
"No seguimos a la IA" es exactamente lo que diría alguien que la siguió. "El plan se commiteó antes de medir, commit `e348616`" no se discute.

**3. Decir qué medirías es lo que separa "aceptable" de "sobresaliente".**
Casi nadie lo dice, porque exige admitir que no se sabe algo. Es justo lo que la rúbrica pide ante una restricción nueva.

---

## Pregunta 1 — El número que no mide lo que parece

> *"Dicen que el p95 es de 64 ms contra un umbral de 2.000. ¿Cuánto tarda el tablero en cargar para un vendedor, un martes a las nueve, desde la oficina?"*

**Por qué duele:** la medición es de la API REST en localhost con 5 usuarios virtuales. No dice nada del tiempo que percibe una persona.

**Respuesta débil:** *"No lo sabemos, solo medimos la API."* — Honesta, pero deja la puerta abierta a *"¿y entonces por qué lo presentan como evidencia de rendimiento?"*.

**Estructura de la respuesta fuerte:**

1. Nombrar el límite primero, citando el documento propio: `condiciones.md` dice textual que es *"un piso, no el número final que vería un usuario"*.
2. Decir qué **sí** demuestra la medición: que el costo de la consulta con RLS aplicado no es el cuello de botella.
3. Cerrar ubicando dónde estaría el problema si existiera: render o red, no base de datos.

**Evidencia a tener a mano:** `experimentos/EXP-001-linea-base/condiciones.md`, sección *"Qué invalidaría esta medición"*.

---

## Pregunta 2 — La más peligrosa: ¿copiaron a la IA?

> *"Su documentación dice que la IA les propuso un monolito modular con partición por dominio. Y eso es exactamente lo que construyeron. ¿En qué se diferencia esto de haber copiado la recomendación?"*

**Por qué duele:** el resultado final coincide con la propuesta de septiembre. Visto desde afuera, parece obediencia.

**Respuesta débil:** *"No la seguimos, llegamos ahí por el spike."* — Es la conclusión sin la prueba, y es literalmente lo que diría alguien que sí la siguió.

**Los cuatro hechos que lo prueban, todos verificables:**

| Hecho | Dónde está |
|---|---|
| El plan del spike se commiteó **antes** del código y de medir | commit `e348616` |
| La decisión cita el spike, **no** la propuesta de la IA | `ADR-007` |
| Pasaron **dos meses** entre una cosa y la otra | septiembre → 16-17/10/2026 |
| La propuesta de la IA **nunca se auditó**; sigue sin clasificar | issue #29, abierto |

**El argumento más fuerte es el último, y es contraintuitivo:** que la auditoría siga sin completar prueba que no se usó la propuesta. Un equipo que copia a la IA no deja su recomendación sin clasificar durante dos meses — la valida primero, para respaldarse.

**Cómo cerrar sin sobreactuar:** no decir que la IA se equivocó ni que tenía razón. Decir que dos caminos independientes llegaron a la misma estructura, y que el del equipo tiene un experimento detrás.

---

## Pregunta 3 — La restricción inyectada en vivo

> *"Entra en vigencia una norma que prohíbe que datos de clientes distintos compartan la misma instancia física de base de datos. Supabase, como lo tienen, deja de ser viable. ¿Qué sobrevive, qué se cae, y qué medirían antes de comprometerse?"*

**Por qué duele:** el aislamiento actual es **por fila** —`can_access_owner(owner_id)` con `auth.uid()`— dentro de una sola instancia. La norma ataca exactamente eso.

La respuesta tiene **tres partes y van en este orden**. Saltarse la tercera es lo que deja la nota en "aceptable".

### Qué sobrevive

| Qué | Por qué |
|---|---|
| El esquema como código | 5 migraciones versionadas. **Ya probado:** EXP-003 lo reconstruyó en una instancia desechable con conteos coincidentes |
| La estructura en capas y por dominio | Los módulos no saben dónde vive la base; todo pasa por `src/integrations/supabase/` |
| La gobernanza | Fitness functions, CI y prueba de aislamiento son portables |

### Qué se cae

- **El ADR-003 de frente.** El aislamiento deja de ser por fila y pasa a ser físico.
- **El ADR-002.** Supabase da un proyecto = una base; una base por cliente significa N proyectos o auto-hospedarse.
- **El ADR-004 sobrevive pero gana un problema:** sigue siendo una app, pero ahora decide a qué base conectarse en cada request.
- **Las mediciones.** EXP-001 y EXP-002 midieron una instancia con caché caliente: no predicen nada sobre N instancias.

> **Matiz que conviene tener listo**, porque el comité va a objetar que el esquema "sobrevive a medias": RLS **no desaparece, cambia de rol**. De frontera de aislamiento pasa a segunda capa, y sigue haciendo falta para separar usuarios *dentro* de un mismo cliente.

### Qué medirían antes de comprometerse

1. **Costo de aprovisionar un cliente nuevo**: crear la base y aplicarle las 5 migraciones. El método ya existe — EXP-003 cronometró una restauración.
2. **Límite de conexiones**: a cuántas instancias se rompe el plan.
3. **Propagación de migraciones**: qué pasa si una de N falla a mitad.
4. **Dónde queda la identidad**: ¿un GoTrue central con datos separados, o se parte también la autenticación? Es una bifurcación real.

**El cierre no es proponer una solución.** Es decir que no se comprometen sin medir los puntos 1 y 2, porque hoy no hay dato de ninguno.

---

## Pregunta 4 — Los ADR sin alternativas

> *"Su ADR-001 dice: 'No se proporcionó una alternativa considerada de forma histórica'. Lo mismo el 002, el 003 y el 004. Cuatro decisiones, cero alternativas. Si nunca compararon contra nada, ¿en qué sentido esto es una decisión y no una descripción de lo que les quedó?"*

**Por qué duele:** el hecho es cierto y negarlo hunde la defensa.

**La respuesta tiene cuatro movimientos, en este orden:**

**1. Conceder el hecho.** Esos cuatro no documentan decisiones tomadas en una bifurcación: documentan estructura que ya existía. Llamarlas decisiones con alternativas inventadas sería mentir sobre el propio proceso.

**2. Mostrar que el equipo sí sabe hacerlo cuando corresponde.** El `ADR-005` tiene tres alternativas evaluadas; el `ADR-006`, otras tres. Ahí hubo bifurcación real y un spike que la resolvió. La diferencia no es de rigor: es que en un caso había decisión y en el otro no.

**3. Nombrar por qué no se inventaron.** Se podrían haber agregado alternativas retroactivas y nadie lo habría notado. Está escrito en los cuatro documentos que no las hubo. Es lo contrario del antipatrón que la propia cátedra llama *propaganda de marketing*.

**4. Cerrar con lo que vale más que una alternativa hipotética.** La regla del `ADR-001` hoy se verifica en cada PR: si alguien rompe la separación en capas, falla el CI. Una decisión que se hace cumplir sola pesa más que una bien argumentada.

### La repregunta que viene después

> *"¿Y por qué documentaron como ADR algo que no fue una decisión?"*

**Respuesta:** porque esas estructuras condicionan todo lo que viene después. Cuando en el Módulo 6 se decidió particionar por dominio, lo primero fue verificar si contradecía el estilo en capas o el monolito — y el `ADR-007` lo dice explícitamente. Un ADR que registra el punto de partida es lo que permite que el siguiente sea una decisión informada y no una preferencia.

**Y después, la concesión acotada:** el estado de los cuatro dice *"Confirmado"*, y sería más preciso *"Vigente"* o *"Registrado"*. Confirmado sugiere una deliberación que no ocurrió.

> Conceder un punto **específico y menor**, después de haber defendido el fondo, demuestra dominio del propio trabajo y corta la búsqueda de errores.

---

## Lo que el ensayo dejó en evidencia

El patrón de error no fue de contenido. Fue siempre el mismo:

| Lo que salió bien | Lo que faltó |
|---|---|
| Las respuestas eran verdaderas | No venían con el commit, el archivo o la fecha |
| Se identificaba lo importante | Se quedaban en la primera capa; la segunda la ponía el comité |
| Había honestidad sobre los límites | Se esperaba a que los sacara el comité en vez de nombrarlos primero |

**La evidencia ya está en el repositorio.** Lo que falta es el reflejo de citarla, y eso solo se entrena repitiendo en voz alta.

## Huecos reales que conviene reconocer antes de que los encuentren

- Los ADR 001 a 004 **no tienen costo en horas ni reversibilidad**. Es medible hoy y no se hizo.
- Las **40 políticas RLS sobre 14 tablas** nunca se auditaron una por una, y Seguridad es el driver #1.
- La **Matriz de Control EDAV sigue sin clasificar** (issue #29).
- El **riesgo R3 no está cerrado**: se mitigó para Supabase y reapareció con Vercel el 23/10, cuando no se pudo leer el log de build porque la cuenta la administra un solo integrante.
