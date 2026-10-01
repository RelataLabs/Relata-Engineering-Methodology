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
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { after, describe, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { daysSince, nextSequenceId, parseFrontMatter } from '../scripts/lib/rem.mjs'

const REM = join(dirname(fileURLToPath(import.meta.url)), '..')
const EXAMPLE = join(REM, 'examples', 'hub')
const temps = []
after(() => temps.forEach((t) => {
  const target = resolve(t)
  if (dirname(target) !== resolve(tmpdir()) || !target.startsWith(join(resolve(tmpdir()), 'rem-'))) throw new Error('Temporal fuera del directorio esperado')
  rmSync(target, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 })
}))

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
  config.repos = {}
  config.agentBlock = null
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

// Fechas relativas para que la ventana y los casos futuros sigan siendo pruebas reales.
const day = (offset = 0) => new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10)
const planFile = (id) => `megaplanes/planes/${id}-x.md`
const closedPlan = (id, started, closed, extra = {}) => plan(id, { status: 'Cerrado', owner: 'ana', started, closed, ...extra })

describe('regresiones: fechas y métricas de flujo', () => {
  test('rechaza fechas normalizadas por Date y respeta años bisiestos', () => {
    assert.equal(daysSince('2026-02-30'), null)
    assert.equal(daysSince('2025-02-29'), null)
    assert.equal(daysSince('2024-02-29', new Date('2024-03-01T00:00:00Z')), 1)
    const root = hub({ 'architecture-decisions/ADR-0001-a.md': adr('ADR-0001', { date: '2026-02-30' }) })
    assert.equal(run('rem-doctor.mjs', root, '--no-git').code, 1)
  })
  test('doctor y flow rechazan fecha futura, invertida e inexistente', () => {
    for (const [started, closed, expected] of [[day(-3), day(1), /futuro/], [day(-1), day(-2), /anterior/], ['2026-02-30', day(-1), /calendario/]]) {
      const root = hub({ [planFile('PLAN-2026-001')]: closedPlan('PLAN-2026-001', started, closed) })
      const doctor = run('rem-doctor.mjs', root, '--no-git', '--strict')
      assert.equal(doctor.code, 1, doctor.out)
      assert.match(doctor.out, /\[regla 24\]/)
      assert.match(doctor.out, expected)
      const flow = run('rem-flow.mjs', root)
      assert.equal(flow.code, 1, flow.out)
      assert.match(flow.out, expected)
      assert.doesNotMatch(flow.out, /Throughput/)
    }
  })
  test('flow no oculta planes finalizados sin fechas', () => {
    const root = hub({ [planFile('PLAN-2026-001')]: plan('PLAN-2026-001', { status: 'Cerrado' }) })
    const flow = run('rem-flow.mjs', root)
    assert.equal(flow.code, 1, flow.out)
    assert.match(flow.out, /sin started|sin closed/)
  })
  test('mediana par es el promedio central y no mezcla abandonos con entregas', () => {
    const root = hub({
      [planFile('PLAN-2026-001')]: closedPlan('PLAN-2026-001', day(-3), day(-1)),
      [planFile('PLAN-2026-002')]: closedPlan('PLAN-2026-002', day(-11), day(-1)),
      [planFile('PLAN-2026-003')]: closedPlan('PLAN-2026-003', day(-90), day(-1), { status: 'Abandonado' }),
    })
    const flow = run('rem-flow.mjs', root)
    assert.equal(flow.code, 0, flow.out)
    assert.match(flow.out, /mediana: 6d.*p85: 10d.*n=2/)
    assert.match(flow.out, /2 cerrados \(\+1 abandonados\)/)
  })
  test('ventana UTC incluye hoy y excluye exactamente el día N; valida --days', () => {
    const root = hub({
      [planFile('PLAN-2026-001')]: closedPlan('PLAN-2026-001', day(-1), day()),
      [planFile('PLAN-2026-002')]: closedPlan('PLAN-2026-002', day(-30), day(-29)),
      [planFile('PLAN-2026-003')]: closedPlan('PLAN-2026-003', day(-31), day(-30)),
    })
    assert.match(run('rem-flow.mjs', root, '--days', '30').out, /2 cerrados/)
    assert.match(run('rem-flow.mjs', root, '--days', '1').out, /1 cerrados/)
    for (const value of ['0', '-2', '1.5', 'oops']) assert.equal(run('rem-flow.mjs', root, '--days', value).code, 1)
  })
  test('WIP iniciado incluye pausa y observación; pendiente sin empezar no consume WIP', () => {
    const files = {}
    for (const [index, status] of ['Activo', 'Pausado', 'Desplegado', 'Observando', 'Pendiente'].entries()) {
      const id = `PLAN-2026-00${index + 1}`
      files[planFile(id)] = plan(id, {
        status, owner: 'ana', ...(status === 'Pendiente' ? {} : { started: day(-5) }),
        ...(status === 'Pausado' ? { paused: day(-2), pause_reason: 'Espera de validación' } : {}),
      })
    }
    const root = hub(files)
    const flow = run('rem-flow.mjs', root)
    assert.equal(flow.code, 0, flow.out)
    assert.match(flow.out, /abiertos: 5 · WIP iniciado: 4 · activos\/verificando: 1/)
    assert.match(flow.out, /Pausado.*edad=5d/)
    assert.equal(run('rem-doctor.mjs', root, '--no-git', '--strict').code, 0)
  })
  test('pausa requiere fecha y motivo; reanudar no exige esos campos', () => {
    const id = 'PLAN-2026-001'
    const root = hub({ [planFile(id)]: plan(id, { status: 'Pausado', owner: 'ana', started: day(-5) }) })
    const invalid = run('rem-doctor.mjs', root, '--no-git')
    assert.equal(invalid.code, 1, invalid.out)
    assert.match(invalid.out, /sin paused/)
    assert.match(invalid.out, /sin pause_reason/)
    writeFileSync(join(root, planFile(id)), plan(id, { status: 'Pausado', owner: 'ana', started: day(-5), paused: day(-2), pause_reason: 'Espera externa' }))
    assert.equal(run('rem-doctor.mjs', root, '--no-git', '--strict').code, 0)
    writeFileSync(join(root, planFile(id)), plan(id, { status: 'Activo', owner: 'ana', started: day(-5) }))
    assert.equal(run('rem-doctor.mjs', root, '--no-git', '--strict').code, 0)
  })
})

