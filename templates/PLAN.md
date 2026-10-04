---
id: MEGA-YYYY-NNN-PN
type: plan
title: "<El objetivo específico, en una frase que se entienda sola>"
date: YYYY-MM-DD
status: Pendiente
owner: null
megaplan: MEGA-YYYY-NNN
verification_level: V1
depends_on: []
touches: []
repos: []
related: []
commits: []
started:
verified:
deployed:
observed:
closed:
---

<!--
PLANTILLA DE PLAN — REM 1.1

Crear:  node scripts/rem-new.mjs plan <slug> --mega MEGA-YYYY-NNN   (plan de un megaplán)
        node scripts/rem-new.mjs plan <slug>                        (Plan suelto: PLAN-YYYY-NNN, megaplan: null)

Un plan es UN objetivo específico. Si te salen dos que se pueden cerrar por separado,
son dos planes.

Front-matter — lo que el tooling comprueba:
  · `megaplan` resuelve y ese megaplán te lista en `plans` (regla 12, las dos direcciones).
  · Las listas son INLINE: [a, b]. Una lista en bloque con guiones es un error (regla 1b).
  · `owner` es UN humano. Tomar el plan = poner tu nombre + `status: Activo` + `started`,
    commitear solo eso y empujar enseguida: el push es el candado (docs/TEAM.md).
  · `touches: [repo:ruta]` declara la zona de código que el plan cambia. Dos planes
    activos de dos personas que se pisan producen un aviso (regla 19).
  · `depends_on: [ID]` son los planes que tienen que entregar antes (regla 20).
  · `commits: [repo@hash]` se rellena DESPUÉS del merge a la rama de integración (regla 5).
  · Ningún hash de 7–12 caracteres entre comillas invertidas en el cuerpo (regla 5b).

Estados: Pendiente · Activo · Verificando · Desplegado · Observando · Pausado · Cerrado · Abandonado.
Un plan `Cerrado` no tiene casillas sin marcar (regla 13).

EN EQUIPO: este fichero lo edita su owner (y sus agentes). Nadie más. Si algo de otro
plan te afecta, se dice en una DEC que lo enlace, no editando su plan.

Las secciones son un menú: borra las que no apliquen. EXCEPTO "Restricciones heredadas",
que no se borra. El menú aplica a secciones de un documento, nunca a tipos ni carpetas.
-->

# MEGA-YYYY-NNN-PN — <título corto>

## Estado para retomar

> Lo primero que lee quien retoma el plan —otra persona, tu agente mañana, tú en tres
> semanas—. Se reescribe al terminar cada sesión de trabajo; no es un historial (eso es
> "Avance"). Mientras el plan esté `Pendiente`, déjalo vacío.

- **Último avance:** <qué quedó hecho en la última sesión>
- **Siguiente paso:** <la próxima acción concreta>
- **Bloqueos:** <qué espera a quién; "ninguno">
- **Ramas abiertas:** <repo: rama — qué contiene>

## Contexto

> Qué se sabe hoy y qué duele. Concreto: qué se observa, dónde (`archivo:línea`) y por qué
> importa. La evidencia —una respuesta HTTP, una medición, un log— va aquí.

## Objetivo específico

> Una frase. Si necesitas dos, tienes dos planes.

## Resultado

> Qué cambia para el usuario o el sistema cuando esto funciona.

## Fuera de alcance

> Qué NO se toca. Lo que se saca a propósito no es deuda: es una decisión.

## Restricciones heredadas (Constitución)

> Esta sección no se borra. Cita las secciones de la Constitución que gobiernan este
> trabajo —arquitectura del repo que se toca, seguridad y datos, verificación, Git— para
> que quien ejecute no tenga que acordarse y quien revise pueda señalarlas.

- **§<n> <tema>:** <la regla, en una línea, tal como aplica aquí>

## Restricciones de este plan

> Solo las propias de este plan. Las globales viven en la Constitución.

## Contrato de entrega

> Lo que este plan le entrega a otros y lo que necesita de otros. Es lo que permite que
> varios planes avancen en paralelo sin esperarse: se trabaja contra el contrato, no
> contra la implementación ajena. Cambiar un contrato ya publicado exige una DEC que
> enlace a los planes que dependen de él.

- **Produce:** <endpoint, evento, tabla, componente, documento — con su forma>
- **Consume:** <lo que espera de otro plan, y de cuál>

## Recursos y compromisos económicos

> Cuando este Plan afecte un compromiso económico, enlaza el registro común y precisa el impacto, período y autoridad aplicable. Evita duplicar partidas. Esta sección es opcional según el contexto y la Constitución.

## Checklist

> Hitos tipados: casi siempre hay que averiguar algo antes de poder decidir, y decidir
> antes de poder implementar.
>
> `[INV]` producir el dato que falta · `[DEC]` elegir y dejar escrito por qué ·
> `[IMP]` construir · `[VER]` demostrar · `[OBS]` comprobar el resultado real tras desplegar
>
> Al completar un hito se marca `[x]` **y se dice qué quedó y cuándo, en una línea**. Eso
> es todo su valor: permite retomar el plan sin releerlo entero. Una comprobación honesta
> sin resultado útil también se marca, con su motivo.

- [ ] [INV] <qué hay que averiguar, y qué decisión desbloquea>
- [ ] [DEC] <qué hay que decidir, y qué opciones hay sobre la mesa>
- [ ] [IMP] <qué hay que construir>
- [ ] [VER] <cómo se demuestra que funciona, incluido el caso incorrecto que se teme>
- [ ] [OBS] <qué señal real cierra el plan después de desplegar, si aplica>

<!-- Ejemplo de hito cerrado (las continuaciones van sangradas seis espacios):
- [x] [IMP] Filtrar la consulta de aprobaciones por espacio de trabajo — 2026-08-11:
      el filtro pasa de userId a workspaceId; queda pendiente quién aprueba.
-->

## Ramificaciones

> Lo que apareció a mitad y **bloqueaba** un hito. Va aquí y no en la checklist para no
> perder el hilo de lo que se venía a hacer. Si una ramificación crece hasta tener objetivo
> propio, deja de ser una fila: es un plan nuevo (lo crea quien coordina el megaplán).

| Qué apareció | Qué hito bloqueaba | Dónde se resolvió | Estado |
|---|---|---|---|
| <hallazgo> | <hito> | <commit, DEC, INC, plan o "aquí mismo"> | Abierta |

## Decisiones

> Donde aterrizan los `[DEC]`. Si la decisión establece una **regla** del sistema, no se
> queda aquí: se escribe una DEC y se enlaza.

- **YYYY-MM-DD — <decisión>.** <Por qué, y qué se descartó.>

## Avance

> Bitácora del plan: una línea fechada por sesión o entrega relevante. Se añade, no se
> reescribe.

- **YYYY-MM-DD** — <qué pasó>

## Verificación

> Con los comandos reales, y leyendo el resultado del código de salida, no de un grep.
> Separa lo ejecutado de lo que no; un plan que dice "verificado" sin decir cómo no vale
> más que uno que no lo dice. Nivel exigido: `verification_level` (docs/VERIFICATION.md).

### No verificado

> Lo que no pudo demostrarse, y por qué.

## Observación

> La señal de producción o de usuario que cierra `[OBS]`, si aplica.

## Criterio de cierre

> Qué tiene que ser cierto para poner `Cerrado`. Si al llegar quedan casillas sin marcar,
> el estado honesto es `Pausado` o `Abandonado`.
