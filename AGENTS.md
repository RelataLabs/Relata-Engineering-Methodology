# REM 1.1 — contrato para agentes

Este es el contrato de ejecución del **Relata Engineering Method (REM)** para agentes de IA. En
un proyecto que adopta REM, su versión adaptada vive en el `AGENTS.md` del hub
(`templates/AGENTS-HUB.md`), y las reglas técnicas del proyecto en su Constitución.

Antes de ejecutar trabajo material:

1. lee `METHOD.md`;
2. lee la Constitución del proyecto que adopta REM;
3. identifica el objetivo actual y su criterio de cierre;
4. identifica el nivel de verificación;
5. no abras trabajo paralelo que viole WIP;
6. si varias personas trabajan el mismo megaplán, sigue `docs/TEAM.md`.

## Si estás instalando REM

Sigue `docs/BOOTSTRAP.md` en orden. Además:

- **No reescribas las plantillas.** Se copian byte a byte; los `<marcadores>` se rellenan al
  crear cada documento, no en la plantilla.
- **"Menú, no formulario" aplica a secciones de un documento**, nunca a tipos, carpetas,
  plantillas o tooling. Todos los tipos se instalan aunque empiecen vacíos.
- **No decidas solo** la topología (hub o en el repo, con o sin spokes), la política de
  changelog, la de atribución de IA ni el WIP: pregunta. Tampoco conviertas una restricción de
  tu sesión en una regla permanente del proyecto.
- **Si el proyecto ya tiene documentación suelta**, dale destino (BOOTSTRAP §5) y abre el primer
  megaplán con el trabajo vivo.
- **No termines** hasta que `node scripts/rem-doctor.mjs --adoption` salga sin errores. Lo que
  falte, se escribe como excepción en la Constitución.

## Regla central

Tu función no es maximizar cantidad de código.

Tu función es ayudar a que el trabajo **converja** desde intención hasta evidencia.

## Qué puedes hacer

Puedes:

- investigar;
- inspeccionar código y documentación autorizados;
- proponer decisiones;
- implementar;
- crear pruebas;
- ejecutar verificaciones;
- preparar commits/changelogs;
- actualizar el Plan de tu humano con evidencia;
- proponer ramificaciones;
- señalar contradicciones y riesgos.

## Qué no puedes decidir solo

No aceptes por tu cuenta:

- riesgo residual;
- expansión material de alcance;
- cambio de objetivo;
- modificación de la Constitución;
- tomar un Plan para tu humano;
- acción irreversible de producción fuera de la autoridad recibida;
- degradación silenciosa de verificación para poder cerrar.

## Trabajo en equipo

- Al empezar: `git pull --rebase` y `node scripts/rem-status.mjs`; lee "Estado para retomar"
  del plan de tu humano.
- Edita solo el Plan cuyo `owner` es tu humano. El maestro del megaplán es de quien lo coordina.
  Las vistas generadas (índice, tablas de planes) no se editan.
- Crea documentos con `node scripts/rem-new.mjs`, que calcula el ID sin chocar con otros.
- Si tu cambio afecta el contrato de otro plan o un recurso compartido de la Constitución:
  DEC con `related` a esos planes, y avisa a tu humano.
- Al terminar: hitos marcados con fecha, "Estado para retomar" reescrito, una línea en
  "Avance", `rem-doctor`, commit pequeño y push.
- En los repos de código, los commits de un plan llevan el trailer `Plan: <ID>`.

## Hitos

Usa:

- `[INV]` para producir evidencia;
- `[DEC]` para elegir;
- `[IMP]` para construir;
- `[VER]` para demostrar;
- `[OBS]` para comprobar resultado real.

Al cerrar uno, márcalo `[x]` con su fecha y una línea de qué quedó. No conviertas cada hito en
ticket/subtask.

## Ramificaciones

Cuando aparezca algo inesperado:

- misma familia causal + superficie de verificación similar → puede entrar;
- bloqueo acotado → ramificación;
- objetivo/cierre propios → nuevo Plan (lo crea quien coordina);
- no bloquea → registra o deja fuera.

Nunca amplíes scope silenciosamente.

## Verificación

Una suite verde no es suficiente si no detectaría la regresión objetivo.

En V2/V3 busca evidencia contrafactual: árbol anterior, reversión, mutación o técnica equivalente.

Declara explícitamente lo que NO se pudo verificar.

## Escritura de documentos

Las plantillas son un **menú, no un formulario**: al escribir un documento, borra las
secciones que no apliquen en ese documento. No rellenes `N/A` por ceremonia. El documento más
corto que preserva la decisión correcta es preferible.

Esto aplica al contenido de cada documento. No autoriza a omitir tipos, carpetas, plantillas ni
tooling (ver "Si estás instalando REM").

## Cierre

No marques `Cerrado` si:

- quedan hitos obligatorios abiertos;
- el criterio de cierre no es cierto;
- falta la verificación requerida;
- falta `[OBS]` cuando era necesario;
- existe una contradicción conocida no declarada.
