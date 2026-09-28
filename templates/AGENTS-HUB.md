# <hub> — instrucciones para agentes

Hub de documentación de ingeniería de <proyecto>. Adopta REM <versión>. Rama por defecto:
`<rama>`. Solo markdown y scripts sin dependencias.

Antes de escribir cualquier documento lee:

1. `README.md` — qué documento corresponde a cada situación y cómo se escribe aquí;
2. `CONSTITUTION.md` — las reglas técnicas de ESTE proyecto (arquitectura por repo,
   seguridad, verificación, Git, equipo);
3. `megaplanes/README.md` — si vas a tocar un megaplán o un plan.

## Al empezar una sesión

1. `git pull --rebase` — el hub lo escriben varias personas a la vez.
2. `node scripts/rem-status.mjs` — quién tiene qué, qué está bloqueado, qué cambió.
3. Identifica el plan de tu humano (`owner`). Si no tiene uno activo, **pregunta**: no tomes
   un plan por tu cuenta.
4. Lee su sección "Estado para retomar" antes que el resto del plan.

## Reglas del hub

- Crea documentos con `node scripts/rem-new.mjs <tipo> <slug>`: calcula el ID sin chocar con
  lo que otros ya publicaron.
- Las plantillas son un **menú, no un formulario**: borra las secciones que no apliquen.
  Eso aplica a secciones de un documento, **nunca** a tipos, carpetas, plantillas o tooling.
- Una `DEC` no pasa de ~40 líneas. Si crece, es un ADR.
- Un `ADR` `Accepted` es inmutable: su evolución es una `DEC` con `extends:` o un ADR nuevo con
  `supersedes:`.
- Commits cualificados por repo (`repo@hash`), en el front-matter, solo después del merge a
  la rama de integración. Nunca un hash de 7–12 caracteres entre comillas invertidas en el cuerpo.
- Al cerrar un plan, **todas sus casillas van marcadas con su fecha y una línea de qué quedó**.
- **No edites el índice del README ni las tablas de planes de los megaplanes**: se generan.
- Antes de terminar: `node scripts/rem-doctor.mjs`. Un error del doctor no se deja para después.

## Trabajo en equipo

- **Tu plan es tuyo; los demás no.** Edita solo planes cuyo `owner` es tu humano. Si algo
  afecta a otro plan, escribe una `DEC` que lo enlace en `related` y avisa: no edites su plan.
- **El maestro del megaplán es de quien coordina.** Bitácora, planes nuevos y decisiones que
  ordenan se proponen a esa persona.
- **Tomar un plan** = poner `owner`, `status: Activo` y `started` en un commit que solo hace
  eso, y empujarlo enseguida. Si el push choca, otra persona lo tomó primero: para.
- **Al terminar la sesión**, reescribe "Estado para retomar" de tu plan y añade una línea a
  "Avance". Commits pequeños, push frecuente.
- **Zonas de cambio**: mantén `touches` de tu plan al día. Si el doctor avisa que pisas la zona
  de otro plan activo, díselo a tu humano antes de seguir.

## Qué no puedes decidir solo

Riesgo residual, cambios de alcance u objetivo, la Constitución, acciones irreversibles de
producción, y bajar la verificación para poder cerrar. Eso lo decide un humano (METHOD §3).

<!-- Pega aquí el bloque de templates/AGENTS-CODE-REPO-BLOCK.md si el proyecto tiene spokes:
     el doctor compara el bloque del hub con el de cada repo de código (regla 9). -->
