---
id: DEC-2026-09-02-reembolso-solo-al-medio-original
type: dec
title: "Un reembolso vuelve siempre al medio de pago original, nunca a saldo de tienda"
date: 2026-09-02
status: Accepted
extends: ADR-0001
repos: [api]
commits: []
related: []
---

# Reembolso al medio original

**Síntoma.** Soporte ofrecía "saldo de tienda" en lugar de reembolso para ahorrar comisiones.

**La regla, explícita.** Todo reembolso vuelve al medio con el que se pagó. El saldo de tienda solo
existe si el cliente lo pide por escrito.

**Decisión.** El servicio de reembolsos no expone la opción de saldo; la operación manual queda
registrada con quién la pidió.

**Cómo se sabría que esto se rompió.** Un reembolso con destino "saldo" sin petición asociada en el
registro de auditoría.
