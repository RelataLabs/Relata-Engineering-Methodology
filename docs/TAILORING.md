# Tailoring de REM

REM debe adaptarse sin convertirse en ceremonia, y sin quedarse a medias.

## Lo que puedes cambiar

- nombres de carpetas (declarándolos en `rem.config.json`);
- vocabularios de estados documentales declarados por tipo en el config; los Plans y Megaplanes conservan los estados canónicos de METHOD §6 para que funcionen las reglas y métricas del tooling;
- límite de atención activa y política de admisión, manteniendo visible el WIP total;
- taxonomía de prioridades y política de selección;
- política de Git, de review y de atribución de IA;
- formato y política de changelog (`required`, `observable`, `deferred`);
- campos adicionales de front-matter;
- herramientas de agentes;
- umbrales que amplíen la verificación y controles del doctor, conservando los mínimos del nivel aplicable;
- cadencias.

## Lo que NO es tailoring

Estas cosas no adaptan REM: lo desinstalan en silencio. Ningún agente debe hacerlas por su
cuenta, y ninguna adopción debería hacerlas sin declararlas como excepción en la Constitución:

- **omitir tipos de documento** (MEGA, PLAN, DEC, AUD…) "porque todavía no hacen falta";
- **reescribir plantillas más cortas** o sin front-matter; las plantillas se copian y el menú
  se aplica al escribir cada documento, borrando secciones de ese documento;
- **no instalar el tooling** (doctor, índice, hooks, CI): una regla que una máquina puede
  comprobar no debe depender de la memoria de nadie (METHOD §3.3);
- **convertir una restricción de una sesión en una regla permanente** (p. ej. "no toques los
  repos de código hoy" escrito como ADR) sin preguntarle a un humano;
- **dejar la documentación existente sin destino** en un proyecto con historia.

## Lo que no deberías eliminar si quieres llamarlo REM

- coste proporcional;
- autoridad humana;
- WIP explícito;
- evidencia proporcional;
- ciclo INV/DEC/IMP/VER (aunque los nombres cambien);
- observación cuando el resultado lo exige;
- historia durable de decisiones;
- métricas mínimas de flujo;
- mecanismo de mejora del propio método.

## Traducir las reglas del proyecto de origen

REM nació destilando el hub de un proyecto concreto. Sus reglas "de la casa" no desaparecieron:
cambiaron de sitio, de la plantilla o del método a la **Constitución** del proyecto que adopta.

| Regla en el proyecto de origen | Dónde vive en REM | Cómo se adapta |
|---|---|---|
| Clean Architecture y SOLID en todos los repos, sección "no se borra" de cada plan | Constitución, "Arquitectura por repositorio"; cada plan la cita en "Restricciones heredadas" | una fila por repo con SU patrón (Atomic Design, Clean, monolito modular, puertos y adaptadores…) |
| Boy Scout sin límite | METHOD §9.1 (acotado por familia causal) | se mantiene o se amplía en la Constitución |
| Una prueba nueva falla contra el árbol anterior | VERIFICATION, contrafactual obligatorio en V2/V3 | la Constitución elige la técnica equivalente y puede exigirlo también en V1; no elimina los mínimos V2/V3 |
| El éxito se lee del código de salida | Constitución, "Verificación" | igual |
| Cero estimaciones en tiempo humano | METHOD §4.2 | igual |
| Cada commit con cuerpo y entrada de CHANGELOG | `changelog.policy` + bloque CONFIG de `hooks/commit-msg` | `required` / `observable` / `deferred`, y cuerpo obligatorio o no |
| Sin trailers de coautoría de IA | Constitución, "Git"; `BLOCK_AI_ATTRIBUTION` en el hook | bloquear o permitir |
| Ramas por defecto por repo, repos públicos, términos que no deben filtrarse | `repos` y `publicLeakTerms` del config | lo que tenga el proyecto |
| Escala CVSS para incidentes de seguridad | plantilla INC (modo seguridad) | se mantiene; otro esquema de severidad va en la Constitución |

Hay dos ejemplos de Constitución en [examples/](../examples/): uno con una sola arquitectura para
todo el sistema y otro multirepo con una arquitectura distinta por repo.

## Equipo de una persona

- atención activa de un Plan; seguimiento separado del WIP total;
- sin PR obligatorio;
- `generated.index = "local"` (se ejecuta `rem-index` y se preparan las vistas; el hook comprueba el contenido staged sin añadir archivos);
- agente como implementador/revisor adversarial;
- CI como segunda línea;
- V3 exige pausa consciente y, si el riesgo lo justifica, revisor humano externo.

## Equipo 2–5

- atención activa por humano = 1; WIP total visible;
- `generated.index = "ci"` y el protocolo de [TEAM.md](TEAM.md);
- un coordinador por megaplán;
- review cruzado solo V2/V3 o cambios estructurales;
- no crear subtareas salvo que tengan independencia real: si dos personas, dos planes.

## Equipo 6–15

- límite WIP por equipo y por persona;
- owners claros por Plan y coordinador por Megaplán;
- `team.owners` en el config para validar responsables;
- revisiones breves de flujo con `rem-flow` y `rem-status`;
- decisiones arquitectónicas más explícitas.

## Regulado / crítico

Añade:

- matriz de aprobación;
- trazabilidad requisito→evidencia;
- retención;
- control de acceso a agentes;
- V3 ampliado;
- segregación de funciones;
- evidencia firmada si aplica.

No hace falta abandonar REM: se incrementa el coste donde el riesgo lo justifica.

## Recursos y política económica

Un proyecto con compromisos económicos puede concretar en su Constitución el registro común, límites de importe/período/consumo, autoridad de contratación y renovación, cadencia de seguimiento y continuidad. La [guía de costes](COSTS.md) es orientación: no exige estimar horas, crear un tipo documental adicional ni presupuestar cada Plan. Las reglas de autoridad y evidencia existentes siguen vigentes.
