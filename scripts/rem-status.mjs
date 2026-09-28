#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 RelataLabs

/**
 * REM status 1.1 — el tablero del equipo, sin tablero.
 *
 * Responde a la primera pregunta de cualquier persona o agente que empieza a trabajar:
 * ¿quién tiene qué, qué está bloqueado y qué cambió desde la última vez? Es lo primero
 * que el contrato de agentes pide ejecutar (docs/TEAM.md).
 *
 * Uso:
 *   node scripts/rem-status.mjs                 todos los megaplanes y planes abiertos
 *   node scripts/rem-status.mjs MEGA-2026-001   solo ese megaplán
 *   node scripts/rem-status.mjs --owner ana     solo lo de una persona
 *   node scripts/rem-status.mjs --days 14       ventana de "novedades" (por defecto 7)
 *   node scripts/rem-status.mjs --commits       añade los commits de cada plan, leídos del
 *                                               trailer `Plan: <id>` en los repos de código
 */

import { existsSync } from 'node:fs'
import {
  ACTIVE_STATES,
  DEPENDENCY_DONE,
  FINAL_STATES,
  arg,
  asList,
  branchRef,
  daysSince,
  docTitle,
  flag,
  git,
  loadConfig,
  loadDocs,
  repoBranch,
  repoDir,
  resolveRoot,
} from './lib/rem.mjs'

const ROOT = resolveRoot(import.meta.url)
const onlyOwner = arg('--owner')
const windowDays = Number(arg('--days') ?? 7)
const onlyMega = process.argv.slice(2).find((a) => /^MEGA-\d{4}-\d{3}$/.test(a))

const { config, error } = loadConfig(ROOT)
if (!config) {
  console.error(`✗ ${error}`)
  process.exit(1)
}

const docs = loadDocs(ROOT, config).filter((d) => d.fm?.id)
const byId = new Map(docs.map((d) => [d.fm.id, d]))
const plans = docs.filter((d) => d.fm.type === 'plan')
const megas = docs.filter((d) => d.fm.type === 'mega' && (!onlyMega || d.fm.id === onlyMega))

// Commits por plan, leídos del trailer `Plan:` de cada repo (sin tocar ningún fichero
// compartido: el commit ya dice a qué plan pertenece).
const commitsByPlan = new Map()
if (flag('--commits')) {
  for (const name of Object.keys(config.repos)) {
    const dir = repoDir(ROOT, config, name)
    if (!existsSync(dir)) continue
    const ref = branchRef(dir, repoBranch(config, name))
    const log = git(dir, ['log', ref, '--no-merges', '--format=%h%x1f%ad%x1f%s%x1f%(trailers:key=Plan,valueonly,separator=%x2C)', '--date=short', '-n', '2000'])
    for (const line of (log ?? '').split(/\r?\n/).filter(Boolean)) {
      const [hash, date, subject, trailer] = line.split('\x1f')
      for (const pid of (trailer ?? '').split(',').map((s) => s.trim()).filter(Boolean)) {
        commitsByPlan.set(pid, [...(commitsByPlan.get(pid) ?? []), `${name}@${hash} ${date} ${subject}`])
      }
    }
  }
}

const blockedBy = (p) => asList(p.fm.depends_on).filter((dep) => {
  const d = byId.get(dep)
  return d && !DEPENDENCY_DONE.has(d.fm.status)
})

function planLine(p, indent = '  ') {
  const blocked = blockedBy(p)
  const age = daysSince(p.fm.started)
  const bits = [
    p.fm.status.padEnd(11),
    (p.fm.owner ?? '—').padEnd(14),
    `${p.fm.id} — ${docTitle(p)}`,
  ]
  const tail = []
  if (ACTIVE_STATES.has(p.fm.status) && age !== null) tail.push(`${age}d`)
  if (blocked.length) tail.push(`espera ${blocked.join(', ')}`)
  const zones = asList(p.fm.touches)
  if (zones.length) tail.push(`toca ${zones.slice(0, 3).join(', ')}${zones.length > 3 ? ` +${zones.length - 3}` : ''}`)
  const out = [`${indent}${bits.join(' ')}${tail.length ? `  [${tail.join(' · ')}]` : ''}`]
  for (const c of commitsByPlan.get(p.fm.id) ?? []) out.push(`${indent}    ${c}`)
  return out.join('\n')
}

const visible = (p) => !onlyOwner || p.fm.owner === onlyOwner

console.log('# Estado REM\n')

for (const m of megas.sort((a, b) => (a.fm.id < b.fm.id ? -1 : 1))) {
  if (FINAL_STATES.has(m.fm.status) && !onlyMega) continue
  const own = asList(m.fm.plans ?? m.fm.planes).map((id) => byId.get(id)).filter(Boolean).filter(visible)
  if (onlyOwner && !own.length) continue
  console.log(`## ${m.fm.id} — ${docTitle(m)}  (${m.fm.status}; coordina ${m.fm.owner ?? '—'})`)
  for (const p of own) console.log(planLine(p))
  console.log('')
}

const loose = plans.filter((p) => !p.fm.megaplan && !FINAL_STATES.has(p.fm.status) && visible(p))
if (loose.length && !onlyMega) {
  console.log('## Planes sueltos')
  for (const p of loose) console.log(planLine(p))
  console.log('')
}

// WIP y huecos: planes activos por persona y planes libres que ya no están bloqueados.
if (!onlyMega) {
  const byOwner = new Map()
  for (const p of plans.filter((x) => ACTIVE_STATES.has(x.fm.status))) {
    const o = p.fm.owner ?? '<sin owner>'
    byOwner.set(o, [...(byOwner.get(o) ?? []), p.fm.id])
  }
  console.log('## WIP por persona')
  if (!byOwner.size) console.log('  (nadie tiene un plan activo)')
  for (const [o, ids] of byOwner) {
    const over = ids.length > config.wip.maxActiveOrVerifyingPerOwner ? '  ⚠ sobre el límite' : ''
    console.log(`  ${o.padEnd(14)} ${ids.join(', ')}${over}`)
  }
  const free = plans.filter((p) => p.fm.status === 'Pendiente' && !p.fm.owner && !blockedBy(p).length)
  if (free.length) {
    console.log('\n## Planes que se pueden tomar (Pendiente, sin responsable, sin dependencias abiertas)')
    for (const p of free) console.log(`  ${p.fm.id} — ${docTitle(p)}`)
  }
  console.log('')
}

// Novedades: decisiones, incidentes y auditorías recientes que pueden cambiar lo que uno hace.
const recent = docs
  .filter((d) => ['dec', 'adr', 'incident', 'audit'].includes(d.fm.type))
  .filter((d) => (daysSince(d.fm.date) ?? Infinity) <= windowDays)
  .filter((d) => !onlyMega || asList(d.fm.related).some((r) => r === onlyMega || r.startsWith(`${onlyMega}-`)))
  .sort((a, b) => (a.fm.date < b.fm.date ? 1 : -1))
console.log(`## Novedades (últimos ${windowDays} días)`)
if (!recent.length) console.log('  (ninguna)')
for (const d of recent) {
  const affects = asList(d.fm.related).filter((r) => byId.get(r)?.fm.type === 'plan')
  console.log(`  ${d.fm.date} ${d.fm.id} — ${docTitle(d)}${affects.length ? `  → afecta ${affects.join(', ')}` : ''}`)
}
