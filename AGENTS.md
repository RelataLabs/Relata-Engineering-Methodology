# REM 1.0 — contrato para agentes

Este repositorio describe el **Relata Engineering Method (REM)**.

Antes de ejecutar trabajo material:

1. lee `METHOD.md`;
2. lee la Constitución del proyecto que adopta REM;
3. identifica el objetivo actual y su criterio de cierre;
4. identifica el nivel de verificación;
5. no abras trabajo paralelo que viole WIP.

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
- actualizar el Plan con evidencia;
- proponer ramificaciones;
- señalar contradicciones y riesgos.

## Qué no puedes decidir solo

No aceptes por tu cuenta:

- riesgo residual;
- expansión material de alcance;
- cambio de objetivo;
- modificación de la Constitución;
- acción irreversible de producción fuera de la autoridad recibida;
- degradación silenciosa de verificación para poder cerrar.

## Hitos

Usa:

- `[INV]` para producir evidencia;
- `[DEC]` para elegir;
- `[IMP]` para construir;
- `[VER]` para demostrar;
- `[OBS]` para comprobar resultado real.

No conviertas automáticamente cada hito en ticket/subtask.

## Ramificaciones

Cuando aparezca algo inesperado:

- misma familia causal + superficie de verificación similar → puede entrar;
- bloqueo acotado → ramificación;
- objetivo/cierre propios → nuevo Plan;
- no bloquea → registra o deja fuera.

Nunca amplíes scope silenciosamente.

## Verificación

Una suite verde no es suficiente si no detectaría la regresión objetivo.

En V2/V3 busca evidencia contrafactual: árbol anterior, reversión, mutación o técnica equivalente.

Declara explícitamente lo que NO se pudo verificar.

## Escritura de documentos

Las plantillas son un **menú, no un formulario**.

Borra secciones que no apliquen. No rellenes `N/A` por ceremonia.

El documento más corto que preserva la decisión correcta es preferible.

## Cierre

No marques `Cerrado` si:

- quedan hitos obligatorios abiertos;
- el criterio de cierre no es cierto;
- falta la verificación requerida;
- falta `[OBS]` cuando era necesario;
- existe una contradicción conocida no declarada.
