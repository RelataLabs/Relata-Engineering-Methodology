# Verificación basada en riesgo — REM 1.0

El nivel se elige por impacto y frontera de confianza, no por tamaño del diff.

## V0 — Mecánico

Ejemplos:

- formato;
- rename interno;
- documentación;
- refactor sin cambio observable y cubierto.

Evidencia mínima:

- checks estáticos relevantes;
- build/typecheck si aplica;
- inspección del diff.

No requiere contrafactual obligatorio.

## V1 — Comportamiento normal

Ejemplos:

- feature común;
- bug funcional;
- UI;
- endpoint sin nueva frontera de seguridad.

Evidencia mínima:

- prueba del comportamiento cambiado;
- al menos un caso negativo/edge relevante;
- suite/build/typecheck aplicable;
- evidencia manual si la UI no queda suficientemente cubierta.

Contrafactual recomendado para bugs.

## V2 — Seguridad, datos o fronteras

Ejemplos:

- autorización;
- autenticación;
- permisos;
- SQL;
- pagos;
- backups;
- secrets;
- acceso entre tenants;
- clasificación de operaciones;
- nueva integración externa con privilegios.

Evidencia mínima:

- todo V1;
- prueba adversarial;
- prueba de aislamiento/negación;
- evidencia contrafactual de que la prueba detecta el fallo temido;
- estrategia de rollback o recuperación;
- revisión del camino completo, no solo de una función.

Métodos contrafactuales válidos:

- árbol anterior;
- revertir fix;
- mutar predicado crítico;
- fixture conocido incorrecto;
- equivalente demostrable.

## V3 — Irreversible o crítico

Ejemplos:

- migración destructiva;
- cambio que puede perder datos;
- control de acceso raíz;
- infraestructura crítica;
- cambio regulado;
- rotación masiva de credenciales.

Evidencia mínima:

- todo V2;
- aprobación humana explícita;
- segundo revisor humano recomendado;
- backup/rollback comprobado;
- rollout por etapas cuando sea posible;
- observación en entorno objetivo;
- criterio de abortar despliegue.

## Declarar lo no verificado

“No verificable aquí” es un resultado válido.

Ocultarlo no lo es.

Una casilla `[VER]` puede cerrarse con resultado “no fue posible demostrar X en producción; queda sostenido por Y”, siempre que el criterio de cierre y nivel de riesgo permitan esa evidencia.

## La prueba debe probar el efecto

Evita pruebas que solo inspeccionan la forma de una query, mock o llamada cuando lo que importa es el efecto observable.

Preferir:

- filas devueltas;
- permisos efectivamente negados;
- estado persistido;
- evento emitido;
- respuesta de frontera;
- comportamiento de usuario.
