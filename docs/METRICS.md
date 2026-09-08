# Métricas REM 1.0

REM mide flujo y resultados, no actividad.

## Mínimas

### WIP

Cantidad de trabajo iniciado y no terminado.

Para Plans:

`Activo + Verificando + (Desplegado/Observando que aún requieren atención)`

### Throughput

Planes/unidades cerradas por periodo.

No comparar equipos por throughput sin contexto: las unidades no son homogéneas.

### Work Item Age

Edad de cada trabajo que sigue abierto desde `started`.

Sirve para detectar envejecimiento antes de que se convierta en retraso invisible.

### Cycle Time

`closed - started`

Usa percentiles/mediana, no solo promedio.

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
