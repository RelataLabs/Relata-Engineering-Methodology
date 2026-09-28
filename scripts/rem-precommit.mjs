#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 RelataLabs

/**
 * REM pre-commit 1.1 — lo que el hook `pre-commit` del hub ejecuta.
 *
 * 1. El doctor sin git (rápido): un commit no puede introducir un documento roto.
 * 2. Si las vistas generadas tienen escritor local (`generated.index = "local"`), las
 *    regenera y las añade al commit. Con escritor `ci`, NO las toca: en equipo, que cada
 *    commit regenere el README es la receta para que cinco personas choquen en él.
 */

import { execFileSync, spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { loadConfig, resolveRoot } from './lib/rem.mjs'

const ROOT = resolveRoot(import.meta.url)
const { config, error } = loadConfig(ROOT)
if (!config) {
  console.error(`  ✗ ${error}`)
  process.exit(1)
}

const node = (script, args = []) => spawnSync(process.execPath, [join(ROOT, 'scripts', script), ...args], { cwd: ROOT, encoding: 'utf8' })

const doctor = node('rem-doctor.mjs', ['--no-git', '--quiet'])
if (doctor.status !== 0) {
  const full = node('rem-doctor.mjs', ['--no-git'])
  process.stderr.write(full.stdout)
  console.error('  ✗ commit rechazado: el doctor encontró errores (bypass consciente: git commit --no-verify)')
  process.exit(1)
}

if (config.generated.index === 'local') {
  const listed = node('rem-index.mjs', ['--list'])
  if (listed.status !== 0) {
    process.stderr.write(listed.stderr)
    process.exit(1)
  }
  const changed = listed.stdout.split(/\r?\n/).filter(Boolean)
  if (changed.length) {
    node('rem-index.mjs')
    execFileSync('git', ['add', '--', ...changed], { cwd: ROOT })
    console.log(`  ✓ regenerado: ${changed.join(', ')}`)
  }
}
