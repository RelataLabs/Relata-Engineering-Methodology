# Adoptar REM 1.0 en un proyecto

## Ruta mínima

1. Copia `CONSTITUTION.md` al proyecto y complétalo.
2. Copia `AGENTS.md` o integra sus reglas en el archivo de contexto de tus agentes.
3. Copia `templates/`, `scripts/` y `rem.config.example.json`.
4. Renombra el config a `rem.config.json`.
5. Define WIP.
6. Define política de selección.
7. Decide qué cambios requieren changelog.
8. Conecta `rem-doctor.mjs` a CI.

## Estructura sugerida en un proyecto adoptante

```text
docs/rem/
  decisions/
  architecture/
  incidents/
  audits/
  implementations/
  megaplanes/
    plans/

REM-CONSTITUTION.md
rem.config.json
```

No es obligatorio usar esas rutas.

## Primer Megaplán

No migres todo tu backlog.

Abre un Megaplán solo con trabajo vivo que realmente tenga dependencias. Aprende con él.

## Migración desde Scrum/Jira

No copies cada ticket.

Migra:

- decisiones que siguen vigentes;
- trabajo realmente activo;
- dependencias actuales;
- incidentes relevantes;
- ADRs útiles.

El historial administrativo muerto puede quedarse donde está.

## Migración desde documentación informal

Empieza con:

- una Constitución;
- un Plan activo;
- `rem-doctor`;
- una regla de changelog;
- WIP 1.

Añade artefactos cuando aparezca una necesidad real.

## GitHub sin Jira

REM funciona bien con:

- Markdown versionado;
- GitHub Issues solo para entradas externas si hace falta;
- commits;
- CI;
- un script de flujo.

Un issue no es obligatorio para que exista trabajo.
