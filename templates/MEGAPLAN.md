---
id: MEGA-YYYY-NNN
type: mega
title: "<El objetivo general, en una frase que se entienda sola>"
date: YYYY-MM-DD
status: Pendiente
owner: "<quien coordina>"
plans: []
repos: []
related: []
started:
closed:
---

<!--
PLANTILLA DE MEGAPLÁN — REM 1.1

Crear:  node scripts/rem-new.mjs mega <slug>
        y un plan por objetivo: node scripts/rem-new.mjs plan <slug> --mega MEGA-YYYY-NNN

CUÁNDO: hay dos o más objetivos que se quieren terminados juntos y ALGO DEPENDE DE OTRA
COSA, o el trabajo va a durar lo bastante como para ramificarse. Entonces DEBE abrirse
(METHOD §5.4). Un objetivo suelto y corto no lo necesita: es un Plan suelto o un commit.

Lee megaplanes/README.md (docs/MEGAPLANS.md de REM) antes de crear uno.

EN EQUIPO: este fichero es de quien coordina (`owner`). Los responsables de cada plan
editan su plan, no el maestro. La tabla de planes NO se escribe a mano: la genera
scripts/rem-index.mjs desde el front-matter de cada plan, entre los marcadores REM:PLANES.
Así el estado de la tabla y el `status` del plan no pueden contradecirse.

Estados: Pendiente · Activo · Verificando · Desplegado · Observando · Pausado · Cerrado · Abandonado.
Las secciones son un menú: borra las que no apliquen.
-->

# MEGA-YYYY-NNN — <título corto>

## Objetivo general

> Una frase. **Puede ser acumulado**: lo que une a sus planes es que se quieren terminados
> juntos, no que traten de lo mismo.

## Por qué ahora

> Qué pasó para que esto se abra hoy. Si nació de un incidente, una auditoría o una
> conversación, dilo y enlázalo.

## Resultado esperado

> Qué efecto importa, no solo qué software se producirá.

## Premisas verificadas

> Antes de escribir los planes, se contrastan las premisas del encargo con el código. En la
> práctica, alguna resulta falsa y cambia el reparto de los planes.

| El encargo decía | El código dice | Consecuencia aquí |
|---|---|---|
| <premisa> | <`archivo:línea` o medición> | <qué cambia en los planes> |

## Planes

<!-- REM:PLANES:START — generado por scripts/rem-index.mjs, no editar a mano -->

<!-- REM:PLANES:END -->

## Orden y dependencias

> Qué desbloquea qué, y por qué ese orden. **Sin plazos**: se ordena la dependencia, no el
> calendario. Las dependencias máquina-legibles van en `depends_on` de cada plan.

## Decisiones que ordenan el megaplán

> Decisiones aprobadas por quien corresponde que afectan a varios planes, con fecha. Si una
> establece una regla del sistema, además se escribe como DEC.

- **YYYY-MM-DD — <decisión>.** <quién la aprobó y qué descarta>

## Esperando acción del responsable

> Lo que no es código y solo puede hacer un humano con autoridad: un despliegue, una
> rotación de credenciales, una firma, una compra. Separarlo evita que parezca trabajo de
> los planes.

- [ ] <acción> — <quién>

## Fuera de alcance

> Qué NO entra, para que nadie lo dé por incluido.

## Criterio de cierre

> Qué tiene que ser cierto para `Cerrado`. Al cerrar, todos sus planes están `Cerrado` o
> `Abandonado` (regla 14), y lo aprendido se extrae a DEC o IMP: el megaplán describe el
> viaje, no es el destino.

## Bitácora

> Solo lo que cambia el megaplán ENTERO: un plan que nace a mitad (y por qué), uno que se
> abandona, un cambio de orden, un intento de cierre fallido. El día a día vive en cada plan.

- **YYYY-MM-DD** — <qué pasó y qué consecuencia tuvo>