describe('regresiones: contratos y dependencias', () => {
  test('detecta autociclo y ciclo indirecto, pero permite un diamante acíclico', () => {
    const ids = ['PLAN-2026-001', 'PLAN-2026-002', 'PLAN-2026-003', 'PLAN-2026-004']
    for (const [edges, cyclic] of [
      [[[0], [], [], []], true], [[[1], [2], [0], []], true], [[[1, 2], [3], [3], []], false],
    ]) {
      const files = Object.fromEntries(ids.map((id, i) => [planFile(id), plan(id, { depends_on: `[${edges[i].map((n) => ids[n]).join(', ')}]` })]))
      const result = run('rem-doctor.mjs', hub(files), '--no-git', '--strict')
      assert.equal(result.code, cyclic ? 1 : 0, result.out)
      if (cyclic) assert.match(result.out, /\[regla 6b\].*ciclo/)
    }
  })
  test('dependencia abandonada no satisface una entrega; eliminarla con decisión permite continuar', () => {
    const id = 'PLAN-2026-002'
    const root = hub({
      [planFile('PLAN-2026-001')]: closedPlan('PLAN-2026-001', day(-5), day(-3), { status: 'Abandonado' }),
      [planFile(id)]: closedPlan(id, day(-2), day(-1), { depends_on: '[PLAN-2026-001]' }),
    })
    const result = run('rem-doctor.mjs', root, '--no-git')
    assert.equal(result.code, 1, result.out)
    assert.match(result.out, /\[regla 20\].*Abandonado/)
    writeFileSync(join(root, planFile(id)), closedPlan(id, day(-2), day(-1)) + '\nDecisión: se retiró la dependencia; el contrato se cubrió por otra vía.\n')
    assert.equal(run('rem-doctor.mjs', root, '--no-git', '--strict').code, 0)
  })
  test('contrato desplegado u observado se puede consumir; dependencia activa avisa', () => {
    for (const status of ['Activo', 'Desplegado', 'Observando', 'Cerrado']) {
      const root = hub({
        [planFile('PLAN-2026-001')]: plan('PLAN-2026-001', {
          status, owner: 'ana', started: day(-5), ...(status === 'Cerrado' ? { closed: day(-3) } : {}),
        }),
        [planFile('PLAN-2026-002')]: closedPlan('PLAN-2026-002', day(-2), day(-1), { depends_on: '[PLAN-2026-001]' }),
      })
      const result = run('rem-doctor.mjs', root, '--no-git', '--strict')
      assert.equal(result.code, status === 'Activo' ? 1 : 0, result.out)
      if (status === 'Activo') assert.match(result.out, /\[regla 20\]/)
    }
  })
  test('IDs de megaplán configurados conservan referencias bidireccionales', () => {
    const megaId = 'MEGA-PMU-001'
    const id = `${megaId}-P1`
    const root = hub({
      [`megaplanes/${megaId}-x.md`]: mega([id], { id: megaId }),
      [planFile(id)]: plan(id),
    }, (c) => {
      c.types.mega.idPattern = '^MEGA-PMU-\\d{3}$'
      c.types.plan.idPattern = '^MEGA-PMU-\\d{3}-P\\d+$'
      return c
    })
    assert.equal(run('rem-doctor.mjs', root, '--no-git', '--strict').code, 0)
    const status = run('rem-status.mjs', root, megaId)
    assert.match(status.out, /MEGA-PMU-001/)
    assert.doesNotMatch(status.out, /Atención activa por persona/, 'se aplicó el filtro de megaplán personalizado')
    writeFileSync(join(root, planFile(id)), plan(id, { megaplan: 'null' }))
    assert.match(run('rem-doctor.mjs', root, '--no-git').out, /\[regla 12\]/)
  })
})

