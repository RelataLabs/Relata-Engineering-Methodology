---
id: MEGA-2026-001-P2
type: plan
title: "El web muestra el estado real del pedido al volver del pago"
date: 2026-09-10
status: Activo
owner: marta
megaplan: MEGA-2026-001
verification_level: V1
depends_on: [MEGA-2026-001-P1]
touches: [web:src/features/checkout]
repos: [web]
related: []
commits: []
started: 2026-09-16
verified:
deployed:
observed:
closed:
---

# MEGA-2026-001-P2 — El web muestra el estado real

## Estado para retomar

- **Último avance:** la página de retorno consulta el estado y muestra "procesando" mientras
  el pedido está en `created`.
- **Siguiente paso:** reintento con espera creciente hasta `paid` o 30 s.
- **Bloqueos:** ninguno.
- **Ramas abiertas:** web: `marta/checkout-retorno`.

## Contexto

Al volver del proveedor, el web mostraba "¡Gracias!" aunque el pago no se hubiera confirmado.

## Objetivo específico

Que la página de retorno refleje el estado del pedido publicado por P1.

## Restricciones heredadas (Constitución)

- **§2 web:** los componentes no llaman a `fetch`; usan hooks de `features/*/data`.

## Contrato de entrega

- **Consume:** `OrderStatus` de MEGA-2026-001-P1.

## Checklist

- [x] [IMP] Consultar el estado al volver — 2026-09-17: hook `useOrderStatus`.
- [ ] [IMP] Reintento con espera creciente
- [ ] [VER] Pago rechazado, pago lento y pago correcto, de punta a punta

## Avance

- **2026-09-17** — Estado visible; falta el reintento.

## Criterio de cierre

Los tres escenarios de [VER] se ven correctamente en staging.
