# Ejemplo — Constitución con una sola arquitectura para todo el sistema

> Ejemplo ficticio. Muestra cómo queda en la Constitución un proyecto que impone el mismo
> patrón a todos sus repos (el caso del proyecto donde nació REM, anonimizado). Las secciones
> siguen la numeración de `CONSTITUTION.md`.

**Versión:** 1.0 · **Basada en:** REM 1.1 · **Coordinación:** <persona>

## 1. Repositorios

| Repo | Rol | Stack | Rama de integración |
|---|---|---|---|
| `app` | Aplicación web | Next.js | `master` |
| `back` | API | Node + TypeScript | `main` |
| `mcp` | Paquete público | Node + TypeScript | `main` (público) |

## 2. Arquitectura por repositorio

Todos los repos siguen **Clean Architecture con SOLID**: dominio sin dependencias, casos de uso
que dependen de puertos, adaptadores en el borde. **El código heredado no es la referencia**:
da igual lo mal que esté el fichero que se toca, el código nuevo separa responsabilidades. La
coherencia vale para nombres, idioma y formato; no para los anti-patrones.

| Repo | Patrón | Reglas | Desviaciones medidas |
|---|---|---|---|
| `app` | Clean Architecture | la UI no importa adaptadores | 3 páginas heredadas llaman a `fetch` — deuda con plan |
| `back` | Clean Architecture | un caso de uso no conoce HTTP ni SQL | — |
| `mcp` | Clean Architecture | — | — |

Además, en todos los repos:

- **Regla del Boy Scout ampliada**: un defecto de la misma familia se corrige en el mismo commit;
  lo que no es de la familia va en el suyo, pero no se calla.
- **Cero estimaciones en tiempo humano**: se ordena por lo que desbloquea cada cosa.

## 4. Verificación

- Una prueba nueva **falla contra el árbol anterior** desde V1 (no solo en V2/V3).
- El éxito se lee del **código de salida**, nunca de un grep sobre la salida.

## 5. Git y entrega

- Commits convencionales con cuerpo (síntoma → causa raíz → por qué esta solución).
- Changelog `required`: entrada en `CHANGELOG.md` en el mismo commit, en lenguaje de usuario.
- **Atribución de IA bloqueada** por el hook (`BLOCK_AI_ATTRIBUTION=1`).
- La historia publicada nunca se reescribe: hay documentos que citan hashes.

## 6. Topología documental

Hub con spokes. Los repos públicos no publican el bloque de agente ni los hooks
(`public: true` + `publicLeakTerms` en el config; regla 10 del doctor).
