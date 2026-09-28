#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 RelataLabs

/**
 * REM new 1.1 — crea un documento desde su plantilla con el ID correcto.
 *
 * El problema que resuelve es de equipo: con numeración correlativa (ADR-0007,
 * INC-2026-004…) dos personas que crean "el siguiente" a la vez eligen el mismo número.
 * rem-new calcula el siguiente contra lo publicado (`origin/<rama del hub>`) además de lo
 * local, y el doctor (regla 15) atrapa el duplicado si aun así se cruzan. Quien llega
 * segundo renumera: nadie lo cita todavía.
 *
 * Los tipos con ID por fecha (DEC, AUD) no reservan nada: fecha + slug no chocan.
 *
 * Uso:
 *   node scripts/rem-new.mjs <tipo> <slug> [--title "…"] [--date YYYY-MM-DD] [--no-fetch]
 *   node scripts/rem-new.mjs plan <slug> --mega MEGA-2026-001   (plan de un megaplán; lo
 *        añade a `plans:` del maestro — es un gesto del coordinador, ver docs/TEAM.md)
 *   node scripts/rem-new.mjs plan <slug>                        (Plan suelto PLAN-YYYY-NNN)
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import {
  arg,
  escapeRegex,
  git,
  loadConfig,
  loadDocs,
  parseFrontMatter,
  resolveRoot,
  slugify,
  today,
  toPosix,
} from './lib/rem.mjs'

const ROOT = resolveRoot(import.meta.url)
const VALUED = new Set(['--title', '--date', '--mega', '--root', '--config'])
const positional = []
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i]
  if (VALUED.has(a)) i++
  else if (!a.startsWith('--')) positional.push(a)
}
const [type, rawSlug] = positional
const date = arg('--date') ?? today()
const megaId = arg('--mega')

const { config, error } = loadConfig(ROOT)
if (!config || config.legacy) {
  console.error(`✗ ${error ?? 'rem-new necesita un config REM 1.1 con `types`'}`)
  process.exit(1)
}
const t = config.types[type]
if (!t || !rawSlug) {
  console.error(`uso: node scripts/rem-new.mjs <${Object.keys(config.types).join('|')}> <slug> [--title "…"] [--mega MEGA-…]`)
  process.exit(1)
}
const slug = slugify(rawSlug)
const title = arg('--title') ?? rawSlug.replace(/[-_]+/g, ' ')

// IDs ya usados: los locales y, salvo --no-fetch, los publicados en origin.
const docs = loadDocs(ROOT, config)
const used = new Set(docs.map((d) => d.fm?.id).filter(Boolean))
const usedStems = new Set(docs.map((d) => d.file.replace(/\.md$/, '')))
if (!process.argv.includes('--no-fetch') && git(ROOT, ['rev-parse', '--git-dir']) !== null) {
  git(ROOT, ['fetch', '--quiet', 'origin', config.hub.branch])
  const listed = git(ROOT, ['ls-tree', '--name-only', `origin/${config.hub.branch}`, `${t.dir}/`])
  for (const f of (listed ?? '').split(/\r?\n/).filter(Boolean)) usedStems.add(f.split('/').pop().replace(/\.md$/, ''))
}

function nextFrom(pattern) {
  const year = date.slice(0, 4)
  const width = (/\{(N+)\}/.exec(pattern)?.[1] ?? 'NNN').length
  const re = new RegExp(
    '^' + escapeRegex(pattern).replace('\\{YYYY\\}', year).replace(/\\\{N+\\\}/, `(\\d{${width}})`) + '(?:$|-)',
  )
  let max = 0
  for (const s of [...used, ...usedStems]) {
    const m = re.exec(s)
    if (m) max = Math.max(max, Number(m[1]))
  }
  return pattern.replace('{YYYY}', year).replace(/\{N+\}/, String(max + 1).padStart(width, '0'))
}

let id
let mega = null
if (type === 'plan' && megaId) {
  mega = docs.find((d) => d.fm?.id === megaId && d.fm.type === 'mega')
  if (!mega) {
    console.error(`✗ no existe el megaplán ${megaId}`)
    process.exit(1)
  }
  id = nextFrom(`${megaId}-P{N}`)
} else if (t.sequence) {
  id = nextFrom(t.sequence)
} else {
  const prefix = /^\^?\(?([A-Z]+)-/.exec(t.idPattern ?? '')?.[1]
  id = prefix === 'ARCH' ? `ARCH-${slug}` : `${prefix}-${date}-${slug}`
}

const fileStem = t.fileNaming === 'unprefixed-id' ? id.replace(/^[A-Z]+-/, '') : `${id}-${slug}`
const rel = `${t.dir}/${fileStem}.md`
const path = join(ROOT, rel)
if (existsSync(path)) {
  console.error(`✗ ya existe ${rel}`)
  process.exit(1)
}

const templatePath = resolve(ROOT, t.template)
if (!existsSync(templatePath)) {
  console.error(`✗ falta la plantilla ${t.template}`)
  process.exit(1)
}
let text = readFileSync(templatePath, 'utf8')
const placeholderId = parseFrontMatter(text).data?.id
if (placeholderId) text = text.split(placeholderId).join(id)

// Solo se reescriben líneas del front-matter; el cuerpo guía queda como está.
const fmEnd = text.indexOf('\n---', 4)
let fm = text.slice(0, fmEnd)
const body = text.slice(fmEnd)
const setField = (key, value) => {
  const re = new RegExp(`^${key}:.*$`, 'm')
  fm = re.test(fm) ? fm.replace(re, `${key}: ${value}`) : `${fm}\n${key}: ${value}`
}
setField('title', JSON.stringify(title))
setField('date', date)
if (type === 'plan') setField('megaplan', mega ? mega.fm.id : 'null')
writeFileSync(path, fm + body, 'utf8')

// Un plan nuevo de un megaplán entra en su lista `plans:` (regla 12, dos direcciones).
if (mega) {
  const mtext = readFileSync(mega.path, 'utf8')
  const key = /^plans:/m.test(mtext) ? 'plans' : 'planes'
  const current = mega.fm[key] ?? []
  const next = mtext.replace(new RegExp(`^${key}:.*$`, 'm'), `${key}: [${[...current, id].join(', ')}]`)
  writeFileSync(mega.path, next, 'utf8')
}

console.log(`✓ ${toPosix(rel)} (${id})`)
if (mega) console.log(`  añadido a plans de ${mega.fm.id}; anota en su bitácora por qué nace`)
if (t.sequence || mega) console.log('  empuja pronto: el número queda reservado cuando está en origin')