function fixtureGit(root, ...args) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
  return result.stdout
}
function stagedHub(tweak = (c) => c) {
  const root = hub({ 'architecture-decisions/ADR-0001-a.md': adr() }, (c) => {
    c.generated.index = 'ci'
    c.repos = {}
    c.agentBlock = null
    return tweak(c)
  })
  cpSync(join(REM, 'scripts'), join(root, 'scripts'), { recursive: true })
  fixtureGit(root, 'init', '-q')
  fixtureGit(root, 'add', '--all')
  return root
}
function unchangedAfterHook(root, expected) {
  const before = [readFileSync(join(root, '.git', 'index')), fixtureGit(root, 'diff', '--binary'), fixtureGit(root, 'diff', '--cached', '--binary')]
  const temporaries = readdirSync(tmpdir()).filter((name) => name.startsWith('rem-staged-')).sort()
  const result = run('rem-precommit.mjs', root)
  assert.equal(result.code, expected, result.out)
  assert.deepEqual(readFileSync(join(root, '.git', 'index')), before[0], 'el índice cambió')
  assert.equal(fixtureGit(root, 'diff', '--binary'), before[1], 'el working tree cambió')
  assert.equal(fixtureGit(root, 'diff', '--cached', '--binary'), before[2], 'el staging cambió')
  assert.deepEqual(readdirSync(tmpdir()).filter((name) => name.startsWith('rem-staged-')).sort(), temporaries, 'snapshot sin limpiar')
  return result
}

