# Trabajo en equipo — varias personas, cada una con sus agentes, en el mismo Megaplán

REM 1.0 cubría a **varios agentes de una misma persona** dentro de un Plan (METHOD §7.2). No
decía qué pasa cuando **cinco personas, cada una con sus agentes, avanzan el mismo Megaplán a la
vez**. En la práctica eso produce siempre los mismos choques:

- dos agentes editan la tabla del maestro a la vez y uno pisa al otro;
- dos personas crean "el siguiente ADR" y los dos se llaman ADR-0007;
- el índice del README se regenera en cada commit y todos chocan en él;
- dos planes activos tocan el mismo módulo y se enteran en el merge, o en producción;
- alguien cambia un contrato que otro plan consumía y el otro plan se entera tarde;
- un agente retoma el plan de ayer sin saber qué quedó a medias.

Este documento es el protocolo que los evita. Su principio es uno:

> **Cada fichero tiene un solo escritor.** Lo que es de todos se genera, no se edita.

METHOD §7.5 lo hace normativo; aquí está el detalle.

## 1. Roles

| Rol | Quién | Autoridad |
|---|---|---|
| **Coordinador** | el `owner` del megaplán (un humano) | edita el maestro: objetivo, planes que nacen o se abandonan, "Decisiones que ordenan", "Esperando acción", bitácora; asigna números de plan |
| **Responsable de plan** | el `owner` del plan (un humano) | edita su plan; decide dentro de su objetivo; acepta o rechaza su riesgo residual |
| **Agente** | trabaja para un humano | edita lo que edita su humano, nada más; no toma planes por su cuenta |
| **CI** | la automatización | único escritor de las vistas generadas (si `generated.index = "ci"`) |

Un plan tiene **un** responsable. Si un objetivo necesita a dos personas, son dos planes con su
"Contrato de entrega" entre ellos.

## 2. Quién escribe qué

| Fichero | Escritor | Los demás… |
|---|---|---|
| Maestro del megaplán (`MEGA-…`) | coordinador | proponen cambios al coordinador |
| Tabla de planes del maestro | `rem-index` (CI) | no la tocan; sale del front-matter de los planes |
| Plan (`MEGA-…-PN`, `PLAN-…`) | su `owner` y sus agentes | no lo editan; si les afecta, escriben una DEC que lo enlace |
| Índice del README | `rem-index` (CI) | no lo tocan |
| `TIMELINE.md` | `rem-timeline` (quien coordina, en local) | no lo tocan |
| DEC, ADR, INC, AUD, IMP | quien los crea | los amplían con documentos nuevos (DEC `extends`, ADR `supersedes`), no editándolos |
| Constitución | por PR con revisión del coordinador | — |

## 3. Tomar un plan: el push es el candado

1. `git pull --rebase` y `node scripts/rem-status.mjs`: la sección "Planes que se pueden tomar"
   lista los `Pendiente` sin responsable y sin dependencias abiertas.
2. En un commit que **solo** hace esto: `owner: <tu handle>`, `status: Activo`,
   `started: <hoy>`.
3. `git push` **inmediatamente**.
4. Si el push es rechazado y al hacer `pull --rebase` hay conflicto en esas líneas, otra persona
   lo tomó antes: descarta tu cambio y elige otro. Si no hay conflicto, era otro plan: empuja.

No hace falta un servidor de candados: el repositorio ya serializa los pushes, y dos commits que
cambian las mismas líneas no se mezclan en silencio.

**Soltar un plan** es lo mismo al revés: `status: Pendiente` (o `Pausado` con motivo),
`owner: null`, y "Estado para retomar" al día para quien lo tome.

## 4. Nada escrito dos veces

La tabla de planes del maestro repetía el estado de cada plan, y derivaba. El índice del README
repetía el de todos los documentos, y derivaba. En REM 1.1 las dos son **vistas generadas**
desde el front-matter por `scripts/rem-index.mjs`, entre marcadores.

Quién las regenera lo declara el config (`generated.index`):

- **`ci`** (equipos): solo el workflow de CI, en la rama principal, después de cada push. Nadie
  más las commitea, así que cinco personas empujando a la vez no chocan en el README. Si la rama
  principal está protegida, el bot de CI necesita permiso para empujar, o se usa `local`.
- **`local`** (una persona): el hook `pre-commit` las regenera y las añade a cada commit.

En modo `ci` la vista puede ir un push por detrás de la verdad durante un minuto. La verdad
siempre es el front-matter de cada documento; `rem-status` lo lee directamente.

## 5. IDs sin choques

- **DEC y AUD** usan fecha + slug: no hay número que reservar.
- **ADR, INC, IMP, MEGA y Plan suelto** son correlativos. `node scripts/rem-new.mjs <tipo> <slug>`
  calcula el siguiente contra lo **publicado** (`origin/<rama del hub>`) además de lo local.
