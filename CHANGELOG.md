# Changelog

## Unreleased — 2026-10-01

### Aclarado

- La prohibición de ocultar o falsificar evidencia es incondicional; la aceptación de riesgo no permite aparentar un cierre.
- WIP total y atención activa tienen definiciones separadas; pausas, observación y abandonos conservan trazabilidad y fechas de flujo reales.
- Los mínimos de V2/V3 prevalecen sobre recomendaciones generales; la Constitución concreta o amplía su ejecución sin relajarlos para cerrar.
- La observación interna de 99/117 cambios se contextualiza sin presentarla como estudio reproducible ni conclusión causal.
- Se corrigen referencias residuales a 1.0 en recomendaciones vigentes y atribución, conservando las menciones históricas.

### Añadido

- Guía de alcance y evaluación: distingue definición, tooling, adopción, producto y eficacia; propone medir flujo, coste y retrabajo con límites explícitos.
- Recorrido didáctico completo con datos sintéticos, verificación contrafactual, recuperación, observación y cálculo de métricas.
- Fuentes primarias más precisas para Spec Kit, Kanban, Shape Up y registros de decisión.

### Corregido

- Las comprobaciones previas al commit revisan el árbol preparado sin incorporar archivos ni cambios ajenos; las vistas locales se generan y preparan explícitamente.
- Las dependencias abandonadas no se consideran entregas satisfechas; se detectan ciclos y se respetan los patrones configurados de identificadores.
- Las métricas separan WIP total, atención, cierres y abandonos; fechas inválidas no producen resultados parciales y la mediana usa ambos valores centrales cuando corresponde.
- El control semanal utiliza validación estricta y los informes de CI se leen como datos, sin interpolarlos en código.

Estos cambios pertenecen a una revisión de REM 1.1 pendiente de publicación como versión; no crean una release ni una etiqueta nueva.

## 1.1.0 — 2026-09-25

REM 1.1 recupera la capa operativa que se perdió al destilar REM del hub de su proyecto de
origen, y añade lo que ese hub no tenía: coordinación de varias personas en un megaplán.

La motivación es medida. La primera adopción de REM 1.0 en un proyecto multirepo terminó sin
megaplanes, sin notas de decisión, sin auditorías, sin Constitución, sin tooling y con las
plantillas reescritas, mientras el proyecto tenía decenas de planes y auditorías reales sueltos
en un repo de código. Otra adopción, con megaplanes, también se saltó scripts, hooks y CI. El
doctor 1.0 daba "OK" con cero documentos, así que nada lo detectó.

### Añadido

- `docs/BOOTSTRAP.md`: checklist ejecutable de instalación con perfiles (`hub-multirepo` con o
  sin spokes, `in-repo`), qué se copia byte a byte, migración brownfield y definición de hecho.
- `docs/MEGAPLANS.md`: guía de megaplanes y planes (se copia a cada adopción).
- `docs/TEAM.md` y METHOD §7.5: varias personas, cada una con sus agentes, en el mismo megaplán —
  coordinador, un escritor por fichero, tomar un plan con el push como candado, vistas
  generadas con escritor único, IDs sin choques, zonas de cambio, contratos de entrega,
  trailer `Plan:` en los commits, "Estado para retomar".
- Tipo `arch` (arquitectura viva, con `last_verified`) y Plan suelto `PLAN-YYYY-NNN`.
- Scripts: `rem-index` (índice y tablas de planes generadas), `rem-timeline` (desde CHANGELOG o
  desde commits), `rem-new` (IDs contra lo publicado), `rem-status` (tablero del equipo),
  `rem-install`, `rem-precommit`, y `lib/rem.mjs` compartido.
- Hooks `commit-msg` (asunto, cuerpo, changelog; atribución de IA opcional) y `pre-commit`.
- Plantillas nuevas: ARCHITECTURE, CHANGELOG, HUB-README, AGENTS-HUB, AGENTS-CODE-REPO-BLOCK,
  CI (`ci/rem.yml`) y arranque de sesión de agentes.
- `examples/`: dos Constituciones y un hub completo que el CI de REM audita (antes el CI
  inspeccionaba cero documentos).
- `tests/`: pruebas del tooling con `node --test`.
- README: "Empieza aquí" y "Qué SÍ exige una adopción REM".
- Constitución: arquitectura por repositorio, topología documental, equipo y coordinación,
  recursos compartidos y excepciones vigentes.

### Cambiado

- `rem-doctor` pasa de 8 comprobaciones a 25 reglas más las de adopción (`--adoption`),
  configurables por tipo: tipo↔carpeta, ID↔fichero, estados por tipo, `repo@hash` alcanzable
  desde la rama de integración, referencias existentes, enlaces rotos, IDs duplicados, secretos,
  zonas de cambio solapadas, dependencias, fechas de flujo, deriva de tablas escritas a mano.
  Sale 1 solo con errores (`--strict` para avisos).
- METHOD §5.4: el megaplán DEBE abrirse cuando hay dos o más objetivos con dependencia.
- METHOD §11.2: la Constitución DEBE declarar la política de changelog; el default es `required`.
- METHOD §13: "un artefacto solo existe si…" aplica a instancias, no a tipos.
- METHOD §18: la adopción se comprueba con `rem-doctor --adoption` en CI.
- ADOPTION y TAILORING: fuera las frases que permitían instalar a medias; "Lo que NO es
  tailoring"; tabla para traducir las reglas de un proyecto de origen a la Constitución.
- Las siete plantillas recuperan la profundidad del hub de origen, con el comentario guía
  después del front-matter.
- `rem-flow`: el throughput cuenta solo `Cerrado`; `Abandonado` se informa aparte.

### Corregido

- El doctor ignoraba en silencio las listas del front-matter en bloque (un megaplán con `plans:`
  en bloque quedaba sin planes y podía cerrarse vacío): ahora es un error.
- `README.md` dentro de una carpeta de documentos ya no se trata como documento.
- La integridad megaplán↔plan se comprueba en las dos direcciones.
- La contradicción entre "empieza con un Plan activo" y "Plan sin megaplán es error".
- El config de ejemplo declaraba una carpeta `architecture` sin tipo ni plantilla.

### Compatibilidad

- Un config 1.0 (`workRoots`, `planStates`) sigue funcionando en modo legado; `--adoption` exige
  el formato 1.1.
- `plans` y `planes` se aceptan en el maestro.

## 1.0.0 — 2026-09-08

Primera versión estable de Relata Engineering Method.

### Añadido

- kernel AI-native con autoridad separada humano/agente/automatización;
- escalamiento documental proporcional;
- Megaplán y Plan como orquestación de trabajo complejo;
- ciclo `[INV] → [DEC] → [IMP] → [VER] → [OBS]`;
- política de selección sin backlog obligatorio;
- WIP explícito;
- cuatro niveles de verificación;
- evidencia contrafactual para riesgo alto;
- observación post-deploy;
- métricas mínimas de flujo;
- Constitución técnica separada del método;
- `rem-doctor` y `rem-flow`.

### Corregido respecto al método precursor

- Clean Architecture/SOLID dejan de ser obligación universal y pasan a Constitución;
- la Boy Scout Rule queda limitada por familia causal y superficie de verificación;
- el tamaño en líneas deja de ser criterio principal de escalamiento;
- no todo cambio interno exige changelog;
- la atribución a herramientas de IA deja de ser una regla universal del método;
- `Cerrado` deja de equivaler a “implementado/verificado” cuando falta resultado real.
