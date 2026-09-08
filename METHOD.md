# Relata Engineering Method — REM 1.0

**Versión:** 1.0.0  
**Fecha:** 2026-09-08  
**Estado:** Stable

Las palabras **DEBE**, **NO DEBE**, **DEBERÍA**, **PUEDE** y **RECOMENDADO** expresan fuerza normativa.

---

## 1. Propósito

REM es un método de ingeniería para desarrollar y operar software cuando humanos, agentes de IA y automatización determinista participan juntos en el ciclo de entrega.

REM optimiza cinco cosas:

1. claridad de intención;
2. velocidad de aprendizaje;
3. flujo de trabajo terminado;
4. evidencia verificable;
5. responsabilidad humana sobre decisiones y riesgo.

REM no optimiza el número de tickets cerrados, story points, líneas de código ni actividad visible.

---

## 2. Kernel del método

Un uso conforme de REM DEBE conservar estas propiedades:

1. **Escalamiento proporcional:** el coste documental/procesal aumenta con riesgo, incertidumbre y permanencia, no automáticamente con tamaño.
2. **Trabajo explícito cuando importa:** el trabajo no trivial tiene objetivo, alcance y criterio de cierre comprensibles.
3. **Ciclo de evidencia:** investigar, decidir, implementar y verificar son actividades distinguibles aunque se ejecuten en minutos.
4. **WIP controlado:** existe una política explícita que limita trabajo iniciado pero no terminado.
5. **Autoridad humana:** un agente no acepta riesgo residual ni amplía por sí mismo el alcance material o los permisos que recibió.
6. **Verificación proporcional al riesgo:** la evidencia requerida está definida antes de declarar terminado el trabajo.
7. **Historia durable:** las decisiones que sobreviven al diff quedan registradas a un nivel proporcional.
8. **Feedback posterior a entrega:** cuando el resultado solo puede demostrarse en producción, existe una etapa de observación.
9. **Métricas de flujo:** como mínimo se puede conocer WIP, throughput, edad del trabajo y cycle time.
10. **Evolución del método:** las reglas de REM adoptadas por un equipo pueden revisarse a partir de evidencia.

Si una adopción elimina alguna de estas propiedades, puede inspirarse en REM, pero no DEBERÍA llamarse una implementación completa de REM 1.0.

---

## 3. Actores y autoridad

REM distingue responsabilidad, no cargos corporativos.

### 3.1 Humano responsable

Cada Plan activo DEBE tener al menos un **humano responsable**.

El humano responsable:

- define o acepta el objetivo;
- decide si el trabajo merece iniciarse;
- decide cambios materiales de alcance;
- acepta o rechaza riesgo residual;
- aprueba acciones irreversibles o de alto impacto cuando corresponda;
- decide entre alternativas cuando la elección representa producto, negocio, seguridad o arquitectura duradera;
- puede delegar investigación, implementación, documentación y verificación a agentes.

El humano NO necesita escribir personalmente el código ni los artefactos.

### 3.2 Agente de IA

Un agente PUEDE:

- inspeccionar repositorios y sistemas autorizados;
- investigar;
- proponer alternativas;
- preparar o actualizar Plans, DEC y ADR;
- implementar;
- escribir y ejecutar pruebas;
- producir commits y changelogs;
- detectar contradicciones;
- proponer ramificaciones;
- ejecutar tareas delegadas dentro de la autoridad recibida.

Un agente NO DEBE, sin autoridad humana explícita:

- aceptar riesgo residual;
- redefinir el objetivo del Plan;
- convertir una ramificación en un nuevo compromiso de producto;
- modificar la constitución del proyecto;
- realizar una acción irreversible de producción que exceda su autorización;
- ocultar evidencia fallida para poder cerrar trabajo.

### 3.3 Automatización determinista

CI, hooks, linters, test runners y `rem-doctor` DEBERÍAN encargarse de todo lo que pueda expresarse como invariante mecánico.

Una regla que una máquina puede comprobar repetidamente NO DEBERÍA depender únicamente de memoria humana o de instrucciones al agente.

### 3.4 Revisor adicional

Para riesgo alto, una adopción PUEDE exigir un segundo humano independiente. En nivel V3 de verificación es RECOMENDADO.

---

## 4. Entrada de trabajo

REM NO exige backlog global.

Trabajo candidato PUEDE nacer de:

- usuario o cliente;
- incidente;
- auditoría;
- métrica;
- soporte;
- investigación;
- oportunidad de producto;
- deuda técnica observada;
- hallazgo de un agente;
- obligación contractual o regulatoria.

**El trabajo no seleccionado no necesita un artefacto REM.** Puede vivir en una conversación, nota, issue, correo o lista simple.

