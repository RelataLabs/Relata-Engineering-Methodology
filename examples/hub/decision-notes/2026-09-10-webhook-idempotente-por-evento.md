---
id: DEC-2026-09-10-webhook-idempotente-por-evento
type: dec
title: "Cada webhook de pagos se procesa una sola vez por id de evento del proveedor"
date: 2026-09-10
status: Accepted
extends: ADR-0001
repos: [api]
commits: []
related: [INC-2026-001]
---

# Webhook idempotente por evento

**Síntoma.** Un reintento del proveedor creó pedidos duplicados ([INC-2026-001](../incident-responses/INC-2026-001-pedidos-duplicados-por-reintento-de-webhook.md)).

**La regla, explícita.** El id de evento del proveedor es la clave de idempotencia. Un evento ya
procesado responde 200 sin efectos.

**Fuera de alcance.** El orden de los eventos: se resuelve por estado del pedido, no aquí.

**Cómo se sabría que esto se rompió.** Dos filas en `processed_events` con el mismo id, o dos
pedidos con el mismo pago.