describe('regresiones: pre-commit valida exactamente el índice', () => {
  test('rechaza documento staged inválido aunque el working tree lo corrija, y no ejecuta scripts staged', () => {
    const root = stagedHub()
    const file = 'architecture-decisions/ADR-0001-a.md'
    writeFileSync(join(root, file), '# Sin frontmatter\n')
    mkdirSync(join(root, 'scripts'), { recursive: true })
    writeFileSync(join(root, 'scripts', 'rem-doctor.mjs'), 'process.exit(0)\n')
    fixtureGit(root, 'add', '--all')
    writeFileSync(join(root, file), adr())
    assert.match(unchangedAfterHook(root, 1).out, /sin front-matter/)
  })
  test('acepta staged válido aunque haya documento y config inválidos sin stage', () => {
    const root = stagedHub()
    writeFileSync(join(root, 'architecture-decisions', 'ADR-0001-a.md'), '# En edición\n')
    writeFileSync(join(root, 'architecture-decisions', 'ADR-0002-untracked.md'), '# Borrador no preparado\n')
    writeFileSync(join(root, 'rem.config.json'), '{invalid')
    unchangedAfterHook(root, 0)
  })
  test('config staged inválido no puede ocultarse con una corrección sin stage', () => {
    const root = stagedHub()
    const config = readFileSync(join(root, 'rem.config.json'), 'utf8')
    writeFileSync(join(root, 'rem.config.json'), '{invalid')
    fixtureGit(root, 'add', '--', 'rem.config.json')
    writeFileSync(join(root, 'rem.config.json'), config)
    assert.match(unchangedAfterHook(root, 1).out, /configuración REM válida en el índice/)
  })
  test('falta de config staged y archivo interno sin stage no se rescatan del working tree', () => {
    const root = stagedHub()
    cpSync(join(root, 'rem.config.json'), join(root, 'rem.config.example.json'))
    fixtureGit(root, 'add', '--', 'rem.config.example.json')
    fixtureGit(root, 'rm', '--cached', '--', 'rem.config.json')
    assert.match(unchangedAfterHook(root, 1).out, /falta rem.config.json en el índice/)
    fixtureGit(root, 'add', '--', 'rem.config.json')
    writeFileSync(join(root, 'architecture-decisions', 'ADR-0001-a.md'), adr() + '\n[pendiente](../solo local.txt)\n[enlace](../solo%20local.txt)\n')
    fixtureGit(root, 'add', '--', 'architecture-decisions/ADR-0001-a.md')
    writeFileSync(join(root, 'solo local.txt'), 'No está en el commit\n')
    assert.match(unchangedAfterHook(root, 1).out, /enlace roto/)
    fixtureGit(root, 'add', '--', 'solo local.txt')
    unchangedAfterHook(root, 0)
  })
  test('escritor local comprueba vistas y nunca autostagea su regeneración', () => {
    const root = stagedHub((c) => { c.generated.index = 'local'; return c })
    assert.match(unchangedAfterHook(root, 1).out, /Regenera/)
    assert.equal(run('rem-index.mjs', root).code, 0)
    unchangedAfterHook(root, 1) // Todavía no se preparó la vista generada.
    fixtureGit(root, 'add', '--all')
    unchangedAfterHook(root, 0)
  })
  test('rutas de documentos absolutas internas se remapean; externas se rechazan', () => {
    const root = stagedHub()
    const config = JSON.parse(readFileSync(join(root, 'rem.config.json'), 'utf8'))
    config.types.adr.dir = join(root, 'architecture-decisions')
    writeFileSync(join(root, 'rem.config.json'), JSON.stringify(config))
    fixtureGit(root, 'add', '--all')
    unchangedAfterHook(root, 0)
    config.types.adr.dir = dirname(root)
    writeFileSync(join(root, 'rem.config.json'), JSON.stringify(config))
    fixtureGit(root, 'add', '--all')
    assert.match(unchangedAfterHook(root, 1).out, /fuera del hub/)
  })
  test('enlaces externos relativos mantienen contexto; absolutos internos siguen exigiendo stage', () => {
    const root = stagedHub()
    const external = hub()
    const link = relative(root, join(external, 'README.md')).replaceAll('\\', '/')
    const inside = join(root, 'interno.txt')
    writeFileSync(inside, 'Contenido local\n')
    writeFileSync(join(root, 'architecture-decisions', 'ADR-0001-a.md'), adr() + `\n[externo](../${link})\n[interno](${inside.replaceAll('\\', '/')})\n`)
    fixtureGit(root, 'add', '--all')
    unchangedAfterHook(root, 0)
    fixtureGit(root, 'rm', '--cached', '--', 'interno.txt')
    assert.match(unchangedAfterHook(root, 1).out, /enlace roto.*interno/)
  })
  test('nombres con espacios y saltos de línea se leen sin interpretar comandos', () => {
    const root = stagedHub()
    const names = ['archivo con espacios.txt', ...(process.platform === 'win32' ? [] : ['archivo\npartido.txt'])]
    for (const name of names) writeFileSync(join(root, name), 'Contenido\n')
    fixtureGit(root, 'add', '--all')
    unchangedAfterHook(root, 0)
  })
})

describe('regresiones: avisos semanales', () => {
  const sh = spawnSync('sh', ['-c', 'true'])
  const skip = sh.error ? 'sh no disponible' : false
  test('el bloque real de CI falla por avisos en schedule y no bloquea push por ellos', { skip }, () => {
    const root = hub({ 'architecture-decisions/ADR-0001-a.md': adr('ADR-0001', { status: 'Proposed', date: day(-30) }) }, (c) => {
      c.repos = {}; c.agentBlock = null; return c
    })
    cpSync(join(REM, 'scripts'), join(root, 'scripts'), { recursive: true })
    const workflow = readFileSync(join(REM, 'templates', 'ci', 'rem.yml'), 'utf8')
    const block = /id: doctor\r?\n\s+run: \|\r?\n([\s\S]*?)(?=\r?\n      - name:)/.exec(workflow)?.[1]
    assert.ok(block, 'bloque ejecutable del doctor en CI')
    const script = block.split(/\r?\n/).map((line) => line.replace(/^          /, '')).join('\n')
    for (const [event, code] of [['push', 0], ['schedule', 1]]) {
      const result = spawnSync('sh', ['-c', script], { cwd: root, encoding: 'utf8', env: { ...process.env, GITHUB_EVENT_NAME: event, GITHUB_OUTPUT: join(root, 'outputs.txt') } })
      assert.equal(result.status, code, result.stdout + result.stderr)
      assert.match(readFileSync(join(root, 'doctor.txt'), 'utf8'), /\[regla 2\]/)
    }
    assert.doesNotMatch(workflow, /\$\{\{ steps\.doctor\.outputs\.report \}\}/, 'el informe se trata como datos, no como código JS')
  })
})
