# Relata Engineering Method (REM)

> **Empieza aquí.** ¿Vas a adoptar REM en un proyecto (o eres un agente al que le pidieron
> hacerlo)? Sigue [docs/BOOTSTRAP.md](docs/BOOTSTRAP.md): es un checklist ejecutable con lo que
> se instala, lo que se copia tal cual, cómo migrar la documentación que ya existe y cuándo está
> terminado (`rem-doctor --adoption` sin errores). ¿Varias personas van a trabajar el mismo
> megaplán? Lee también [docs/TEAM.md](docs/TEAM.md).

**REM 1.1** es un método de ingeniería de software diseñado para equipos pequeños y medianos que trabajan con agentes de IA como parte normal del desarrollo.

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

## Qué SÍ exige una adopción REM

Lo anterior es sobre cómo se **usa** REM. Para **instalarlo**, una adopción exige:

- los ocho tipos de documento instalados, con su carpeta y su plantilla copiada tal cual, aunque empiecen vacíos (ADR, DEC, INC, AUD, IMP, Megaplán, Plan, ARCH);
- una Constitución con la arquitectura de cada repositorio, los niveles de verificación con comandos reales, la política de Git y de changelog, el equipo y las excepciones vigentes;
- `rem.config.json`, los scripts, los hooks y el CI, con el doctor corriendo en cada push y cada semana;
- el trabajo vivo con dependencias en un Megaplán desde el primer día, y la documentación existente con destino;
- que `rem-doctor --adoption` salga sin errores, y que lo que falte esté declarado como excepción con su condición de salida.

Instalar completo y usar en proporción no se contradicen: una carpeta vacía no cuesta nada; un tipo que falta hace que su primer documento se escriba en otro lado o no se escriba.

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
  BOOTSTRAP.md            instalar REM: checklist ejecutable y definición de hecho
  MEGAPLANS.md            guía de megaplanes y planes (se copia a cada adopción)
  TEAM.md                 varias personas con sus agentes en el mismo megaplán
  CLASSIFICATION.md       clasificación formal: methodology / method / process framework
  FLOW.md                 selección, estados y WIP
  VERIFICATION.md         niveles de evidencia
  METRICS.md              métricas de flujo y outcome
  TAILORING.md            cómo adaptar REM sin romperlo (y qué no es adaptar)
  ADOPTION.md             criterio de adopción

templates/
  DECISION-NOTE.md  ADR.md  INCIDENT.md  AUDIT.md  IMPLEMENTATION-RECORD.md
  MEGAPLAN.md  PLAN.md  ARCHITECTURE.md       los ocho tipos
  CHANGELOG.md                                 changelog de un repo de código
  HUB-README.md  AGENTS-HUB.md                 README y contrato de agentes de un hub
  AGENTS-CODE-REPO-BLOCK.md                    bloque para los repos de código (spokes)
  ci/rem.yml  claude-settings.json             CI y arranque de sesión de agentes

scripts/
  rem-doctor.mjs          comprueba invariantes (25 reglas + adopción)
  rem-index.mjs           genera el índice y las tablas de planes
  rem-timeline.mjs        agrega changelogs o commits de todos los repos
  rem-new.mjs             crea documentos con el ID correcto
  rem-status.mjs          tablero del equipo: quién tiene qué
  rem-flow.mjs            WIP y métricas de flujo
  rem-install.mjs         activa los hooks en un clon
  rem-precommit.mjs       lo que ejecuta el hook pre-commit
  lib/rem.mjs             parser y config compartidos

hooks/
  commit-msg              asunto, cuerpo, changelog y (opcional) atribución de IA
  pre-commit              doctor rápido y vistas generadas

examples/
  constitution-*.md       dos Constituciones de ejemplo
  hub/                    un hub completo que el CI de REM audita

rem.config.example.json   configuración de referencia
```

## La idea del Megaplán

Un **Megaplán** es el artefacto de orquestación para trabajo futuro complejo: agrupa varios objetivos que se quieren completar juntos y explicita dependencias, orden causal, alcance y criterio de cierre.

Cada objetivo específico vive en un **Plan**. Un Plan no es un ticket: contiene contexto, objetivo, restricciones, hitos tipados, ramificaciones, decisiones, evidencia y criterio de cierre.

El Megaplán es deliberadamente pesado. **No se usa para un bug pequeño o una modificación evidente.** Pero cuando hay dos o más objetivos y uno depende de otro, **se abre**: no abrirlo no ahorra trabajo, lo esconde. Guía completa en [docs/MEGAPLANS.md](docs/MEGAPLANS.md).

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

un objetivo por delante que no cabe en un commit
  → PLAN suelto

cómo es hoy una pieza del sistema
  → ARCH (se edita; lleva fecha de verificación)

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

> Based on Relata Engineering Methodology (REM) 1.1 by RelataLabs, licensed under CC BY 4.0.

## Estado de esta especificación

- **Versión:** 1.1.0
- **Estado:** Stable
- **Fecha:** 2026-09-25
- **Idioma normativo:** español
- **Clasificación:** configurable software engineering process framework + method specification
- **Publicación:** open specification versionada
- **Documentación:** CC BY 4.0
- **Tooling:** Apache-2.0

La especificación normativa está en [METHOD.md](METHOD.md). La clasificación formal está en [docs/CLASSIFICATION.md](docs/CLASSIFICATION.md).
