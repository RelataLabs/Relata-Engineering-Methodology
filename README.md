# Relata Engineering Method (REM)

**REM 1.0** es un método de ingeniería de software diseñado para equipos pequeños y medianos que trabajan con agentes de IA como parte normal del desarrollo.

Su clasificación técnica es **framework configurable de proceso de ingeniería de software y especificación de método** (*configurable software engineering process framework and method specification*). `Relata Engineering Methodology` es el nombre paraguas del proyecto; la distinción formal entre metodología, método, framework y proceso configurado está documentada en [docs/CLASSIFICATION.md](docs/CLASSIFICATION.md).

No es Scrum sin ceremonias, ni RUP reducido, ni Jira en Markdown. REM parte de una premisa distinta:

> **Generar código se ha abaratado; entender el problema, decidir bien, verificar y asumir responsabilidad siguen siendo escasos.**

Por eso REM desplaza el centro del proceso desde la administración de tareas hacia **intención, evidencia, riesgo, flujo y aprendizaje**.

## REM en una frase

**El humano define intención y autoridad; el agente investiga y construye; la automatización verifica invariantes; el sistema solo se considera terminado cuando existe evidencia suficiente de que resolvió el problema.**

## Ciclo central

```text
PROBLEMA
   │
   ▼
SELECT
   │
   ▼
PLAN
   │
   ├─ [INV] Investigar
   ├─ [DEC] Decidir
   ├─ [IMP] Implementar
   ├─ [VER] Verificar
   └─ [OBS] Observar, cuando haga falta
   │
   ▼
CERRAR / APRENDER
```

`[OBS]` no es obligatorio para todo cambio. Se exige cuando la corrección o el resultado solo puede comprobarse razonablemente en un entorno real.

## Principios

1. **El coste del proceso es proporcional al riesgo, la incertidumbre y la permanencia de la decisión.**
2. **La intención precede a la implementación en trabajo no trivial.**
3. **La atención humana es el WIP realmente escaso.**
4. **La evidencia pesa más que el estado declarado.**
5. **Las dependencias y el riesgo ordenan el trabajo; las estimaciones de horas no son requisito.**
6. **Un agente puede producir artefactos, pero no aceptar riesgo ni ampliar autoridad por sí mismo.**
7. **Los cambios pequeños deben poder seguir siendo pequeños.**
8. **El proceso se automatiza donde una máquina pueda comprobarlo.**
9. **Se mide flujo y resultados, no story points ni volumen de código.**
10. **El método también se inspecciona y evoluciona.**

## Qué NO exige REM

REM no exige:

- Jira ni ningún tracker específico.
- sprints;
- dailies;
- story points;
- velocity;
- estimación en horas;
- una rama por ticket;
- PR para cada cambio;
- una arquitectura concreta;
- Clean Architecture, SOLID, DDD o microservicios;
- un documento por cada cambio;
- que un humano escriba manualmente commits, changelogs o documentación que un agente puede generar y otro mecanismo puede verificar.

## Arquitectura documental

```text
METHOD.md                 norma del método
CONSTITUTION.md           plantilla de reglas técnicas del proyecto
AGENTS.md                 contrato de ejecución para agentes
REFERENCES.md             influencias y fundamentos
LICENSE                    mapa de licencias y alcance
NOTICE                     atribución del proyecto
TRADEMARKS.md              política de nombres y branding

docs/
  CLASSIFICATION.md       clasificación formal: methodology / method / process framework
  FLOW.md                 selección, estados y WIP
  VERIFICATION.md         niveles de evidencia
  METRICS.md              métricas de flujo y outcome
  TAILORING.md            cómo adaptar REM sin romperlo
  ADOPTION.md             adopción práctica

templates/
  DECISION-NOTE.md
  ADR.md
  INCIDENT.md
  AUDIT.md
  IMPLEMENTATION-RECORD.md
  MEGAPLAN.md
  PLAN.md

scripts/
  rem-doctor.mjs          comprueba invariantes
  rem-flow.mjs            resume WIP y flujo

rem.config.example.json   configuración de referencia
```

## La idea del Megaplán

Un **Megaplán** es el artefacto de orquestación para trabajo futuro complejo: agrupa varios objetivos que se quieren completar juntos y explicita dependencias, orden causal, alcance y criterio de cierre.

Cada objetivo específico vive en un **Plan**. Un Plan no es un ticket: contiene contexto, objetivo, restricciones, hitos tipados, ramificaciones, decisiones, evidencia y criterio de cierre.

El Megaplán es deliberadamente pesado. **No se usa para un bug pequeño o una modificación evidente.**

## Ruta barata y ruta pesada

```text
cambio mecánico
  → commit + verificación

cambio observable pequeño
  → changelog + commit + verificación

regla que debe sobrevivir al diff
  → DEC

decisión estructural
  → ADR

trabajo con varios objetivos/dependencias
  → MEGA + PLAN

incidente
  → INC

revisión sistemática
  → AUDIT

entrega relevante que necesita evidencia durable
  → IMP
```

## Licencias

REM se publica con un modelo de licencia dual según el tipo de material:

- **Especificación, documentación y plantillas:** [Creative Commons Attribution 4.0 International (CC BY 4.0)](LICENSE-CC-BY-4.0).
- **Software y tooling ejecutable:** [Apache License 2.0](LICENSE-APACHE-2.0).

El alcance exacto por ruta está definido en [LICENSE](LICENSE) y la atribución del proyecto en [NOTICE](NOTICE).

Esto permite usar, enseñar, adaptar y redistribuir REM —también en contextos comerciales— manteniendo atribución y trazabilidad de modificaciones. Los nombres, logos y branding oficial de RelataLabs/REM no quedan licenciados por esas licencias; consulta [TRADEMARKS.md](TRADEMARKS.md).

Atribución sugerida para documentación o adaptaciones:

> Based on Relata Engineering Methodology (REM) 1.0 by RelataLabs, licensed under CC BY 4.0.

## Estado de esta especificación

- **Versión:** 1.0.0
- **Estado:** Stable
- **Fecha:** 2026-09-08
- **Idioma normativo:** español
- **Clasificación:** configurable software engineering process framework + method specification
- **Publicación:** open specification versionada
- **Documentación:** CC BY 4.0
- **Tooling:** Apache-2.0

La especificación normativa está en [METHOD.md](METHOD.md). La clasificación formal está en [docs/CLASSIFICATION.md](docs/CLASSIFICATION.md).
