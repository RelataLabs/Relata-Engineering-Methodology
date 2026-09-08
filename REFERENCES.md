# Fundamentos e influencias de REM 1.0

REM no pretende inventar de cero cada idea. Combina patrones que funcionan bien y los adapta al desarrollo con agentes.

## GitHub Spec Kit / Spec-Driven Development

Aporta:

- intención antes que implementación;
- constitución/gobierno del proyecto;
- flujo estructurado Spec → Plan → Tasks → Implement → Converge;
- contexto durable para agentes;
- idea de que no todo cambio pequeño necesita el flujo pesado.

Referencias:

- https://github.com/github/spec-kit
- https://github.com/github/spec-kit/blob/main/docs/concepts/sdd.md

REM difiere en que no hace de la spec el único centro: añade flujo, WIP, autoridad, incidentes, auditoría, historia de decisiones, observación post-deploy y coste documental variable.

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

- https://kanbanguides.org/the-kanban-guide/

REM usa esas métricas y la lógica de flujo, pero no exige que una adopción se autodenomine Kanban ni que use un tablero visual específico.

## Shape Up

Aporta:

- dar forma al problema antes de construir;
- límites y rabbit holes;
- autonomía del equipo;
- evitar convertir ingenieros en ticket-takers;
- appetite como límite de inversión en vez de precisión falsa de estimación.

Referencia:

- https://basecamp.com/shapeup

REM no adopta ciclos fijos de seis semanas ni betting tables.

## OMG Essence

Aporta un lente para pensar un método como conjunto de estados, actividades, work products, competencias y progreso, en lugar de confundir metodología con una herramienta de gestión.

Referencia:

- https://www.omg.org/spec/Essence

En marzo de 2026 OMG publicó Essence 2.0 beta 2.

## ADR

REM adopta el patrón de Architecture Decision Records: conservar contexto, decisión y consecuencias, y no reescribir retrospectivamente decisiones aceptadas.

## Origen interno

El Megaplán, Plans tipados `[INV] [DEC] [IMP] [VER]`, ramificaciones, `doctor`, escalamiento documental y distinción entre documentación prospectiva y evidencia histórica provienen de prácticas desarrolladas en el ecosistema RelataSQL y generalizadas aquí como REM.
