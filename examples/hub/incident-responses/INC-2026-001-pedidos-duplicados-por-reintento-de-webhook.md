---
id: INC-2026-001
type: incident
title: "Un reintento del webhook de pagos creó pedidos duplicados"
date: 2026-09-08
status: Resolved
severity: null
detected: 2026-09-08
resolved: 2026-09-10
repos: [api]
commits: []
related: [DEC-2026-09-10-webhook-idempotente-por-evento, MEGA-2026-001-P1]
---

# INC-2026-001 — Pedidos duplicados por reintento de webhook

## 1. Resumen ejecutivo

Durante una hora, algunos clientes recibieron dos confirmaciones y dos envíos de un mismo pedido.
El proveedor reintentó webhooks que nuestro API tardó en contestar y cada reintento creó un
pedido. Se corrigió haciendo el webhook idempotente por id de evento.

## 3. Línea de tiempo

| Cuándo | Evento |
|---|---|
| 2026-09-08 10:05 | Soporte recibe dos quejas de envío doble |
| 2026-09-08 10:40 | Contención: se pausa el despacho automático |
| 2026-09-10 16:00 | Corrección desplegada |

## 7. Causa raíz

- **¿Por qué dos pedidos?** El handler creaba el pedido antes de registrar el evento.
- **¿Por qué hubo reintento?** La respuesta tardaba más que el timeout del proveedor.
- **Raíz:** el handler no era idempotente; la regla no estaba escrita en ninguna parte.

## 9. Contención

Despacho automático en pausa y revisión manual de pedidos con el mismo pago.

## 10. Remediación

| Horizonte | Acción | Responsable | Estado | Evidencia |
|---|---|---|---|---|
| Inmediato | Pausar despacho automático | luis | ☑ | — |
| Corto plazo | Idempotencia por id de evento | luis | ☑ | DEC-2026-09-10 |
| Estructural | Checkout v2 con estados explícitos | ana | ☑ | MEGA-2026-001 |

## 11. Verificación

Prueba que reenvía el mismo evento tres veces: un pedido. Falla contra el árbol anterior.

## 12. Lecciones

- **Qué cambiamos:** toda integración por webhook se diseña idempotente desde el primer commit.
