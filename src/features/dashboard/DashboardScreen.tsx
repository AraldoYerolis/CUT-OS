import { useMemo } from 'react'
import { Screen } from '../../components/layout/Screen'
import { MacroBar } from '../../components/ui/MacroBar'
import { useStore, selectTargets, selectActiveDate } from '../../store'
import { sumMacros, remainingMacros, macroProgress } from '../../domain/calculations'
import { formatCalories } from '../../utils/format'
import type { LoggedFood } from '../../domain/types'
import styles from './DashboardScreen.module.css'

// Stable empty array — avoids new reference on every render when no logs exist
const NO_LOGS: LoggedFood[] = []

export function DashboardScreen() {
  const activeDate = useStore(selectActiveDate)
  const targets = useStore(selectTargets)
  const dailyLogs = useStore((s) => s.logs[activeDate] ?? NO_LOGS)

  const consumed = useMemo(
    () => sumMacros(dailyLogs.map((l) => l.macros)),
    [dailyLogs]
  )

  const remaining = useMemo(
    () => remainingMacros(targets, consumed),
    [targets, consumed]
  )

  const calProgress = macroProgress(consumed.calories, targets.calories)
  const calFillPct = Math.min(calProgress / 1.2, 1) * 100
  const calOver = consumed.calories > targets.calories
  const isEmpty = dailyLogs.length === 0

  return (
    <Screen>
      <div className={styles.container}>

        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>Today</h1>
        </header>

        {/* Calorie hero card */}
        <div className={styles.calorieCard}>
          <div className={styles.calorieHero}>
            <span className={[styles.calorieNumber, calOver ? styles.calorieNumberOver : ''].filter(Boolean).join(' ')}>
              {calOver ? '+' : ''}{formatCalories(Math.abs(remaining.calories))}
            </span>
            <span className={styles.calorieSubLabel}>
              {calOver ? 'kcal over target' : 'kcal remaining'}
            </span>
          </div>

          <div className={styles.calorieTrack}>
            <div
              className={[styles.calorieFill, calOver ? styles.calorieFillOver : ''].filter(Boolean).join(' ')}
              style={{ width: `${calFillPct}%` }}
            />
          </div>

          <div className={styles.calorieFooter}>
            <span>{formatCalories(consumed.calories)} consumed</span>
            <span>{formatCalories(targets.calories)} target</span>
          </div>
        </div>

        {/* Macro bars */}
        <div className={styles.macroCard}>
          <MacroBar
            label="Protein"
            consumed={consumed.protein}
            target={targets.protein}
            unit="g"
            color="var(--color-protein)"
          />
          <MacroBar
            label="Carbs"
            consumed={consumed.carbs}
            target={targets.carbs}
            unit="g"
            color="var(--color-carbs)"
          />
          <MacroBar
            label="Fat"
            consumed={consumed.fat}
            target={targets.fat}
            unit="g"
            color="var(--color-fat)"
          />
        </div>

        {/* Empty state */}
        {isEmpty && (
          <div className={styles.empty}>
            <div className={styles.emptyIconRing}>
              <span className={styles.emptyPlus}>+</span>
            </div>
            <p className={styles.emptyTitle}>Nothing logged yet</p>
            <p className={styles.emptyHint}>Tap + below to add food</p>
          </div>
        )}

      </div>
    </Screen>
  )
}
