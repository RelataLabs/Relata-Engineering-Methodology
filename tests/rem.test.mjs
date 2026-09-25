// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 RelataLabs

/**
 * Pruebas del tooling de REM. Ejecutar: node --test tests/
 *
 * Cada caso negativo arma un hub mínimo en una carpeta temporal y comprueba que el doctor
 * lo rechaza por la regla correcta. Varias de estas reglas existen porque REM 1.0 dejaba
 * pasar exactamente ese caso (hub vacío, listas en bloque, enlaces en un solo sentido).
 */

import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { after, describe, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { nextSequenceId, parseFrontMatter } from '../scripts/lib/rem.mjs'

const REM = join(dirname(fileURLToPath(import.meta.url)), '..')
const EXAMPLE = join(REM, 'examples', 'hub')
const temps = []
after(() => temps.forEach((t) => rmSync(t, { recursive: true, force: true })))

function run(script, root, ...args) {
  const r = spawnSync(process.execPath, [join(REM, 'scripts', script), '--root', root, ...args], {
    encoding: 'utf8',
    env: { ...process.env, CI: '1' },
  })
  return { code: r.status, out: r.stdout + r.stderr }
}

/** Un hub temporal con el config del ejemplo (plantillas absolutas) y los ficheros dados. */
function hub(files = {}, tweak = (c) => c) {
  const root = mkdtempSync(join(tmpdir(), 'rem-'))
  temps.push(root)
  const config = JSON.parse(readFileSync(join(EXAMPLE, 'rem.config.json'), 'utf8'))
  for (const t of Object.values(config.types)) t.template = join(REM, t.template.replace('../../', ''))
  config.ci = { workflow: join(REM, '.github', 'workflows', 'rem-doctor.yml') }
  config.required = []
  writeFileSync(join(root, 'rem.config.json'), JSON.stringify(tweak(config), null, 2))
  for (const t of Object.values(config.types)) mkdirSync(join(root, t.dir), { recursive: true })
  writeFileSync(join(root, 'README.md'), '# Hub\n\n<!-- REM:INDEX:START — generado por scripts/rem-index.mjs, no editar a mano -->\n<!-- REM:INDEX:END -->\n')
  for (const [rel, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, rel)), { recursive: true })
    writeFileSync(join(root, rel), text)
  }
  return root
}

const fm = (fields) => `---\n${Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join('\n')}\n---\n\n# Documento\n`
const adr = (id = 'ADR-0001', extra = {}) => fm({ id, type: 'adr', title: '"Decisión"', date: '2026-09-01', status: 'Accepted', related: '[]', ...extra })
const mega = (plans, extra = {}) => fm({ id: 'MEGA-2026-001', type: 'mega', title: '"M"', date: '2026-09-01', status: 'Activo', owner: 'ana', plans: `[${plans.join(', ')}]`, related: '[]', started: '2026-09-01', ...extra }) +
  '\n<!-- REM:PLANES:START — generado por scripts/rem-index.mjs, no editar a mano -->\n<!-- REM:PLANES:END -->\n'
const plan = (id, extra = {}, body = '') => fm({
  id, type: 'plan', title: '"P"', date: '2026-09-01', status: 'Pendiente', owner: 'null',
  megaplan: id.startsWith('MEGA') ? id.replace(/-P\d+$/, '') : 'null', verification_level: 'V1',
  depends_on: '[]', touches: '[]', related: '[]', ...extra,
}) + body

describe('ejemplo de REM', () => {
  test('examples/hub pasa el doctor de adopción sin errores', () => {
    const r = run('rem-doctor.mjs', EXAMPLE, '--no-git', '--adoption')
    assert.equal(r.code, 0, r.out)
    assert.match(r.out, /sano|0 error/)
  })
  test('el índice y las tablas de planes del ejemplo están al día', () => {
    const r = run('rem-index.mjs', EXAMPLE, '--check')
    assert.equal(r.code, 0, r.out)
  })
  test('la guía de megaplanes del ejemplo es la de docs/ (se copia tal cual)', () => {
    assert.equal(readFileSync(join(EXAMPLE, 'megaplanes', 'README.md'), 'utf8'), readFileSync(join(REM, 'docs', 'MEGAPLANS.md'), 'utf8'))
  })
})

