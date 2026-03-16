import { useMemo, useState } from 'react'
import { useStore, selectActiveDate } from '../../store'
import { Screen } from '../../components/layout/Screen'
import { Header } from '../../components/layout/Header'
import { EmptyState } from '../../components/ui/EmptyState'
import { EditEntrySheet } from './EditEntrySheet'
import { SaveTemplateSheet } from './SaveTemplateSheet'
import { sumMacros } from '../../domain/calculations'
import { formatCalories } from '../../utils/format'
import { toDateKey, fromDateKey } from '../../utils/date'
import { MEAL_SLOT_LABELS } from '../../domain/constants'
import type { LoggedFood, MacroSnapshot, MealSlot } from '../../domain/types'
import styles from './LogScreen.module.css'

// ─── Helpers ──────────────────────────────────────────────────────────────

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function fmtDayLabel(dateKey: string): string {
  const today    = toDateKey()
  const yesterday = toDateKey(new Date(Date.now() - 86_400_000))
  if (dateKey === today)     return 'Today'
  if (dateKey === yesterday) return 'Yesterday'
  const d = fromDateKey(dateKey)
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month:   'short',
    day:     'numeric',
  })
}

// ─── Event grouping ───────────────────────────────────────────────────────

interface LogEvent {
  loggedAt: string       // group key — exact ISO string shared by batch entries
  entries:  LoggedFood[]
  totals:   MacroSnapshot
  mealSlot: MealSlot
}

function buildEvents(entries: LoggedFood[]): LogEvent[] {
  // Group by exact loggedAt string.
  // Batch operations (My Meal, Template) share the same timestamp; single
  // entries get unique timestamps — so each grouping is a natural log event.
  const groupMap = new Map<string, LoggedFood[]>()
  for (const entry of entries) {
    const grp = groupMap.get(entry.loggedAt) ?? []
    grp.push(entry)
    groupMap.set(entry.loggedAt, grp)
  }
  return Array.from(groupMap.entries())
    .map(([loggedAt, evEntries]) => ({
      loggedAt,
      entries:  evEntries,
      totals:   sumMacros(evEntries.map(e => e.macros)),
      mealSlot: evEntries[0].mealSlot,
    }))
    .sort((a, b) => b.loggedAt.localeCompare(a.loggedAt)) // newest first
}

// ─── Component ────────────────────────────────────────────────────────────

const NO_ENTRIES: LoggedFood[] = []

export function LogScreen() {
  const logs        = useStore(s => s.logs)
  const activeDate  = useStore(selectActiveDate)

  const [selectedEntry,    setSelectedEntry]    = useState<LoggedFood | null>(null)
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false)
  const [expandedEvents,   setExpandedEvents]   = useState<Set<string>>(new Set())

  // Today's entries (for SaveTemplateSheet — always keyed to the current day)
  const todayEntries = logs[activeDate] ?? NO_ENTRIES

  // All dates that have at least one logged entry, sorted newest → oldest
  const sortedDates = useMemo(() =>
    Object.entries(logs)
      .filter(([, entries]) => entries.length > 0)
      .map(([date]) => date)
      .sort((a, b) => b.localeCompare(a)),
    [logs]
  )

  function toggleEvent(key: string) {
    setExpandedEvents(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const saveTemplateBtn = todayEntries.length > 0 ? (
    <button
      className={styles.saveTemplateBtn}
      onClick={() => setSaveTemplateOpen(true)}
      type="button"
    >
      Save template
    </button>
  ) : undefined

  return (
    <Screen>
      <Header title="Log" right={saveTemplateBtn} />

      {sortedDates.length === 0 ? (
        <EmptyState
          icon="≡"
          title="Nothing logged yet"
          message="Tap + to log your first food for today."
        />
      ) : (
        <div className={styles.container}>
          {sortedDates.map(dateKey => {
            const events = buildEvents(logs[dateKey] ?? NO_ENTRIES)
            return (
              <div key={dateKey} className={styles.daySection}>

                {/* ── Day header ── */}
                <div className={styles.dayHeader}>
                  <span className={styles.dayLabel}>{fmtDayLabel(dateKey)}</span>
                </div>

                {/* ── Log events ── */}
                {events.map(event => {
                  const isExpanded = expandedEvents.has(event.loggedAt)
                  return (
                    <div key={event.loggedAt} className={styles.eventCard}>

                      {/* Collapsed header — always visible, click to expand */}
                      <button
                        type="button"
                        className={styles.eventHeader}
                        onClick={() => toggleEvent(event.loggedAt)}
                        aria-expanded={isExpanded}
                      >
                        <div className={styles.eventTop}>
                          <span className={styles.eventTime}>{fmtTime(event.loggedAt)}</span>
                          <span className={styles.eventDot} aria-hidden>·</span>
                          <span className={styles.eventSlot}>
                            {MEAL_SLOT_LABELS[event.mealSlot]}
                          </span>
                          <span className={styles.eventSpacer} />
                          <span className={styles.eventKcal}>
                            {formatCalories(event.totals.calories)} kcal
                          </span>
                          <span className={styles.eventChevron} aria-hidden>
                            {isExpanded ? '▾' : '▸'}
                          </span>
                        </div>
                        <div className={styles.eventMacros}>
                          P {Math.round(event.totals.protein)}
                          {' · '}C {Math.round(event.totals.carbs)}
                          {' · '}F {Math.round(event.totals.fat)}g
                        </div>
                      </button>

                      {/* Expanded item list */}
                      {isExpanded && (
                        <div className={styles.eventItems}>
                          {event.entries.map(entry => (
                            <button
                              key={entry.id}
                              type="button"
                              className={styles.itemRow}
                              onClick={() => setSelectedEntry(entry)}
                            >
                              <div className={styles.itemLeft}>
                                <span className={styles.itemName}>
                                  {entry.foodItem.name}
                                </span>
                                <span className={styles.itemMacros}>
                                  {entry.quantityG}g
                                  {' · '}P {Math.round(entry.macros.protein)}
                                  {' · '}C {Math.round(entry.macros.carbs)}
                                  {' · '}F {Math.round(entry.macros.fat)}g
                                </span>
                              </div>
                              <div className={styles.itemRight}>
                                <span className={styles.itemCalories}>
                                  {formatCalories(entry.macros.calories)}
                                </span>
                                <span className={styles.entryUnit}>kcal</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
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
        entries={todayEntries}
        isOpen={saveTemplateOpen}
        onClose={() => setSaveTemplateOpen(false)}
      />
    </Screen>
  )
}
