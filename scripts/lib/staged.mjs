// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 RelataLabs

import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'

/** Copia solo blobs del índice; nunca hace stash, checkout, git add ni ejecuta su código. */
export function stagedSnapshot(root) {
  const parent = realpathSync(tmpdir())
  const snapshot = mkdtempSync(join(parent, 'rem-staged-'))
  const cleanup = () => {
    // Verificación del destino absoluto antes de borrar recursivamente (también en Windows).
    const target = realpathSync(snapshot)
    if (dirname(target) !== parent || target !== snapshot) throw new Error('Ruta temporal inesperada: no se elimina')
    rmSync(target, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 })
  }
  const git = (args, options = {}) => execFileSync('git', ['-C', root, ...args], {
    maxBuffer: 256 * 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'], ...options,
  })
  try {
    const entries = git(['ls-files', '--stage', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean).map((entry) => {
      const match = /^(\d+) ([a-f0-9]+) (\d)\t([\s\S]+)$/.exec(entry)
      if (!match) throw new Error('No se pudo leer una entrada del índice')
      const [, mode, oid, stage, file] = match
      if (stage !== '0') throw new Error(`Índice con conflictos: ${file}`)
      // Los enlaces podrían leer/escribir fuera del snapshot; no se siguen silenciosamente.
      if (!['100644', '100755', '160000'].includes(mode)) throw new Error(`Enlace simbólico no admitido en la validación staged: ${file}`)
      const path = resolve(snapshot, file)
      const rel = relative(snapshot, path)
      if (!rel || isAbsolute(rel) || rel === '..' || rel.startsWith(`..${sep}`)) throw new Error(`Ruta staged fuera del snapshot: ${file}`)
      return { mode, oid, path }
    }).filter((entry) => entry.mode !== '160000') // Los submódulos no son contenido del índice de este hub.

    const blobs = entries.length ? git(['cat-file', '--batch'], { input: entries.map((entry) => entry.oid).join('\n') + '\n' }) : Buffer.alloc(0)
    let offset = 0
    for (const entry of entries) {
      const newline = blobs.indexOf(10, offset)
      const header = blobs.subarray(offset, newline).toString('ascii')
      const match = /^([a-f0-9]+) blob (\d+)$/.exec(header)
      if (!match || match[1] !== entry.oid) throw new Error('Respuesta de git cat-file inválida')
      const size = Number(match[2])
      const end = newline + 1 + size
      if (end >= blobs.length || blobs[end] !== 10) throw new Error('Blob staged incompleto')
      mkdirSync(dirname(entry.path), { recursive: true })
      writeFileSync(entry.path, blobs.subarray(newline + 1, end))
      offset = end + 1
    }
    return { root: snapshot, cleanup }
  } catch (error) {
    cleanup()
    throw error
  }
}
