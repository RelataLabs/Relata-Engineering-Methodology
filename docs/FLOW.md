# Flujo y WIP en REM 1.1

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

Un work item entra en cycle time cuando pasa a `Activo`; `started` conserva esa primera fecha. Reanudar no reinicia el reloj.

Trabajo candidato no seleccionado no cuenta como WIP.

## 3. Punto de fin

Un work item sale del WIP cuando pasa a `Cerrado` o `Abandonado`, con fecha `closed`. Solo `Cerrado` representa cumplimiento; un abandono se informa aparte.

Si el objetivo requiere evidencia posterior al deploy, `Desplegado` todavía cuenta como WIP.

## 4. WIP

Se distinguen dos medidas:

- **WIP total:** todos los Plans con inicio real que no están `Cerrado` ni `Abandonado`. Incluye `Pausado`, `Desplegado` y toda observación pendiente.
- **Atención activa:** Plans en `Activo` o `Verificando`; el default limita esta medida a uno por humano responsable. La Constitución declara cómo reserva capacidad adicional para observaciones que requieren intervención.

Pausar libera atención activa, pero no elimina WIP ni edad. Antes de iniciar más trabajo se revisan ambos valores. Un incidente crítico puede preemptar un Plan registrando la pausa.

Con varias personas en el mismo megaplán, el límite de atención sigue siendo por humano, y quién edita qué
está en [TEAM.md](TEAM.md). `scripts/rem-status.mjs` muestra la atención activa de cada persona y las dependencias;
`scripts/rem-flow.mjs` informa además el WIP total.

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

Una dependencia se satisface cuando cumple el contrato que necesita su consumidor. El validador admite como candidatos los estados `Desplegado`, `Observando` y `Cerrado`; el responsable debe comprobar la entrega real y registrar si permite consumirla mientras continúa la observación. Si el contrato exige esa observación terminada, el consumidor espera su cumplimiento. El estado por sí solo no acredita aceptación, y `Abandonado` no satisface una entrega. Si la dependencia deja de ser necesaria, se revisa el contrato y se registra la decisión antes de cambiar `depends_on`.

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

Un Plan `Pausado` registra `paused: YYYY-MM-DD` y `pause_reason`; puede añadir `resume_when`. Un hito bloqueado registra su causa. Las fechas son reales, no futuras, y se ordenan como `started ≤ paused/closed`. Al reanudar se conserva la pausa en el historial del Plan y su inicio original.

La edad y el cycle time miden días calendario transcurridos e incluyen el tiempo bloqueado. Si se mide tiempo de trabajo efectivo, se publica como una medida distinta.

Métrica recomendada: proporción de cycle time consumida bloqueada.

## 9. Service Level Expectation

REM no exige SLE.

Cuando exista suficiente histórico, un equipo puede publicar una expectativa probabilística basada en cycle time, por ejemplo:

> 85% de los Plans de clase normal cierran en ≤ X días.

No se fabrica una SLE con story points.
