// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 RelataLabs

/**
 * rem.mjs — lectura compartida de una adopción REM.
 *
 * Todo el tooling (doctor, índice, timeline, new, status, flow) lee los documentos por
 * aquí, así que hay UNA sola interpretación del front-matter y del config. Sin
 * dependencias externas: se copia a un proyecto y funciona con Node ≥ 20.
 *
 * El config describe los tipos (carpeta, patrón de ID, estados, plantilla), los repos
 * de código que el hub cubre y las políticas. Un config REM 1.0 (con `workRoots` y
 * `planStates`) se sigue aceptando en modo legado: se recorre cada raíz y el tipo sale
 * del front-matter, sin comprobar carpetas.
 */

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

export const INDEX_START = '<!-- REM:INDEX:START — generado por scripts/rem-index.mjs, no editar a mano -->'
export const INDEX_END = '<!-- REM:INDEX:END -->'
export const PLANS_START = '<!-- REM:PLANES:START — generado por scripts/rem-index.mjs, no editar a mano -->'
export const PLANS_END = '<!-- REM:PLANES:END -->'

/** Estados en los que un Plan consume atención humana (METHOD §7.1). */
export const ACTIVE_STATES = new Set(['Activo', 'Verificando'])
/** Estados que cierran un Plan o un Megaplán. */
export const FINAL_STATES = new Set(['Cerrado', 'Abandonado'])
/** Estados en los que una dependencia ya no bloquea a quien depende de ella. */
export const DEPENDENCY_DONE = new Set(['Desplegado', 'Observando', 'Cerrado'])

// --- argumentos -------------------------------------------------------------

export function arg(name, argv = process.argv) {
  const i = argv.indexOf(name)
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : null
}

export function flag(name, argv = process.argv) {
  return argv.includes(name)
}

/**
 * Raíz de la adopción: `--root`, o la carpeta padre de `scripts/`. Así el mismo script
 * sirve copiado en un hub (raíz = el hub) y dentro del repo de REM contra un ejemplo.
 */
export function resolveRoot(importMetaUrl, argv = process.argv) {
  const explicit = arg('--root', argv)
  if (explicit) return resolve(explicit)
  const here = dirname(fileURLToPath(importMetaUrl))
  return resolve(here, basename(here) === 'lib' ? '../..' : '..')
}

// --- config -----------------------------------------------------------------

export function loadConfig(root, argv = process.argv) {
  const explicit = arg('--config', argv)
  const candidates = explicit
    ? [resolve(explicit)]
    : [join(root, 'rem.config.json'), join(root, 'rem.config.example.json')]
  const path = candidates.find((p) => existsSync(p))
  if (!path) {
    return { config: null, path: null, error: `no hay rem.config.json en ${toPosix(root)}` }
  }
  let raw
  try {
    raw = JSON.parse(readFileSync(path, 'utf8'))
  } catch (e) {
    return { config: null, path, error: `${toPosix(path)} no es JSON válido: ${e.message}` }
  }
  try {
    const config = normalizeConfig(raw)
    const sourceRoot = arg('--source-root', argv)
    if (sourceRoot) {
      // Un snapshot conserva las rutas semánticas del config preparado para commit.
      // Las raíces de documentos deben pertenecer a ese commit, no a otro checkout.
      const source = resolve(sourceRoot)
      const internal = (value, label) => {
        const target = resolve(source, value)
        if (!isWithin(source, target)) throw new Error(`${label} está fuera del hub; no se puede validar desde el índice`)
        return relative(source, target) || '.'
      }
      for (const t of Object.values(config.types)) {
        if (t.dir) t.dir = internal(t.dir, 'types.dir')
        if (t.template) t.template = isWithin(source, resolve(source, t.template))
          ? internal(t.template, 'template') : resolve(source, t.template)
      }
      if (config.workRoots) config.workRoots = config.workRoots.map((p) => internal(p, 'workRoots'))
      config.generated.readme = internal(config.generated.readme, 'generated.readme')
      config.required = config.required.map((p) => internal(p, 'required'))
      for (const repo of Object.values(config.repos)) {
        const target = resolve(source, repo.path)
        repo.path = isWithin(source, target) ? resolve(root, relative(source, target)) : target
      }
      if (config.ci.workflow) config.ci.workflow = isWithin(source, resolve(source, config.ci.workflow))
        ? internal(config.ci.workflow, 'ci.workflow') : resolve(source, config.ci.workflow)
    }
    return { config, path, error: null }
  } catch (error) {
    return { config: null, path, error: error.message }
  }
}