La formalización comienza cuando se decide invertir atención.

### 4.1 Selección

Una adopción DEBE tener una política de selección explícita.

Orden de referencia de REM 1.0:

1. seguridad, integridad de datos, disponibilidad o incidente activo;
2. trabajo que desbloquea trabajo ya activo;
3. riesgo o incertidumbre que puede invalidar decisiones futuras;
4. resultado de usuario/negocio sustentado por evidencia;
5. mantenimiento que elimina coste recurrente significativo;
6. exploración.

Este orden es un default, no una verdad universal. La organización PUEDE modificarlo en su Constitución.

Dentro de la misma clase, REM prefiere trabajo que:

- reduce más incertidumbre;
- desbloquea más dependencias;
- puede cerrarse como una unidad coherente;
- tiene mejor evidencia de valor.

### 4.2 Sin estimación obligatoria

REM NO exige estimaciones de horas ni story points.

Un equipo PUEDE usar un **appetite** o presupuesto de atención para limitar inversión, siempre que no lo confunda con una predicción contractual de duración.

---

## 5. Clases de trabajo y coste documental

La regla central es:

> **Documentar una decisión cuesta según lo difícil que sería reconstruirla después, no según cuántas líneas cambió.**

### 5.1 Nivel mínimo

| Situación | Evidencia mínima |
|---|---|
| cambio mecánico sin comportamiento observable | commit + verificación relevante |
| comportamiento observable pequeño | changelog + commit + verificación |
| regla de negocio/datos/permisos que alguien podría “corregir” después | DEC |
| decisión de arquitectura con consecuencias duraderas | ADR |
| varios objetivos con dependencias o ramificaciones | Megaplán + Plans |
| incidente de producción/seguridad | INC |
| revisión sistemática | AUDIT |
| entrega significativa con necesidad de evidencia durable | IMP |

**Tamaño en líneas no es un criterio suficiente.** Una entrega pequeña con nueva superficie de seguridad puede requerir más evidencia que una migración mecánica grande.

### 5.2 DEC

Una Decision Note registra una regla pequeña y durable.

DEBERÍA ser corta. REM recomienda un límite de aproximadamente 40 líneas de contenido.

Si necesita explicar múltiples alternativas, consecuencias amplias o una decisión estructural, probablemente es un ADR.

### 5.3 ADR

Un ADR registra una decisión estructural, alternativas y consecuencias.

Una vez `Accepted`, NO DEBERÍA editarse para fingir que el pasado fue distinto. Su evolución se registra con un nuevo ADR o una DEC que lo extiende/sustituye.

### 5.4 Megaplán

Se abre cuando:

- hay varios objetivos que se quieren completar juntos; y
- existe al menos una dependencia, incertidumbre material o probabilidad razonable de ramificación.

Un objetivo simple y corto NO DEBERÍA convertirse en Megaplán.

### 5.5 Plan

Un Plan representa **un objetivo específico**.

Si contiene dos objetivos que pueden cerrarse independientemente, DEBERÍA dividirse.

---

## 6. Flujo global

Estados de referencia:

```text
Pendiente → Activo → Verificando → Desplegado → Observando → Cerrado
                 ↘ Pausado                         ↘ Abandonado
```

No todos los trabajos recorren todos los estados.

- Un cambio que no necesita despliegue puede cerrar después de `Verificando`.
- `Observando` solo es necesario cuando la evidencia real llega después del despliegue.
- `Pausado` DEBE registrar el motivo.
- `Abandonado` es un resultado legítimo y DEBE registrar por qué se dejó.

### 6.1 Definiciones

**Pendiente:** seleccionado o conocido, pero sin atención de ejecución consumiéndose.

**Activo:** investigación, decisión o implementación consume atención.

**Verificando:** la implementación candidata existe y la actividad principal es demostrar que cumple.

**Desplegado:** el cambio está en el entorno objetivo, pero aún falta evidencia de resultado cuando corresponda.

**Observando:** se espera/recoge evidencia real posterior al despliegue.

**Cerrado:** el criterio de cierre se cumplió con evidencia suficiente.

**Pausado:** se decidió detener temporalmente.

**Abandonado:** se decidió no continuar.

### 6.2 Definición de terminado

`Cerrado` NO significa “el agente terminó de escribir código”.

Un Plan solo puede cerrarse cuando:

1. su criterio de cierre es cierto;
2. no quedan hitos obligatorios abiertos;
3. la verificación requerida por su nivel de riesgo fue ejecutada;
4. lo no verificado está declarado;
5. cualquier decisión durable fue extraída a DEC/ADR cuando correspondía;
6. si `[OBS]` era obligatorio, la evidencia de observación existe.

---

