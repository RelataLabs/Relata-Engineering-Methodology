# Ejemplo — Constitución multirepo con una arquitectura por repositorio

> Ejemplo ficticio de un producto con landing, dos aplicaciones web, una API y un servicio de
> voz. Muestra cómo se escribe "cada repo tiene su patrón" sin forzar uno común, y cómo se
> declara una adopción que todavía no toca los repos de código. Las secciones siguen la
> numeración de `CONSTITUTION.md`.

**Versión:** 1.0 · **Basada en:** REM 1.1 · **Coordinación:** <persona>

## 1. Repositorios

| Repo | Rol | Stack | Rama de integración |
|---|---|---|---|
| `landing` | Sitio público | Next.js | `development` |
| `web` | Aplicación de clientes | Next.js, SWR | `development` |
| `admin` | Backoffice interno | Next.js | `dev` |
| `api` | API y dominio | NestJS, Postgres, Redis | `development` |
| `voice` | Agente de voz | Python | `development` |

## 2. Arquitectura por repositorio

La arquitectura se clasifica por lo que el código mantiene, no por el nombre deseado. El código
nuevo sigue el patrón de su repo.

| Repo | Patrón | Reglas | Desviaciones medidas |
|---|---|---|---|
| `landing` | Atomic Design (`atoms → molecules → organisms → templates → pages`) | un nivel solo importa niveles inferiores | — |
| `web` | Clean Architecture adaptada a frontend (`core → application → infra → presentation`) | `core` no importa capas externas; los componentes usan hooks, no `infra` | N ficheros de `application` cablean singletons de `infra` — por decidir: aceptada o deuda |
| `admin` | Igual que `web` | Igual que `web` | M componentes importan `infra` — por decidir |
| `api` | Monolito modular (`src/modules/<dominio>`) | un módulo expone servicios, no repositorios | el módulo de facturación es hexagonal — aceptado |
| `voice` | Puertos y adaptadores | el pipeline no conoce el backend concreto | — |

Una "desviación medida" lleva el número y la fecha de la medición. "Por decidir" es una
pregunta abierta (§11), no un permiso.

## 3. Seguridad y datos

- Nada de datos personales en eventos, nombres de salas ni logs: identificadores.
- Seeders de fixtures nunca en producción; respaldo antes de migrar.

## 5. Git y entrega

- Atribución de IA: permitida.
- Commits de un plan con el trailer `Plan: <ID>`.

## 6. Topología documental

- **Hub sin spokes** (excepción declarada en §10): los repos de código no referencian el hub.
- Registro por defecto de un cambio: su commit. El timeline del hub se construye desde los
  commits convencionales (`timeline.source = "auto"`), y pasará a leer el CHANGELOG de cada
  repo el día que lo tenga.
- La documentación suelta que ya existía en `api/context/` se resume en documentos tipados que
  la citan (`sources:`); no se mueve ni se borra.

## 8. Equipo y coordinación

- Cinco personas; WIP 1 cada una. Las vistas generadas las regenera solo CI
  (`generated.index = "ci"`).

## 9. Recursos compartidos

| Recurso | Dónde vive |
|---|---|
| Catálogo de eventos del bus | `api/src/modules/event-bus` + estándar en `api/context/` |
| Contrato API ↔ voz | `api/src/modules/internal`, `voice/docs/contratos` |

## 10. Excepciones vigentes

| Regla exceptuada | Motivo | Responsable | Salida |
|---|---|---|---|
| Changelog por repo (`deferred`) | se empieza solo con el hub | coordinación | plan de spokes decidido |
