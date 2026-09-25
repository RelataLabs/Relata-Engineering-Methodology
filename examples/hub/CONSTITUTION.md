# Constitución de ingeniería — Lumen (ejemplo)

**Versión:** 1.0 · **Basada en:** REM 1.1 · **Coordinación:** ana

## 1. Repositorios

| Repo | Rol | Stack | Rama de integración |
|---|---|---|---|
| `web` | Tienda | Next.js | `main` |
| `api` | Pedidos, pagos, inventario | NestJS, Postgres | `main` |

## 2. Arquitectura por repositorio

| Repo | Patrón | Reglas | Desviaciones medidas |
|---|---|---|---|
| `web` | Feature folders + hooks de datos | Los componentes no llaman a `fetch`; usan hooks de `features/*/data` | — |
| `api` | Monolito modular | Un módulo expone servicios, nunca repositorios; pagos detrás de un puerto | — |

## 3. Seguridad y datos

- Ningún dato de tarjeta pasa por nuestros servidores (proveedor externo, ADR-0001).
- Los webhooks se verifican por firma y se procesan de forma idempotente.
- Secretos solo en el entorno.

## 4. Verificación

| Nivel | Evidencia mínima |
|---|---|
| V0 | `npm run build` en el repo tocado |
| V1 | V0 + `npm test` + la prueba del comportamiento nuevo |
| V2 | V1 + prueba adversarial + la prueba falla contra el árbol anterior + rollback |
| V3 | V2 + segundo revisor + `[OBS]` en producción |

## 5. Git y entrega

- Commits convencionales con cuerpo; changelog `required` (hook `commit-msg`).
- Atribución de IA en commits: bloqueada por el hook.
- La historia publicada no se reescribe.

## 6. Topología documental

Hub con spokes: `web` y `api` llevan CHANGELOG, hook y el bloque de agente.

## 7. Agentes

Sin confirmación: leer, implementar y probar en local. Con aprobación: migraciones, cambios de
precios, reembolsos manuales.

## 8. Equipo y coordinación

- Personas: ana (coordina), luis, marta.
- WIP 1 por persona. Selección: la de REM por defecto. Protocolo de docs/TEAM.md; las vistas
  generadas las regenera el hook local (equipo pequeño que empuja poco).

## 9. Recursos compartidos

| Recurso | Dónde vive |
|---|---|
| Contrato de pedidos entre `web` y `api` | `api/src/modules/orders/contract.ts` |

## 10. Excepciones vigentes

Ninguna.
