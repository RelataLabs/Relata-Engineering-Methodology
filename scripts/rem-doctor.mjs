#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 RelataLabs

/**
 * REM doctor 1.1 — audita la salud de una adopción REM.
 *
 * Los hooks atrapan lo que pasa al commitear. El doctor atrapa lo que pasa por NO
 * commitear: un incidente que lleva un mes en `Investigating` aunque ya esté resuelto,
 * un Plan cerrado con casillas abiertas, una referencia a un commit que una reescritura
 * de historia dejó huérfano, dos planes activos de dos personas tocando el mismo módulo.
 *
 * Uso:
 *   node scripts/rem-doctor.mjs               errores → sale 1; avisos → sale 0
 *   node scripts/rem-doctor.mjs --strict      los avisos también fallan
 *   node scripts/rem-doctor.mjs --adoption    además exige que la adopción esté completa
 *   node scripts/rem-doctor.mjs --no-git      omite las reglas que necesitan los repos clonados
 *   node scripts/rem-doctor.mjs --quiet       solo el resumen
 *   node scripts/rem-doctor.mjs --root <dir>  audita otra carpeta (p. ej. examples/hub)
 *
 * Numeración: 1–14 conservan la del hub de origen de REM para que los mensajes sigan
 * siendo buscables; 15+ son nuevas en 1.1; A* son de adopción. Catálogo en docs/BOOTSTRAP.md.
 */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import {
  ACTIVE_STATES,
  DEPENDENCY_DONE,
  FINAL_STATES,
  INDEX_END,
  INDEX_START,
  PLANS_START,
  asList,
  arg,
  branchRef,
  daysSince,
  fileMatchesId,
  flag,
  git,
  isWithin,
  loadConfig,
  loadDocs,
  parseDate,
  readText,
  repoBranch,
  repoDir,
  resolveRoot,
  toPosix,
  typeEntries,
  walkText,
} from './lib/rem.mjs'
import { planDateIssues } from './lib/flow.mjs'

const ROOT = resolveRoot(import.meta.url)
const SOURCE_ROOT = arg('--source-root')
const NO_GIT = flag('--no-git')
const QUIET = flag('--quiet')
const STRICT = flag('--strict')
const ADOPTION = flag('--adoption')
const IN_CI = Boolean(process.env.CI)

const findings = []
const add = (rule, level, msg, fix) => findings.push({ rule, level, msg, fix })

const { config, error: configError } = loadConfig(ROOT)
if (!config) {
  console.log(`✗ [regla A0] ${configError}`)
  console.log('     → copia rem.config.example.json como rem.config.json y ajústalo (docs/BOOTSTRAP.md)')
  process.exit(1)
}

const docs = loadDocs(ROOT, config)
const withId = docs.filter((d) => d.fm?.id)
const byId = new Map()
for (const d of withId) if (!byId.has(d.fm.id)) byId.set(d.fm.id, d)
const label = (d) => d.fm?.id ?? d.rel
const typeOf = (d) => d.fm?.type
const plans = withId.filter((d) => typeOf(d) === 'plan')
const megas = withId.filter((d) => typeOf(d) === 'mega')
const plansOf = (mega) => asList(mega.fm.plans ?? mega.fm.planes)