## 7. WIP y paralelismo

El recurso escaso en desarrollo AI-native es la atención humana capaz de comprender, integrar y verificar.

### 7.1 Regla por defecto

REM 1.0 establece como default:

> **Máximo un Plan `Activo` o `Verificando` por humano responsable.**

Una adopción PUEDE cambiar el número, pero DEBE declarar el límite.

### 7.2 Paralelismo de agentes

Varios agentes PUEDEN trabajar en paralelo dentro del mismo Plan si:

- el objetivo sigue siendo uno;
- los límites están claros;
- sus cambios pueden integrarse sin perder comprensión;
- la verificación puede atribuirse a resultados concretos.

Crear cinco Plans activos porque existen cinco agentes NO aumenta la capacidad humana de revisión.

### 7.3 Preempción

Un incidente o riesgo superior PUEDE preemptar trabajo activo.

El trabajo desplazado pasa a `Pausado` con:

- fecha;
- motivo;
- condición de reanudación cuando sea conocida.

### 7.4 Ramificaciones

Si durante un Plan aparece trabajo no previsto:

1. si es parte de la misma causa y no aumenta materialmente la superficie de verificación, PUEDE resolverse dentro del Plan;
2. si bloquea un hito pero es una misión secundaria acotada, se registra como ramificación;
3. si adquiere objetivo y cierre propios, se convierte en Plan separado;
4. si no bloquea el objetivo actual, NO DEBE colarse silenciosamente: se registra o se deja fuera.

---

## 8. Ciclo de un Plan

Los hitos usan tipos semánticos.

### [INV] Investigar

Produce la evidencia que falta para decidir.

Un `[INV]` no se cierra con “revisado”. Se cierra con un dato, hallazgo, mapa, medición o respuesta que reduce incertidumbre.

### [DEC] Decidir

Elige entre alternativas.

Debe quedar al menos:

- qué se decidió;
- por qué;
- qué alternativa relevante se descartó.

Si la decisión sobrevivirá al Plan, se extrae a DEC o ADR.

### [IMP] Implementar

Construye o modifica el sistema.

El agente PUEDE decidir subtareas locales sin convertirlas en tickets. REM no requiere predeterminar cada archivo, DTO, endpoint o test antes de empezar.

### [VER] Verificar

Demuestra que el sistema hace lo que afirma hacer y que la evidencia distingue un caso correcto de uno incorrecto.

La verificación se rige por `docs/VERIFICATION.md`.

### [OBS] Observar

Comprueba el efecto real después de desplegar cuando tests y staging no pueden demostrar completamente el resultado.

Ejemplos:

- comportamiento visible de usuario;
- métrica de errores;
- integridad de un flujo real;
- rendimiento;
- entrega de notificaciones;
- efectos operativos.

`[OBS]` puede producir nueva investigación o una ramificación.

---

## 9. Restricciones técnicas: método vs Constitución

REM NO prescribe una arquitectura.

Reglas como:

- Clean Architecture;
- SOLID;
- DDD;
- monolito modular;
- trunk-based development;
- proveedor cloud;
- versión mínima de Node;
- política de commits;
- política de atribución de IA;

pertenecen a la **Constitución del proyecto**, no al kernel universal de REM.

### 9.1 Regla del área adyacente

REM adopta una versión acotada de la Boy Scout Rule:

> Un defecto adyacente PUEDE corregirse en el mismo cambio si comparte la misma familia causal y no aumenta materialmente el riesgo ni la superficie de verificación.

Si no cumple esas condiciones, se registra como ramificación o trabajo separado.

Esto evita que “dejarlo mejor” se convierta en permiso para expandir scope sin control.

---

## 10. Verificación y riesgo

Cada trabajo DEBE tener un nivel de verificación suficiente.

REM define cuatro niveles de referencia:

- **V0 — mecánico**
- **V1 — comportamiento normal**
- **V2 — seguridad/datos/fronteras**
- **V3 — irreversible/crítico**

Los requisitos están en `docs/VERIFICATION.md`.

La regla general es:

> **Una prueba útil debe distinguir el sistema que queremos del sistema incorrecto que tememos.**

Cuando sea práctico, una prueba nueva DEBERÍA demostrar contrafactualmente su capacidad de detectar el fallo mediante uno de estos mecanismos:

- ejecutarla contra el árbol anterior;
- revertir la corrección;
- mutar la condición crítica;
- introducir un doble/fixture que represente el caso incorrecto;
- otra técnica equivalente.

Pasar una suite no basta si la suite nunca habría fallado ante la regresión objetivo.

---

## 11. Entrega

REM favorece lotes pequeños y ciclos cortos de integración.

La Constitución PUEDE imponer trunk-based development u otra estrategia.