describe('doctor: casos que REM 1.0 dejaba pasar', () => {
  test('un hub sin documentos no está sano con --adoption (A1)', () => {
    const r = run('rem-doctor.mjs', hub(), '--no-git', '--adoption')
    assert.equal(r.code, 1, r.out)
    assert.match(r.out, /\[regla A1\]/)
  })
  test('sin --adoption, cero documentos es un aviso, no un OK silencioso', () => {
    const r = run('rem-doctor.mjs', hub(), '--no-git')
    assert.match(r.out, /\[regla 0\]/)
  })
  test('una lista en bloque en el front-matter es error (1b)', () => {
    const text = '---\nid: MEGA-2026-001\ntype: mega\ntitle: "M"\ndate: 2026-09-01\nstatus: Activo\nplans:\n  - MEGA-2026-001-P1\n---\n# M\n'
    const r = run('rem-doctor.mjs', hub({ 'megaplanes/MEGA-2026-001-m.md': text }), '--no-git')
    assert.equal(r.code, 1)
    assert.match(r.out, /\[regla 1b\].*plans/)
  })
  test('un plan que su megaplán no lista es error (12, dirección plan→mega)', () => {
    const r = run('rem-doctor.mjs', hub({
      'megaplanes/MEGA-2026-001-m.md': mega([]),
      'megaplanes/planes/MEGA-2026-001-P1-x.md': plan('MEGA-2026-001-P1'),
    }), '--no-git')
    assert.equal(r.code, 1)
    assert.match(r.out, /\[regla 12\].*no lo lista/)
  })
  test('README.md en una carpeta de documentos no es un documento', () => {
    const r = run('rem-doctor.mjs', hub({ 'megaplanes/README.md': '# guía\n', 'architecture-decisions/ADR-0001-x.md': adr() }), '--no-git')
    assert.equal(r.code, 0, r.out)
  })
  test('un Plan suelto PLAN-YYYY-NNN sin megaplán es válido', () => {
    const r = run('rem-doctor.mjs', hub({ 'megaplanes/planes/PLAN-2026-001-x.md': plan('PLAN-2026-001') }), '--no-git')
    assert.equal(r.code, 0, r.out)
  })
})