// --- A. Adopción completa (solo con --adoption) ------------------------------
// REM 1.0 decía "OK (0 documentos inspeccionados)" sobre un hub vacío. Un hub que no
// tiene nada no está sano: está sin instalar. Con --adoption eso es un error.
if (ADOPTION) {
  if (config.legacy) {
    add('A1', 'error', 'config REM 1.0 (workRoots): una adopción 1.1 declara `types`',
      'parte de rem.config.example.json de REM 1.1')
  }
  if (!withId.length) {
    add('A1', 'error', 'la adopción no tiene ningún documento con front-matter',
      'una adopción recién instalada abre al menos su ADR fundacional o su primer Megaplán')
  }
  for (const [type, t] of typeEntries(config)) {
    if (!existsSync(join(ROOT, t.dir))) {
      add('A2', 'error', `falta la carpeta \`${t.dir}\` del tipo \`${type}\``,
        'los tipos se instalan todos aunque estén vacíos; renombrar se hace en el config, omitir no')
    }
    if (t.template && !existsSync(resolve(ROOT, t.template))) {
      add('A3', 'error', `falta la plantilla \`${t.template}\` del tipo \`${type}\``,
        'copia la plantilla de REM byte a byte y cambia solo los marcadores <…>')
    }
  }
  for (const f of config.required) {
    if (!existsSync(join(ROOT, f))) add('A4', 'error', `falta \`${f}\` (declarado en \`required\`)`)
  }
  if (config.ci?.workflow && !existsSync(resolve(ROOT, config.ci.workflow))) {
    add('A5', 'error', `falta el workflow de CI \`${config.ci.workflow}\``,
      'copia templates/ci/rem.yml: sin reloj, nadie ve lo que se pudre por no commitear')
  }
  const readme = readText(join(ROOT, config.generated.readme)) ?? ''
  if (!readme.includes(INDEX_START) || !readme.includes(INDEX_END)) {
    add('A6', 'error', `${config.generated.readme} no tiene los marcadores del índice generado`,
      'parte de templates/HUB-README.md y ejecuta node scripts/rem-index.mjs')
  }
  if (!IN_CI && !NO_GIT && git(ROOT, ['rev-parse', '--git-dir']) !== null) {
    const hp = git(ROOT, ['config', 'core.hooksPath'])
    if (hp !== config.hooksDir) {
      add('A7', 'warn', `core.hooksPath es \`${hp ?? ''}\`, no \`${config.hooksDir}\``,
        'node scripts/rem-install.mjs (se configura por clon; no viaja con el repo)')
    }
  }
  if (!['required', 'observable', 'deferred'].includes(config.changelog.policy)) {
    add('A8', 'error', `changelog.policy \`${config.changelog.policy}\` no es required, observable ni deferred`,
      'la Constitución DEBE declarar la política de changelog (METHOD §11.2)')
  }
  if (!NO_GIT) {
    for (const [name, r] of Object.entries(config.repos)) {
      if (!r.spoke) continue
      const dir = repoDir(ROOT, config, name)
      if (!existsSync(dir)) {
        add('A9', 'warn', `${name}: no está clonado en ${r.path}; no se puede comprobar su spoke`)
        continue
      }
      if (!existsSync(join(dir, 'CHANGELOG.md'))) add('A9', 'error', `${name}: spoke sin CHANGELOG.md`)
      const agent = config.agentBlock?.file ? readText(join(dir, config.agentBlock.file)) ?? '' : null
      if (agent !== null && !agent.includes(config.agentBlock.heading)) {
        add('A9', 'error', `${name}: ${config.agentBlock.file} sin el bloque "${config.agentBlock.heading}"`,
          'copia templates/AGENTS-CODE-REPO-BLOCK.md')
      }
    }
  }
}

if (!docs.length && !ADOPTION) {
  add(0, 'warn', 'no se inspeccionó ningún documento',
    'si esto es una adopción, ejecuta con --adoption: un hub vacío no está sano, está sin instalar')
}

// --- 1. Front-matter presente, completo y coherente --------------------------
for (const d of docs) {
  if (!d.fm) {
    add(1, 'error', `${d.rel}: sin front-matter`,
      'el bloque --- va en el primer byte del fichero; un comentario antes lo invalida')
    continue
  }
  if (d.bom) add(1, 'warn', `${d.rel}: empieza con BOM`, 'guárdalo como UTF-8 sin BOM')
  for (const key of d.blockLists) {
    add('1b', 'error', `${d.rel}: \`${key}\` es una lista en bloque`,
      `escríbela inline: ${key}: [a, b]. En bloque el parser no la ve y la regla que la usa queda ciega`)
  }
  for (const key of ['id', 'type', 'title', 'date', 'status']) {
    if (!d.fm[key]) add(1, 'error', `${d.rel}: falta \`${key}\` en el front-matter`)
  }
  if (d.expectedType && d.fm.type && d.fm.type !== d.expectedType) {
    add(1, 'error', `${d.rel}: type \`${d.fm.type}\` no corresponde a la carpeta ${d.dir} (\`${d.expectedType}\`)`)
  }
  const t = config.types[d.fm.type]
  if (!d.expectedType && d.fm.type && !t && !config.legacy) {
    add(1, 'error', `${d.rel}: type \`${d.fm.type}\` no existe en el config`)
  }
  if (t?.idPattern && d.fm.id && !new RegExp(t.idPattern).test(d.fm.id)) {
    add(1, 'error', `${d.rel}: id \`${d.fm.id}\` no cumple ${t.idPattern}`)
  }
  if (t?.fileNaming && d.fm.id && !fileMatchesId(d.file, d.fm.id, t.fileNaming)) {
    add(1, 'error', `${d.rel}: el nombre del fichero no corresponde al id \`${d.fm.id}\``,
      t.fileNaming === 'unprefixed-id' ? 'el fichero es el id sin su prefijo: YYYY-MM-DD-slug.md' : 'el fichero empieza por el id: <ID>-slug.md')
  }
  if (d.fm.date && !parseDate(d.fm.date)) {
    add(1, 'error', `${label(d)}: date \`${d.fm.date}\` no es una fecha de calendario YYYY-MM-DD válida`)
  }
}

