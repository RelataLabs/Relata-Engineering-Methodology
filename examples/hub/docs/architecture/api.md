---
id: ARCH-api
type: arch
title: "El API de Lumen: pedidos, pagos e inventario"
date: 2026-08-20
status: Vigente
last_verified: 2026-09-20
verified_against: []
repos: [api]
related: [ADR-0001]
---

# API

## Qué es

Backend de la tienda: pedidos, pagos (a través de un proveedor externo) e inventario.

## Estructura

- `src/modules/orders` — máquina de estados del pedido y su contrato.
- `src/modules/payments` — puerto `PaymentProvider`, adaptador del proveedor, webhooks.
- `src/modules/inventory` — reservas de stock.

## Dependencias

- **Permitidas:** `orders` usa `payments` e `inventory` por sus servicios.
- **Prohibidas:** importar repositorios de otro módulo.

## Decisiones que lo explican

[ADR-0001](../../architecture-decisions/ADR-0001-pagos-con-proveedor-externo.md).

## Cómo se verificó

Lectura de `src/modules/*` el 2026-09-20.
