# Adoptar REM en un proyecto

**Para instalar REM, sigue [BOOTSTRAP.md](BOOTSTRAP.md)**: es el checklist ejecutable, con la
estructura obligatoria, lo que se copia byte a byte, la migración de documentación existente y
la definición de hecho (`rem-doctor --adoption` sin errores). Esta página explica el criterio
detrás de esos pasos.

## Instalar completo, usar en proporción

Son dos cosas distintas y REM 1.0 las mezclaba:

- **Instalar** es poner la estructura, los tipos, las plantillas, el tooling, los hooks y el CI.
  Se instala **todo**, aunque algunas carpetas empiecen vacías. Una carpeta vacía no cuesta nada;
  un tipo que falta hace que el primer documento de ese tipo se escriba en otro lado o no se
  escriba.
- **Usar** es decidir qué documento merece cada cambio. Eso sí es proporcional: la mayoría de los
  cambios no llevan documento en el hub, y el megaplán no se usa para un bug pequeño.

"Empieza con poco" se refiere a lo segundo, nunca a lo primero.

## Adopción mínima: solo como excepción declarada

Si un proyecto necesita empezar con menos de lo que pide BOOTSTRAP (por ejemplo, sin spokes en
los repos de código, o con la política de changelog en `deferred`), se puede, **escribiéndolo en
la Constitución** como excepción: qué regla no se cumple, por qué, quién responde y cuál es la
condición de salida. REM 1.1 permite adoptar sin tocar los repos de código (perfil hub sin
spokes, timeline desde los commits), pero es una variante declarada, no un atajo silencioso.

## Rutas y nombres

Las carpetas se pueden renombrar **declarándolas en `rem.config.json`** (`types.<tipo>.dir`). Lo
que no se puede es omitir un tipo: el doctor con `--adoption` exige la carpeta y la plantilla de
cada tipo del config.

## Primer Megaplán

Si hay trabajo vivo con dependencias —y en un proyecto con historia casi siempre lo hay—, el
primer megaplán se abre **en la instalación**, con ese trabajo, y con su tabla de premisas
verificadas contra el código. No hace falta migrar todo el backlog: hace falta que lo que está en
curso tenga forma. Guía completa en [MEGAPLANS.md](MEGAPLANS.md).

## Migración desde Scrum/Jira

No copies cada ticket. Migra:

- decisiones que siguen vigentes (ADR/DEC);
- trabajo realmente activo (megaplán + planes);
- dependencias actuales (`depends_on`);
- incidentes relevantes (INC);
- auditorías cuyos hallazgos siguen abiertos (AUD).

El historial administrativo muerto puede quedarse donde está.

## Migración desde documentación informal

Carpetas de planes, fases, handoffs o auditorías dentro de un repo de código son exactamente el
síntoma que los megaplanes vienen a resolver. El procedimiento (inventario → clasificación →
resumen con `sources` → verificación contra el código → primer megaplán) está en
[BOOTSTRAP.md §5](BOOTSTRAP.md#5-migración-brownfield).

## Equipos

Si más de una persona va a escribir en el hub, lee [TEAM.md](TEAM.md) antes de repartir planes:
cada fichero tiene un solo escritor y las vistas compartidas se generan.

## GitHub sin Jira

REM funciona bien con:

- Markdown versionado;
- GitHub Issues solo para entradas externas si hace falta;
- commits con trailer `Plan: <ID>`;
- CI con el doctor en cada push y cada semana;
- `rem-status` como tablero.

Un issue no es obligatorio para que exista trabajo.
