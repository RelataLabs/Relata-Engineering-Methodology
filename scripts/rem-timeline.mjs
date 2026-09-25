#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 RelataLabs

/**
 * REM timeline 1.1 — la vista transversal de lo que cambió en todos los repos.
 *
 * El registro se escribe UNA vez, en el repo donde ocurre el cambio. Este script lo
 * agrega en el hub sin que nadie escriba dos veces. Dos fuentes, por repo:
 *
 *   - `changelog`: el CHANGELOG.md del repo (formato por fecha `## YYYY-MM-DD` o por
 *     versión `## [x.y.z] — YYYY-MM-DD`). Es la fuente buena: lenguaje de usuario.
 *   - `git`: los commits convencionales de la rama de integración (feat, fix…). Es la
 *     fuente para un hub que todavía no instaló los spokes: peor redactada, pero real.
 *   - `auto` (por defecto): changelog si el repo lo tiene en su rama, si no git. Así un
 *     repo pasa de una fuente a la otra el día que añade su CHANGELOG, sin tocar nada.
 *
 * Se lee lo PUBLICADO (`origin/<rama>` vía `git show`/`git log`), no el checkout local:
 * una rama de trabajo no representa lo integrado.
 *
 * Uso:  node scripts/rem-timeline.mjs            regenera
 *       node scripts/rem-timeline.mjs --check    sale 1 si está desactualizado
 *
 * Necesita los repos clonados donde dice `repos.<nombre>.path`, así que en un hub cuyo
 * CI no los clona lo regenera en local quien coordina (`generated.timeline = "local"`).
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { branchRef, eol, flag, git, loadConfig, repoBranch, repoDir, resolveRoot } from './lib/rem.mjs'

const ROOT = resolveRoot(import.meta.url)
const CHECK = flag('--check')

const { config, error } = loadConfig(ROOT)
if (!config) {
  console.error(`✗ ${error}`)
  process.exit(1)
}

const DATE = /^##\s+(\d{4}-\d{2}-\d{2})\s*$/
const VERSION = /^##\s+\[([^\]]+)\]\s*[—-]\s*(\d{4}-\d{2}-\d{2})\s*$/
const SECTION = /^###\s+(.+?)\s*$/
const ENTRY = /^-\s+(.*)$/
const CONVENTIONAL = /^([a-z]+)(\([^)]*\))?(!)?(\[trivial\])?:\s*(.+)$/

function parseChangelog(text, repo) {
  const out = []
  let date = null
  let version = null
  let section = null
  let current = null
  const flush = () => {
    if (current && date) out.push({ repo, date, version, section, text: current.trim() })
    current = null
  }
  for (const line of text.split(/\r?\n/)) {
    const v = VERSION.exec(line)
    const d = DATE.exec(line)
    const s = SECTION.exec(line)
    const e = ENTRY.exec(line)
    if (v) { flush(); version = v[1]; date = v[2]; section = null; continue }
    if (d) { flush(); date = d[1]; version = null; section = null; continue }
    if (s) { flush(); section = s[1]; continue }
    if (e) { flush(); current = e[1]; continue }
    if (current && /^\s+\S/.test(line)) current += ' ' + line.trim()
    else if (current) flush()
  }
  flush()
  return out
}

function fromGit(dir, ref, repo) {
  const args = ['log', ref, '--no-merges', '--date=short', '--format=%ad%x1f%s']
  if (config.timeline.since) args.push(`--since=${config.timeline.since}`)
  const log = git(dir, args)
  if (!log) return []
  const types = new Set(config.timeline.gitTypes)
  const out = []
  for (const line of log.split(/\r?\n/)) {
    const [date, subject = ''] = line.split('\x1f')
    const m = CONVENTIONAL.exec(subject.trim())
    if (!m || !types.has(m[1]) || m[4]) continue
    out.push({ repo, date, version: null, section: `${m[1]}${m[2] ?? ''}`, text: m[5] })
  }
  return out
}

const entries = []
const sources = []
const missing = []

for (const name of Object.keys(config.repos)) {
  const dir = repoDir(ROOT, config, name)
  if (!existsSync(dir) || git(dir, ['rev-parse', '--git-dir']) === null) {
    missing.push(name)
    continue
  }
  const ref = branchRef(dir, repoBranch(config, name))
  const wanted = config.repos[name].timeline ?? config.timeline.source
  let changelog = null
  if (wanted !== 'git') {
    changelog = git(dir, ['show', `${ref}:CHANGELOG.md`])
    if (changelog === null && !ref.startsWith('origin/') && existsSync(join(dir, 'CHANGELOG.md'))) {
      changelog = readFileSync(join(dir, 'CHANGELOG.md'), 'utf8')
    }
  }
  if (changelog !== null) {
    entries.push(...parseChangelog(changelog, name))
    sources.push(`${name} (CHANGELOG, ${ref})`)
  } else if (wanted === 'changelog') {
    missing.push(`${name} (sin CHANGELOG.md en ${ref})`)
  } else {
    entries.push(...fromGit(dir, ref, name))
    sources.push(`${name} (commits, ${ref})`)
  }
}

// Más reciente primero; dentro del día, por repo; dentro del repo, el orden de la fuente.
const indexed = entries.map((e, i) => ({ ...e, i }))
indexed.sort((a, b) => (a.date !== b.date ? (a.date < b.date ? 1 : -1) : a.repo !== b.repo ? a.repo.localeCompare(b.repo) : a.i - b.i))

const lines = [
  '<!-- GENERADO POR scripts/rem-timeline.mjs — NO EDITAR A MANO -->',
  '',
  '# Línea de tiempo — todos los repos',
  '',
  'Vista agregada de lo que cambió en cada repositorio, por fecha. Fuentes:',
  '',
  ...sources.map((s) => `- ${s}`),
  '',
]
if (config.timeline.since) lines.push(`Desde ${config.timeline.since}.`, '')
if (missing.length) lines.push(`> Sin datos: ${missing.join(', ')}.`, '')
lines.push('Regenerar: `node scripts/rem-timeline.mjs`', '')

let lastDate = null
for (const e of indexed) {
  if (e.date !== lastDate) {
    lines.push('', `## ${e.date}`, '')
    lastDate = e.date
  }
  const tag = e.version ? `${e.repo} ${e.version}` : e.repo
  lines.push(`- **${tag}**${e.section ? ` · ${e.section}` : ''} · ${e.text}`)
}

const output = lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n'
const target = join(ROOT, config.timeline.file)

if (CHECK) {
  const existing = existsSync(target) ? eol(readFileSync(target, 'utf8')) : ''
  if (existing !== output) {
    console.error(`✗ ${config.timeline.file} está desactualizado. Ejecuta: node scripts/rem-timeline.mjs`)
    process.exit(1)
  }
  console.log(`✓ ${config.timeline.file} al día`)
} else {
  writeFileSync(target, output, 'utf8')
  console.log(`✓ ${config.timeline.file}: ${entries.length} entradas de ${sources.length} repos`)
  if (missing.length) console.log(`  sin datos: ${missing.join(', ')}`)
}
