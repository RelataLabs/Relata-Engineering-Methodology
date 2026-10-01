#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 RelataLabs

/**
 * REM pre-commit 1.1 — lo que el hook `pre-commit` del hub ejecuta.
 *
 * Valida un snapshot del índice con el tooling instalado, nunca con scripts del snapshot.
 * No modifica working tree ni staging parcial. Con escritor local comprueba las vistas;
 * el autor las regenera y prepara explícitamente. Con escritor CI, ese trabajo es de CI.
 */

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadConfig, resolveRoot } from './lib/rem.mjs'
import { stagedSnapshot } from './lib/staged.mjs'

const ROOT = resolveRoot(import.meta.url)
let snapshot
try {
  snapshot = stagedSnapshot(ROOT)
  if (!existsSync(join(snapshot.root, 'rem.config.json'))) throw new Error('falta rem.config.json en el índice; el ejemplo no sustituye la configuración del hub')
  const { config, error } = loadConfig(snapshot.root, ['--source-root', ROOT])
  if (!config) throw new Error(`falta una configuración REM válida en el índice: ${error}`)
  const scripts = dirname(fileURLToPath(import.meta.url))
  const node = (script, args) => {
    const result = spawnSync(process.execPath, [join(scripts, script), '--root', snapshot.root, '--source-root', ROOT, ...args], {
      cwd: snapshot.root, encoding: 'utf8',
    })
    if (result.error) throw result.error
    if (result.status !== 0) throw new Error((result.stdout ?? '') + (result.stderr ?? ''))
  }
  node('rem-doctor.mjs', ['--no-git'])
  if (config.generated.index === 'local') {
    try { node('rem-index.mjs', ['--check']) } catch (error) {
      throw new Error(`${error.message}\nRegenera con node scripts/rem-index.mjs y prepara sus cambios con git add.`)
    }
  }
} catch (error) {
  console.error(`  ✗ commit rechazado al validar el índice:\n${error.message}`)
  process.exitCode = 1
} finally {
  snapshot?.cleanup()
}