Independientemente de branching:

- las ramas largas DEBERÍAN evitarse cuando no aportan aislamiento real;
- el cambio DEBERÍA poder revertirse o existir una estrategia de recuperación;
- el estado del repositorio que se declara entregado DEBE corresponder al código versionado;
- un cambio verificado pero no registrado en Git no es una entrega durable.

### 11.1 Commits

Para cambios no triviales, el commit DEBERÍA explicar el **porqué** y registrar verificación suficiente para reconstruir la decisión local.

La redacción PUEDE ser generada por un agente.

REM no prescribe una política universal sobre trailers o atribución a herramientas de IA; esa regla pertenece a la Constitución.

### 11.2 Changelog

Un cambio observable para usuarios DEBERÍA producir una entrada de changelog en lenguaje de usuario.

Un cambio puramente interno no necesita una entrada si el commit y la evidencia ya lo explican adecuadamente.

---

## 12. Observación y resultado

“Desplegado” y “resuelto” no son sinónimos.

Cuando el objetivo depende de comportamiento real, el Plan DEBE definir qué señal cerrará `[OBS]`.

Puede ser:

- usuario real completa el flujo;
- tasa de error bajo umbral;
- latencia bajo objetivo;
- ausencia de reintentos anómalos;
- evento/auditoría generado correctamente;
- métrica de negocio esperada;
- evidencia manual documentada.

Si la observación contradice el cierre esperado, el Plan vuelve a `Activo` o genera una ramificación/incidente.

---

## 13. Evidencia durable

REM separa:

- **código:** qué hace el sistema;
- **commit/changelog:** qué cambió y por qué localmente;
- **DEC:** regla pequeña durable;
- **ADR:** decisión estructural;
- **IMP:** qué se entregó y con qué evidencia;
- **INC:** qué se rompió y qué aprendimos;
- **AUDIT:** qué se encontró en una revisión sistemática;
- **MEGA/PLAN:** qué estamos intentando lograr y cómo converge.

No se duplica información por ceremonia.

Un artefacto solo debe existir si responde una pregunta futura que los artefactos más baratos no responden bien.

---

## 14. Métricas

Una adopción conforme DEBE poder obtener como mínimo:

1. **WIP:** trabajo iniciado y no terminado;
2. **Throughput:** unidades cerradas por periodo;
3. **Work Item Age:** edad del trabajo aún abierto;
4. **Cycle Time:** tiempo desde inicio hasta cierre.

REM RECOMIENDA además:

- change lead time;
- deployment frequency;
- change failure rate;
- recovery time;
- reopen/regression rate;
- branching rate por Plan;
- proporción de trabajo bloqueado;
- tiempo relativo en `[INV]`, `[DEC]`, `[IMP]`, `[VER]`, `[OBS]` cuando los datos existan.

REM NO usa velocity ni story points como métricas de productividad.

---

## 15. Cadencias

REM no exige reuniones periódicas.

Una adopción PUEDE usar:

- revisión de flujo;
- revisión de producto;
- retrospectiva;
- revisión de arquitectura;
- revisión de incidentes.

La reunión solo existe si produce una decisión o señal que el flujo necesita.

No se crea una ceremonia para demostrar que el método se está siguiendo.

---

## 16. Mejora del método

Al menos periódicamente, o cuando exista evidencia suficiente, el equipo DEBERÍA revisar:

- dónde se acumula WIP;
- qué verificaciones fallaron en detectar regresiones;
- qué artefactos tienen alto coste y bajo valor;
- qué reglas de `doctor` producen ruido;
- qué decisiones se repiten por falta de documentación;
- qué tareas siguen consumiendo atención humana aunque puedan automatizarse.

Una regla del método que genera avisos permanentes sin capacidad de corregirse DEBERÍA cambiarse o eliminarse. El ruido enseña a ignorar controles.

---

## 17. Versionado de REM

Cambios compatibles de aclaración: `1.0.x`.

Nuevas capacidades sin romper el kernel: `1.x`.

Cambios que alteran obligaciones del kernel: `2.0`.

Una organización PUEDE versionar además su propia Constitución independientemente.

---

## 18. Criterio de adopción

Un proyecto puede decir **“usa REM 1.0”** cuando:

- tiene política de selección;
- tiene WIP explícito;
- usa evidencia proporcional;
- distingue autoridad humana/agente/automatización;
- conserva decisiones durables;
- puede observar trabajo terminado;
- mide al menos las cuatro métricas mínimas;
- y no convierte todos los cambios en el artefacto más pesado.

El objetivo de REM no es producir más proceso.

El objetivo es que **la velocidad de generación de código no supere la capacidad del sistema para decidir, verificar y aprender**.
