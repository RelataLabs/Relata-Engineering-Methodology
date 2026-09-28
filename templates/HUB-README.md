# <Proyecto> — hub de documentación de ingeniería

> Fuente única de verdad para las decisiones, entregas, auditorías, incidentes y trabajo en
> curso de <repos que cubre>. Adopta [REM](https://github.com/RelataLabs/Relata-Engineering-Methodology)
> <versión>; las reglas propias del proyecto están en la [Constitución](CONSTITUTION.md).
>
> **Se registra todo cambio, no solo los grandes.** <Una línea sobre la política de changelog
> declarada en la Constitución: dónde queda el registro por defecto de cada cambio.>
> Solo se escala a un documento de este hub cuando el cambio deja una **regla** o una
> **decisión** que sobrevive al diff, o cuando hay **trabajo con dependencias por delante**.

## Empieza aquí

1. Clona este repo junto a los repos de código (las rutas están en `rem.config.json`).
2. `node scripts/rem-install.mjs` — activa los hooks en tu clon.
3. `node scripts/rem-status.mjs` — quién tiene qué, qué está libre y qué cambió esta semana.
4. Lee la [Constitución](CONSTITUTION.md) y la [guía de megaplanes](megaplanes/README.md).
5. Si trabajas con un agente desde un repo de código, dale acceso a este hub
   (<cómo, p. ej. `--add-dir ../<hub>`>) y que lea [AGENTS.md](AGENTS.md).

## ¿Qué documento uso?

**La mayoría de los cambios no llevan documento aquí.** <Llevan su entrada de CHANGELOG / su
commit, según la Constitución.> Se escala solo cuando:

| El cambio… | Documento | Coste |
|---|---|---|
| cambia comportamiento observable y nada más | changelog del repo | una línea |
| codifica o corrige una regla de negocio, permisos, datos o contrato | `DEC` | ≤40 líneas |
| extiende o contradice un ADR aceptado | `DEC` con `extends:` | ≤40 líneas |
| es una decisión de diseño con consecuencias largas | `ADR` | alto |
| entrega algo grande o con superficie de seguridad nueva | `ADR` + `IMP` | alto |
| se rompió en producción o hay un vector de seguridad | `INC` | medio/alto |
| es una revisión sistemática (seguridad, rendimiento, dependencias) | `AUD` | medio |
| son dos o más objetivos por delante y alguno depende de otro | megaplán + planes | vive lo que dure |
| es un objetivo por delante que no cabe en un commit | Plan suelto | medio |
| describe cómo es hoy una pieza del sistema | `ARCH` (se edita) | medio |

Prueba rápida entre changelog y DEC: *¿alguien podría "arreglar" esto en el futuro sin saber
que era intencional?* Si sí, es una DEC.

## Cómo se escribe aquí

- `node scripts/rem-new.mjs <tipo> <slug>` crea el documento desde su plantilla con el ID
  correcto (los correlativos se calculan contra lo publicado para que dos personas no
  elijan el mismo número).
- Las plantillas son un **menú, no un formulario**: se borran las secciones que no aplican.
  Eso vale para secciones de un documento, nunca para tipos, carpetas o tooling.
- Fechas absolutas (`YYYY-MM-DD`). Commits cualificados por repo (`repo@hash`), solo después
  del merge a la rama de integración. Evidencia como `archivo:línea`.
- Honestidad: lo que falló, quedó fuera o no se verificó, se dice.
- **No edites el índice de abajo ni las tablas de planes**: se generan desde el front-matter
  (<quién las regenera: CI o el hook local>).

## Estructura

| Carpeta | Qué va | Plantilla | Nombre |
|---|---|---|---|
| `architecture-decisions/` | ADR: decisiones estructurales | `templates/ADR.md` | `ADR-NNNN-slug.md` |
| `decision-notes/` | DEC: reglas pequeñas | `templates/DECISION-NOTE.md` | `YYYY-MM-DD-slug.md` |
| `incident-responses/` | INC: lo que se rompió | `templates/INCIDENT.md` | `INC-YYYY-NNN-slug.md` |
| `audits/` | AUD: revisiones sistemáticas | `templates/AUDIT.md` | `YYYY-MM-DD-slug.md` |
| `implementation-records/` | IMP: lo entregado y su evidencia | `templates/IMPLEMENTATION-RECORD.md` | `IMP-YYYY-NNN-slug.md` |
| `megaplanes/` | trabajo en curso con dependencias | `templates/MEGAPLAN.md` | `MEGA-YYYY-NNN-slug.md` |
| `megaplanes/planes/` | un objetivo específico cada uno | `templates/PLAN.md` | `MEGA-…-PN-slug.md` / `PLAN-YYYY-NNN-slug.md` |
| `docs/architecture/` | cómo es hoy cada pieza | `templates/ARCHITECTURE.md` | `slug.md` |

## Reglas de oro

1. **Todo cambio se registra cuando ocurre**, en el nivel más barato que lo preserve.
2. **La historia no se reescribe**: ni los documentos (se añaden otros que los superan) ni la
   historia de git publicada.
3. **Trazabilidad**: todo documento enlaza a su evidencia y a los documentos relacionados.
4. **Honestidad**: lo no verificado se declara.
5. **En equipo, cada uno escribe lo suyo**: el plan es de su responsable, el maestro de quien
   coordina, las vistas generadas de su único escritor (ver [docs de equipo de REM](https://github.com/RelataLabs/Relata-Engineering-Methodology/blob/main/docs/TEAM.md)).

## Índice de documentos

<!-- REM:INDEX:START — generado por scripts/rem-index.mjs, no editar a mano -->
<!-- REM:INDEX:END -->
