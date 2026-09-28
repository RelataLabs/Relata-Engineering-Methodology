---
id: INC-YYYY-NNN
type: incident
title: "<Qué se rompió, en una frase que se entienda sola>"
date: YYYY-MM-DD
status: Investigating
severity: null
detected: YYYY-MM-DD
resolved: null
repos: []
commits: []
related: []
---

<!--
PLANTILLA DE INCIDENTE (INC) — REM 1.1

Crear:  node scripts/rem-new.mjs incident <slug>

DOS MODOS. Pregunta: ¿existe alguien que pueda provocar esto a propósito?
  · FUNCIONAL (no): usa 1, 3, 4, 7, 9, 10, 11 y 12. Borra 2, 5, 6 y 8 — escribir tres veces
    "N/A, no es una vulnerabilidad" solo añade ruido.
  · SEGURIDAD (sí): todas las secciones. `severity` lleva el vector CVSS v3.1 completo
    ("CVSS:3.1/AV:N/…"). Bandas: Critical 9–10 (corrección el mismo día) · High 7–8.9 ·
    Medium 4–6.9 · Low 0.1–3.9 · Info 0.

Estados: Draft · Investigating · Mitigated · Resolved · Closed. Un incidente no se queda
en `Investigating` después de corregido (regla 2 avisa a los siete días).
-->

# INC-YYYY-NNN — <título corto>

## 1. Resumen ejecutivo

> 3–6 frases que alguien no técnico pueda seguir: qué pasó, qué tan grave fue, qué se hizo,
> estado actual.

## 2. Severidad y clasificación

- **CVSS v3.1:** `<vector>` → **<score>** (<banda>)
- **Tipo:** <p. ej. control de acceso roto, exposición de datos>
- **Explotabilidad:** <¿anónima? ¿requiere sesión? ¿precondiciones?>

## 3. Línea de tiempo

| Cuándo (YYYY-MM-DD HH:MM TZ) | Evento |
|---|---|
| | Detección |
| | Contención |
| | Remediación desplegada |

## 4. Detección

> Cómo se detectó, y cuánto tardó. Si lo detectó un usuario, dilo: es un dato.

## 5. Sistemas y activos afectados

> Repos, servicios, datos, tenants o usuarios potencialmente afectados. Específico.

## 6. Vectores

> Cómo se explota (o se explotaría): pasos reproducibles y rutas de código (`archivo:línea`).

## 7. Causa raíz

> Hasta la causa sistémica, no el síntoma. Cinco porqués u otra técnica.

- **¿Por qué 1?** …
- **¿Por qué 5? (raíz)** …

## 8. Impacto

- **Confidencialidad / integridad / disponibilidad:** …
- **Datos expuestos o en riesgo:** …

## 9. Contención

> Qué detuvo el impacto, y cuándo.

## 10. Remediación

| Horizonte | Acción | Responsable | Estado | Evidencia |
|---|---|---|---|---|
| Inmediato | | | ☐ | |
| Corto plazo | | | ☐ | |
| Estructural (ADR/DEC/Plan) | | | ☐ | |

## 11. Verificación

> Cómo se comprobó que el vector quedó cerrado: la reproducción ahora falla, la prueba nueva
> falla contra el árbol anterior.

## 12. Lecciones

- **Qué salió bien:** …
- **Qué salió mal:** …
- **Qué cambiamos para que no vuelva a pasar:** …
