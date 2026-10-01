# Fundamentos e influencias de REM

REM combina y configura prácticas existentes para el trabajo con agentes. Estas fuentes permiten rastrear sus conceptos; citarlas no valida empíricamente REM ni implica adoptar cada regla de los enfoques referenciados. La eficacia de la combinación requiere evaluación en contexto; véase [docs/EVALUATION.md](docs/EVALUATION.md).

## GitHub Spec Kit / Spec-Driven Development

Aporta:

- intención antes que implementación;
- constitución/gobierno del proyecto;
- organización del trabajo en Specify → Plan → Tasks → Implement;
- contexto durable para agentes;
- idea de que no todo cambio pequeño necesita el flujo pesado.

Referencias:

- Den Delimarsky (2 de septiembre de 2025), [Spec-driven development with AI: Get started with a new open source toolkit](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/). Describe las cuatro fases citadas y puntos de revisión humana.
- https://github.com/github/spec-kit (repositorio vivo; para comparar una versión concreta debe fijarse su revisión).
- https://github.com/github/spec-kit/blob/main/docs/concepts/sdd.md

REM explicita además políticas de flujo, atención humana, incidentes, auditoría, decisiones durables y observación. Esta descripción delimita REM; no afirma que Spec Kit carezca de capacidades que su proyecto pueda incorporar o evolucionar.

## DORA 2025 — AI-assisted Software Development

Aporta la idea empírica de que IA actúa como amplificador del sistema existente y que las capacidades organizacionales/entrega importan más que la herramienta aislada.

Referencia:

- https://dora.dev/research/2025/dora-report/

## Kanban Guide 2025.5

Aporta:

- control explícito de WIP;
- throughput;
- work item age;
- cycle time;
- mejora del flujo.

Referencia:

- [The Kanban Guide, mayo de 2025](https://kanbanguides.org/the-kanban-guide/2025.5/), apartados “Defining and Visualizing the Workflow” y “Flow Metrics”.

REM usa esas métricas y la lógica de flujo, pero no exige que una adopción se autodenomine Kanban ni que use un tablero visual específico.

## Shape Up

Aporta:

- dar forma al problema antes de construir;
- límites y rabbit holes;
- autonomía del equipo;
- evitar convertir ingenieros en ticket-takers;
- appetite como límite de inversión en vez de precisión falsa de estimación.

Referencia:

- [Shape Up](https://basecamp.com/shapeup), especialmente [Set Boundaries](https://basecamp.com/shapeup/1.2-chapter-03) para distinguir appetite de estimación.

REM no adopta ciclos fijos de seis semanas ni betting tables.

## OMG Essence

Aporta un lente para pensar un método como conjunto de estados, actividades, work products, competencias y progreso, en lugar de confundir metodología con una herramienta de gestión.

Referencia:

- https://www.omg.org/spec/Essence

En marzo de 2026 OMG publicó Essence 2.0 beta 2.

## ADR

REM adopta el patrón de Architecture Decision Records: conservar contexto, decisión y consecuencias. La fuente es Michael Nygard (15 de noviembre de 2011), [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions). REM concreta además cómo registrar la evolución de decisiones aceptadas.

## Origen interno

El Megaplán, Plans tipados `[INV] [DEC] [IMP] [VER]`, ramificaciones, `doctor`, escalamiento documental y distinción entre documentación prospectiva y evidencia histórica provienen de prácticas desarrolladas en el ecosistema RelataSQL y generalizadas aquí como REM. Este es el origen declarado por su autor; el repositorio publica la propuesta resultante, no un estudio independiente ni los datos privados de esos proyectos. El [ejemplo completo](docs/EXAMPLE-WALKTHROUGH.md) es ilustrativo y no sustituye evidencia empírica.
