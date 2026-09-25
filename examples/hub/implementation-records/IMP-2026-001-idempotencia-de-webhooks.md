---
id: IMP-2026-001
type: imp
title: "Los webhooks de pagos se procesan una sola vez por evento"
date: 2026-09-10
status: Deployed
repos: [api]
commits: []
related: [INC-2026-001, DEC-2026-09-10-webhook-idempotente-por-evento]
deployed: 2026-09-10
observed: 2026-09-17
---

# IMP-2026-001 — Idempotencia de webhooks

## 1. Resumen

El handler de webhooks registra el id de evento antes de cualquier efecto y responde 200 a los
repetidos. Desplegado el 2026-09-10; una semana sin pedidos duplicados.

## 3. Alcance

- **Incluido:** handler de pagos, tabla de eventos procesados.
- **Fuera de alcance intencional:** reordenar eventos.

## 5. Qué quedó

- Registro del evento y efecto en la misma transacción.
- **Evidencia:** `api/src/modules/payments/webhook.handler.ts`

## 9. Verificación

### Ejecutado y aprobado

| Repo / entorno | Comando o escenario | Resultado | Fecha |
|---|---|---|---|
| api | `npm test -- webhook` | 12 pruebas, 3 nuevas en rojo contra el árbol anterior | 2026-09-10 |

### No cubierto

- Eventos que llegan fuera de orden.

## 10. Despliegue

2026-09-10 16:00, con el despacho automático reactivado tras comprobar la cola.

## 11. Observación

Del 2026-09-10 al 2026-09-17: 0 pedidos con pago repetido.
