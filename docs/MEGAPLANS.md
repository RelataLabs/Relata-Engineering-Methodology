# Megaplanes y planes — guía de REM 1.1

> Esta guía se copia tal cual a la carpeta de megaplanes de cada adopción, como
> `megaplanes/README.md`. `README.md` nunca es un documento: el tooling lo salta.

Un **megaplán** describe trabajo **en curso**: varios objetivos que se quieren terminados
juntos, con sus dependencias, sus decisiones pendientes y las misiones secundarias que
aparecen a mitad. Un **plan** es uno de esos objetivos, con su checklist.

Es el único tipo que habla de lo que todavía no está hecho. Los demás miran hacia atrás o
hacia los lados: un ADR fija una decisión, una DEC escribe una regla, un IMP documenta lo
entregado, un INC es un post-mortem, una AUD es una foto, un ARCH describe el presente.
Ninguno sirve para «esto es lo que estamos haciendo y por dónde vamos».

## Por qué existe

En el proyecto donde nació REM, el trabajo pendiente vivía en un directorio suelto, sin
repositorio y sin validación: media docena de ficheros de estado, planes numerados a mano y
notas de deuda. Cuando alguien preguntaba cómo íbamos, la respuesta era un volcado en el que
no se distinguía lo cerrado de lo bloqueado, ni lo que esperaba una decisión de lo que
esperaba código.

El problema no era la falta de información: era la falta de forma. Un megaplán le pone forma
y —esto es lo que lo distingue de un fichero de notas— **el doctor la comprueba**.