/** Completa valores por defecto y marca el modo legado (config REM 1.0). */
export function normalizeConfig(raw) {
  const c = structuredClone(raw)
  c.legacy = !c.types
  c.types ??= {}
  c.transientStates ??= ['Draft', 'Proposed', 'Investigating', 'Open', 'In Review']
  c.repos ??= {}
  c.hub ??= {}
  c.hub.branch ??= 'main'
  c.changelog ??= {}
  c.changelog.policy ??= 'observable'
  c.timeline ??= {}
  c.timeline.file ??= 'TIMELINE.md'
  c.timeline.source ??= 'auto'
  c.timeline.gitTypes ??= ['feat', 'fix', 'perf', 'refactor', 'revert']
  c.generated ??= {}
  c.generated.index ??= 'local'
  c.generated.timeline ??= 'local'
  c.generated.readme ??= 'README.md'
  c.wip ??= {}
  c.wip.maxActiveOrVerifyingPerOwner ??= 1
  c.team ??= {}
  c.team.owners ??= []
  c.limits ??= {}
  c.limits.decisionNoteContentLines ??= 40
  c.limits.staleDays ??= 7
  c.limits.deployDays ??= 14
  c.limits.archStaleDays ??= 90
  c.limits.changelogDryCommits ??= 10
  c.links ??= {}
  c.links.exclude ??= ['templates/', 'node_modules/']
  c.secrets ??= {}
  c.secrets.extraPatterns ??= []
  c.secrets.exclude ??= ['node_modules/']
  c.hooksDir ??= '.githooks'
  c.ci ??= {}
  c.required ??= []
  c.publicLeakTerms ??= []
  if (c.legacy) {
    c.workRoots ??= []
    const states = c.planStates ?? ['Pendiente', 'Activo', 'Verificando', 'Desplegado', 'Observando', 'Pausado', 'Cerrado', 'Abandonado']
    c.types = {
      plan: { states, legacy: true },
      mega: { states, legacy: true },
    }
  }
  return c
}

/** Tipos en el orden del config (es el orden del índice). */
export function typeEntries(config) {
  return Object.entries(config.types).filter(([, t]) => !t.legacy)
}

// --- front-matter -----------------------------------------------------------

/**
 * Parser de front-matter suficiente para el esquema REM, sin dependencias.
 *
 * Reglas, y por qué:
 * - El bloque `---` va en el PRIMER byte. Un comentario antes y no hay front-matter.
 *   (Un BOM se tolera y se informa: lo meten editores de Windows sin avisar.)
 * - Las listas son INLINE: `[a, b]`. Una lista en bloque con guiones NO se ignora en
 *   silencio: se devuelve en `blockLists` para que el doctor la marque como error.
 *   En REM 1.0 se ignoraba y un Megaplán con `plans:` en bloque quedaba sin planes,
 *   así que podía cerrarse "vacío" sin que nada avisara.
 * - `null`, `~` y vacío valen null.
 */
export function parseFrontMatter(input) {
  let text = input
  const bom = text.charCodeAt(0) === 0xfeff
  if (bom) text = text.slice(1)
  const m = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(\r?\n|$)/.exec(text)
  if (!m) return { data: null, body: text, blockLists: [], bom }
  const data = {}
  const blockLists = []
  const lines = m[1].split(/\r?\n/)
  let lastKey = null
  for (const raw of lines) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    if (/^-\s*/.test(line) && (raw.startsWith('-') || /^\s+-/.test(raw))) {
      if (lastKey && !blockLists.includes(lastKey)) blockLists.push(lastKey)
      continue
    }
    const i = line.indexOf(':')
    if (i < 0) continue
    const key = line.slice(0, i).trim()
    const value = line.slice(i + 1).trim()
    lastKey = key
    data[key] = parseScalar(value)
  }
  return { data, body: text.slice(m[0].length), blockLists, bom }
}