// --- 2. Estados transitorios estancados ------------------------------------
// Megaplanes, planes y arquitectura viva están exentos por TIPO: un megaplán abierto
// semanas es su estado normal, y avisarlo enseñaría a ignorar el aviso.
const transient = new Set(config.transientStates)
for (const d of withId) {
  if (['mega', 'plan', 'arch'].includes(typeOf(d))) continue
  const base = String(d.fm.status ?? '')
  if (!transient.has(base)) continue
  const age = daysSince(d.fm.date)
  if (age !== null && age > config.limits.staleDays) {
    add(2, 'warn', `${d.fm.id}: lleva ${age} días en \`${base}\``,
      'si ya se resolvió, actualiza `status`; si sigue abierto, di por qué en el documento')
  }
}

// --- 3. Entregas sin desplegar ---------------------------------------------
for (const d of withId.filter((x) => typeOf(x) === 'imp')) {
  if (!['Implemented', 'Validated'].includes(d.fm.status)) continue
  const age = daysSince(d.fm.date)
  if (!(d.fm.deployed ?? d.fm.deploy) && age !== null && age > config.limits.deployDays) {
    add(3, 'warn', `${d.fm.id}: ${age} días en \`${d.fm.status}\` sin fecha de despliegue`,
      'rellena `deployed: YYYY-MM-DD` o explica en el documento por qué sigue sin desplegarse')
  }
}

// --- 4 y 5. Commits cualificados por repo y alcanzables ----------------------
const knownRepo = (name) => name === '.' || name === config.hub?.name || Boolean(config.repos[name])
for (const d of withId) {
  const refs = [
    ...['commits', 'verified_against'].flatMap((f) => asList(d.fm[f]).map((v) => ({ v, field: f }))),
    ...asList(d.fm.sources).map((v) => ({ v, field: 'sources' })),
  ]
  for (const { v, field } of refs) {
    const m = /^([A-Za-z0-9._-]+)@([0-9a-f]{7,40})(?::(.+))?$/.exec(v)
    if (!m || (m[3] && field !== 'sources')) {
      add(4, 'error', `${d.fm.id}: \`${v}\` en \`${field}\` no es repo@hash${field === 'sources' ? '[:ruta]' : ''}`,
        'un hash suelto no se puede resolver cuando el hub cubre varios repos')
      continue
    }
    const [, repo, hash, path] = m
    if (!knownRepo(repo)) {
      add(4, 'warn', `${d.fm.id}: repo \`${repo}\` de \`${v}\` no está en \`repos\` del config`)
      continue
    }
    if (NO_GIT) continue
    const dir = repoDir(ROOT, config, repo)
    if (!existsSync(dir)) {
      add(5, 'warn', `${d.fm.id}: ${repo} no está clonado en ${toPosix(relative(ROOT, dir))}; no se comprueba \`${v}\``)
      continue
    }
    const ref = branchRef(dir, repoBranch(config, repo))
    if (git(dir, ['cat-file', '-e', `${hash}^{commit}`]) === null) {
      add(5, 'error', `${d.fm.id}: \`${repo}@${hash}\` no existe`,
        'sustitúyelo por evidencia estable: archivo:línea + fecha + asunto')
    } else if (git(dir, ['merge-base', '--is-ancestor', hash, ref]) === null) {
      add(5, 'error', `${d.fm.id}: \`${repo}@${hash}\` no es alcanzable desde ${ref}`,
        'cita commits solo después del merge a la rama de integración; si la historia se reescribió, cita archivo:línea + fecha')
    } else if (path && git(dir, ['cat-file', '-e', `${hash}:${path}`]) === null) {
      add(5, 'error', `${d.fm.id}: \`${path}\` no existe en ${repo}@${hash}`)
    }
  }
}

