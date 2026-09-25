---
id: ADR-NNNN
type: adr
title: "<La decisión, en una frase que se entienda sola>"
date: YYYY-MM-DD
status: Proposed
deciders: []
supersedes: null
superseded_by: null
related: []
commits: []
---

<!--
PLANTILLA DE ADR — REM 1.1

Crear:  node scripts/rem-new.mjs adr <slug>

Un ADR registra UNA decisión estructural con consecuencias largas, sus alternativas y su
por qué. Una vez `Accepted` es INMUTABLE: su evolución se escribe como DEC con
`extends: ADR-NNNN` (el índice las cuenta en la línea del ADR) o como un ADR nuevo con
`supersedes`. Nunca se reescribe para fingir que el pasado fue distinto.

Estados: Draft · Proposed · Accepted · Superseded · Rejected.
Las secciones son un menú: borra las que no apliquen, salvo Opciones y Decisión.
-->

# ADR-NNNN — <título corto>

## Contexto y problema

> Qué situación obliga a decidir, con su evidencia: auditoría, incidente, `archivo:línea`,
> medición. Concreto y honesto.

## Fuerzas

> Lo que importa en esta decisión: seguridad, coste, latencia, operabilidad,
> compatibilidad, capacidad del equipo…

- <fuerza>

## Opciones consideradas

1. **<Opción A>** — <descripción>
2. **<Opción B>** — <descripción>

## Decisión

> **Elegimos <opción>.** Por qué, atado a las fuerzas de arriba.

## Consecuencias

- **Positivas:** …
- **Negativas / costes:** …
- **Riesgo residual:** … (quién lo aceptó)

## Alternativas descartadas

- **<opción>:** por qué no.

## Evidencia

> Commits (`repo@hash`, en el front-matter), prototipos, mediciones, pruebas.

## Seguimiento

> Qué vigilar, qué deuda queda, y qué señal haría revisar esta decisión.
