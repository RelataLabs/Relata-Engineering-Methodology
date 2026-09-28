---
id: DEC-YYYY-MM-DD-slug
type: dec
title: "<La regla, en una frase que se entienda sola>"
date: YYYY-MM-DD
status: Accepted
extends: null
repos: []
commits: []
related: []
---

<!--
PLANTILLA DE NOTA DE DECISIÓN (DEC) — REM 1.1

Crear:  node scripts/rem-new.mjs dec <slug>     (el ID es la fecha: no hay número que reservar)

CUÁNDO: el cambio es pequeño pero codifica o corrige una REGLA —de negocio, de permisos, de
datos, de contrato— o extiende un ADR (`extends: ADR-NNNN`). La prueba: ¿alguien podría
"arreglar" esto en el futuro sin saber que era intencional? Si sí, es una DEC.

LÍMITE: unas 40 líneas de contenido (regla 7). Si se te va de ahí, no es una nota: es un ADR.
Los párrafos son un menú: borra los que no apliquen.
-->

# <La regla, corta>

**Síntoma.** Qué se veía desde fuera. Concreto: quién, haciendo qué, obtenía qué.

**La regla, explícita.** Lo que ahora queda escrito y antes solo vivía en un diff. Si algo del
sistema ya era correcto, dilo: evita que alguien lo "arregle".

**Decisión.** Qué se hace, en qué rutas de código, y qué sigue prohibido.

**Fuera de alcance.** Qué NO se tocó, para que nadie lo asuma incluido.

**Cómo se sabría que esto se rompió.** La señal observable que delataría una regresión. Es el
párrafo que da valor a la nota: describe la prueba que falta.
