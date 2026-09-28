---
id: MEGA-2026-001-P1
type: plan
title: "El pedido tiene estados explícitos y solo avanza por transiciones válidas"
date: 2026-09-10
status: Cerrado
owner: luis
megaplan: MEGA-2026-001
verification_level: V2
depends_on: []
touches: [api:src/modules/orders]
repos: [api]
related: [IMP-2026-001]
commits: []
started: 2026-09-10
verified: 2026-09-14
deployed: 2026-09-15
observed:
closed: 2026-09-16
---

# MEGA-2026-001-P1 — Estados de pedido explícitos

## Contexto

El pedido era un booleano `paid`; un webhook repetido o tardío no tenía dónde encajar.

## Objetivo específico

Una máquina de estados del pedido con transiciones validadas en el API.

## Restricciones heredadas (Constitución)

- **§2 api:** los módulos exponen servicios, no repositorios.
- **§4 V2:** las pruebas nuevas fallan contra el árbol anterior.

## Contrato de entrega

- **Produce:** `OrderStatus` = `created → paid → fulfilled | refunded`, publicado en
  `api/src/modules/orders/contract.ts`.

## Checklist

- [x] [INV] Listar los caminos que hoy crean o cambian pedidos — 2026-09-11: tres; uno de
      ellos desde el web, que resultó ser solo lectura.
- [x] [DEC] Estados y transiciones — 2026-09-12: cuatro estados; `refunded` solo desde `paid`
      o `fulfilled`.
- [x] [IMP] Máquina de estados en el servicio de pedidos — 2026-09-13.
- [x] [VER] Transiciones inválidas rechazadas — 2026-09-14: 9 pruebas, 6 en rojo contra el
      árbol anterior.

## Criterio de cierre

Ningún camino del código cambia el estado sin pasar por la máquina.
