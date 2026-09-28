---
id: ADR-0001
type: adr
title: "Los pagos con tarjeta los procesa un proveedor externo; nunca tocamos datos de tarjeta"
date: 2026-08-20
status: Accepted
deciders: [ana]
supersedes: null
superseded_by: null
related: []
commits: []
---

# ADR-0001 — Pagos con proveedor externo

## Contexto y problema

La tienda empieza a cobrar online. Guardar o transmitir datos de tarjeta nos obligaría a un
cumplimiento que un equipo de tres personas no puede sostener.

## Fuerzas

- No almacenar datos de tarjeta.
- Poder cambiar de proveedor sin reescribir pedidos.

## Opciones consideradas

1. **Formulario propio + pasarela** — control total, cumplimiento a nuestro cargo.
2. **Checkout alojado por el proveedor + webhooks** — el proveedor ve la tarjeta; nosotros, eventos.

## Decisión

**Elegimos la opción 2**, detrás de un puerto `PaymentProvider` en `api`, para que el proveedor
concreto sea un adaptador.

## Consecuencias

- **Positivas:** ningún dato de tarjeta en nuestros sistemas.
- **Negativas:** dependemos de webhooks, que llegan duplicados y desordenados.
- **Riesgo residual:** el estado del pedido puede ir por detrás del pago unos segundos.

## Seguimiento

Si el volumen exige pagos recurrentes, revisar si el puerto sigue alcanzando.
