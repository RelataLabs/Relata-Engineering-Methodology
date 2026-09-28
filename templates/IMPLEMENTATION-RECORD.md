---
id: IMP-YYYY-NNN
type: imp
title: "<Qué se entregó, en una frase que se entienda sola>"
date: YYYY-MM-DD
status: Implemented
repos: []
commits: []
related: []
deployed: null
observed: null
---

<!--
PLANTILLA DE IMPLEMENTATION RECORD (IMP) — REM 1.1

Crear:  node scripts/rem-new.mjs imp <slug>

Conecta una entrega concreta con su código, su evidencia, su estado de despliegue y lo que
le falta. No sustituye al ADR (el porqué) ni al megaplán (el viaje): es el destino.

DOS MODOS:
  · LITE (lo normal): secciones 1, 3, 5, 9, 10, 13 y 14.
  · COMPLETO: entregas grandes o que abren superficie de seguridad nueva. Todas.
Si no es una entrega sino una regla pequeña, no es un IMP: es una DEC.

Estados: Draft · Implemented · Validated · Deployed · Observed · Superseded.
`Validated` confirma evidencia en el entorno declarado; NO implica despliegue. Un IMP que
pasa `deployDays` sin `deployed` recibe aviso (regla 3).
-->

# IMP-YYYY-NNN — <título corto>

## 1. Resumen

> Qué se entregó, qué resultado observable produce y su estado real (¿desplegado?).

## 2. Problema y estado anterior

## 3. Alcance

- **Incluido:** …
- **Fuera de alcance intencional:** … (una decisión, no una deuda)

## 4. Invariantes y frontera de confianza

| Invariante | Cómo se garantiza | Evidencia |
|---|---|---|
| <propiedad que nunca debe romperse> | <mecanismo> | `archivo:línea` / prueba |

## 5. Qué quedó

### 5.1 <Subsistema>

- <comportamiento implementado>
- **Evidencia:** `repo/ruta`

## 6. Contratos, datos y permisos

> Endpoints, eventos, entidades, migraciones, matriz de permisos.

## 7. Seguridad y privacidad

## 8. Migración, compatibilidad y recuperación

## 9. Verificación

### Ejecutado y aprobado

| Repo / entorno | Comando o escenario | Resultado | Fecha |
|---|---|---|---|
| | | | |

### No ejecutado

### No cubierto

## 10. Despliegue

> Dónde, cuándo, con qué comprobación posterior.

## 11. Observación

> Qué señal posterior al despliegue se comprobó.

## 12. Rollback

## 13. Pendientes reales

| ID | Qué funciona hoy | Límite | Mejora | Criterio de cierre | Prioridad | Estado |
|---|---|---|---|---|---|---|
| FUT-<ÁREA>-NNN | | | | | P0–P3 | Open |

> P0 bloquea despliegue o escalado; P1 siguiente ciclo; P2 planificada; P3 oportunidad.
> Las limitaciones intencionales de producto van en Alcance, no aquí.

## 14. Commits y documentos

> Los commits van en el front-matter (`repo@hash`). Aquí, los documentos: ADR, plan del
> megaplán que la produjo, auditorías.
