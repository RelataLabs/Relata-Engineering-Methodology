# Métricas REM 1.1

REM mide flujo y resultados, no actividad.

## Mínimas

### WIP total y atención activa

Cantidad de trabajo iniciado y no terminado.

Para Plans: todos los que tienen `started` válido y no están `Cerrado` ni `Abandonado`. Incluye pausas y espera de observación. La atención activa (`Activo + Verificando`) se informa aparte y usa el límite configurable por responsable. La falta de atención inmediata no convierte un trabajo pendiente en terminado.

### Throughput

Planes en `Cerrado` por período. Los abandonos se cuentan por separado: son salidas del flujo, no entregas cumplidas. `rem-flow --days N` informa las N fechas calendario UTC que incluyen hoy; una fecha de cierre exactamente N días atrás queda fuera. El período y su zona se muestran para evitar comparaciones entre ventanas distintas.

No comparar equipos por throughput sin contexto: las unidades no son homogéneas.

### Work Item Age

Edad de cada trabajo iniciado que sigue abierto desde `started`, incluidos los pausados. Usa días calendario; no resta bloqueos ni reinicia al reanudar.

Sirve para detectar envejecimiento antes de que se convierta en retraso invisible.

### Cycle Time

`closed - started`

Para planes `Cerrado`, usa días calendario entre fechas reales. La mediana de una cantidad par de valores es el promedio de los dos centrales. `rem-flow` presenta el histórico de cierres con fechas válidas; su ventana de throughput no filtra ese histórico. La duración hasta abandono se analiza aparte. Usa percentiles/mediana y cantidad de observaciones, no solo promedio.

Los campos `date`, `started`, `paused` y `closed` deben contener fechas de calendario válidas. `started`, `paused` y `closed` no pueden ser futuras ni estar invertidas. Fechas objetivo futuras son planificación y van en campos separados. Si faltan fechas de flujo exigibles, primero se corrigen con evidencia; el comando rechaza el cálculo en lugar de excluir silenciosamente registros. No se reconstruyen fechas desconocidas para mejorar los indicadores.

## Recomendadas

- deployment frequency;
- change lead time;
- change failure rate;
- recovery time;
- reopen/regression rate;
- porcentaje de trabajo bloqueado;
- ramificaciones por Plan;
- porcentaje de Plans con `[OBS]`;
- ratio de verificaciones que detectaron un problema antes del deploy;
- tiempo relativo en INV/DEC/IMP/VER/OBS si puede inferirse sin burocracia.

## Prohibiciones conceptuales

REM no considera estas métricas de productividad:

- líneas de código;
- commits por persona;
- prompts;
- tokens;
- story points;
- tickets cerrados;
- horas “ocupado”.

Pueden existir como telemetría técnica, pero no prueban valor ni eficacia.

## Outcome

Siempre que el objetivo lo permita, adjunta una señal de resultado:

- uso;
- error rate;
- conversión;
- tiempo de tarea;
- soporte reducido;
- reducción de incidentes;
- seguridad;
- rendimiento;
- coste.

No todos los cambios necesitan una KPI de negocio. Sí necesitan una definición honesta de qué significaría que el problema quedó resuelto.

Para evaluar sobrecoste, retrabajo, factores de contexto y límites de atribución, véase [EVALUATION.md](EVALUATION.md). Los indicadores del producto no prueban por sí solos la eficacia de REM.