describe('doctor: reglas de 1.1', () => {
  test('IDs duplicados (15)', () => {
    const r = run('rem-doctor.mjs', hub({
      'architecture-decisions/ADR-0001-a.md': adr(),
      'architecture-decisions/ADR-0001-b.md': adr(),
    }), '--no-git')
    assert.equal(r.code, 1)
    assert.match(r.out, /\[regla 15\]/)
  })
  test('enlace relativo roto (16)', () => {
    const r = run('rem-doctor.mjs', hub({ 'architecture-decisions/ADR-0001-a.md': adr() + '\n[x](../no-existe.md)\n' }), '--no-git')
    assert.equal(r.code, 1)
    assert.match(r.out, /\[regla 16\]/)
  })
  test('contraseña literal en el hub (21)', () => {
    const r = run('rem-doctor.mjs', hub({ 'docs/guia.md': '# Guía\n\npassword: hunter22x\n' }), '--no-git')
    assert.equal(r.code, 1)
    assert.match(r.out, /\[regla 21\]/)
  })
  test('contraseña en una columna de tabla (21), sin marcar nombres de variables ni marcadores', () => {
    const leak = '# Cuentas\n\n| Interfaz | Correo | Contraseña |\n|---|---|---|\n| App | `owner@x.dev` | `Clave2026!` |\n'
    const r1 = run('rem-doctor.mjs', hub({ 'docs/guia.md': leak }), '--no-git')
    assert.equal(r1.code, 1)
    assert.match(r1.out, /\[regla 21\].*columna de tabla/)
    const fine = '# Cuentas\n\n| Interfaz | Contraseña |\n|---|---|\n| App | `APP_OWNER_PASSWORD` |\n| CRM | <en el gestor de secretos> |\n| API | — |\n'
    const r2 = run('rem-doctor.mjs', hub({ 'docs/guia.md': fine }), '--no-git')
    assert.doesNotMatch(r2.out, /\[regla 21\]/, r2.out)
  })
  test('el marcador rem-secrets: ignore silencia un falso positivo', () => {
    const r = run('rem-doctor.mjs', hub({ 'docs/guia.md': '# Guía\n\npassword: hunter22x <!-- rem-secrets: ignore -->\n' }), '--no-git')
    assert.doesNotMatch(r.out, /\[regla 21\]/)
  })
  test('plan Cerrado con casillas abiertas (13)', () => {
    const r = run('rem-doctor.mjs', hub({
      'megaplanes/planes/PLAN-2026-001-x.md': plan('PLAN-2026-001', { status: 'Cerrado', owner: 'ana', started: '2026-09-01', closed: '2026-09-02' }, '\n- [ ] [IMP] algo\n'),
    }), '--no-git')
    assert.equal(r.code, 1)
    assert.match(r.out, /\[regla 13\]/)
  })
  test('plan activo sin owner (17) y WIP por persona (18)', () => {
    const r1 = run('rem-doctor.mjs', hub({ 'megaplanes/planes/PLAN-2026-001-x.md': plan('PLAN-2026-001', { status: 'Activo', started: '2026-09-01' }) }), '--no-git')
    assert.match(r1.out, /\[regla 17\]/)
    const r2 = run('rem-doctor.mjs', hub({
      'megaplanes/planes/PLAN-2026-001-x.md': plan('PLAN-2026-001', { status: 'Activo', owner: 'ana', started: '2026-09-01' }),
      'megaplanes/planes/PLAN-2026-002-y.md': plan('PLAN-2026-002', { status: 'Activo', owner: 'ana', started: '2026-09-01' }),
    }), '--no-git')
    assert.equal(r2.code, 1)
    assert.match(r2.out, /\[regla 18\].*ana/)
  })
  test('zonas de cambio solapadas entre dos personas avisan sin fallar (19)', () => {
    const r = run('rem-doctor.mjs', hub({
      'megaplanes/planes/PLAN-2026-001-x.md': plan('PLAN-2026-001', { status: 'Activo', owner: 'ana', started: '2026-09-01', touches: '[api:src/orders]' }),
      'megaplanes/planes/PLAN-2026-002-y.md': plan('PLAN-2026-002', { status: 'Activo', owner: 'luis', started: '2026-09-01', touches: '[api:src/orders/refunds]' }),
    }), '--no-git')
    assert.equal(r.code, 0, r.out)
    assert.match(r.out, /\[regla 19\]/)
  })
  test('type que no corresponde a la carpeta (1)', () => {
    const r = run('rem-doctor.mjs', hub({ 'decision-notes/2026-09-01-x.md': adr('ADR-0001') }), '--no-git')
    assert.equal(r.code, 1)
    assert.match(r.out, /\[regla 1\].*no corresponde a la carpeta/)
  })
  test('referencia a un documento que no existe (6)', () => {
    const r = run('rem-doctor.mjs', hub({ 'architecture-decisions/ADR-0001-a.md': adr('ADR-0001', { related: '[INC-2026-009]' }) }), '--no-git')
    assert.equal(r.code, 1)
    assert.match(r.out, /\[regla 6\]/)
  })
  test('tabla de planes escrita a mano que miente (25)', () => {
    const text = fm({ id: 'MEGA-2026-001', type: 'mega', title: '"M"', date: '2026-09-01', status: 'Activo', owner: 'ana', plans: '[MEGA-2026-001-P1]', related: '[]' }) +
      '\n| Plan | Objetivo | Estado |\n|---|---|---|\n| **P1** | x | Pendiente |\n'
    const r = run('rem-doctor.mjs', hub({
      'megaplanes/MEGA-2026-001-m.md': text,
      'megaplanes/planes/MEGA-2026-001-P1-x.md': plan('MEGA-2026-001-P1', { status: 'Activo', owner: 'ana', started: '2026-09-01' }),
    }), '--no-git')
    assert.match(r.out, /\[regla 25\].*la tabla dice P1 `Pendiente`/)
  })
})

describe('index', () => {
  test('genera la tabla de planes desde el front-matter y --check la valida', () => {
    const root = hub({
      'megaplanes/MEGA-2026-001-m.md': mega(['MEGA-2026-001-P1']),
      'megaplanes/planes/MEGA-2026-001-P1-x.md': plan('MEGA-2026-001-P1', { status: 'Activo', owner: 'ana', started: '2026-09-01' }),
    })
    assert.equal(run('rem-index.mjs', root, '--check').code, 1)
    assert.equal(run('rem-index.mjs', root).code, 0)
    assert.equal(run('rem-index.mjs', root, '--check').code, 0)
    const m = readFileSync(join(root, 'megaplanes', 'MEGA-2026-001-m.md'), 'utf8')
    assert.match(m, /\| \[\*\*P1\*\*\]\(planes\/MEGA-2026-001-P1-x\.md\) \| P \| Activo \| ana \| — \|/)
  })
})