// --- 5b. Hashes sueltos en el cuerpo ---------------------------------------
if (!NO_GIT) {
  const dirs = [['.', ROOT], ...Object.keys(config.repos).map((r) => [r, repoDir(ROOT, config, r)])]
    .filter(([, dir]) => existsSync(dir))
  const cache = new Map()
  const alive = (hash) => {
    if (!cache.has(hash)) {
      cache.set(hash, dirs.some(([name, dir]) =>
        git(dir, ['cat-file', '-e', `${hash}^{commit}`]) !== null &&
        git(dir, ['merge-base', '--is-ancestor', hash, branchRef(dir, repoBranch(config, name))]) !== null))
    }
    return cache.get(hash)
  }
  for (const d of withId) {
    const seen = new Set()
    for (const m of d.body.matchAll(/`([0-9a-f]{7,12})`/g)) {
      const hash = m[1]
      if (seen.has(hash) || !/\d/.test(hash) || !/[a-f]/.test(hash)) continue
      seen.add(hash)
      if (!alive(hash)) {
        add('5b', 'error', `${d.fm.id}: el cuerpo cita \`${hash}\`, que no es alcanzable en ningún repo`,
          'escribe repo@hash sin comillas invertidas, o cita archivo:línea + fecha + asunto')
      }
    }
  }
}

// --- 5c. Hashes muertos en los CHANGELOG de los repos ------------------------
if (!NO_GIT) {
  for (const name of Object.keys(config.repos)) {
    const dir = repoDir(ROOT, config, name)
    const text = readText(join(dir, 'CHANGELOG.md'))
    if (text === null) continue
    const ref = branchRef(dir, repoBranch(config, name))
    const seen = new Set()
    for (const m of text.matchAll(/`([0-9a-f]{7,12})`/g)) {
      const hash = m[1]
      if (seen.has(hash) || !/\d/.test(hash) || !/[a-f]/.test(hash)) continue
      seen.add(hash)
      if (git(dir, ['cat-file', '-e', `${hash}^{commit}`]) === null || git(dir, ['merge-base', '--is-ancestor', hash, ref]) === null) {
        add('5c', 'error', `${name}/CHANGELOG.md cita \`${hash}\`, que no existe en ${ref}`,
          'quita el hash: una entrada se localiza con `git log -S "<texto>"`')
      }
    }
  }
}

// --- 6. Referencias a documentos inexistentes -------------------------------
for (const d of withId) {
  const refs = [...asList(d.fm.related), ...asList(d.fm.depends_on), d.fm.extends, d.fm.supersedes, d.fm.superseded_by]
  for (const ref of refs.filter(Boolean)) {
    if (!byId.has(ref)) add(6, 'error', `${d.fm.id}: referencia a \`${ref}\`, que no existe`)
  }
}

// Los IDs pueden existir y aun así formar un ciclo imposible de secuenciar.
{
  const visited = new Set()
  const visiting = new Set()
  const path = []
  const visit = (id) => {
    if (visiting.has(id)) {
      add('6b', 'error', `ciclo de dependencias: ${[...path.slice(path.indexOf(id)), id].join(' → ')}`,
        'divide el contrato o elimina la dependencia que no sea necesaria; registra la decisión')
      return
    }
    if (visited.has(id) || !byId.has(id)) return
    visiting.add(id)
    path.push(id)
    for (const dep of asList(byId.get(id).fm.depends_on)) visit(dep)
    path.pop()
    visiting.delete(id)
    visited.add(id)
  }
  for (const d of withId) visit(d.fm.id)
}

// --- 7. Notas DEC que se pasan de tamaño -------------------------------------
for (const d of withId.filter((x) => typeOf(x) === 'dec')) {
  const content = d.body.replace(/<!--[\s\S]*?-->/g, '').split(/\r?\n/).filter((l) => l.trim()).length
  if (content > config.limits.decisionNoteContentLines) {
    add(7, 'warn', `${d.fm.id}: ${content} líneas de contenido (límite ${config.limits.decisionNoteContentLines})`,
      'si de verdad necesita ese tamaño, es un ADR mal clasificado')
  }
}

// --- 8. Repos que dejaron de registrar --------------------------------------
if (!NO_GIT && config.changelog.policy !== 'deferred') {
  for (const [name, r] of Object.entries(config.repos)) {
    const dir = repoDir(ROOT, config, name)
    if (!r.spoke || !existsSync(join(dir, 'CHANGELOG.md'))) continue
    const log = git(dir, ['log', `-${config.limits.changelogDryCommits}`, '--no-merges', '--name-only', '--pretty=format:'])
    if (log === null) continue
    if (!log.split(/\r?\n/).some((f) => f.trim() === 'CHANGELOG.md')) {
      add(8, 'warn', `${name}: ${config.limits.changelogDryCommits} commits sin tocar CHANGELOG.md`,
        'o no se está registrando, o son todos [trivial]; comprueba cuál')
    }
  }
}

