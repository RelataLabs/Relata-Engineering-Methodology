---
id: ARCH-slug
type: arch
title: "<Qué pieza del sistema describe>"
date: YYYY-MM-DD
status: Vigente
last_verified: YYYY-MM-DD
verified_against: []
repos: []
related: []
---

<!--
PLANTILLA DE ARQUITECTURA VIVA (ARCH) — REM 1.1

Crear:  node scripts/rem-new.mjs arch <slug>

A diferencia de los otros tipos, este documento SE EDITA: describe cómo es el sistema HOY.
Por eso lleva `last_verified` (cuándo se contrastó con el código) y `verified_against`
(`repo@hash` contra el que se contrastó). El doctor avisa cuando pasa `archStaleDays`
sin verificarse (regla 23): un documento de arquitectura que nadie contrasta miente con
autoridad.

Lo que cambió y por qué NO va aquí: va en un ADR/DEC (la decisión) o en un IMP (la
entrega). Aquí solo el estado actual, con enlaces a esas decisiones.

Estados: Vigente · Obsoleto.
-->

# <Pieza del sistema>

## Qué es

> Una o dos frases: qué responsabilidad tiene y qué no.

## Estructura

> Capas, módulos o carpetas, con lo que vive en cada una. Rutas reales.

## Dependencias

- **Permitidas:** …
- **Prohibidas:** …
- **Desviaciones conocidas:** <dónde el código no cumple lo de arriba, medido, y si está
  aceptado o es deuda — con enlace a la DEC o al plan>

## Contratos

> Lo que expone y lo que consume: API, eventos, colas, tablas compartidas.

## Operación

> Cómo se ejecuta en desarrollo y en producción; configuración relevante (nombres de
> variables, nunca valores).

## Decisiones que lo explican

> Enlaces a los ADR/DEC que fijaron esta forma.

## Cómo se verificó

> Qué se contrastó con el código en `last_verified` y cómo (lectura, comando, conteo).
