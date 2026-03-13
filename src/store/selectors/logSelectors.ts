import { sumMacros, remainingMacros } from '../../domain/calculations'
import { DEFAULT_TARGETS } from '../../domain/constants'
import type { AppStore } from '../index'

/** Total macros consumed for a given date */
export function selectDailyTotals(date: string) {
  return (s: AppStore) => {
    const entries = s.logs[date] ?? []
    return sumMacros(entries.map((e) => e.macros))
  }
}

/** Remaining macros for a given date vs targets */
export function selectDailyRemaining(date: string) {
  return (s: AppStore) => {
    const targets = s.user?.targets ?? DEFAULT_TARGETS
    const entries = s.logs[date] ?? []
    const consumed = sumMacros(entries.map((e) => e.macros))
    return remainingMacros(targets, consumed)
  }
}
