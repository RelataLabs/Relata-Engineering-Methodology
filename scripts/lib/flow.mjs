// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 RelataLabs

import { ACTIVE_STATES, FINAL_STATES, daysSince, parseDate } from './rem.mjs'

/** Doctor y métricas comparten las mismas fechas; no se imputa trabajo sin evidencia. */
export function planDateIssues(fm, now = new Date()) {
  const issues = []
  const add = (level, message) => issues.push({ level, message })
  for (const field of ['started', 'closed', 'paused']) {
    if (fm[field] === undefined || fm[field] === null || fm[field] === '') continue
    if (!parseDate(fm[field])) add('error', `${field} no es una fecha de calendario YYYY-MM-DD válida`)
    else if (daysSince(fm[field], now) < 0) add('error', `${field} está en el futuro`)
  }
  if (fm.status !== 'Pendiente' && !fm.started) add('warn', `${fm.status} sin started`)
  if (FINAL_STATES.has(fm.status) && !fm.closed) add('warn', `${fm.status} sin closed`)
  if (fm.status === 'Pausado') {
    if (!fm.paused) add('error', 'Pausado sin paused (fecha de la pausa)')
    if (typeof fm.pause_reason !== 'string' || !fm.pause_reason.trim()) add('error', 'Pausado sin pause_reason (motivo)')
  }
  for (const [earlier, later] of [['started', 'closed'], ['started', 'paused'], ['paused', 'closed']]) {
    if (parseDate(fm[earlier]) && parseDate(fm[later]) && fm[later] < fm[earlier]) {
      add('error', `${later} es anterior a ${earlier}`)
    }
  }
  return issues
}

/** Ventana de N fechas UTC, incluido hoy. Los ciclos son históricos y en días calendario. */
export function summarizeFlow(plans, window = 30, now = new Date()) {
  if (!Number.isInteger(window) || window <= 0) throw new Error('--days debe ser un entero positivo')
  const issues = plans.flatMap((p) => planDateIssues(p.fm, now).map((issue) => ({ id: p.fm.id, ...issue })))
  if (issues.length) throw new Error(issues.map((issue) => `${issue.id}: ${issue.message}`).join('\n'))
  const open = plans.filter((p) => !FINAL_STATES.has(p.fm.status))
  const wip = open.filter((p) => parseDate(p.fm.started))
  const active = plans.filter((p) => ACTIVE_STATES.has(p.fm.status))
  const closedIn = (state) => plans.filter((p) => {
    const age = daysSince(p.fm.closed, now)
    return p.fm.status === state && age !== null && age >= 0 && age < window
  }).length
  const cycles = plans.filter((p) => p.fm.status === 'Cerrado')
    .map((p) => daysSince(p.fm.started, parseDate(p.fm.closed)))
    .sort((a, b) => a - b)
  const middle = Math.floor(cycles.length / 2)
  const median = cycles.length ? (cycles.length % 2 ? cycles[middle] : (cycles[middle - 1] + cycles[middle]) / 2) : null
  const p85 = cycles.length ? cycles[Math.ceil(cycles.length * 0.85) - 1] : null
  return { open, wip, active, closed: closedIn('Cerrado'), abandoned: closedIn('Abandonado'), cycles, median, p85 }
}
