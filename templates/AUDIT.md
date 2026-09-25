---
id: AUD-YYYY-MM-DD-slug
type: audit
title: "<Qué se revisó, en una frase que se entienda sola>"
date: YYYY-MM-DD
status: Draft
repos: []
commits: []
related: []
---

<!--
PLANTILLA DE AUDITORÍA (AUD) — REM 1.1

Crear:  node scripts/rem-new.mjs audit <slug>     (el ID es la fecha: no hay número que reservar)

Una auditoría es una FOTO: lo que se encontró en una revisión sistemática en un momento y
sobre una revisión exacta del código (`commits: [repo@hash]`). No es un plan: los
hallazgos que se van a corregir se convierten en trabajo (INC, DEC, ADR, Plan) y se
enlazan en "Trabajo generado".

Estados: Draft · Open · In Review · Closed. `Closed` = el informe está terminado, no que
todos los hallazgos estén resueltos (eso lo dice el estado de cada hallazgo).
Las secciones son un menú: borra las que no apliquen.
-->

# Auditoría — <título corto> (YYYY-MM-DD)

## Pregunta

> Qué se quiso comprobar.

## Alcance

- **Entra:** <repos, módulos, flujos — y la revisión exacta: repo@hash>
- **No entra:** <qué se dejó fuera y por qué>

## Método

> Cómo se revisó: lectura estática, pruebas, agentes en paralelo, verificación adversarial.
> Qué tasa de falsos positivos se encontró al verificar.

## Resumen

| Severidad | Hallazgos |
|---|---|
| Crítica | |
| Alta | |
| Media | |
| Baja | |
| Info | |

**Riesgos principales:** …

## Hallazgos

> Un bloque por hallazgo. El ID (H-NN) es local a esta auditoría y es lo que citan los
> planes que lo corrigen.

### H-01 · [ALTA] (categoría) — <título>

- **Dónde:** `ruta:línea`
- **Impacto:** …
- **Evidencia:** …
- **Propuesta:** …
- **Estado:** Open · Mitigated · Won't fix (<motivo>)

## Temas transversales

> Patrones que se repiten y su causa de raíz.

## Fuera de alcance / requiere revisión manual

## Trabajo generado

> Enlaces a los INC, DEC, ADR, Megaplanes o Planes que nacieron de esta auditoría.

## Anexos
