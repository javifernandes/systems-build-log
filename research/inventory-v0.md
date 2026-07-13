# Inventario de exploracion de sistemas - v0

Fecha de corte: 2026-07-12.

Este documento junta evidencia local y remota para prototipar un sitio/diario visual sobre lo construido desde enero de 2026. La funcion del sitio no seria reemplazar los proyectos, sino actuar como mapa narrativo y log publico: mostrar el hilo conductor, la escala, la calidad profesional y el modo de trabajo con IA.

## Tesis provisoria

Desde enero de 2026, Javier viene usando IA como medio de construccion, investigacion y arquitectura para resolver problemas reales: estudiar, leer, escribir, publicar, recibir feedback, operar sistemas y organizar planes vivos.

La historia no es "hice varias apps con IA". Es:

1. necesidades personales concretas producen herramientas situadas;
2. esas herramientas revelan problemas comunes de lectura, aprendizaje y colaboracion;
3. BookOps aparece como infraestructura para publicar y observar libros vivos;
4. Ontahi aparece como lenguaje/framework para abstraer entidades, operaciones, runtimes y datos;
5. Atlas aparece como meta-herramienta para mapear la evolucion de planes, evidencia y sistemas.

## Resumen verificable

| Artefacto | Fuente | Rango observado | Actividad | Senal principal |
| --- | --- | ---: | ---: | --- |
| The Mechanics of Thoughts | local git | 2026-01-28 -> 2026-05-24 | 29 commits | Libro LaTeX sobre fundamentos de programacion; origen de BookOps. |
| BookOps | local git | 2026-02-16 -> 2026-07-11 | 380 commits | Sistema de publicacion/feedback, lector, extractor, dashboards, Ontahi, Atlas. |
| UBA Psi Scheduler | local git | 2026-03-06 -> 2026-03-28 | 80 commits | Scheduler visual para inscripcion, cupos, conflictos, sedes, analytics y tour. |
| Shiki Wollok | local git | 2026-05-22 | 2 commits | Plugin de lenguaje Wollok para Shiki. |
| Psicoanalisis Freud/Laznik | local git | 2026-05-23 -> 2026-05-30 | 13 commits | Libro de estudio publicado en BookOps, con Mermaid y estructura conceptual. |
| Ontahi Book of Style | local git | 2026-06-29 -> 2026-07-09 | 10 commits | Spec visual/UX de Ontahi y libro que se lee con sus propios principios. |
| Ontahi Library / Living Systems | local git | 2026-07-06 -> 2026-07-09 | 12 commits | Ensayo/documentacion filosofica sobre sistemas, arquitectura y organismos. |
| Freud lectura 2do parcial | local git | 2026-07-04 -> 2026-07-05 | 8 commits | App GH Pages para progreso de 49 lecturas, guias, apuntes y bloques repetidos. |
| Neurofisiologia MCQ | capturas + Drive | ultima carga visible 2026-06-15 | 303 preguntas / 31 temas / 16 fuentes | Simulador de examen multiple choice con banco JSON, progreso local y administracion separada. |
| Atlas | dentro de BookOps | visible 2026-07-10 -> 2026-07-11 | 75 items Atlas actuales | Mapa semantico markdown-first de workstreams, planes, evidencia y formas. |

## Volumen observado

| Repositorio | Archivos trackeados | Lineas textuales aprox. | Meses activos 2026 |
| --- | ---: | ---: | --- |
| bookops | 1626 | 247108 | Feb, Mar, Abr, May, Jun, Jul |
| uba-psi-scheduler | 197 | 22346 | Mar |
| progbook | 65 | 15212 | Ene, Feb, May |
| psicoanalisis-freud-laznik | 40 | 8123 | May |
| manual-docentes-wollok | 13 | 1783 | Ene, Feb, Mar, May |
| ontahi-book-of-style | 82 | 1453 | Jun, Jul |
| ontahi-library | 14 | 1318 | Jul |
| shiki-lang-wollok | 7 | 146 | May |
| psicoanalisis-freud-laznik-lectura-2do-parcial | 14 | 5099 | Jul |

BookOps tiene ademas:

- 10 paquetes workspace;
- 8 workflows GitHub Actions;
- 157 archivos de planes;
- 107 planes en `done`;
- 6 planes en `current`;
- 12 libros JSON generados;
- 75 items en `atlas/items`.

