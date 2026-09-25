#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 RelataLabs

/**
 * REM install 1.1 — prepara un clon para trabajar en la adopción.
 *
 * Los hooks versionados no se activan solos: `core.hooksPath` es configuración local
 * del clon y no viaja con el repo. En el hub de origen de REM un repo añadido más tarde
 * se quedó sin hook durante semanas porque nadie lo configuró. Esto lo hace en un paso
 * y dice qué más falta.
 *
 * Uso:  node scripts/rem-install.mjs
 */

import { chmodSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { git, loadConfig, repoDir, resolveRoot } from './lib/rem.mjs'

const ROOT = resolveRoot(import.meta.url)
const { config, error } = loadConfig(ROOT)
if (!config) {
  console.error(`✗ ${error}`)
  process.exit(1)
}

if (git(ROOT, ['rev-parse', '--git-dir']) === null) {
  console.error('✗ esta carpeta no es un repositorio git')
  process.exit(1)
}

const hooks = join(ROOT, config.hooksDir)
if (!existsSync(hooks)) {
  console.error(`✗ falta ${config.hooksDir}/ (copia hooks/ de REM)`)
  process.exit(1)
}
for (const f of readdirSync(hooks)) {
  try { chmodSync(join(hooks, f), 0o755) } catch { /* en Windows no aplica */ }
}
git(ROOT, ['config', 'core.hooksPath', config.hooksDir])
console.log(`✓ core.hooksPath = ${git(ROOT, ['config', 'core.hooksPath'])}`)

const missing = Object.entries(config.repos).filter(([name]) => !existsSync(repoDir(ROOT, config, name)))
if (missing.length) {
  console.log('\nRepos del config que no están clonados junto al hub (las reglas de commits se saltan para ellos):')
  for (const [name, r] of missing) console.log(`  - ${name}: se espera en ${r.path}`)
}
console.log('\nSiguiente: node scripts/rem-status.mjs   (quién tiene qué)')