Si tu proyecto tiene hoy carpetas de "planes", "fases", "handoffs" o "auditorías con plan"
sueltas en un repo de código, ese es exactamente el síntoma. Ver
[BOOTSTRAP.md](https://github.com/RelataLabs/Relata-Engineering-Methodology/blob/main/docs/BOOTSTRAP.md#5-migración-brownfield).

## Cuándo abrir uno

| Situación | Documento |
|---|---|
| Una regla pequeña que hay que dejar escrita | `DEC` |
| Una decisión de arquitectura con consecuencia larga | `ADR` |
| Algo que **ya** se entregó y hay que documentar | `IMP` |
| Algo que se rompió | `INC` |
| Una revisión sistemática | `AUD` |
| **Un** objetivo por delante que no cabe en un commit | **Plan suelto** (`PLAN-YYYY-NNN`) |
| **Dos o más objetivos por delante, con alguna dependencia entre ellos** | **megaplán** |

La regla es positiva: cuando algo **depende de otra cosa**, o el trabajo va a durar lo
bastante como para ramificarse, el megaplán **DEBE** abrirse (METHOD §5.4). No abrirlo no
ahorra trabajo: lo esconde.

## Estructura

```text
megaplanes/
├── README.md                        esta guía
├── MEGA-2026-001-<slug>.md          el maestro: objetivo general y tabla de planes (generada)
└── planes/
    ├── MEGA-2026-001-P1-<slug>.md   un objetivo específico, con su checklist
    ├── MEGA-2026-001-P2-<slug>.md
    └── PLAN-2026-001-<slug>.md      un Plan suelto, sin megaplán
```

El maestro lleva el **objetivo general**, que puede ser acumulado: lo que une a sus planes es
que se quieren terminados juntos. Cada plan lleva **un** objetivo específico.

## Numeración

- Megaplán: `MEGA-YYYY-NNN`, correlativo en el año.
- Plan de megaplán: `MEGA-YYYY-NNN-PN`, correlativo dentro de su megaplán. El ID del plan lleva
  el de su padre a propósito: suelto en un listado, sigue diciendo a qué responde.
- Plan suelto: `PLAN-YYYY-NNN`, con `megaplan: null`.

Los números los calcula `scripts/rem-new.mjs` contra lo publicado, para que dos personas no
elijan el mismo (ver [TEAM.md](https://github.com/RelataLabs/Relata-Engineering-Methodology/blob/main/docs/TEAM.md)).

## Cómo se crea

1. `node scripts/rem-new.mjs mega <slug>` crea el maestro.
2. **Antes de escribir los planes, contrasta las premisas con el código** y rellena la tabla
   "Premisas verificadas". En la práctica alguna resulta falsa y cambia el reparto de los
   planes; mejor descubrirlo antes de repartirlos.
3. `node scripts/rem-new.mjs plan <slug> --mega MEGA-YYYY-NNN`, una vez por objetivo. Añade el
   plan a `plans:` del maestro (las dos direcciones: la regla 12 comprueba que se citan
   mutuamente).
4. Rellena `depends_on`, `touches` y el "Contrato de entrega" de cada plan.
5. `node scripts/rem-index.mjs && node scripts/rem-doctor.mjs`.

Si lo abre un incidente o una auditoría, se crean en el mismo commit y se enlazan. Añadir un
plan a mitad es lo mismo: se crea, entra en `plans:` y **se anota en la bitácora por qué
apareció**.

## Estados

`Pendiente` · `Activo` · `Verificando` · `Desplegado` · `Observando` · `Pausado` · `Cerrado` · `Abandonado`

Son propios de megaplanes y planes y no se mezclan con los de los otros tipos (el doctor
avisa a los siete días de un estado transitorio como `Draft`; un megaplán vive semanas por
definición). `Abandonado`, cerrado con su motivo, vale más que un plan que se queda en
`Pausado` para siempre.

Qué significa cada paso hacia producción, sin ambigüedad:

1. **En código**: mergeado a la rama de integración con la verificación exigida en verde.
2. **Desplegado**: en el entorno objetivo, con su comprobación posterior y su hora.
3. **Cerrado**: solo cuando todo `[VER]` y `[OBS]` exigido está hecho, incluidos los
   recorridos manuales en producción si el criterio de cierre los pide.

## La tabla de planes se genera

La tabla del maestro la escribe `scripts/rem-index.mjs` entre los marcadores `REM:PLANES`,
desde el front-matter de cada plan (estado, responsable, dependencias). **No se escribe a
mano.** Escrita a mano, la tabla y el `status` de cada plan son el mismo dato dos veces, y en
el hub de origen de REM derivaron: la tabla decía `Pendiente` de un plan que llevaba días
`Activo`. En equipo, además, sería el fichero en el que chocan todos.

## Hitos tipados

| | |
|---|---|
| `[INV]` | investigar: producir el dato que falta para poder decidir |
| `[DEC]` | decidir: elegir entre opciones y dejar escrito por qué |
| `[IMP]` | implementar |
| `[VER]` | verificar de punta a punta, incluido el caso incorrecto que se teme |
| `[OBS]` | observar el resultado real después de desplegar, cuando haga falta |

Un plan puede ser todo `[IMP]`, o tres `[INV]` sin llegar a código. Las dos formas son válidas.

Al completar un hito se marca `[x]` **y se dice qué quedó y cuándo, en una línea**:

```markdown
- [x] [VER] El filtro rechaza tenants ajenos — 2026-08-11: siete pruebas nuevas, las siete
      en rojo con el árbol anterior y en verde con el cambio.
```

Ese es todo su valor: permite retomar el plan semanas después sin releerlo entero. Una
comprobación honesta sin resultado útil también se marca, con su motivo («se marca porque la
comprobación se hizo y su resultado es "no es comprobable aquí"»).

## Ramificaciones

Cuando a mitad de un plan aparece algo que **bloquea** un hito —una misión secundaria—, no se
mete en la checklist: va a la tabla de ramificaciones, con qué hito bloqueaba y dónde se
resolvió. Así, al volver, se ve qué se venía a hacer y qué se cruzó por el camino.

Si una ramificación crece hasta tener objetivo propio, deja de ser una fila: es un plan nuevo
(lo crea quien coordina) y la fila apunta a él. Una fila puede decir "Transferida a
MEGA-…-P8": mover trabajo entre planes es explícito, nunca silencioso.

## Secciones que no están en todos los documentos pero conviene conocer

- **Premisas verificadas** (maestro): qué decía el encargo, qué dice el código, qué cambia.
- **Decisiones que ordenan el megaplán** (maestro): aprobadas por quien corresponde, con fecha.
- **Esperando acción del responsable** (maestro): lo que no es código y solo puede hacer un
  humano con autoridad (un despliegue, una rotación de credenciales). Separarlo evita que
  parezca trabajo de los planes.
- **Estado para retomar** (plan): último avance, siguiente paso, bloqueos, ramas abiertas.
- **Contrato de entrega** (plan): qué produce y qué consume; permite avanzar en paralelo.
- **Restricciones heredadas** (plan): las secciones de la Constitución que gobiernan ese
  trabajo. No se borra.

## Qué comprueba el doctor

| Regla | Qué exige |
|---|---|
| 11 | El `status` es uno de los ocho de arriba |
| 12 | Un plan de megaplán declara `megaplan`, ese megaplán existe y lo lista; un Plan suelto se llama `PLAN-…` y no declara megaplán |
| 13 | Un plan `Cerrado` no tiene casillas sin marcar |
| 14 | Un megaplán `Cerrado` tiene todos sus planes `Cerrado` o `Abandonado` |
| 17 | Un plan `Activo` o `Verificando` tiene `owner` |
| 18 | Nadie supera el límite de WIP de la Constitución |
| 19 | Dos planes activos de dos personas no declaran la misma zona en `touches` (aviso) |
| 20 | Un plan que ya se entrega no depende de uno que no ha entregado (aviso) |
| 24 | Un plan que ya empezó tiene `started`; uno terminado, `closed` (aviso) |
| 25 | La tabla del maestro está entre marcadores; si no, se compara fila a fila (aviso) |

La 13 es la que sostiene el formato: dar por cerrado algo con trabajo dentro es la deriva que
estos documentos vienen a impedir. El estado dice una cosa, el contenido otra, y quien lo lee
se fía del estado.

## Cuatro trampas del tooling

1. **El bloque `---` va en el primer byte del fichero.** Un comentario antes y no hay
   front-matter. Las plantillas de REM ya ponen el comentario guía después.
2. **Las listas del front-matter son inline**: `[a, b]`. Una lista en bloque con guiones es un
   error (regla 1b); en REM 1.0 se ignoraba en silencio y un megaplán podía "cerrarse" sin
   planes.
3. **Ningún hash de 7–12 caracteres entre comillas invertidas en el cuerpo.** La regla 5b exige
   que sea un commit vivo y alcanzable. Los commits van en el front-matter, como `repo@hash`,
   y solo después del merge.
4. **`README.md` no es un documento.** El tooling lo salta: es la guía de la carpeta.

## Trabajo en equipo

Varias personas, cada una con sus agentes, avanzan el mismo megaplán sin pisarse si cada una
escribe solo lo suyo: el plan es de su `owner`, el maestro de quien coordina, las vistas
generadas de su único escritor. Protocolo completo en [TEAM.md](https://github.com/RelataLabs/Relata-Engineering-Methodology/blob/main/docs/TEAM.md).

## Cómo se cierra

Un plan se cierra cuando cumple su criterio de cierre y todas sus casillas están marcadas. Si
al llegar quedan casillas, el estado honesto es `Pausado` o `Abandonado`, y la regla 13 lo
impone de todas formas. Conviene lanzar una revisión adversarial justo antes de cerrar: en el
hub de origen de REM una revisión así tumbó dos cierres el mismo día, y la bitácora lo cuenta.

Un megaplán se cierra cuando todos sus planes están `Cerrado` o `Abandonado`. Lo aprendido no
se queda aquí: si estableció una regla, se escribe una DEC; si fue una entrega grande, un IMP.
**El megaplán describe el viaje; no es el destino.**
