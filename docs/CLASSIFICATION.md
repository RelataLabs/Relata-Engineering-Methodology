# Clasificación formal de REM

**Relata Engineering Methodology (REM)** es el nombre del proyecto y de la familia de especificaciones.

La clasificación técnica de **REM 1.0** es:

> **Framework configurable de proceso de ingeniería de software y especificación de método**  
> *Configurable software engineering process framework and method specification.*

Esta formulación distingue el nombre del proyecto de la naturaleza del artefacto que publica.

## 1. Vocabulario

### Methodology

`Relata Engineering Methodology` es el nombre paraguas del proyecto. En comunicación general y académica puede hablarse de **metodología REM** para referirse al sistema completo de trabajo.

El término no implica que REM sea una teoría científica sobre todas las metodologías de desarrollo ni que haya sido validado universalmente. Es el nombre de una propuesta de ingeniería versionada.

### Method specification

`METHOD.md` es la **especificación normativa del método**. Define el kernel, las actividades, estados, responsabilidades, invariantes y reglas que determinan cuándo una adopción puede considerarse conforme con REM 1.0.

### Process framework

REM es un **framework de proceso** porque no prescribe una única secuencia rígida para todos los proyectos. Proporciona un kernel y reglas configurables que una organización adapta a su contexto sin eliminar las propiedades esenciales de conformidad.

El framework define, entre otras cosas:

- entrada y selección de trabajo;
- control de WIP;
- actores y autoridad;
- ciclo `[INV] → [DEC] → [IMP] → [VER] → [OBS]`;
- estados de flujo;
- evidencia y niveles de verificación;
- artefactos proporcionales al riesgo;
- métricas mínimas;
- reglas de tailoring.

### Configured process / adopción

Una **adopción de REM** es la configuración concreta usada por un equipo o proyecto.

Ejemplo:

```text
Relata Engineering Methodology
        ↓
REM 1.0 — process framework + method specification
        ↓
tailoring / constitution / políticas locales
        ↓
proceso REM configurado para un proyecto
        ↓
trabajo y evidencia reales
```

La adopción puede definir arquitectura, branching, herramientas, límites de WIP, niveles de aprobación u otras reglas locales mediante su Constitución, siempre que conserve el kernel de conformidad definido en `METHOD.md`.

## 2. ¿REM es una metodología, un proceso o un framework?

Las tres palabras describen niveles distintos, por lo que no conviene tratarlas como sinónimos:

| Término | En REM |
|---|---|
| **Methodology** | nombre paraguas y forma común de referirse al sistema completo |
| **Method specification** | la norma versionada que define REM 1.0 |
| **Process framework** | la arquitectura configurable que puede adaptarse a distintos proyectos |
| **Configured process** | la instancia concreta de REM usada por un equipo/proyecto |

Por ello, la descripción recomendada es:

> **REM 1.0 es un framework configurable de proceso de ingeniería de software, publicado como una especificación de método.**

En inglés:

> **REM 1.0 is a configurable software engineering process framework published as a method specification.**

## 3. Relación conceptual con RUP

RUP es un antecedente útil para explicar la **categoría** de process framework: un framework de proceso puede ofrecer un cuerpo de prácticas y artefactos que luego se configuran para una organización o proyecto.

REM comparte esa propiedad de configurabilidad, pero **no afirma equivalencia con RUP** en madurez, alcance histórico, validación, adopción industrial ni contenido. REM tiene un kernel distinto y fue diseñado explícitamente para un contexto donde humanos, agentes de IA y automatización determinista cooperan en el ciclo de entrega.

## 4. Uso académico recomendado

Cuando un documento académico pida simplemente “Metodología a utilizar”, se recomienda:

> **Relata Engineering Methodology (REM) 1.0, framework configurable de proceso de ingeniería de software basado en evidencia y orientado al desarrollo asistido por agentes de inteligencia artificial.**

Cuando haya espacio para mayor precisión:

> **Se utilizará Relata Engineering Methodology (REM) 1.0, un framework configurable de proceso de ingeniería de software publicado como especificación de método. La adopción del proyecto conserva el kernel de REM y configura sus políticas técnicas y de flujo según el contexto del proyecto.**

## 5. Estado de publicación

REM 1.0 se publica como **open specification versionada**.

La apertura se expresa mediante licencias explícitas según el tipo de material:

- la especificación, documentación y plantillas se publican bajo **Creative Commons Attribution 4.0 International (CC BY 4.0)**;
- el software y tooling ejecutable se publican bajo **Apache License 2.0**.

El archivo raíz `LICENSE` define el alcance por ruta; los textos completos están en `LICENSE-CC-BY-4.0` y `LICENSE-APACHE-2.0`.

Esta apertura permite reutilización, adaptación y uso comercial bajo las condiciones de cada licencia. No concede por sí sola derechos sobre branding ni autorización para presentar una variante modificada como publicación oficial de RelataLabs; esas reglas se aclaran en `TRADEMARKS.md`.

Por tanto, REM puede describirse como **open specification** y su tooling como **open-source software** bajo Apache-2.0.
