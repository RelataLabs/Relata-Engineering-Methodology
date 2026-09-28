---
id: PLAN-2026-001
type: plan
title: "Saber qué porcentaje de carritos termina en pago, por paso del checkout"
date: 2026-09-18
status: Pendiente
owner: null
megaplan: null
verification_level: V1
depends_on: []
touches: [web:src/features/checkout]
repos: [web]
related: []
commits: []
started:
verified:
deployed:
observed:
closed:
---

# PLAN-2026-001 — Medir la conversión del checkout

## Contexto

No sabemos en qué paso se abandonan los carritos.

## Objetivo específico

Un embudo por paso del checkout, sin datos personales.

## Restricciones heredadas (Constitución)

- **§3:** ningún dato personal en los eventos de analítica.

## Checklist

- [ ] [DEC] Qué eventos y con qué propiedades
- [ ] [IMP] Instrumentar los cuatro pasos
- [ ] [OBS] Una semana de datos en producción

## Criterio de cierre

El embudo existe y se consultó con una semana de datos.
