#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 RelataLabs

/**
 * REM flow 1.0
 *
 * Resume WIP, work item age, throughput y cycle time de Plans con front-matter REM.
 * Sin dependencias externas.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const configPath = existsSync(resolve(ROOT, 'rem.config.json'))
  ? resolve(ROOT, 'rem.config.json')
  : resolve(ROOT, 'rem.config.example.json')
const config = JSON.parse(readFileSync(configPath, 'utf8'))

function walk(dir) {
  if (!existsSync(dir)) return []
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) out.push(...walk(p))
    else if (st.isFile() && p.endsWith('.md')) out.push(p)
  }
  return out
}

function parse(path) {
  const text = readFileSync(path, 'utf8')
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return null
  const fm = {}
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':')
    if (i < 0) continue
    fm[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '')
  }
  return fm
}

function days(a, b = new Date()) {
  if (!a) return null
  const d = new Date(`${a}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return null
  return Math.max(0, (b - d) / 86400000)
}

const plans = config.workRoots
  .flatMap(p => walk(resolve(ROOT, p)))
  .map(p => ({ path: p, fm: parse(p) }))
  .filter(x => x.fm?.type === 'plan')

const today = new Date()
const open = plans.filter(x => !['Cerrado', 'Abandonado'].includes(x.fm.status))
const closed = plans.filter(x => x.fm.status === 'Cerrado' && x.fm.started && x.fm.closed)

console.log('# REM Flow\n')
console.log(`Plans: ${plans.length}`)
console.log(`WIP abierto: ${open.length}`)

for (const x of open.sort((a,b) => (days(b.fm.started) ?? -1) - (days(a.fm.started) ?? -1))) {
  const age = days(x.fm.started, today)
  console.log(`- ${x.fm.id}: ${x.fm.status} · owner=${x.fm.owner || '?'} · age=${age === null ? '?' : age.toFixed(1)}d`)
}

const last30 = plans.filter(x => x.fm.closed && days(x.fm.closed, today) <= 30)
console.log(`\nThroughput 30d: ${last30.length}`)

const cycles = closed.map(x => days(x.fm.started, new Date(`${x.fm.closed}T00:00:00Z`))).filter(x => x !== null)
if (cycles.length) {
  cycles.sort((a,b) => a-b)
  const median = cycles[Math.floor(cycles.length / 2)]
  const p85 = cycles[Math.min(cycles.length - 1, Math.ceil(cycles.length * 0.85) - 1)]
  console.log(`Cycle time mediana: ${median.toFixed(1)}d`)
  console.log(`Cycle time p85: ${p85.toFixed(1)}d`)
} else {
  console.log('Cycle time: sin datos suficientes')
}
