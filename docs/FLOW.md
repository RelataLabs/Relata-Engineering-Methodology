# Flujo y WIP en REM 1.0

## 1. Flujo de referencia

```text
Pendiente
   ↓
Activo
   ↓
Verificando
   ↓
Desplegado
   ↓
Observando
   ↓
Cerrado
```

`Pausado` y `Abandonado` pueden salir desde cualquier estado activo.

No hace falta un tablero visual. Los estados pueden vivir en front-matter Markdown, GitHub Issues, una base de datos o cualquier representación que el equipo realmente use.

Lo obligatorio es que las políticas sean explícitas.

## 2. Punto de inicio

Un work item entra en cycle time cuando pasa a `Activo`.

Trabajo candidato no seleccionado no cuenta como WIP.

## 3. Punto de fin

Un work item termina cuando pasa a `Cerrado` o `Abandonado`.

Si el objetivo requiere evidencia posterior al deploy, `Desplegado` todavía cuenta como WIP.

## 4. WIP

Default:

- 1 Plan `Activo` o `Verificando` por humano responsable;
- `Observando` cuenta como WIP si requiere atención activa;
- observación pasiva puede medirse aparte;
- un incidente crítico puede preemptar un Plan.

## 5. Pull

No se inicia nuevo Plan porque “hay un agente libre”.

Se inicia cuando:

- existe capacidad humana para responsabilizarse;
- el Plan activo anterior terminó/se pausó; o
- el nuevo trabajo tiene prioridad de preempción.

## 6. Dependencias

REM ordena por dependencia causal.

Un Plan maestro puede mantener:

| Plan | Estado | Depende de |
|---|---|---|
| P1 | Activo | — |
| P2 | Pendiente | P1 |
| P3 | Pendiente | P1, P2 |

No se exige Gantt ni fechas ficticias.

## 7. Ramificaciones

Una ramificación debe declarar:

- qué apareció;
- qué hito bloqueaba;
- dónde se resolvió;
- estado.

Si crece hasta objetivo propio, se promueve a Plan.

## 8. Trabajo bloqueado

Bloqueado no es un estado separado obligatorio.

Un Plan `Pausado` o un hito bloqueado debe registrar la causa.

Métrica recomendada: proporción de cycle time consumida bloqueada.

## 9. Service Level Expectation

REM no exige SLE.

Cuando exista suficiente histórico, un equipo puede publicar una expectativa probabilística basada en cycle time, por ejemplo:

> 85% de los Plans de clase normal cierran en ≤ X días.

No se fabrica una SLE con story points.