export function parseScalar(value) {
  if (value === '' || value === 'null' || value === '~') return null
  if (value.startsWith('[')) {
    const inner = value.replace(/^\[/, '').replace(/\]\s*$/, '').trim()
    if (!inner) return []
    return inner
      .split(',')
      .map((v) => v.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean)
  }
  return value.replace(/^["']|["']$/g, '')
}

export function asList(v) {
  if (Array.isArray(v)) return v
  if (v === null || v === undefined || v === '') return []
  return [v]
}

// --- documentos -------------------------------------------------------------

/**
 * Carga los documentos de la adopción.
 *
 * Modo tipado (REM 1.1): cada tipo tiene su carpeta y se lee SIN recursión. La
 * subcarpeta de planes está registrada aparte a propósito: si se recorriera
 * recursivamente la de megaplanes, un plan se cargaría dos veces con dos tipos
 * esperados distintos.
 *
 * `README.md` nunca es un documento: es la guía de la carpeta (REM 1.0 lo cargaba y
 * fallaba por "falta front-matter" en cuanto alguien añadía la guía de megaplanes).
 */
export function loadDocs(root, config) {
  const docs = []
  if (config.legacy) {
    for (const r of config.workRoots) {
      for (const path of walk(resolve(root, r))) docs.push(readDoc(root, path, null))
    }
    return docs
  }
  for (const [type, t] of typeEntries(config)) {
    const dir = join(root, t.dir)
    if (!existsSync(dir)) continue
    const files = readdirSync(dir)
      .filter((f) => f.endsWith('.md') && f !== 'README.md' && statSync(join(dir, f)).isFile())
      .sort()
    for (const f of files) docs.push(readDoc(root, join(dir, f), type))
  }
  return docs
}

function readDoc(root, path, expectedType) {
  const text = readFileSync(path, 'utf8')
  const { data, body, blockLists, bom } = parseFrontMatter(text)
  return {
    path,
    rel: toPosix(relative(root, path)),
    file: basename(path),
    dir: toPosix(relative(root, dirname(path))),
    expectedType,
    text,
    body,
    fm: data,
    blockLists,
    bom,
    lines: text.split(/\r?\n/).length,
  }
}

export function walk(dir, { exclude = [] } = {}, base = dir) {
  if (!existsSync(dir)) return []
  const out = []
  for (const name of readdirSync(dir).sort()) {
    if (name === '.git' || name === 'node_modules') continue
    const p = join(dir, name)
    const rel = toPosix(relative(base, p))
    if (exclude.some((e) => rel === e.replace(/\/$/, '') || rel.startsWith(e))) continue
    const st = statSync(p)
    if (st.isDirectory()) out.push(...walk(p, { exclude }, base))
    else if (st.isFile() && name.endsWith('.md') && name !== 'README.md') out.push(p)
  }
  return out
}

/** Todos los ficheros de texto versionables del hub (para enlaces y secretos). */
export function walkText(root, exclude = [], exts = ['.md', '.json', '.yml', '.yaml', '.mjs', '.js', '.sh', '.txt', '.toml']) {
  const out = []
  const visit = (dir) => {
    for (const name of readdirSync(dir).sort()) {
      if (name === '.git' || name === 'node_modules') continue
      const p = join(dir, name)
      const rel = toPosix(relative(root, p))
      if (exclude.some((e) => rel === e.replace(/\/$/, '') || rel.startsWith(e))) continue
      const st = statSync(p)
      if (st.isDirectory()) visit(p)
      else if (st.isFile() && (exts.some((x) => name.endsWith(x)) || ['commit-msg', 'pre-commit'].includes(name))) out.push(p)
    }
  }
  if (existsSync(root)) visit(root)
  return out
}

export function docTitle(d) {
  return d.fm?.title ?? (/^#\s+(.+)$/m.exec(d.body ?? '')?.[1] ?? d.file.replace(/\.md$/, '')).trim()
}

// --- git --------------------------------------------------------------------

export function git(dir, args) {
  if (!dir || !existsSync(dir)) return null
  try {
    return execFileSync('git', ['-C', dir, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 64 * 1024 * 1024,
    }).trim()
  } catch {
    return null
  }
}

/** Carpeta de un repo del config; `.` o el nombre del hub resuelven al propio hub. */
export function repoDir(root, config, name) {
  if (name === '.' || (config.hub?.name && name === config.hub.name)) return root
  const r = config.repos[name]
  if (!r) return null
  return resolve(root, r.path)
}

export function repoBranch(config, name) {
  if (name === '.' || (config.hub?.name && name === config.hub.name)) return config.hub.branch
  return config.repos[name]?.branch ?? 'main'
}

/**
 * La evidencia publicada pertenece a la rama remota, no al checkout que casualmente
 * esté en la rama local. Sin remote, se usa la rama local.
 */
export function branchRef(dir, branch) {
  return git(dir, ['show-ref', '--verify', `refs/remotes/origin/${branch}`]) === null ? branch : `origin/${branch}`
}

// --- fechas, rutas, IDs -----------------------------------------------------

export function today() {
  return new Date().toISOString().slice(0, 10)
}

/** Fecha de calendario real, sin la normalización silenciosa de Date (30 de febrero). */
export function parseDate(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
  const d = new Date(`${date}T00:00:00Z`)
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== date) return null
  return d
}

export function daysSince(date, now = new Date()) {
  const d = parseDate(date)
  if (!d || !(now instanceof Date) || Number.isNaN(now.getTime())) return null
  return Math.floor((now - d) / 86_400_000)
}

export function toPosix(p) {
  return p.split(sep).join('/')
}

/** Inclusión estructural, no un startsWith que confunda /hub con /hub-otro. */
export function isWithin(root, path) {
  const rel = relative(resolve(root), resolve(path))
  return rel === '' || (!/^(?:[A-Za-z]:|[\\/])/.test(rel) && rel !== '..' && !rel.startsWith(`..${sep}`))
}

export function eol(s) {
  return s.split('\r\n').join('\n')
}

export function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Nombre de fichero que corresponde a un ID según `fileNaming` del tipo. */
export function fileMatchesId(file, id, naming) {
  const stem = file.replace(/\.md$/, '')
  if (naming === 'unprefixed-id') {
    const rest = id.replace(/^[A-Z]+-/, '')
    return stem === rest
  }
  return stem === id || stem.startsWith(`${id}-`)
}

/**
 * Siguiente ID de una secuencia (`ADR-{NNNN}`, `INC-{YYYY}-{NNN}`…) a partir de los
 * IDs ya usados. La secuencia es por año cuando el patrón lleva `{YYYY}`.
 */
export function nextSequenceId(pattern, usedIds, date = today()) {
  const year = date.slice(0, 4)
  const width = (/\{(N+)\}/.exec(pattern)?.[1] ?? 'NNN').length
  const re = new RegExp(
    '^' + escapeRegex(pattern).replace('\\{YYYY\\}', year).replace(/\\\{N+\\\}/, `(\\d{${width}})`) + '$',
  )
  let max = 0
  for (const id of usedIds) {
    const m = re.exec(id)
    if (m) max = Math.max(max, Number(m[1]))
  }
  return pattern.replace('{YYYY}', year).replace(/\{N+\}/, String(max + 1).padStart(width, '0'))
}

export function slugify(s) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

/** Enlace relativo POSIX desde la carpeta de `fromRel` hasta `toRel`. */
export function relLink(fromRel, toRel) {
  const from = dirname(fromRel) === '.' ? [] : dirname(fromRel).split('/')
  const to = toRel.split('/')
  let i = 0
  while (i < from.length && i < to.length - 1 && from[i] === to[i]) i++
  return [...from.slice(i).map(() => '..'), ...to.slice(i)].join('/') || '.'
}

export function readText(path) {
  return existsSync(path) ? readFileSync(path, 'utf8') : null
}