## Linea temporal narrativa

### Enero

Arranca `progbook` el 2026-01-28 como libro LaTeX sobre fundamentos de programacion. Es el primer artefacto que empuja la necesidad de publicar, navegar y recibir feedback sobre un libro tecnico.

### Febrero

Arranca `bookops` el 2026-02-16. En sus primeras semanas aparecen extractor, persistencia Supabase, autenticacion, despliegue, workflows, feedback, multi-book, traduccion, Storybook, Codecov/Sonar y una disciplina de planes.

### Marzo

`uba-psi-scheduler` concentra un sprint del 2026-03-06 al 2026-03-28. La app resuelve una necesidad directa de inscripcion: visualizar oferta academica, agrupar bloques de materia, detectar conflictos, persistir elecciones, filtrar sedes/comisiones, mostrar cupos y analizar evolucion de vacantes. Stack observado: Next, Cloudflare/OpenNext, Convex, Clerk, PostHog, ECharts, Shepherd, Vitest/Playwright.

BookOps tambien madura en marzo: arquitectura web, hardening, CI, planes, editor/composer y procesos.

### Abril y Mayo

BookOps empieza a producir abstracciones: next-safe-actions, Effect, operaciones, entidades, data graph, caches, contratos, validacion, runtime server/client. `psicoanalisis-freud-laznik` aparece el 2026-05-23 como libro de estudio y empuja mejor soporte de Mermaid y libros Markdown. El plugin `shiki-lang-wollok` aparece el 2026-05-22 como pieza chica pero concreta para mostrar codigo Wollok bien.

### Junio

BookOps se abre a GitHub/Markdown books y workflows durables. Aparece el sync de planes a GitHub Project el 2026-06-28. Ontahi empieza a tomar forma como framework/lenguaje dentro del repo. El `ontahi-book-of-style` arranca el 2026-06-29.

### Julio

En una semana de presion de parcial aparece la app GH Pages de lectura Freud 2do parcial, creada el 2026-07-04 y con actividad hasta el 2026-07-05. El repo local tiene 49 lecturas estructuradas: 22 del Modulo 3 y 27 del Modulo 4, repartidas entre Teoricos, Seminarios y Practicos. Tambien tiene `docs/` con modelo de guias, auditoria de datos, roadmap y handoff. Al mismo tiempo, Ontahi se separa en paquetes (`ontahi-core`, `ontahi-supabase`, `ontahi-runtime-nextjs`, `ontahi-react`) y `ontahi-library` arranca el 2026-07-06.

Atlas aparece como forma explicita el 2026-07-10: "Workstream Atlas", mapa semantico markdown-first para proyectos, planes, evidencia, practicas y formas durables.

## Hitos internos de BookOps

| Fecha | Hito observado |
| --- | --- |
| 2026-02-16 | Primeros workflows de extraccion y sync. |
| 2026-02-26 | Book ownership, collaboration sharing. |
| 2026-02-28 | Coverage, Codecov, Dependabot, CodeQL, Storybook/LaTeX playground. |
| 2026-03-01 | Package de traduccion. |
| 2026-03-04 | Turborepo + Vercel remote caching. |
| 2026-04-01 | Next safe actions + schemas. |
| 2026-04-23 | Stream/workflows architecture. |
| 2026-05-03 | Typed entities/data graph. |
| 2026-05-31 | Data graph promovido/generalizado desde web hacia arquitectura. |
| 2026-06-04 | Task persistence expuesta via graph. |
| 2026-06-28 | Plans project sync workflow. |
| 2026-07-07 | Reader audio prototype bajo feature flag. |
| 2026-07-09 | Extraccion de paquetes Ontahi. |
| 2026-07-10 | Semantic Workstream Atlas. |

## Capa LLM / modo de produccion

Este bloque viene de relato del usuario y queda pendiente de cuantificar con registros externos si hiciera falta:

- comienzo con Claude pago;
- gasto incremental y tension costo/calidad;
- prueba de DeepSeek con mal resultado personal;
- pasaje a Codex con plan de USD 20;
- upgrade a plan de USD 100 por intensidad de uso;
- dedicacion estimada: 1 a 3 horas diarias en dias habiles, mas bloques de fin de semana;
- modo de trabajo: no "codigo artesanal linea por linea", sino direccion de arquitectura, revision intensiva, refactors, abstracciones, experimentacion de servicios y plasmado de conocimiento.

