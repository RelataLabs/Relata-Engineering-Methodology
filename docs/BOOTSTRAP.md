# Instalar REM 1.1 — checklist ejecutable

> Para humanos y para agentes. Si eres un agente instalando REM: sigue esta página en orden,
> no te saltes pasos, **no reescribas nada que aquí diga "copiar"**, y no termines hasta que
> `node scripts/rem-doctor.mjs --adoption` salga sin errores. Donde dice "decide un humano",
> pregunta.

REM se puede adaptar mucho (ver [TAILORING.md](TAILORING.md)), pero una adopción no se hace a
medias por accidente. La versión 1.0 de REM permitía leer "empieza con poco" como "instala
poco": la primera adopción en un proyecto multirepo terminó sin megaplanes, sin notas de
decisión, sin auditorías, sin Constitución, sin tooling y con plantillas reescritas — mientras
el proyecto tenía decenas de planes y auditorías reales sueltos en un repo de código. Esta
página existe para que eso no vuelva a pasar.

## 0. Decisiones previas — decide un humano

| Decisión | Opciones | Default |
|---|---|---|
| **Perfil** | `hub-multirepo`: un repo de documentación que cubre N repos de código · `in-repo`: las carpetas viven dentro del único repo | `hub-multirepo` si hay más de un repo de código |
| **Spokes** (solo hub) | con spokes: cada repo de código lleva `CHANGELOG.md`, hook `commit-msg` y un bloque en su archivo de agentes que apunta al hub · sin spokes: los repos no saben del hub | con spokes. Sin spokes es una **excepción declarada** en la Constitución, y el timeline sale de los commits |
| **Política de changelog** | `required` (cada cambio de código, mismo commit, lo exige el hook) · `observable` (solo lo observable) · `deferred` (aún no; excepción declarada) | `required` |
| **Atribución de IA en commits** | bloqueada por el hook · permitida | la que diga el proyecto; va en la Constitución |
| **Atención activa** | Plans Activo/Verificando por persona; WIP total se registra aparte | 1 |
| **Vistas generadas** | `ci` (solo CI regenera índice y tablas; para equipos) · `local` (el responsable ejecuta rem-index y prepara las vistas; el hook comprueba el índice staged) | `ci` si escribe más de una persona |

Un agente **no** toma estas decisiones solo: son autoridad humana (METHOD §3).

## 1. Estructura obligatoria

Todos los tipos se instalan **aunque estén vacíos**. Los nombres de carpeta se pueden cambiar
declarándolos en `rem.config.json`; **los tipos no se pueden omitir**.

```text
<hub>/
├── README.md                 ← templates/HUB-README.md (routing + índice generado)
├── CONSTITUTION.md           ← CONSTITUTION.md (completada; ver examples/)
├── AGENTS.md                 ← templates/AGENTS-HUB.md   (+ CLAUDE.md con "@AGENTS.md")
├── rem.config.json           ← rem.config.example.json (ajustado)
├── TIMELINE.md               ← generado por scripts/rem-timeline.mjs
├── architecture-decisions/   ADR
├── decision-notes/           DEC
├── incident-responses/       INC
├── audits/                   AUD
├── implementation-records/   IMP
├── megaplanes/
│   ├── README.md             ← docs/MEGAPLANS.md, tal cual
│   └── planes/               Planes (de megaplán y sueltos)
├── docs/architecture/        ARCH (arquitectura viva)
├── templates/                ← templates/*.md, byte a byte
├── scripts/                  ← scripts/ (con lib/)
├── .githooks/                ← hooks/commit-msg y hooks/pre-commit
├── .github/workflows/rem.yml ← templates/ci/rem.yml
└── .claude/settings.json     ← templates/claude-settings.json (si se usa Claude Code)
```

En el perfil `in-repo` el árbol es el mismo bajo una carpeta (p. ej. `docs/rem/`) y los tipos
apuntan a sus subcarpetas en el config.

## 2. Copiar — byte a byte

| De REM | A la adopción | Qué se toca |
|---|---|---|
| `templates/*.md` | `templates/` | nada; los `<marcadores>` se rellenan al CREAR cada documento |
| `docs/MEGAPLANS.md` | `megaplanes/README.md` | nada |
| `scripts/` (incluido `lib/`) | `scripts/` | nada |
| `hooks/commit-msg`, `hooks/pre-commit` | `.githooks/` | solo el bloque `CONFIG` de commit-msg |
| `templates/ci/rem.yml` | `.github/workflows/rem.yml` | la rama si no es `main` |
| `rem.config.example.json` | `rem.config.json` | todo lo que declare el proyecto (§3) |
| `templates/HUB-README.md` | `README.md` | los `<marcadores>` |
| `templates/AGENTS-HUB.md` | `AGENTS.md` | los `<marcadores>` |
| `CONSTITUTION.md` | `CONSTITUTION.md` | completarla (§4) |