// --- 9. El bloque de agente derivó entre repos ------------------------------
if (config.agentBlock?.file && config.agentBlock?.heading) {
  const spokes = Object.entries(config.repos).filter(([, r]) => r.spoke).map(([n]) => n)
  if (spokes.length) {
    const blocks = new Map()
    for (const name of ['.', ...spokes]) {
      const dir = name === '.' ? ROOT : repoDir(ROOT, config, name)
      if (!existsSync(dir)) continue
      const after = (readText(join(dir, config.agentBlock.file)) ?? '').split(config.agentBlock.heading)[1]
      if (after === undefined) {
        add(9, 'warn', `${name === '.' ? 'hub' : name}: ${config.agentBlock.file} sin "${config.agentBlock.heading}"`)
        continue
      }
      // El bloque termina en el siguiente encabezado de primer nivel o en un marcador
      // generado por otra herramienta; sin ese corte, texto ajeno lo haría diferir siempre.
      const key = after.split(/\r?\n(?=<!-- BEGIN:|# )/)[0].replace(/\s+/g, ' ').trim()
      blocks.set(key, [...(blocks.get(key) ?? []), name === '.' ? 'hub' : name])
    }
    if (blocks.size > 1) {
      add(9, 'warn', `el bloque "${config.agentBlock.heading}" difiere: ${[...blocks.values()].map((g) => g.join(', ')).join(' | ')}`,
        'debe ser idéntico en el hub y en cada spoke; copia el del hub')
    }
  }
}

// --- 10. Documentación interna publicada en un repo público -----------------
if (!NO_GIT) {
  for (const [name, r] of Object.entries(config.repos)) {
    if (!r.public) continue
    const dir = repoDir(ROOT, config, name)
    const tracked = git(dir, ['ls-files'])
    if (tracked === null) continue
    for (const f of tracked.split(/\r?\n/).filter((x) => x.startsWith(`${config.hooksDir}/`))) {
      add(10, 'error', `${name}: publica \`${f}\`, que es interno`, 'añádelo al .gitignore y quítalo con git rm --cached')
    }
    for (const term of config.publicLeakTerms) {
      const hit = git(dir, ['grep', '-il', term, '--', '.'])
      if (hit) add(10, 'error', `${name}: ${hit.split(/\r?\n/).join(', ')} menciona "${term}"`, 'ese repositorio es público; saca la referencia interna')
    }
  }
}

// --- 11. Vocabulario de estados por tipo -------------------------------------
for (const d of withId) {
  const t = config.types[typeOf(d)]
  if (!t?.states || !d.fm.status) continue
  if (!t.states.includes(d.fm.status)) {
    add(11, 'error', `${d.fm.id}: estado \`${d.fm.status}\` no existe para \`${typeOf(d)}\``, `usa uno de: ${t.states.join(', ')}`)
  }
}

// --- 12. Integridad Megaplán ↔ Plan, en las dos direcciones -------------------
const megaPattern = config.types.mega?.idPattern ? new RegExp(config.types.mega.idPattern) : /^MEGA-\d{4}-\d{3}$/
for (const d of plans) {
  const candidate = /^(.+)-P\d+$/.exec(d.fm.id)?.[1]
  const parentFromId = candidate && megaPattern.test(candidate) ? candidate : null
  if (!d.fm.megaplan) {
    if (parentFromId) {
      add(12, 'error', `${d.fm.id}: sin \`megaplan\`, pero su id dice que es de ${parentFromId}`, `declara megaplan: ${parentFromId}`)
    } else if (config.legacy) {
      add(12, 'error', `${d.fm.id}: Plan sin megaplan`)
    }
    continue
  }
  if (!config.legacy && !parentFromId) {
    add(12, 'error', `${d.fm.id}: el Plan de megaplán debe usar <id-del-megaplán>-PN según el patrón configurado`)
  } else if (parentFromId && parentFromId !== d.fm.megaplan) {
    add(12, 'error', `${d.fm.id}: su id dice ${parentFromId} pero declara megaplan ${d.fm.megaplan}`)
  }
  const parent = byId.get(d.fm.megaplan)
  if (!parent) {
    add(12, 'error', `${d.fm.id}: su megaplan \`${d.fm.megaplan}\` no existe`)
  } else if (typeOf(parent) !== 'mega') {
    add(12, 'error', `${d.fm.id}: ${parent.fm.id} no es de tipo mega`)
  } else if (!plansOf(parent).includes(d.fm.id)) {
    add(12, 'error', `${d.fm.id}: ${parent.fm.id} no lo lista en \`plans\``, `añade ${d.fm.id} a plans de ${parent.fm.id}`)
  }
}
for (const d of megas) {
  for (const pid of plansOf(d)) {
    const p = byId.get(pid)
    if (!p) add(12, 'error', `${d.fm.id}: lista el plan \`${pid}\`, que no existe`)
    else if (typeOf(p) !== 'plan') add(12, 'error', `${d.fm.id}: ${pid} no es de tipo plan`)
    else if (p.fm.megaplan !== d.fm.id) add(12, 'error', `${d.fm.id} ↔ ${pid}: el plan no declara megaplan ${d.fm.id}`)
  }
}

// --- 13. Un plan cerrado con trabajo dentro ----------------------------------
for (const d of plans.filter((x) => x.fm.status === 'Cerrado')) {
  const open = (d.body.match(/^\s*-\s\[ \]/gm) ?? []).length
  if (open) {
    add(13, 'error', `${d.fm.id}: Cerrado con ${open} casilla(s) sin marcar`,
      'márcalas con [x] y su fecha, o pasa el plan a Pausado o Abandonado')
  }
}

// --- 14. Un megaplán cerrado con planes vivos --------------------------------
for (const d of megas.filter((x) => x.fm.status === 'Cerrado')) {
  for (const pid of plansOf(d)) {
    const p = byId.get(pid)
    if (p && !FINAL_STATES.has(p.fm.status)) add(14, 'error', `${d.fm.id}: Cerrado, pero ${pid} sigue en \`${p.fm.status}\``)
  }
}

// --- 15. IDs duplicados --------------------------------------------------------
// Dos personas creando el "siguiente" ADR a la vez producen el mismo número. Quien
// llega segundo renumera: nadie lo cita todavía.
{
  const seen = new Map()
  for (const d of withId) seen.set(d.fm.id, [...(seen.get(d.fm.id) ?? []), d.rel])
  for (const [id, rels] of seen) {
    if (rels.length > 1) {
      add(15, 'error', `id \`${id}\` duplicado: ${rels.join(', ')}`,
        'renumera el que llegó después (rem-new calcula el siguiente contra origin)')
    }
  }
}

// --- 16. Enlaces relativos rotos ----------------------------------------------
for (const path of walkText(ROOT, config.links.exclude, ['.md'])) {
  const text = readFileSync(path, 'utf8').replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '').replace(/<!--[\s\S]*?-->/g, '')
  const rel = toPosix(relative(ROOT, path))
  for (const m of text.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    const target = m[1]
    if (/^(https?:|mailto:|#|\/\/|data:)/i.test(target)) continue
    let clean = target.split('#')[0]
    try { clean = decodeURI(clean) } catch { /* se prueba tal cual */ }
    if (!clean) continue
    let destination = resolve(dirname(path), clean)
    if (SOURCE_ROOT) {
      const original = resolve(dirname(resolve(SOURCE_ROOT, rel)), clean)
      destination = isWithin(SOURCE_ROOT, original) ? resolve(ROOT, relative(SOURCE_ROOT, original)) : original
    }
    if (!existsSync(destination)) add(16, 'error', `${rel}: enlace roto a \`${target}\``)
  }
}

// --- 17. Planes activos con responsable ---------------------------------------
const owners = new Set(config.team.owners)
for (const d of [...plans, ...megas]) {
  if (typeOf(d) === 'plan' && ACTIVE_STATES.has(d.fm.status) && !d.fm.owner) {
    add(17, 'error', `${d.fm.id}: \`${d.fm.status}\` sin owner`,
      'todo Plan activo tiene un humano responsable (METHOD §3.1); tomarlo = poner owner y empujar')
  }
  if (d.fm.owner && owners.size && !owners.has(d.fm.owner)) {
    add(17, 'warn', `${d.fm.id}: owner \`${d.fm.owner}\` no está en team.owners`)
  }
}

// --- 18. WIP por responsable ----------------------------------------------------
{
  const byOwner = new Map()
  for (const d of plans.filter((x) => ACTIVE_STATES.has(x.fm.status) && x.fm.owner)) {
    byOwner.set(d.fm.owner, [...(byOwner.get(d.fm.owner) ?? []), d.fm.id])
  }
  for (const [owner, ids] of byOwner) {
    if (ids.length > config.wip.maxActiveOrVerifyingPerOwner) {
      add(18, 'error', `WIP de ${owner}: ${ids.length} Plans activos/verificando (${ids.join(', ')}), límite ${config.wip.maxActiveOrVerifyingPerOwner}`,
        'pasa uno a Pendiente o Pausado con su motivo; cinco agentes no son cinco revisores')
    }
  }
}

// --- 19. Zonas de cambio que se pisan -------------------------------------------
// Dos planes activos de dos personas que declaran tocar la misma ruta van a chocar en
// el merge o, peor, en el comportamiento. El doctor no lo prohíbe: lo hace visible.
{
  const active = plans.filter((x) => ACTIVE_STATES.has(x.fm.status))
  const split = (t) => {
    const s = t.replace(/\/+$/, '').toLowerCase()
    const i = s.indexOf(':')
    return i < 0 ? [s, ''] : [s.slice(0, i), s.slice(i + 1)]
  }
  const overlaps = (a, b) => {
    const [ra, pa] = split(a)
    const [rb, pb] = split(b)
    if (ra !== rb) return false
    return !pa || !pb || pa === pb || pa.startsWith(`${pb}/`) || pb.startsWith(`${pa}/`)
  }
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const [a, b] = [active[i], active[j]]
      if (!a.fm.owner || a.fm.owner === b.fm.owner) continue
      const hits = asList(a.fm.touches).filter((ta) => asList(b.fm.touches).some((tb) => overlaps(ta, tb)))
      if (hits.length) {
        add(19, 'warn', `${a.fm.id} (${a.fm.owner}) y ${b.fm.id} (${b.fm.owner}) tocan ${hits.join(', ')}`,
          'acuerden el límite en el "Contrato de entrega" de ambos planes, o secuéncienlos')
      }
    }
  }
}

// --- 20. Dependencias pendientes en un plan que ya se entrega -------------------
for (const d of plans) {
  if (!['Verificando', 'Desplegado', 'Observando', 'Cerrado'].includes(d.fm.status)) continue
  for (const dep of asList(d.fm.depends_on)) {
    const p = byId.get(dep)
    if (p && !DEPENDENCY_DONE.has(p.fm.status)) {
      add(20, p.fm.status === 'Abandonado' ? 'error' : 'warn', `${d.fm.id} está \`${d.fm.status}\` pero depende de ${dep} (\`${p.fm.status}\`)`,
        'una dependencia abandonada no entrega su contrato; sustituye o quita la dependencia con una decisión, o corrige el estado')
    }
  }
}

// --- 21. Secretos en el hub -----------------------------------------------------
{
  const patterns = [
    ['llave privada', /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/],
    ['llave de Stripe', /\b(?:sk|rk)_live_[0-9A-Za-z]{10,}/],
    ['secreto de webhook', /\bwhsec_[0-9A-Za-z]{20,}/],
    ['SID de cuenta Twilio', /\bAC[0-9a-f]{32}\b/],
    ['llave de API Twilio', /\bSK[0-9a-f]{32}\b/],
    ['llave de AWS', /\bAKIA[0-9A-Z]{16}\b/],
    ['token de GitHub', /\b(?:ghp|gho|ghs|ghu)_[0-9A-Za-z]{36}\b|\bgithub_pat_[0-9A-Za-z_]{40,}/],
    ['token de Slack', /\bxox[abprs]-[0-9A-Za-z-]{10,}/],
    ['JWT', /\beyJ[0-9A-Za-z_-]{10,}\.eyJ[0-9A-Za-z_-]{10,}\.[0-9A-Za-z_-]{10,}/],
    ['contraseña literal', /\b(?:password|passwd|pwd|contrase(?:ñ|n)a)\b\s*[:=]\s*[`'"]?(?![<$({*])[^\s`'"|]{6,}/i],
    ...config.secrets.extraPatterns.map((p) => [p.label ?? 'patrón del config', new RegExp(p.regex, p.flags ?? '')]),
  ]
  // Una contraseña en una tabla no tiene "password:" delante: está en la columna cuyo
  // encabezado lo dice. Así se publicaron las credenciales del primer adoptante de REM 1.1, y
  // ningún patrón de línea las habría visto.
  const PASSWORD_HEADER = /^(contrase(ñ|n)as?|passwords?|passwd)$/i
  const isPlaceholder = (v) =>
    !v || v.length < 6 || /\s/.test(v) || /^[<({[*…—–-]/.test(v) || /^(n\/?a|null|none|vac[ií]o|x+)$/i.test(v) ||
    /^[A-Z][A-Z0-9_]+$/.test(v) || v.includes('/')
  const cells = (line) => line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim().replace(/^`+|`+$/g, ''))
  for (const path of walkText(ROOT, config.secrets.exclude)) {
    const rel = toPosix(relative(ROOT, path))
    // El propio doctor y sus pruebas contienen los patrones como texto.
    if (/(^|\/)scripts\/rem-doctor\.mjs$|(^|\/)tests\//.test(rel)) continue
    const lines = readFileSync(path, 'utf8').split(/\r?\n/)
    let passwordCols = null
    lines.forEach((line, i) => {
      if (line.includes('rem-secrets: ignore')) return
      const hit = patterns.find(([, re]) => re.test(line))
      if (hit) {
        add(21, 'error', `${rel}:${i + 1}: parece ${hit[0]}`,
          'los secretos viven solo en el entorno; si es un falso positivo, añade `rem-secrets: ignore` en la línea')
        return
      }
      if (!line.trim().startsWith('|')) {
        passwordCols = null
        return
      }
      if (/^\|?[\s:|-]+\|?$/.test(line.trim()) && line.includes('-')) return
      const row = cells(line)
      const next = lines[i + 1]?.trim() ?? ''
      if (/^\|?[\s:|-]+\|?$/.test(next) && next.includes('-')) {
        const cols = row.map((c, j) => (PASSWORD_HEADER.test(c) ? j : -1)).filter((j) => j >= 0)
        passwordCols = cols.length ? cols : null
        return
      }
      if (passwordCols && passwordCols.some((j) => !isPlaceholder(row[j]))) {
        add(21, 'error', `${rel}:${i + 1}: parece una contraseña en una columna de tabla`,
          'los secretos viven solo en el entorno; si es un falso positivo, añade `rem-secrets: ignore` en la línea')
      }
    })
  }
}

// --- 22. Nivel de verificación de los planes -------------------------------------
for (const d of plans) {
  const v = d.fm.verification_level
  if (v && !/^V[0-3]$/.test(v)) add(22, 'error', `${d.fm.id}: verification_level \`${v}\` no es V0–V3`)
  if (!v && ACTIVE_STATES.has(d.fm.status)) add(22, 'warn', `${d.fm.id}: activo sin verification_level`, 'docs/VERIFICATION.md')
}

// --- 23. Arquitectura viva que nadie verifica -------------------------------------
for (const d of withId.filter((x) => typeOf(x) === 'arch' && x.fm.status !== 'Obsoleto')) {
  const age = daysSince(d.fm.last_verified)
  if (age === null) {
    add(23, 'warn', `${d.fm.id}: sin \`last_verified\``, 'un documento vivo dice cuándo se contrastó con el código')
  } else if (age > config.limits.archStaleDays) {
    add(23, 'warn', `${d.fm.id}: verificado hace ${age} días`, 'contrástalo con el código y actualiza last_verified y verified_against')
  }
}

// --- 24. Fechas de flujo (métricas mínimas del kernel) -----------------------------
for (const d of plans) {
  for (const issue of planDateIssues(d.fm)) add(24, issue.level, `${d.fm.id}: ${issue.message}`, 'METHOD §7.3 y §14: registra fechas reales y el motivo de pausa')
}

// --- 25. La tabla de planes del maestro es generada --------------------------------
// Escrita a mano, la tabla y el `status` de cada plan son el mismo dato dos veces y
// derivan. Si todavía está a mano, al menos se compara fila a fila con cada plan.
if (!config.legacy) {
  for (const d of megas) {
    if (d.text.includes(PLANS_START)) continue
    add(25, 'warn', `${d.fm.id}: la tabla de planes no está entre marcadores REM:PLANES`,
      'ponla entre los marcadores y deja que rem-index la genere desde el front-matter')
    const states = new Set(config.types.plan?.states ?? [])
    for (const pid of plansOf(d)) {
      const p = byId.get(pid)
      const short = pid.slice(d.fm.id.length + 1)
      const row = d.body.split(/\r?\n/).find((l) => l.startsWith('|') && new RegExp(`^\\|[^|]*\\b${short}\\b`).test(l))
      const said = row?.split('|').map((c) => c.replace(/[*`]/g, '').trim()).find((c) => states.has(c))
      if (p && said && said !== p.fm.status) {
        add(25, 'warn', `${d.fm.id}: la tabla dice ${short} \`${said}\` y el plan dice \`${p.fm.status}\``)
      }
    }
  }
}

// --- salida --------------------------------------------------------------------------
const errors = findings.filter((f) => f.level === 'error')
const warns = findings.filter((f) => f.level === 'warn')

if (!QUIET) {
  for (const f of findings) {
    console.log(`${f.level === 'error' ? '✗' : '⚠'} [regla ${f.rule}] ${f.msg}`)
    if (f.fix) console.log(`     → ${f.fix}`)
  }
  if (findings.length) console.log('')
}

console.log(
  findings.length
    ? `REM doctor: ${errors.length} error(es), ${warns.length} aviso(s) en ${docs.length} documentos`
    : `REM doctor: ✓ sano — ${docs.length} documentos sin hallazgos`,
)

process.exit(errors.length || (STRICT && warns.length) ? 1 : 0)
