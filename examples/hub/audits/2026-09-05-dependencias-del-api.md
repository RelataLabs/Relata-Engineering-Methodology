---
id: AUD-2026-09-05-dependencias-del-api
type: audit
title: "Dependencias del API con vulnerabilidades conocidas"
date: 2026-09-05
status: Closed
repos: [api]
commits: []
related: []
---

# Auditoría — dependencias del API (2026-09-05)

## Pregunta

¿El API arrastra dependencias con vulnerabilidades conocidas explotables?

## Alcance

- **Entra:** dependencias directas y transitivas de `api`.
- **No entra:** `web`, imágenes de contenedor.

## Método

Informe del gestor de paquetes, y lectura del uso real de cada paquete marcado.

## Resumen

| Severidad | Hallazgos |
|---|---|
| Alta | 1 |
| Baja | 1 |

## Hallazgos

### H-01 · [ALTA] (dependencias) — Librería de parseo de fechas con ReDoS

- **Dónde:** dependencia transitiva del validador de pedidos
- **Impacto:** una fecha maliciosa en el checkout bloquea el proceso.
- **Propuesta:** actualizar el validador.
- **Estado:** Mitigated (actualizado el 2026-09-06)

### H-02 · [BAJA] (dependencias) — Paquete de logging sin mantenimiento

- **Estado:** Won't fix (se reemplaza en el checkout v2)

## Trabajo generado

Ninguno nuevo: H-02 lo absorbe [MEGA-2026-001](../megaplanes/MEGA-2026-001-checkout-v2.md).