- Si aun así dos personas se cruzan, el doctor lo detecta (regla 15) y **renumera quien llegó
  segundo**: nadie cita todavía un documento de hace minutos.
- Los números de plan de un megaplán (`-PN`) los asigna el coordinador con
  `rem-new plan <slug> --mega <ID>`, que además lo añade a `plans:` del maestro.

## 6. Dependencias y contratos

- `depends_on: [ID]` en el front-matter del plan: lo que tiene que entregar otro plan antes.
  `rem-status` marca "espera …" y el doctor avisa si un plan se entrega con dependencias abiertas
  (regla 20).
- La sección **"Contrato de entrega"** de cada plan dice qué **produce** (un endpoint, un evento,
  una tabla, un componente — con su forma) y qué **consume** y de quién. Es lo que permite que dos
  planes avancen en paralelo: cada uno trabaja contra el contrato, no contra la implementación
  del otro.
- **Cambiar un contrato ya publicado** exige una DEC con `related` a los planes que lo consumen.
  `rem-status` muestra las DEC recientes con "→ afecta …", que es cómo se entera el otro equipo.

## 7. Zonas de cambio

- `touches: [repo:ruta]` declara qué parte del código cambia el plan
  (`service-api:src/modules/billing`, `web:src/components/office`).
- Si dos planes **activos** de **personas distintas** declaran zonas que se solapan (misma ruta
  o una dentro de otra), el doctor avisa (regla 19). No lo prohíbe: lo hace visible a tiempo.
  Qué hacer: acordar el límite en el "Contrato de entrega" de ambos, o secuenciarlos con
  `depends_on`.
- Los **recursos compartidos** que declara la Constitución (catálogo de eventos, migraciones,
  contrato con otro servicio, tokens de diseño…) solo se cambian con DEC, aunque el cambio sea
  pequeño.

## 8. Ramas y commits en los repos de código

- Una rama por plan y repo (`<persona>/<plan>-<tema>` o la convención de la Constitución).
- Cada commit que avanza un plan lleva el trailer **`Plan: <ID>`**:

  ```text
  fix(billing): reintentar el webhook con la misma clave de idempotencia

  Síntoma: … Causa: … Por qué así: … Verificación: …

  Plan: MEGA-2026-001-P3
  ```

- `node scripts/rem-status.mjs --commits` lista los commits de cada plan leyendo ese trailer en
  la rama de integración de cada repo. Nadie tiene que editar un fichero compartido para decir
  "este commit es mío".
- `commits: [repo@hash]` del plan se rellena después del merge, por su responsable.

## 9. Traspaso

Cada plan activo abre con **"Estado para retomar"**: último avance, siguiente paso, bloqueos y
ramas abiertas. Se **reescribe** al terminar cada sesión (no es historial; el historial es
"Avance", que se **añade**). Es lo primero que lee un agente al retomar, sea el mismo mañana u
otro la semana que viene.

## 10. La sesión de un agente

**Al empezar**

1. `git pull --rebase` en el hub.
2. `node scripts/rem-status.mjs` (o `--owner <su humano>`).
3. Leer la Constitución (secciones que cite el plan) y "Estado para retomar".
4. Si su humano no tiene plan activo: preguntar, no tomar uno.

**Al terminar**

1. Marcar hitos cerrados con fecha y una línea de qué quedó.
2. Reescribir "Estado para retomar"; añadir una línea a "Avance".
3. `node scripts/rem-doctor.mjs`; commit pequeño; `git push`.

## 11. Cuando algo choca

| Situación | Resolución |
|---|---|
| Push rechazado al tomar un plan, conflicto en `owner` | otro lo tomó: elegir otro plan |
| Push rechazado por un commit del bot de CI | `git pull --rebase`: el bot solo toca vistas generadas, el rebase es limpio |
| Conflicto en el índice o en una tabla de planes | alguien los editó a mano: quedarse con la versión remota (`git checkout --theirs`) y dejar que CI regenere |
| Dos documentos con el mismo ID (regla 15) | renumera el más reciente (`rem-new` da el siguiente libre) |
| Aviso de zona solapada (regla 19) | las dos personas acuerdan el límite en sus "Contrato de entrega" o secuencian |
| Tu cambio rompe el contrato de otro plan | DEC con `related` a ese plan, y avisar a su responsable antes de mergear |
| Un plan activo sin movimiento | el coordinador pregunta; si no hay respuesta, lo pasa a `Pausado` con motivo en la bitácora |

## 12. Límites que no cambian

- **WIP por persona**, no por agente. Cinco agentes no son cinco revisores (METHOD §7.2).
- El coordinador es un humano. Un agente puede preparar la bitácora; no decide qué planes nacen.
- Nada de esto sustituye hablar: el protocolo hace visibles los choques a tiempo; resolverlos
  sigue siendo cosa de personas.
