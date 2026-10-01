#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 RelataLabs

/**
 * REM flow 1.1 — WIP, edad del trabajo, throughput y cycle time de los Plans.
 *
 * Distingue WIP iniciado de atención Activo/Verificando. Rechaza fechas inválidas
 * o ausentes en lugar de presentar una entrega parcial como una métrica fiable.
 *
 * Throughput cuenta solo `Cerrado`. `Abandonado` es un resultado legítimo, pero sumarlo
 * inflaría la entrega (REM 1.0 lo contaba): se informa aparte.
 *
 * Uso:  node scripts/rem-flow.mjs [--days 30]
 */

import { arg, daysSince, loadConfig, loadDocs, resolveRoot } from './lib/rem.mjs'
import { summarizeFlow } from './lib/flow.mjs'

const ROOT = resolveRoot(import.meta.url)
const window = Number(arg('--days') ?? 30)
const { config, error } = loadConfig(ROOT)
if (!config) {
  console.error(`✗ ${error}`)
  process.exit(1)
}

const plans = loadDocs(ROOT, config).filter((d) => d.fm?.type === 'plan')
let flow
try {
  flow = summarizeFlow(plans, window)
} catch (error) {
  console.error(`✗ No se pueden calcular métricas fiables:\n${error.message}\nCorrige las fechas con rem-doctor.`)
  process.exit(1)
}

console.log('# REM Flow\n')
console.log(`Plans: ${plans.length} · abiertos: ${flow.open.length} · WIP iniciado: ${flow.wip.length} · activos/verificando: ${flow.active.length}`)

for (const p of flow.open.sort((a, b) => (daysSince(b.fm.started) ?? -1) - (daysSince(a.fm.started) ?? -1))) {
  const age = daysSince(p.fm.started)
  console.log(`- ${p.fm.id}: ${p.fm.status} · owner=${p.fm.owner || '?'} · edad=${age === null ? 'sin iniciar' : `${age}d`}`)
}

console.log(`\nThroughput ${window}d (fechas UTC, hoy incluido): ${flow.closed} cerrados (+${flow.abandoned} abandonados)`)
if (flow.cycles.length) {
  console.log(`Cycle time histórico, mediana: ${flow.median}d · p85: ${flow.p85}d (n=${flow.cycles.length})`)
} else {
  console.log('Cycle time: sin datos suficientes (hacen falta Plans cerrados con started y closed)')
}
