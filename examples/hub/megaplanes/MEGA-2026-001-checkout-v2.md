---
id: MEGA-2026-001
type: mega
title: "El checkout nunca cobra dos veces ni pierde un pedido pagado"
date: 2026-09-10
status: Activo
owner: ana
plans: [MEGA-2026-001-P1, MEGA-2026-001-P2]
repos: [web, api]
related: [INC-2026-001]
started: 2026-09-10
closed:
---

# MEGA-2026-001 — Checkout v2

## Objetivo general

Que un pago siempre produzca exactamente un pedido, aunque el proveedor reintente, el cliente
recargue o la red falle.

## Por qué ahora

[INC-2026-001](../incident-responses/INC-2026-001-pedidos-duplicados-por-reintento-de-webhook.md).

## Premisas verificadas

| El encargo decía | El código dice | Consecuencia aquí |
|---|---|---|
| "El web crea el pedido al volver del proveedor" | el web solo lo muestra; lo crea el webhook | el web no necesita idempotencia propia (P2 se reduce) |

## Planes

<!-- REM:PLANES:START — generado por scripts/rem-index.mjs, no editar a mano -->

| Plan | Objetivo específico | Estado | Responsable | Depende de |
|---|---|---|---|---|
| [**P1**](planes/MEGA-2026-001-P1-estados-de-pedido-explicitos.md) | El pedido tiene estados explícitos y solo avanza por transiciones válidas | Cerrado | luis | — |
| [**P2**](planes/MEGA-2026-001-P2-el-web-muestra-el-estado-real.md) | El web muestra el estado real del pedido al volver del pago | Activo | marta | [P1](planes/MEGA-2026-001-P1-estados-de-pedido-explicitos.md) |

<!-- REM:PLANES:END -->

## Orden y dependencias

P2 consume los estados de pedido que publica P1.

## Criterio de cierre

P1 y P2 cerrados y una semana en producción sin pedidos duplicados ni perdidos.

## Bitácora

- **2026-09-10** — Se abre tras INC-2026-001 con P1 y P2.