Frase posible:

> No escribi cada linea a mano. Diseñe sistemas, dirigi iteraciones, revise arquitectura y use IA como material de construccion.

## Material visual pendiente

### Capturas disponibles

1. `ontahi-library-system-architecture-light.png`: Living Systems en BookOps, modo claro, lenguaje botanico/organico.
2. `ontahi-library-system-architecture-dark.png`: Living Systems en modo oscuro, chapter cover con corte de tronco.
3. `psicoanalisis-freud-primer-parcial-light.png`: material Freud primer parcial con linea temporal integrada.
4. `psicoanalisis-freud-primer-parcial-dark.png`: material Freud primer parcial con diagrama conceptual en modo oscuro.
5. `bookops-landing-dark.png`: home/author workspace de BookOps en modo oscuro.
6. `bookops-landing-light.png`: home/author workspace de BookOps en modo claro.
7. `ontahi-graph-entity-browser-light.png`: Entity Browser reflexivo mostrando datos de Book en modo claro.
8. `ontahi-graph-entity-browser-dark.png`: Entity Browser reflexivo en modo oscuro.
9. `workstream-atlas-dark.png`: Atlas en modo oscuro, canvas semantico con inspector.
10. `workstream-atlas-light.png`: Atlas en modo claro, mismo canvas con `Atlas Model` seleccionado.
11. `uba-psi-scheduler-light.png`: Scheduler UBA Psi en modo claro, calendario + elecciones guardadas.
12. `uba-psi-scheduler-dark.png`: Scheduler UBA Psi en modo oscuro, oferta densa + cupos/filtros.
13. `psicoanalisis-freud-reading-board-second-partial-dark.png`: tablero de lectura del segundo parcial en modo oscuro.
14. `neurofisiologia-mcq-practice-dark.png`: ejercitador Neurofisiologia en modo oscuro, con pregunta, opciones y estado del examen.
15. `neurofisiologia-mcq-practice-light.png`: ejercitador Neurofisiologia en modo claro.
16. `neurofisiologia-mcq-question-bank-light.png`: administracion del banco, 303 preguntas, 31 temas, 16 fuentes y tabla de visualizacion.
17. `neurofisiologia-mcq-question-bank-dark.png`: banco de preguntas en modo oscuro.
18. `ontahi-book-of-style-dark.png`: Ontahi Book of Style en modo oscuro, pagina The Ceibo y lenguaje botanico.
19. `ontahi-book-of-style-light.png`: Ontahi Book of Style en modo claro.
20. `progbook-mechanics-of-thoughts-light.png`: The Mechanics of Thoughts en BookOps, codigo y margen de feedback.
21. `progbook-mechanics-of-thoughts-dark.png`: The Mechanics of Thoughts en modo oscuro.

Manifest: `ai-build-log-lab/media/screenshots/manifest-v0.json`.

### Capturas criticas

1. UBA Psi Scheduler: analytics, tour/wizard y quizas conflicto destacado.
2. BookOps: feedback/conversaciones, slide mode, audio si esta activado.
3. Lectura 2do parcial: vista Programa/Guias, detalle de card, warning Amorrortu.
4. Ontahi internal graph: operaciones, instancias especificas y ejecucion de operaciones.
5. The Mechanics of Thoughts: codigo Wollok/Shiki especifico.
6. Neurofisiologia MCQ: resultado/evaluacion y estado local despues de practicar.

### Capturas de evidencia

1. Git log/timeline por repo.
2. GitHub Project sync de planes.
3. Workflows de extraccion o deploy.
4. Storybook/Chromatic si suma.
5. Sonar/Codecov badges de BookOps.

## Direccion editorial recomendada

No empezar con una landing tradicional. Prototipar imagenes/editoriales primero:

1. Mapa general tipo timeline/constelacion.
2. Pagina log con fechas, commits, artefactos y capturas.
3. Pagina caso de proyecto con problema -> herramienta -> arquitectura -> evidencia -> demo.
4. Carousel LinkedIn con 4 o 5 laminas de alto impacto.

La pagina tiene que producir este efecto:

> "A la mierda: todo esto esta andando, se ve profesional, nacio de problemas reales, y fue construido con IA como medio de arquitectura y produccion."
