# Changelog

<!--
PLANTILLA DE CHANGELOG DE REPO DE CÓDIGO — REM 1.1

Una entrada por commit que cambie comportamiento observable, escrita EN EL MISMO COMMIT que
el código (el hook commit-msg lo exige si la Constitución declara changelog.policy =
"required"). Lo que no se ve desde fuera va en `Interno`.

Formato:
  - Bajo `## <fecha de hoy>` y su sección (Añadido / Cambiado / Corregido / Seguridad / Interno).
  - `- <área>: <qué cambia>.` En lenguaje de USUARIO, no de commit:
      bien: "- Agenda: una cita cancelada libera su hueco al instante en todas las pestañas."
      mal:  "- fix(agenda): invalidate availability cache"
  - Sin hash: una entrada no puede citar su propio commit sin quedar obsoleta al primer
    amend. Para encontrarlo: git log -S "<texto de la entrada>".
  - Si la entrada nace de una regla o decisión del hub, termina con → DEC-… / ADR-….

Repos que publican paquetes pueden usar el sabor por versión: ## [x.y.z] — YYYY-MM-DD.
El hub agrega todas las entradas en TIMELINE.md (scripts/rem-timeline.mjs).
-->

## YYYY-MM-DD

### Añadido

- <área>: <qué puede hacer ahora el usuario que antes no>.

### Cambiado

### Corregido

### Seguridad

### Interno
