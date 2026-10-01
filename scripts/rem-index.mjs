#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 RelataLabs

/**
 * REM index 1.1 — regenera lo que antes se mantenía a mano, desde el front-matter.
 *
 * Dos vistas derivadas:
 *   1. el índice del README, entre los marcadores REM:INDEX;
 *   2. la tabla de planes de cada Megaplán, entre los marcadores REM:PLANES.
 *
 * Mantenidas a mano, las dos se desincronizan: en el hub de origen de REM un incidente
 * pasó 25 días anunciado como abierto con la corrección desplegada, y la tabla de un
 * megaplán decía "Pendiente" de un plan que ya estaba `Activo`. Con una sola fuente
 * (el front-matter de cada documento) no puede volver a pasar.
 *
 * En equipo, estas vistas tienen UN solo escritor (config `generated.index`):
 *   - `ci`: solo CI las regenera en la rama principal; nadie las commitea a mano, así
 *     que no hay conflictos cuando cinco personas empujan a la vez;
 *   - `local`: el autor regenera y prepara las vistas; pre-commit comprueba el índice
 *     sin modificarlo (equipos de una persona).
 *
 * Uso:  node scripts/rem-index.mjs            regenera
 *       node scripts/rem-index.mjs --check    sale 1 si algo está desactualizado
 *       node scripts/rem-index.mjs --list     imprime los ficheros que cambiaría, sin escribir
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  INDEX_END,
  INDEX_START,
  PLANS_END,
  PLANS_START,
  asList,
  docTitle,
  eol,
  escapeRegex,
  flag,
  loadConfig,
  loadDocs,
  relLink,
  resolveRoot,
  typeEntries,
} from './lib/rem.mjs'

const ROOT = resolveRoot(import.meta.url)
const CHECK = flag('--check')
const LIST = flag('--list')

const { config, error } = loadConfig(ROOT)
if (!config) {
  console.error(`✗ ${error}`)
  process.exit(1)
}
if (config.legacy) {
  console.error('✗ rem-index necesita un config REM 1.1 con `types`')
  process.exit(1)
}

const docs = loadDocs(ROOT, config).filter((d) => d.fm?.id)
const byId = new Map(docs.map((d) => [d.fm.id, d]))
const cell = (s) => String(s ?? '').replace(/\|/g, '\\|')

// --- índice del README ---------------------------------------------------------

function renderIndex() {
  const evolutions = new Map()
  for (const d of docs.filter((x) => x.fm.type === 'dec' && x.fm.extends)) {
    evolutions.set(d.fm.extends, [...(evolutions.get(d.fm.extends) ?? []), d])
  }
  const readme = config.generated.readme
  const lines = [INDEX_START, '']
  for (const [type, t] of typeEntries(config)) {
    const group = docs.filter((d) => d.fm.type === type).sort((a, b) => (a.fm.id < b.fm.id ? -1 : 1))
    if (!group.length) continue
    lines.push(`### ${t.label ?? type}`, '')
    for (const d of group) {
      const notes = []
      if (d.fm.owner) notes.push(`responsable ${d.fm.owner}`)
      if (d.fm.megaplan) notes.push(`de ${d.fm.megaplan}`)
      if (d.fm.superseded_by) notes.push(`superado por ${d.fm.superseded_by}`)
      if (d.fm.deployed ?? d.fm.deploy) notes.push(`desplegado ${d.fm.deployed ?? d.fm.deploy}`)
      if (d.fm.type === 'incident' && d.fm.severity) notes.push(String(d.fm.severity).split('/')[0].replace('CVSS:', 'CVSS '))
      if (d.fm.type === 'arch' && d.fm.last_verified) notes.push(`verificado ${d.fm.last_verified}`)
      const evo = evolutions.get(d.fm.id)
      if (evo?.length) {
        const last = evo.map((e) => e.fm.date).sort().at(-1)
        notes.push(`${evo.length} ${evo.length === 1 ? 'evolución' : 'evoluciones'}, última ${last}`)
      }
      const tail = notes.length ? ` · ${notes.join(' · ')}` : ''
      lines.push(`- [${d.fm.id} — ${docTitle(d)}](${relLink(readme, d.rel)}) — \`${d.fm.status}\`${tail} (${d.fm.date})`)
    }
    lines.push('')
  }
  if (existsSync(join(ROOT, config.timeline.file))) {
    lines.push('### Registro continuo', '')
    lines.push(`- [${config.timeline.file}](${relLink(readme, config.timeline.file)}) — **generado** por \`scripts/rem-timeline.mjs\`.`, '')
  }
  lines.push(`_Índice generado desde el front-matter de ${docs.length} documentos._`, INDEX_END)
  return lines.join('\n')
}

// --- tabla de planes de cada megaplán ------------------------------------------------

function renderPlans(mega) {
  const short = (id) => (id.startsWith(`${mega.fm.id}-`) ? id.slice(mega.fm.id.length + 1) : id)
  const rows = [
    PLANS_START,
    '',
    '| Plan | Objetivo específico | Estado | Responsable | Depende de |',
    '|---|---|---|---|---|',
  ]
  for (const pid of asList(mega.fm.plans ?? mega.fm.planes)) {
    const p = byId.get(pid)
    if (!p) {
      rows.push(`| ${short(pid)} | ⚠ no existe | — | — | — |`)
      continue
    }
    const deps = asList(p.fm.depends_on).map((dep) => {
      const target = byId.get(dep)
      const name = short(dep)
      return target ? `[${name}](${relLink(mega.rel, target.rel)})` : name
    })
    rows.push(
      `| [**${short(pid)}**](${relLink(mega.rel, p.rel)}) | ${cell(docTitle(p))} | ${cell(p.fm.status)} | ${cell(p.fm.owner ?? '—')} | ${deps.join(', ') || '—'} |`,
    )
  }
  rows.push('', PLANS_END)
  return rows.join('\n')
}

// --- escritura -------------------------------------------------------------------------

function replaceBetween(text, start, end, block) {
  const re = new RegExp(`${escapeRegex(start)}[\\s\\S]*?${escapeRegex(end)}`)
  return re.test(text) ? text.replace(re, () => block) : null
}

const changes = []

function update(rel, compute, { required }) {
  const path = join(ROOT, rel)
  if (!existsSync(path)) {
    if (required) {
      console.error(`✗ falta ${rel}`)
      process.exitCode = 1
    }
    return
  }
  const original = readFileSync(path, 'utf8')
  const crlf = original.includes('\r\n')
  const text = eol(original)
  const next = compute(text)
  if (next === null) {
    if (required) {
      console.error(`✗ ${rel} no tiene los marcadores ${INDEX_START.slice(0, 22)}… / ${INDEX_END}`)
      console.error('  parte de templates/HUB-README.md')
      process.exitCode = 1
    }
    return
  }
  if (next !== text) {
    changes.push(rel)
    if (!CHECK && !LIST) writeFileSync(path, crlf ? next.split('\n').join('\r\n') : next, 'utf8')
  }
}

update(config.generated.readme, (text) => replaceBetween(text, INDEX_START, INDEX_END, renderIndex()), { required: true })
for (const mega of docs.filter((d) => d.fm.type === 'mega')) {
  update(mega.rel, (text) => replaceBetween(text, PLANS_START, PLANS_END, renderPlans(mega)), { required: false })
}

if (LIST) for (const c of changes) console.log(c)

if (CHECK) {
  if (changes.length) {
    console.error(`✗ vistas generadas desactualizadas: ${changes.join(', ')}`)
    console.error('  regenera con node scripts/rem-index.mjs (o deja que lo haga CI si generated.index = "ci")')
    process.exit(1)
  }
  if (!process.exitCode) console.log('✓ índice y tablas de planes al día')
} else if (!process.exitCode && !LIST) {
  console.log(changes.length ? `✓ regenerado: ${changes.join(', ')}` : '✓ nada que regenerar')
}
