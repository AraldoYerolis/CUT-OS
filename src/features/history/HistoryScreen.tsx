import { useMemo } from 'react'
import { useStore, selectTargets } from '../../store'
import { Screen } from '../../components/layout/Screen'
import { Header } from '../../components/layout/Header'
import { EmptyState } from '../../components/ui/EmptyState'
import { sumMacros } from '../../domain/calculations'
import { formatCalories } from '../../utils/format'
import { dateLabel } from '../../utils/date'
import type { MacroSnapshot } from '../../domain/types'
import styles from './HistoryScreen.module.css'

interface DaySummary {
  date:       string
  totals:     MacroSnapshot
  entryCount: number
}

// ─── Component ────────────────────────────────────────────────────────────

export function HistoryScreen() {
  const logs    = useStore(s => s.logs)
  const targets = useStore(selectTargets)

  const days: DaySummary[] = useMemo(() =>
    Object.entries(logs)
      .filter(([, entries]) => entries.length > 0)
      .map(([date, entries]) => ({
        date,
        totals:     sumMacros(entries.map(e => e.macros)),
        entryCount: entries.length,
      }))
      .sort((a, b) => b.date.localeCompare(a.date)),
    [logs]
  )

  if (days.length === 0) {
    return (
      <Screen>
        <Header title="History" />
        <EmptyState
          icon="□"
          title="No history yet"
          message="Your daily summaries will appear here after you start logging."
        />
      </Screen>
    )
  }

  return (
    <Screen>
      <Header title="History" />
      <div className={styles.list}>
        {days.map(({ date, totals, entryCount }) => {
          const calPercent = Math.min(1, totals.calories / targets.calories)
          return (
            <div key={date} className={styles.dayCard}>
              <div className={styles.dayCardTop}>
                <span className={styles.dayCardLabel}>{dateLabel(date)}</span>
                <span className={styles.dayCardKcal}>
                  {formatCalories(totals.calories)}
                  <span className={styles.dayCardKcalTarget}>
                    {' '}/ {formatCalories(targets.calories)} kcal
                  </span>
                </span>
              </div>

              {/* Calorie progress bar */}
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${calPercent * 100}%` }}
                />
              </div>

              <div className={styles.dayCardMacros}>
                <span>P <span className={styles.macroVal}>{Math.round(totals.protein)}g</span></span>
                <span className={styles.macroDot}>·</span>
                <span>C <span className={styles.macroVal}>{Math.round(totals.carbs)}g</span></span>
                <span className={styles.macroDot}>·</span>
                <span>F <span className={styles.macroVal}>{Math.round(totals.fat)}g</span></span>
                <span className={styles.macroDot}>·</span>
                <span className={styles.entryCount}>
                  {entryCount} item{entryCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </Screen>
  )
}
