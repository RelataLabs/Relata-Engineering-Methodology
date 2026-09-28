# lumen-docs — instrucciones para agentes (ejemplo)

Hub de documentación de Lumen. Adopta REM 1.1. Antes de escribir, lee `README.md`,
`CONSTITUTION.md` y, si tocas un megaplán, `megaplanes/README.md`.

- Al empezar: `git pull --rebase` y `node scripts/rem-status.mjs`.
- Edita solo el plan cuyo `owner` es tu humano; el maestro del megaplán es de quien coordina.
- Crea documentos con `node scripts/rem-new.mjs <tipo> <slug>`.
- Al terminar: hitos con fecha, "Estado para retomar", `node scripts/rem-doctor.mjs`, push.

## Registro de trabajo

Este repo registra su trabajo en el hub **lumen-docs** (`../lumen-docs`), que adopta REM.

**Cada commit que toque código lleva, en el mismo commit:** cuerpo del mensaje (síntoma → causa →
por qué esta solución, y la verificación), entrada en `CHANGELOG.md` en lenguaje de usuario, y el
trailer `Plan: <ID>` si avanza un plan del hub.

**¿Cuándo escalar al hub?** Regla de negocio → DEC · decisión estructural → ADR · se rompió en
producción → INC · revisión sistemática → AUD · dos o más objetivos con dependencias → megaplán.
