import { useMemo, useState } from 'react'
import { useStore, selectActiveDate, selectTargets } from '../../store'
import { Screen } from '../../components/layout/Screen'
import { Header } from '../../components/layout/Header'
import { EmptyState } from '../../components/ui/EmptyState'
import { EditEntrySheet } from './EditEntrySheet'
import { SaveTemplateSheet } from './SaveTemplateSheet'
import { sumMacros } from '../../domain/calculations'
import { formatCalories } from '../../utils/format'
import { MEAL_SLOTS, MEAL_SLOT_LABELS } from '../../domain/constants'
import type { LoggedFood, MealSlot } from '../../domain/types'
import styles from './LogScreen.module.css'

const NO_LOGS: LoggedFood[] = []

export function LogScreen() {
  const activeDate = useStore(selectActiveDate)
  const targets = useStore(selectTargets)
  const dailyLogs = useStore((s) => s.logs[activeDate] ?? NO_LOGS)
  const [selectedEntry, setSelectedEntry] = useState<LoggedFood | null>(null)
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false)

  const totals = useMemo(
    () => sumMacros(dailyLogs.map((l) => l.macros)),
    [dailyLogs]
  )

  const grouped = useMemo(() => {
    const result: Partial<Record<MealSlot, LoggedFood[]>> = {}
    for (const entry of dailyLogs) {
      if (!result[entry.mealSlot]) result[entry.mealSlot] = []
      result[entry.mealSlot]!.push(entry)
    }
    return result
  }, [dailyLogs])

  const filledSlots = MEAL_SLOTS.filter((s) => (grouped[s]?.length ?? 0) > 0)
  const isEmpty = dailyLogs.length === 0

  const saveTemplateBtn = !isEmpty ? (
    <button className={styles.saveTemplateBtn} onClick={() => setSaveTemplateOpen(true)} type="button">
      Save template
    </button>
  ) : undefined

  return (
    <Screen>
      <Header title="Log" right={saveTemplateBtn} />

      {isEmpty ? (
        <EmptyState
          icon="≡"
          title="Nothing logged yet"
          message="Tap + to log your first food for today."
        />
      ) : (
        <div className={styles.container}>

          {/* Daily totals summary */}
          <div className={styles.summary}>
            <div className={styles.summaryCalRow}>
              <span className={styles.summaryCalValue}>
                {formatCalories(totals.calories)}
              </span>
              <span className={styles.summaryCalLabel}>
                / {formatCalories(targets.calories)} kcal
              </span>
            </div>
            <div className={styles.summaryMacros}>
              <span>P {Math.round(totals.protein)}g</span>
              <span className={styles.macroDot}>·</span>
              <span>C {Math.round(totals.carbs)}g</span>
              <span className={styles.macroDot}>·</span>
              <span>F {Math.round(totals.fat)}g</span>
            </div>
          </div>

          {/* Meal slot groups */}
          {filledSlots.map((slot) => {
            const entries = grouped[slot]!
            const slotTotal = sumMacros(entries.map((e) => e.macros))
            return (
              <div key={slot} className={styles.slotGroup}>
                <div className={styles.slotHeader}>
                  <h2 className={styles.slotTitle}>{MEAL_SLOT_LABELS[slot]}</h2>
                  <span className={styles.slotCalories}>
                    {formatCalories(slotTotal.calories)} kcal
                  </span>
                </div>

                {entries.map((entry) => (
                  <button
                    key={entry.id}
                    className={styles.entryRow}
                    onClick={() => setSelectedEntry(entry)}
                    type="button"
                  >
                    <div className={styles.entryLeft}>
                      <span className={styles.entryName}>{entry.foodItem.name}</span>
                      <span className={styles.entryMacros}>
                        P {Math.round(entry.macros.protein)}
                        {' · '}C {Math.round(entry.macros.carbs)}
                        {' · '}F {Math.round(entry.macros.fat)}g
                      </span>
                    </div>
                    <div className={styles.entryRight}>
                      <span className={styles.entryCalories}>
                        {formatCalories(entry.macros.calories)}
                      </span>
                      <span className={styles.entryUnit}>kcal</span>
                    </div>
                  </button>
                ))}
              </div>
            )
          })}

        </div>
      )}

      <EditEntrySheet
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />

      <SaveTemplateSheet
        entries={dailyLogs}
        isOpen={saveTemplateOpen}
        onClose={() => setSaveTemplateOpen(false)}
      />
    </Screen>
  )
}