describe('new', () => {
  test('calcula el siguiente correlativo y enlaza el plan con su megaplán', () => {
    const root = hub({
      'architecture-decisions/ADR-0001-a.md': adr(),
      'megaplanes/MEGA-2026-001-m.md': mega([]),
    })
    const a = run('rem-new.mjs', root, 'adr', 'otra-decision', '--no-fetch')
    assert.equal(a.code, 0, a.out)
    assert.match(a.out, /ADR-0002/)
    const p = run('rem-new.mjs', root, 'plan', 'algo', '--mega', 'MEGA-2026-001', '--no-fetch')
    assert.equal(p.code, 0, p.out)
    assert.match(readFileSync(join(root, 'megaplanes', 'MEGA-2026-001-m.md'), 'utf8'), /plans: \[MEGA-2026-001-P1\]/)
    const d = run('rem-doctor.mjs', root, '--no-git')
    assert.doesNotMatch(d.out, /\[regla (1|12|15)\]/, d.out)
  })
  test('nextSequenceId respeta año y ancho', () => {
    assert.equal(nextSequenceId('INC-{YYYY}-{NNN}', ['INC-2026-001', 'INC-2026-007', 'INC-2025-099'], '2026-09-25'), 'INC-2026-008')
    assert.equal(nextSequenceId('ADR-{NNNN}', [], '2026-09-25'), 'ADR-0001')
  })
})

describe('parser', () => {
  test('front-matter en el byte 1, listas inline y detección de listas en bloque', () => {
    const ok = parseFrontMatter('---\nid: X\nrelated: [A, B]\nnothing:\n---\nbody')
    assert.deepEqual(ok.data.related, ['A', 'B'])
    assert.equal(ok.data.nothing, null)
    assert.deepEqual(ok.blockLists, [])
    const block = parseFrontMatter('---\nid: X\nrelated:\n  - A\n---\n')
    assert.deepEqual(block.blockLists, ['related'])
    assert.equal(parseFrontMatter('<!-- c -->\n---\nid: X\n---\n').data, null)
  })
})

describe('hook commit-msg', () => {
  const sh = spawnSync('sh', ['-c', 'true'])
  const skip = sh.error ? 'sh no disponible' : false
  const repo = () => {
    const dir = mkdtempSync(join(tmpdir(), 'rem-git-'))
    temps.push(dir)
    spawnSync('git', ['init', '-q'], { cwd: dir })
    cpSync(join(REM, 'hooks', 'commit-msg'), join(dir, 'commit-msg'))
    return dir
  }
  const check = (dir, msg) => {
    writeFileSync(join(dir, 'MSG'), msg)
    return spawnSync('sh', ['commit-msg', 'MSG'], { cwd: dir, encoding: 'utf8' }).status
  }
  test('rechaza un asunto fuera de formato y exige cuerpo salvo [trivial]', { skip }, () => {
    const dir = repo()
    assert.equal(check(dir, 'arreglos varios\n'), 1)
    assert.equal(check(dir, 'fix(api): algo\n'), 1)
    assert.equal(check(dir, 'fix(api)[trivial]: algo\n'), 0)
    assert.equal(check(dir, 'fix(api): algo\n\nSíntoma y causa.\n'), 0)
  })
  test('con CHANGELOG.md, tocar código sin tocarlo se rechaza', { skip }, () => {
    const dir = repo()
    writeFileSync(join(dir, 'CHANGELOG.md'), '# Changelog\n')
    writeFileSync(join(dir, 'a.ts'), 'export {}\n')
    spawnSync('git', ['add', 'a.ts'], { cwd: dir })
    assert.equal(check(dir, 'fix(api): algo\n\nCuerpo.\n'), 1)
    spawnSync('git', ['add', 'CHANGELOG.md'], { cwd: dir })
    assert.equal(check(dir, 'fix(api): algo\n\nCuerpo.\n'), 0)
  })
  test('la atribución de IA se permite por defecto y se bloquea con la opción', { skip }, () => {
    const dir = repo()
    const msg = 'fix(api): algo\n\nCuerpo.\n\nCo-Authored-By: Claude <noreply@anthropic.com>\n'
    assert.equal(check(dir, msg), 0)
    const hook = readFileSync(join(dir, 'commit-msg'), 'utf8').replace('BLOCK_AI_ATTRIBUTION=0', 'BLOCK_AI_ATTRIBUTION=1')
    writeFileSync(join(dir, 'commit-msg'), hook)
    assert.equal(check(dir, msg), 1)
  })
})
