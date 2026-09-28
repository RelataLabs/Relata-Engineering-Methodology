# Lumen — hub de documentación de ingeniería (ejemplo)

> Hub **ficticio** que acompaña a REM como ejemplo de adopción completa y como banco de pruebas:
> el CI de REM lo audita en cada cambio. Cubre dos repos imaginarios, `web` (tienda) y `api`
> (backend), con spokes.
>
> **Se registra todo cambio, no solo los grandes.** El registro por defecto es el `CHANGELOG.md`
> de cada repo, en el mismo commit que el código. Solo se escala a este hub cuando el cambio deja
> una regla o una decisión que sobrevive al diff, o hay trabajo con dependencias por delante.

## Empieza aquí

1. Clona este hub junto a `../web` y `../api`.
2. `node scripts/rem-install.mjs` y `node scripts/rem-status.mjs`.
3. Lee la [Constitución](CONSTITUTION.md) y la [guía de megaplanes](megaplanes/README.md).

## ¿Qué documento uso?

| El cambio… | Documento | Coste |
|---|---|---|
| cambia comportamiento observable y nada más | CHANGELOG del repo | una línea |
| codifica o corrige una regla de negocio, permisos o datos | `DEC` | ≤40 líneas |
| extiende o contradice un ADR aceptado | `DEC` con `extends:` | ≤40 líneas |
| es una decisión de diseño con consecuencias largas | `ADR` | alto |
| se rompió en producción | `INC` | medio/alto |
| es una revisión sistemática | `AUD` | medio |
| son dos o más objetivos y alguno depende de otro | megaplán + planes | vive lo que dure |
| es un objetivo por delante que no cabe en un commit | Plan suelto | medio |
| describe cómo es hoy una pieza | `ARCH` | medio |

## Índice de documentos

<!-- REM:INDEX:START — generado por scripts/rem-index.mjs, no editar a mano -->

### Architecture Decision Records

- [ADR-0001 — Los pagos con tarjeta los procesa un proveedor externo; nunca tocamos datos de tarjeta](architecture-decisions/ADR-0001-pagos-con-proveedor-externo.md) — `Accepted` · 2 evoluciones, última 2026-09-10 (2026-08-20)

### Notas de decisión (DEC)

- [DEC-2026-09-02-reembolso-solo-al-medio-original — Un reembolso vuelve siempre al medio de pago original, nunca a saldo de tienda](decision-notes/2026-09-02-reembolso-solo-al-medio-original.md) — `Accepted` (2026-09-02)
- [DEC-2026-09-10-webhook-idempotente-por-evento — Cada webhook de pagos se procesa una sola vez por id de evento del proveedor](decision-notes/2026-09-10-webhook-idempotente-por-evento.md) — `Accepted` (2026-09-10)

### Incidentes (INC)

- [INC-2026-001 — Un reintento del webhook de pagos creó pedidos duplicados](incident-responses/INC-2026-001-pedidos-duplicados-por-reintento-de-webhook.md) — `Resolved` (2026-09-08)

### Auditorías (AUD)

- [AUD-2026-09-05-dependencias-del-api — Dependencias del API con vulnerabilidades conocidas](audits/2026-09-05-dependencias-del-api.md) — `Closed` (2026-09-05)

### Implementation Records (IMP)

- [IMP-2026-001 — Los webhooks de pagos se procesan una sola vez por evento](implementation-records/IMP-2026-001-idempotencia-de-webhooks.md) — `Deployed` · desplegado 2026-09-10 (2026-09-10)

### Megaplanes

- [MEGA-2026-001 — El checkout nunca cobra dos veces ni pierde un pedido pagado](megaplanes/MEGA-2026-001-checkout-v2.md) — `Activo` · responsable ana (2026-09-10)

### Planes

- [MEGA-2026-001-P1 — El pedido tiene estados explícitos y solo avanza por transiciones válidas](megaplanes/planes/MEGA-2026-001-P1-estados-de-pedido-explicitos.md) — `Cerrado` · responsable luis · de MEGA-2026-001 · desplegado 2026-09-15 (2026-09-10)
- [MEGA-2026-001-P2 — El web muestra el estado real del pedido al volver del pago](megaplanes/planes/MEGA-2026-001-P2-el-web-muestra-el-estado-real.md) — `Activo` · responsable marta · de MEGA-2026-001 (2026-09-10)
- [PLAN-2026-001 — Saber qué porcentaje de carritos termina en pago, por paso del checkout](megaplanes/planes/PLAN-2026-001-medir-la-conversion-del-checkout.md) — `Pendiente` (2026-09-18)

### Arquitectura vigente

- [ARCH-api — El API de Lumen: pedidos, pagos e inventario](docs/architecture/api.md) — `Vigente` · verificado 2026-09-20 (2026-08-20)

_Índice generado desde el front-matter de 11 documentos._
<!-- REM:INDEX:END -->
