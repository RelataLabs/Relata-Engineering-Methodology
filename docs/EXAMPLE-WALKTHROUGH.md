# Recorrido ilustrativo: acceso a un informe de equipo

**Ejemplo didáctico íntegramente sintético.** Personas, aplicación, fechas, registros y resultados de esta página son inventados para explicar el método. No describen un despliegue, prueba ejecutada o evaluación de eficacia real. Los identificadores y rutas muestran la forma de los artefactos; no remiten a archivos o servicios existentes.

## 1. Selección y objetivo

En una aplicación ficticia de informes, una persona autenticada puede solicitar un informe de otro equipo cambiando el identificador de la URL. Ana asume el objetivo de impedir esa lectura conservando el acceso autorizado. Se prioriza por la frontera de autorización y se clasifica como **V2**.

El alcance incluye la consulta individual y su servicio de autorización. Exportación, cambio de roles y administración de equipos quedan fuera. Si la investigación descubre otro camino de acceso, Ana decide si comparte la causa o necesita una ramificación; no se amplía el alcance silenciosamente.

## 2. Plan y contrato

Se utiliza un Plan suelto porque hay un objetivo específico. Extracto del registro sintético al cierre:

```yaml
id: PLAN-2026-001
type: plan
title: "Impedir lectura de informes fuera del equipo autorizado"
date: 2026-09-20
status: Cerrado
owner: ana
megaplan: null
verification_level: V2
started: 2026-09-20
closed: 2026-09-26
depends_on: []
```

**Contrato:** una solicitud autenticada solo recibe contenido cuando su usuario tiene autorización vigente para el equipo del informe. Un identificador ajeno debe producir la respuesta de denegación acordada y no incluir contenido del informe. La comprobación se realiza en el servidor.

**Criterio de cierre:** acceso válido conservado, acceso ajeno denegado, prueba capaz de detectar la ausencia del control, verificación del camino completo y estrategia de recuperación revisada. Por tratarse de un servicio desplegado, este Plan añade observación en el entorno objetivo; V2 no la exige universalmente.

## 3. Investigación y decisión

La investigación del escenario localiza una consulta que obtiene el informe por ID y solo comprueba que haya sesión. Su evidencia esperada sería una reproducción con dos equipos y usuarios sintéticos, junto con el recorrido de controlador, servicio y consulta.

La decisión sería comprobar autorización antes de devolver el contenido y registrar la regla en una DEC breve. Se descarta ocultar el enlace únicamente en la interfaz, porque una petición directa seguiría accediendo. Se mantiene el contrato de denegación existente para evitar revelar la existencia de informes ajenos.

El agente puede preparar el cambio y las pruebas; Ana conserva la decisión sobre alcance y riesgo. El registro separa lo propuesto de lo comprobado antes de marcar cada hito.

## 4. Implementación y verificación prevista

La implementación del ejemplo incorpora la decisión en el servicio, reutiliza el mecanismo de autorización y conserva la lectura válida. La tabla muestra el registro que **se simula**, no resultados de una ejecución real:

| Comprobación | Resultado sintético usado para ilustrar el cierre |
|---|---|
| Usuario autorizado del equipo A solicita su informe | Recibe el contenido esperado. |
| Usuario del equipo B solicita el ID del informe A | Recibe denegación y ningún contenido privado. |
| Usuario sin sesión solicita el informe | Se rechaza la solicitud. |
| Contrafactual: se retira deliberadamente el control en una copia descartable | La prueba de aislamiento falla; al restaurarlo vuelve a pasar. |
| Integración por la ruta HTTP y revisión de otras lecturas dentro del alcance | La denegación no depende de una comprobación solo en la interfaz. |
| Compilación y suite relevante | No muestran regresiones en el escenario simulado. |

En un proyecto real cada fila enlazaría su ejecución, revisión de código, entorno, salida y revisión comprobada. Una casilla marcada sin esos resultados no demuestra cumplimiento. Si el contrafactual no detecta la ausencia del control, se corrige la prueba antes del cierre.

## 5. Entrega, recuperación y observación

El cambio se prepara en un entorno de prueba. La estrategia prevista ante una denegación incorrecta es deshabilitar temporalmente el acceso al informe mientras se corrige, conservando los datos. No se propone reabrir la lectura vulnerable como rollback seguro. Ana revisa esa alternativa antes de autorizar la entrega.

El Plan define una ventana de observación y cuentas de prueba autorizadas: confirmar una lectura válida y una denegación por la ruta desplegada, revisar errores y abortar si aparece exposición de contenido. Los identificadores sensibles no se incluyen en los registros compartidos.

En el recorrido sintético la observación cumple esos criterios el 26/09 y Ana cierra el Plan. En una ejecución real, si falta esa observación el estado permanece `Observando`; ni el deploy ni las pruebas locales reemplazan el criterio acordado.

El registro de hitos de esta **simulación** queda completo así:

| Hito | Fecha sintética | Salida que justificaría marcarlo completado |
|---|---|---|
| [INV] Reproducir el acceso ajeno | 20/09/2026 | Dos equipos de prueba y recorrido que localiza la comprobación ausente. |
| [DEC] Fijar la frontera de autorización | 21/09/2026 | Regla en servidor, contrato de denegación y alternativa de interfaz descartada. |
| [IMP] Aplicar el control | 22/09/2026 | Cambio candidato y pruebas listos para revisión. |
| [VER] Comprobar acceso e aislamiento | 23/09/2026 | Casos de la tabla anterior, contrafactual y recuperación revisados. |
| [OBS] Comprobar el flujo desplegado | 26/09/2026 | Resultado de la ventana y las cuentas autorizadas, sin exposición de datos. |

El estado pasa de `Activo` a `Verificando`, luego a `Desplegado` y `Observando`, y finalmente a `Cerrado`. La bitácora real conservaría transiciones, responsables y enlaces a las salidas. Las filas ilustrativas no son un registro de ejecuciones que hayan ocurrido.

## 6. Pausa, WIP y cálculo reproducible

Este conjunto adicional de **datos sintéticos** ilustra las métricas a fecha 26/09/2026:

| Plan | Responsable | Inicio | Cierre | Estado al corte |
|---|---|---|---|---|
| A, el caso descrito | Ana | 20/09 | 26/09 | Cerrado |
| B, otro objetivo independiente | Bruno | 22/09 | 24/09 | Cerrado |
| C, otro objetivo independiente | Carla | 21/09 | — | Pausado desde 23/09; espera un insumo |

Durante una pausa, C registra `paused: 2026-09-23`, `pause_reason: "Espera un insumo"` y, si se conoce, `resume_when`. La pausa no reinicia su `started`. Antes de iniciar otro objetivo, Carla debe revisar el WIP pendiente y su política de admisión.

- WIP total al corte: **1**, el Plan C. Atención activa: **0**.
- Edad de C: **5 días calendario**, incluidos los días pausados.
- Throughput del 22 al 26/09, ambos incluidos: **2 cierres**; no se cuentan como entrega los planes abandonados.
- Cycle time: A = **6 días**, B = **2 días**; mediana de ambos = **4 días**.

Estos números enseñan las definiciones. No dicen que REM haya reducido tiempo, errores o coste. Para estudiar esa pregunta habría que recoger datos reales comparables, sobrecoste y retrabajo siguiendo [EVALUATION.md](EVALUATION.md).
