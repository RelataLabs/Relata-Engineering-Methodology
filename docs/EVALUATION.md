# Alcance y evaluación de REM

REM 1.1 es una propuesta de proceso publicada como especificación. Sus reglas permiten describir una forma de trabajo y comprobar parte de su ejecución. Para evaluar sus resultados hay que distinguir qué afirmación se está haciendo y qué evidencia la sostiene.

## Qué puede demostrar cada evidencia

| Afirmación | Evidencia pertinente | Alcance de la conclusión |
|---|---|---|
| El método está definido | Especificación, conceptos, reglas, responsabilidades y criterios de cierre consistentes | Existe una propuesta examinable; definirla no prueba que mejore un proyecto. |
| El tooling cumple una función | Pruebas positivas, negativas y de regresión sobre una revisión identificada | Se comprobaron los comportamientos ensayados del software. |
| Una instalación cumple sus invariantes | Configuración, documentos y resultado del doctor en CI | Se satisfacen los controles implementados; no demuestra por sí solo que el equipo aplique todas las reglas. |
| Un equipo aplica REM | Planes reales, decisiones, cambios, revisión de evidencia, observación y políticas locales | Se documenta la práctica en ese contexto y período. |
| Un producto cumple requisitos | Pruebas y observaciones ligadas a criterios del producto | Se sustentan esos requisitos; el número de pruebas no mide eficacia del método. |
| El proceso resulta útil | Datos de flujo, resultados, retrabajo y coste de coordinación, con contexto y comparación | Se describe utilidad observada; atribuir causalidad requiere un diseño que descarte explicaciones alternativas. |

El nombre del método, su publicación, sus licencias y el estado de una versión no constituyen una certificación de eficacia. Las fuentes propias permiten consultar la propuesta; una evaluación independiente requiere participantes y revisión que realmente lo sean. El autor puede evaluar su aplicación, declarando esa relación y los límites de la observación.

## Fundamentos y aportación

[REFERENCES.md](../REFERENCES.md) identifica prácticas y fuentes primarias: especificación antes de implementación, control del flujo, decisiones durables y verificación. REM las organiza mediante responsabilidades entre personas, agentes y automatización, y reglas configurables de coordinación y cierre. No atribuye originalidad a cada práctica ni adopta automáticamente todas las reglas de las propuestas citadas.

Los antecedentes del proyecto de origen son experiencias declaradas, no estudios independientes. Por ejemplo, el recuento 99/117 mencionado en METHOD §11.2 no viene acompañado de su conjunto de datos y protocolo; sirve para explicar una decisión de diseño, no para estimar una tasa general o probar causalidad.

## Protocolo práctico para una aplicación

1. **Delimitar la pregunta antes de medir.** Identificar equipo, período, versión de REM, configuración, tipo de trabajo y cambio de política. Por ejemplo: “¿El registro obligatorio permite reconstruir decisiones con un coste de coordinación aceptable para este equipo?”. Definir previamente qué resultado justificaría conservar, ajustar o retirar la regla.
2. **Definir unidades y comparación.** Mantener la misma unidad de trabajo y criterios de inicio/cierre. Comparar períodos o grupos de trabajo de clase y riesgo semejantes, indicando volumen, composición y diferencias. Si no existe una base comparable, reportar un estudio descriptivo; no fabricar un período anterior ni cambiar retrospectivamente las reglas de conteo.
3. **Recoger datos suficientes y verificables.** Registrar por unidad: identificador, clase, riesgo, responsable, versión/configuración, inicio, pausas, cierre o abandono, criterio y enlace a evidencia. Registrar también bloqueos externos, cambios de equipo, herramientas, alcance y cambios simultáneos de proceso. Proteger información personal y secretos al compartir datos.
4. **Medir resultados y coste.** Usar las definiciones de [METRICS.md](METRICS.md). Añadir tiempo observado de coordinación/documentación, retrabajo y una señal del resultado que se pretendía mejorar. La medición puede ser por muestreo declarado; no exige convertir cada actividad en un ticket ni estimar horas futuras.
5. **Revisar casos y explicar variación.** Examinar entregas correctas, fallos, abandonos y datos faltantes. Una segunda persona puede revisar una muestra con los mismos criterios; registrar desacuerdos. Presentar cantidades y distribuciones, no únicamente promedios favorables.
6. **Publicar una conclusión acotada.** Identificar qué cambió, qué se observó y qué no puede inferirse. Decidir la siguiente adaptación y conservar los datos y definiciones necesarios para repetir el análisis.

## Medidas complementarias

| Medida | Definición que debe fijar la evaluación |
|---|---|
| Sobrecoste de coordinación | Tiempo observado destinado a planificar, documentar y mantener controles, por unidad o período. Indicar si procede de registro completo, muestreo o estimación retrospectiva. No tratar datos faltantes como cero. |
| Retrabajo | Correcciones posteriores a la aceptación por incumplimiento de un criterio previamente acordado. Separarlas de cambios de requisito y mejoras nuevas; fijar ventana de observación. |
| Reconstrucción de decisiones | Proporción de una muestra en la que un revisor puede localizar contexto, decisión y evidencia con un criterio de revisión definido. Informar tamaño de muestra y desacuerdos. |
| Resultado del producto | Señal pertinente al objetivo, como errores de un flujo o tiempo de una tarea; fijar población, ventana e instrumento. No confundirla con cantidad de código. |

Un descenso de cycle time puede deberse a cambios más pequeños, experiencia del equipo, herramientas o menos bloqueos. Un aumento puede acompañar controles necesarios para trabajo de mayor riesgo. Un estudio antes/después pequeño permite describir asociaciones, no aislar por sí solo el efecto de REM. No se fija un tamaño de muestra universal ni se promete significancia sin un diseño estadístico adecuado.

## Cómo informar los resultados

El informe de evaluación debe incluir: pregunta, contexto, versión, política aplicada, unidad y período, selección de casos, fuentes, resultados completos, limitaciones y decisión posterior. Distingue instalación, ejecución del método y resultados del producto. Si el autor de REM también evalúa, decláralo; si hubo revisión externa, indica qué examinó y conserva su registro.

El [recorrido completo](EXAMPLE-WALKTHROUGH.md) es un ejemplo didáctico con datos sintéticos. Enseña a registrar y calcular; no constituye un caso de validación de REM.