**Lo que NO es adaptar** y ningún agente debe hacer: escribir plantillas propias "más cortas",
quitar el front-matter, omitir tipos, carpetas, scripts, hooks o CI, o convertir una
restricción de sesión ("no toques los repos de código hoy") en una regla permanente sin
preguntar.

## 3. Configurar `rem.config.json`

| Clave | Qué declara |
|---|---|
| `profile`, `hub.name`, `hub.branch` | perfil, nombre del hub (para citar `hub@hash`) y su rama |
| `types.<tipo>` | carpeta, plantilla, patrón de ID, nombre de fichero, secuencia y estados |
| `repos.<nombre>` | `path` relativo al hub, `branch` de integración (contra la que se valida `repo@hash`), `public`, `spoke` |
| `changelog.policy` | `required` · `observable` · `deferred` |
| `timeline.source` | `auto` (changelog si existe, si no commits) · `changelog` · `git` |
| `generated.index`, `generated.timeline` | quién regenera las vistas: `ci` o `local` |
| `wip.maxActiveOrVerifyingPerOwner` | límite de atención activa, separado del WIP total |
| `team.owners` | handles válidos para `owner` (vacío = sin validar) |
| `limits` | umbrales de las reglas (DEC, estancamiento, despliegue, arquitectura) |
| `agentBlock` | fichero y encabezado del bloque de agente que se compara entre repos |
| `secrets.extraPatterns` | patrones propios para el escaneo de secretos |
| `required` | ficheros que `--adoption` exige |

## 4. Completar la Constitución

Obligatorio, en este orden de importancia:

