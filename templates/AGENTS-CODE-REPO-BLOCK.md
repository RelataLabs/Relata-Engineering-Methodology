<!--
BLOQUE DE AGENTE PARA REPOS DE CÓDIGO (spokes) — REM 1.1

Se pega al final del archivo de contexto de agentes de CADA repo de código (AGENTS.md,
CLAUDE.md…, el que declare `agentBlock.file` en rem.config.json) y también en el AGENTS.md
del hub. Tiene que ser IDÉNTICO en todos: el doctor compara el bloque entre repos
(regla 9) y avisa cuando uno deriva.

Antes del bloque, cada repo pone su cabecera propia: stack, rama de integración, el
comando de verificación exacto y las reglas de dominio no negociables.

Sustituye los <marcadores> y borra este comentario.
-->

## Registro de trabajo

Este repo registra su trabajo en el hub **<hub>** (`<ruta relativa al hub>`), que adopta REM.
Las reglas del proyecto están en `<hub>/CONSTITUTION.md`.

**Cada commit que toque código lleva, en el mismo commit:**

1. **Cuerpo del mensaje**: síntoma → causa raíz → por qué esta solución, más la verificación
   ejecutada y lo que quedó sin verificar. Si de verdad no hace falta:
   `tipo(ámbito)[trivial]: …`, que es un escape consciente, no el valor por defecto.
2. **Entrada en `CHANGELOG.md`** bajo `## <fecha de hoy>` y su sección (Añadido / Cambiado /
   Corregido / Seguridad / Interno), en lenguaje de usuario y sin hash.
3. Si el commit avanza un plan del hub, el trailer **`Plan: <ID del plan>`**
   (p. ej. `Plan: MEGA-2026-001-P3`). Así el plan sabe qué commits son suyos sin que nadie
   edite un fichero compartido.

**¿Cuándo escalar al hub?** El changelog basta para la mayoría de los cambios. Escala solo cuando:

| Situación | Documento en el hub |
|---|---|
| El cambio codifica o corrige una regla de negocio, permisos, datos o contrato | `DEC` (≤40 líneas) |
| El cambio extiende o contradice un ADR aceptado | `DEC` con `extends:` |
| Decisión estructural con consecuencias largas | `ADR` |
| Se rompió en producción o hay un vector de seguridad | `INC` |
| Revisión sistemática (seguridad, rendimiento, dependencias) | `AUD` |
| Entrega grande o con superficie de seguridad nueva | `ADR` + `IMP` |
| Dos o más objetivos por delante, con dependencias entre ellos | megaplán — lee `<hub>/megaplanes/README.md` |
| El trabajo pertenece a un plan que ya existe | actualiza ESE plan (solo si su owner es tu humano) |

Si una DEC te sale de más de 40 líneas, está mal clasificada: es un ADR. Para y pregunta.

**Trabajo en equipo.** Antes de empezar: `node <hub>/scripts/rem-status.mjs`. Trabaja solo en
planes cuyo `owner` es tu humano; no edites el maestro de un megaplán ni las vistas
generadas; si tu cambio toca un recurso compartido de la Constitución, va con DEC.

**Hooks.** Si `git config core.hooksPath` está vacío en tu clon: `git config core.hooksPath .githooks`.
