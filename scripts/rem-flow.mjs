#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 RelataLabs

/**
 * REM flow 1.1 — WIP, edad del trabajo, throughput y cycle time de los Plans.
 *
 * Son las cuatro métricas mínimas del kernel (METHOD §14). Salen de las fechas del
 * front-matter (`started`, `closed`), así que un Plan sin ellas es invisible aquí: el
 * doctor lo avisa (regla 24).
 *
 * Throughput cuenta solo `Cerrado`. `Abandonado` es un resultado legítimo, pero sumarlo
 * inflaría la entrega (REM 1.0 lo contaba): se informa aparte.
 *
 * Uso:  node scripts/rem-flow.mjs [--days 30]
 */

import { ACTIVE_STATES, FINAL_STATES, arg, daysSince, loadConfig, loadDocs, resolveRoot } from './lib/rem.mjs'

const ROOT = resolveRoot(import.meta.url)
const window = Number(arg('--days') ?? 30)
const { config, error } = loadConfig(ROOT)
if (!config) {
  console.error(`✗ ${error}`)
  process.exit(1)
}

const plans = loadDocs(ROOT, config).filter((d) => d.fm?.type === 'plan')
const open = plans.filter((p) => !FINAL_STATES.has(p.fm.status))
const active = plans.filter((p) => ACTIVE_STATES.has(p.fm.status))
const closedIn = (state) => plans.filter((p) => p.fm.status === state && (daysSince(p.fm.closed) ?? Infinity) <= window)

console.log('# REM Flow\n')
console.log(`Plans: ${plans.length} · abiertos: ${open.length} · activos/verificando: ${active.length}`)

for (const p of open.sort((a, b) => (daysSince(b.fm.started) ?? -1) - (daysSince(a.fm.started) ?? -1))) {
  const age = daysSince(p.fm.started)
  console.log(`- ${p.fm.id}: ${p.fm.status} · owner=${p.fm.owner || '?'} · edad=${age === null ? '?' : `${age}d`}`)
}

console.log(`\nThroughput ${window}d: ${closedIn('Cerrado').length} cerrados (+${closedIn('Abandonado').length} abandonados)`)

const cycles = plans
  .filter((p) => p.fm.status === 'Cerrado' && p.fm.started && p.fm.closed)
  .map((p) => daysSince(p.fm.started, new Date(`${p.fm.closed}T00:00:00Z`)))
  .filter((x) => x !== null)
  .sort((a, b) => a - b)
if (cycles.length) {
  const median = cycles[Math.floor(cycles.length / 2)]
  const p85 = cycles[Math.min(cycles.length - 1, Math.ceil(cycles.length * 0.85) - 1)]
  console.log(`Cycle time mediana: ${median}d · p85: ${p85}d (n=${cycles.length})`)
} else {
  console.log('Cycle time: sin datos suficientes (hacen falta Plans cerrados con started y closed)')
}
