#!/usr/bin/env node

/**
 * REM doctor 1.0
 *
 * Sin dependencias externas. Valida invariantes básicas de una adopción REM:
 * - front-matter mínimo;
 * - estados de plan válidos;
 * - integridad MEGA↔PLAN;
 * - Plan cerrado sin checklist abierto;
 * - Megaplán cerrado solo con Plans cerrados/abandonados;
 * - límite WIP por owner;
 * - DEC demasiado grande.
 *
 * Uso:
 *   node scripts/rem-doctor.mjs
 *   node scripts/rem-doctor.mjs --config path/rem.config.json
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

function arg(name) {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : null
}

const configPath = resolve(ROOT, arg('--config') ?? 'rem.config.json')
const fallbackPath = resolve(ROOT, 'rem.config.example.json')
const config = JSON.parse(readFileSync(existsSync(configPath) ? configPath : fallbackPath, 'utf8'))

function walk(dir) {
  if (!existsSync(dir)) return []
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) out.push(...walk(p))
    else if (st.isFile() && name.endsWith('.md')) out.push(p)
  }
  return out
}

function scalar(v) {
  const s = v.trim()
  if (!s) return ''
  if (s.startsWith('[') && s.endsWith(']')) {
    const body = s.slice(1, -1).trim()
    if (!body) return []
    return body.split(',').map(x => x.trim().replace(/^["']|["']$/g, ''))
  }
  return s.replace(/^["']|["']$/g, '')
}

function parse(path) {
  const text = readFileSync(path, 'utf8')
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)
  if (!m) return { path, text, fm: null, body: text }
  const fm = {}
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue
    const i = line.indexOf(':')
    if (i < 0) continue
    fm[line.slice(0, i).trim()] = scalar(line.slice(i + 1))
  }
  return { path, text, fm, body: text.slice(m[0].length) }
}

const paths = config.workRoots.flatMap(p => walk(resolve(ROOT, p)))
const docs = paths.map(parse)
const byId = new Map(docs.filter(d => d.fm?.id).map(d => [d.fm.id, d]))
const findings = []

function add(level, msg) {
  findings.push({ level, msg })
}

for (const d of docs) {
  const rel = relative(ROOT, d.path)
  if (!d.fm) {
    add('ERROR', `${rel}: falta front-matter`)
    continue
  }
  for (const k of ['id', 'type', 'title', 'date', 'status']) {
    if (!d.fm[k]) add('ERROR', `${rel}: falta ${k}`)
  }

  if (['plan', 'mega'].includes(d.fm.type) && !config.planStates.includes(d.fm.status)) {
    add('ERROR', `${d.fm.id}: estado REM inválido: ${d.fm.status}`)
  }

  if (d.fm.type === 'plan') {
    if (!d.fm.owner) add('WARN', `${d.fm.id}: Plan sin owner`)
    if (!d.fm.megaplan) add('ERROR', `${d.fm.id}: Plan sin megaplan`)
    else if (!byId.has(d.fm.megaplan)) add('ERROR', `${d.fm.id}: megaplan ${d.fm.megaplan} no existe`)

    if (d.fm.status === 'Cerrado' && /^\s*-\s*\[\s\]/m.test(d.body)) {
      add('ERROR', `${d.fm.id}: Cerrado con checklist pendiente`)
    }
  }

  if (d.fm.type === 'dec') {
    const contentLines = d.body.split(/\r?\n/).filter(x => x.trim()).length
    if (contentLines > config.limits.decisionNoteContentLines) {
      add('WARN', `${d.fm.id}: DEC con ${contentLines} líneas de contenido; considera ADR`)
    }
  }
}

// Integridad MEGA ↔ PLAN y cierre.
for (const d of docs.filter(x => x.fm?.type === 'mega')) {
  const ids = Array.isArray(d.fm.plans) ? d.fm.plans : []
  for (const id of ids) {
    const p = byId.get(id)
    if (!p) {
      add('ERROR', `${d.fm.id}: lista Plan inexistente ${id}`)
      continue
    }
    if (p.fm?.megaplan !== d.fm.id) {
      add('ERROR', `${d.fm.id} ↔ ${id}: referencia no bidireccional`)
    }
  }

  if (d.fm.status === 'Cerrado') {
    for (const id of ids) {
      const p = byId.get(id)
      if (p && !['Cerrado', 'Abandonado'].includes(p.fm?.status)) {
        add('ERROR', `${d.fm.id}: Cerrado pero ${id} está ${p.fm?.status}`)
      }
    }
  }
}

// WIP por owner.
const activeStates = new Set(['Activo', 'Verificando'])
const byOwner = new Map()
for (const d of docs.filter(x => x.fm?.type === 'plan' && activeStates.has(x.fm?.status))) {
  const owner = d.fm.owner || '<sin-owner>'
  byOwner.set(owner, [...(byOwner.get(owner) ?? []), d.fm.id])
}

for (const [owner, ids] of byOwner) {
  if (ids.length > config.wip.maxActiveOrVerifyingPerOwner) {
    add(
      'ERROR',
      `WIP de ${owner}: ${ids.length} Plans activos/verificando (${ids.join(', ')}), límite ${config.wip.maxActiveOrVerifyingPerOwner}`,
    )
  }
}

if (!findings.length) {
  console.log(`REM doctor: OK (${docs.length} documentos inspeccionados)`)
  process.exit(0)
}

for (const f of findings) console.log(`${f.level}: ${f.msg}`)
const errors = findings.filter(f => f.level === 'ERROR').length
console.log(`\nREM doctor: ${errors} error(es), ${findings.length - errors} aviso(s)`)
process.exit(errors ? 1 : 0)
