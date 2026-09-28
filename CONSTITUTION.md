# Constitución de Ingeniería — plantilla REM

> Este archivo NO es parte universal del kernel de REM. Se copia y adapta por proyecto.
> Las decisiones técnicas concretas viven aquí para que no contaminen la metodología general.
> Hay dos ejemplos completos en `examples/`: uno de una sola arquitectura y otro multirepo con
> una arquitectura por repositorio.

**Versión de constitución:** 0.1  
**Basada en:** REM 1.1  
**Coordinación:**

Los planes citan estas secciones por número en su apartado "Restricciones heredadas", así que
conviene no renumerarlas.

## 1. Repositorios

| Repo | Rol | Stack | Rama de integración |
|---|---|---|---|
| | | | |

## 2. Arquitectura por repositorio

Una fila por repo. Es donde vive lo que en otros proyectos se impone a todos ("Clean
Architecture en todos los repos"): aquí se dice repo por repo, con lo que el código mantiene de
verdad.

| Repo | Patrón | Reglas (dependencias permitidas y prohibidas) | Desviaciones medidas |
|---|---|---|---|
| | | | |

Principios transversales, si los hay (composición, compatibilidad hacia atrás, contratos API
estables, accesibilidad, privacidad por diseño…):

## 3. Seguridad y datos

- clasificación de datos:
- datos que nunca van en logs, eventos o URLs:
- acciones que requieren aprobación humana:
- política de secretos:
- migraciones, seeders y backups:
- reglas de autorización y aislamiento entre clientes:

## 4. Verificación

Con los comandos reales de cada repo; el éxito se lee del código de salida.

| Nivel | Cuándo | Evidencia mínima (comandos) |
|---|---|---|
| V0 | | |
| V1 | | |
| V2 | | |
| V3 | | |

## 5. Git y entrega

- ramas (integración, personales, por plan):
- política de PR:
- política de commits (formato, cuerpo):
- política de changelog (`required` / `observable` / `deferred`, METHOD §11.2):
- atribución de IA en commits (bloqueada / permitida):
- reescritura de historia:
- despliegue:
- rollback:

## 6. Topología documental

- perfil (`hub-multirepo` / `in-repo`), con o sin spokes:
- dónde queda el registro por defecto de un cambio:
- qué pasa con la documentación que ya existía:

## 7. Agentes

- herramientas autorizadas:
- acciones permitidas sin confirmación:
- acciones que requieren aprobación:
- acciones prohibidas:
- archivos de contexto canónicos:

## 8. Equipo y coordinación

- personas y su handle (`owner`):
- WIP (default REM: 1 Plan activo/verificando por humano):
- orden de selección:
- protocolo (docs/TEAM.md): quién coordina cada megaplán, cómo se toma un plan, quién
  regenera las vistas, cómo llegan los cambios al hub:

## 9. Recursos compartidos

Lo que varios planes consumen y solo se cambia con DEC.

| Recurso | Dónde vive |
|---|---|
| | |

## 10. Excepciones vigentes

Toda regla de REM o de esta Constitución que no se cumple todavía.

| Regla exceptuada | Motivo | Responsable | Condición o fecha de salida |
|---|---|---|---|
| | | | |

## 11. Preguntas abiertas