1. **Arquitectura por repositorio** — una fila por repo con su patrón, reglas y desviaciones
   medidas. Es donde vive lo que el proyecto de origen imponía a todos ("Clean Architecture
   en todos los repos"): aquí se dice repo por repo. Ejemplos en `examples/`.
2. **Verificación** — V0–V3 con los comandos reales de cada repo.
3. **Git y entrega** — ramas, commits, changelog, atribución de IA, reescritura de historia.
4. **Topología documental** — perfil, spokes o no, dónde queda el registro por defecto.
5. **Equipo y coordinación** — personas, WIP, selección, protocolo de [TEAM.md](TEAM.md).
6. **Recursos compartidos** — contratos, migraciones, catálogos: se cambian con DEC.
7. **Excepciones vigentes** — toda regla de REM que no se cumple todavía, con su salida.

## 5. Migración brownfield

Si el proyecto ya tiene documentación suelta (carpetas de planes, fases, handoffs, auditorías,
estándares dentro de un repo de código), **no se empieza vacío**:

1. **Inventario**: lista cada documento con su fecha, tamaño y si describe pasado, presente o
   futuro.
2. **Clasifica**:

   | Si el documento es… | Va a… |
   |---|---|
   | una auditoría o revisión con hallazgos | `AUD` (+ trabajo generado) |
   | un plan, una fase, un handoff de trabajo que sigue abierto | megaplán + planes, o Plan suelto |
   | un plan ya ejecutado | `IMP` |
   | un estándar o una decisión estructural | `ADR` (+ DEC por cada regla durable) |
   | una regla pequeña que alguien podría "arreglar" | `DEC` |
   | un fallo en producción | `INC` |
   | una descripción vigente de cómo funciona algo | `ARCH`, o se indexa si vive mejor en su repo |
   | un runbook | se indexa en `docs/operations/` (sanitizado) |

3. **Resume, no copies**: el documento tipado destila decisiones, hallazgos, estado y
   evidencia, y cita su fuente en `sources: [repo@hash:ruta]`. La fuente se queda donde está.
4. **Verifica contra el código** el estado de cada hallazgo o decisión antes de escribirlo.
5. **Abre el primer megaplán con el trabajo vivo** que tenga dependencias, con su tabla de
   premisas verificadas. No es opcional si ese trabajo existe.

## 6. Spokes (perfil hub con spokes)

En cada repo de código:

1. `CHANGELOG.md` desde `templates/CHANGELOG.md`, con una primera entrada del día.
2. `.githooks/commit-msg` desde `hooks/commit-msg`, ajustando su bloque `CONFIG` al stack del
   repo (extensiones de código), y `git config core.hooksPath .githooks` en cada clon.
3. El bloque de `templates/AGENTS-CODE-REPO-BLOCK.md` al final de su archivo de agentes,
   **idéntico** en todos los repos y en el `AGENTS.md` del hub (regla 9).
4. En el hub: `repos.<nombre>.spoke = true`.

## 7. Activar

```bash
node scripts/rem-install.mjs          # hooks del clon
node scripts/rem-index.mjs            # índice y tablas de planes
node scripts/rem-timeline.mjs         # si los repos de código están clonados al lado
node scripts/rem-doctor.mjs --adoption
git add -A && git commit              # el hook commit-msg ya revisa este commit
git push                              # y el CI corre con el reloj a partir de aquí
```

El pre-commit comprueba una copia temporal del contenido preparado para commit y exige
`rem.config.json` en ese contenido. Usa las herramientas instaladas, sin ejecutar las de
la copia ni añadir cambios al índice. Los documentos del hub deben estar dentro de su
raíz; las referencias a repos externos conservan su contexto, pero no incorporan esos
repos al commit. La implementación rechaza enlaces simbólicos versionados, no materializa
el contenido de submódulos y limita la lectura conjunta de blobs a 256 MiB. Si encuentra
uno de esos límites, falla explícitamente: no certifica una inspección parcial. En ese
caso se debe revisar la topología o ampliar el tooling y su verificación antes de usar
este control en ese repositorio.

## 8. Definición de hecho

La adopción está hecha cuando:

- [ ] `node scripts/rem-doctor.mjs --adoption` sale con 0 errores (con los repos de código
      clonados al lado, para que también resuelva los `repo@hash`);
- [ ] el CI del hub está en verde;
- [ ] `core.hooksPath` apunta a `.githooks` en el clon de cada persona;
- [ ] la Constitución declara las siete secciones de §4;
- [ ] si había documentación suelta, cada documento tiene destino (§5) y el trabajo vivo está
      en un megaplán;
- [ ] con spokes: cada repo tiene su CHANGELOG, su hook y el bloque idéntico;
- [ ] toda desviación de lo anterior está escrita como excepción en la Constitución, con
      responsable y condición de salida. **Una adopción mínima es una excepción declarada y
      temporal, nunca el punto de llegada.**

## 9. Catálogo de reglas del doctor

| Regla | Qué comprueba | Nivel |
|---|---|---|
| A0 | Hay `rem.config.json` válido | error |
| A1–A9 (`--adoption`) | config 1.1; ≥1 documento; carpetas y plantillas de todos los tipos; ficheros `required`; workflow de CI; marcadores del índice; `core.hooksPath` (aviso, solo local); política de changelog declarada; spokes completos | error |
| 0 | Se inspeccionó al menos un documento | aviso |
| 1 / 1b | Front-matter en el byte 1, campos obligatorios, `type` = carpeta, ID y nombre de fichero coherentes / listas en bloque | error |
| 2 | Estado transitorio más de `staleDays` (megaplanes, planes y ARCH exentos) | aviso |
| 3 | IMP sin `deployed` tras `deployDays` | aviso |
| 4 / 5 | `commits`, `verified_against`, `sources` como `repo@hash`; que existan y sean alcanzables desde la rama de integración | error |
| 5b / 5c | Hashes entre comillas invertidas en cuerpos y en CHANGELOG, vivos | error |
| 6 | `related`, `depends_on`, `extends`, `supersedes`, `superseded_by` existen | error |
| 7 | DEC de más de ~40 líneas de contenido | aviso |
| 8 | Un spoke lleva N commits sin tocar su CHANGELOG | aviso |
| 9 | El bloque de agente es idéntico en el hub y en cada spoke | aviso |
| 10 | Un repo público no publica hooks ni términos internos | error |
| 11 | Estados válidos por tipo | error |
| 12 | Megaplán ↔ plan en las dos direcciones; Plan suelto bien formado | error |
| 13 | Plan `Cerrado` sin casillas abiertas | error |
| 14 | Megaplán `Cerrado` solo con planes cerrados o abandonados | error |
| 15 | IDs duplicados | error |
| 16 | Enlaces relativos rotos | error |
| 17 | Plan activo con `owner` (y en `team.owners` si se declara) | error / aviso |
| 18 | Límite de atención activa por persona | error |
| 19 | Zonas de cambio (`touches`) que se pisan entre planes activos de personas distintas | aviso |
| 20 | Plan que se entrega con dependencias sin entregar | aviso |
| 21 | Secretos en el hub | error |
| 22 | `verification_level` válido; presente en planes activos | error / aviso |
| 23 | ARCH sin verificar en `archStaleDays` | aviso |
| 24 | Fechas de flujo válidas, ordenadas y no futuras; pausa con fecha y motivo | error; `started`/`closed` ausentes generan aviso y bloquean el cálculo de métricas |
| 25 | Tabla de planes del maestro generada; si no, deriva fila a fila | aviso |

## 10. Desde REM 1.0

- Config: `workRoots`/`planStates` siguen funcionando en modo legado, pero `--adoption` exige
  `types` (parte de `rem.config.example.json`).
- Listas del front-matter en bloque: pásalas a inline (regla 1b).
- `plans`/`planes`: se aceptan las dos claves.
- La tabla de planes del maestro: ponla entre los marcadores `REM:PLANES` y regenera.
- Plan suelto: ahora es legítimo como `PLAN-YYYY-NNN` con `megaplan: null`.
