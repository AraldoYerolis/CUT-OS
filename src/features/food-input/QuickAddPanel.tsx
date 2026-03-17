import { useMemo, useState } from 'react'
import { useStore, selectActiveDate } from '../../store'
import type { FoodInputContext } from '../../services/foodInput/FoodInputService'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { MealSlotPicker } from './MealSlotPicker'
import { generateId } from '../../utils/id'
import { toDateKey } from '../../utils/date'
import { MEAL_SLOT_LABELS } from '../../domain/constants'
import { searchFoods, type SearchableFood } from '../../domain/searchFoods'
import type { FoodItem, LoggedFood, MealSlot } from '../../domain/types'
import styles from './QuickAddPanel.module.css'

// ─── Recent log-event helpers ─────────────────────────────────────────────

interface RecentEvent {
  loggedAt:  string
  date:      string
  entries:   LoggedFood[]
  totalKcal: number
}

function buildRecentEvents(
  logs: Record<string, LoggedFood[]>,
  limit = 8,
): RecentEvent[] {
  const today     = toDateKey()
  const yesterday = toDateKey(new Date(Date.now() - 86_400_000))

  // Combine entries from today and yesterday only
  const entries: LoggedFood[] = [
    ...(logs[today]     ?? []),
    ...(logs[yesterday] ?? []),
  ]

  // Group by exact loggedAt string (batch ops share a timestamp → one event)
  const groupMap = new Map<string, LoggedFood[]>()
  for (const entry of entries) {
    const grp = groupMap.get(entry.loggedAt) ?? []
    grp.push(entry)
    groupMap.set(entry.loggedAt, grp)
  }

  return Array.from(groupMap.entries())
    .map(([loggedAt, evEntries]) => ({
      loggedAt,
      date:      evEntries[0].date,
      entries:   evEntries,
      totalKcal: evEntries.reduce((s, e) => s + e.macros.calories, 0),
    }))
    .sort((a, b) => b.loggedAt.localeCompare(a.loggedAt))
    .slice(0, limit)
}

// ─── Round to 1 decimal, strip trailing .0 → "31" not "31.0" ─────────────
function roundMacro(v: number): string {
  const r = Math.round(v * 10) / 10
  return r % 1 === 0 ? String(Math.round(r)) : String(r)
}

// ─── Component ────────────────────────────────────────────────────────────

export function QuickAddPanel({ onConfirm, onCancel }: FoodInputContext) {
  const logs       = useStore(s => s.logs)
  const activeDate = useStore(selectActiveDate)
  const addLogEntry = useStore(s => s.addLogEntry)

  // ─── Direct-entry state ──────────────────────────────────────────────
  const [calories, setCalories] = useState('')
  const [protein, setProtein]   = useState('')
  const [carbs, setCarbs]       = useState('')
  const [fat, setFat]           = useState('')
  const [label, setLabel]       = useState('')
  const [slot, setSlot]         = useState<MealSlot>('untagged')
  const [calError, setCalError] = useState('')

  // ─── Search state ────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery]   = useState('')
  const [selectedFood, setSelectedFood] = useState<SearchableFood | null>(null)
  const [quantity, setQuantity]         = useState('')

  // Derived
  const showResults   = searchQuery.length >= 1 && selectedFood === null
  const searchResults = showResults ? searchFoods(searchQuery, 8) : []
  const showRecent    = !searchQuery && selectedFood === null

  // Recent events from today + yesterday
  const recentEvents = useMemo(
    () => buildRecentEvents(logs),
    [logs],
  )

  const today = toDateKey()

  // ─── Search helpers ──────────────────────────────────────────────────

  function scaleAndFill(food: SearchableFood, qty: string) {
    const q = parseFloat(qty)
    if (!qty.trim() || isNaN(q) || q <= 0) return
    const factor = q / food.baseAmount
    setCalories(String(Math.round(food.calories * factor)))
    setProtein(roundMacro(food.protein * factor))
    setCarbs(roundMacro(food.carbs * factor))
    setFat(roundMacro(food.fat * factor))
    setCalError('')
  }

  function applySearchFood(food: SearchableFood) {
    const fullName   = [food.name, food.descriptor].filter(Boolean).join(' — ')
    const defaultQty = String(food.baseAmount)
    setSelectedFood(food)
    setSearchQuery('')
    setQuantity(defaultQty)
    setLabel(fullName)
    scaleAndFill(food, defaultQty)
  }

  function handleQuantityChange(val: string) {
    setQuantity(val)
    if (selectedFood) scaleAndFill(selectedFood, val)
  }

  function clearSearch() {
    setSelectedFood(null)
    setSearchQuery('')
    setQuantity('')
    setCalories('')
    setProtein('')
    setCarbs('')
    setFat('')
    setLabel('')
    setCalError('')
  }

  // ─── Repeat / copy-forward helpers ──────────────────────────────────

  /** Pre-fill the direct-entry form from a single logged entry so the user
   *  can review/adjust the values before submitting. */
  function handleFillFromEntry(entry: LoggedFood) {
    setCalories(String(entry.macros.calories))
    setProtein(String(entry.macros.protein))
    setCarbs(String(entry.macros.carbs))
    setFat(String(entry.macros.fat))
    setLabel(entry.foodItem.name)
    setSlot(entry.mealSlot)
    setSelectedFood(null)
    setSearchQuery('')
    setCalError('')
  }

  /** Instantly re-log a group of entries (one or many) as today's date,
   *  sharing a single new timestamp so they appear as one event in the Log. */
  function handleInstantLog(entries: LoggedFood[]) {
    if (entries.length === 0) return
    const now  = new Date().toISOString()
    const slot = entries[0].mealSlot
    if (entries.length === 1) {
      // Route single-entry repeats through onConfirm so it also adds to Recents
      onConfirm(entries[0].foodItem, entries[0].quantityG, slot)
      return
    }
    // Multi-entry: add each with a shared loggedAt so they group as one event
    for (const entry of entries) {
      addLogEntry({
        ...entry,
        id:       generateId(),
        date:     activeDate,
        loggedAt: now,
      })
    }
    onCancel()
  }

  // ─── Submit ──────────────────────────────────────────────────────────

  function handleSubmit() {
    const now = new Date().toISOString()

    // Search-mode path
    if (selectedFood !== null) {
      const q = parseFloat(quantity)
      if (!quantity.trim() || isNaN(q) || q <= 0) {
        setCalError('Enter an amount')
        return
      }
      setCalError('')
      const factor100 = 100 / selectedFood.baseAmount
      const food: FoodItem = {
        id: generateId(),
        name: label.trim() || selectedFood.name,
        macros: {
          calories: Math.round(selectedFood.calories * factor100),
          protein:  Math.round(selectedFood.protein  * factor100 * 10) / 10,
          carbs:    Math.round(selectedFood.carbs     * factor100 * 10) / 10,
          fat:      Math.round(selectedFood.fat       * factor100 * 10) / 10,
        },
        servingSizeG: selectedFood.baseAmount,
        source: 'search',
        searchFoodId: selectedFood.id,
        createdAt: now,
      }
      onConfirm(food, q, slot)
      return
    }

    // Manual path
    const cal = Math.round(parseFloat(calories))
    if (!calories || isNaN(cal) || cal <= 0) {
      setCalError('Enter a calorie amount')
      return
    }
    setCalError('')

    const food: FoodItem = {
      id: generateId(),
      name: label.trim() || 'Quick Add',
      macros: {
        calories: cal,
        protein: Math.max(0, parseFloat(protein) || 0),
        carbs:   Math.max(0, parseFloat(carbs)   || 0),
        fat:     Math.max(0, parseFloat(fat)      || 0),
      },
      servingSizeG: 100,
      source: 'quickadd',
      createdAt: now,
    }
    onConfirm(food, 100, slot)
  }

  const selectedFoodLabel = selectedFood
    ? [selectedFood.name, selectedFood.descriptor].filter(Boolean).join(' — ')
    : null

  return (
    <>
      <div className={styles.scrollContent}>

        {/* ── Search field ── */}
        <div className={styles.searchWrap}>
          <div className={styles.searchRow}>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search foods…"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                if (selectedFood) setSelectedFood(null)
              }}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            {(searchQuery.length > 0 || selectedFood !== null) && (
              <button
                type="button"
                className={styles.searchClear}
                onClick={clearSearch}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Selected food badge + quantity input */}
          {selectedFood !== null && (
            <>
              <div className={styles.selectedBadge}>
                <span className={styles.selectedBadgeName}>{selectedFoodLabel}</span>
                <span className={styles.selectedBadgeCal}>
                  per {selectedFood.baseAmount}&thinsp;{selectedFood.baseUnit}
                </span>
              </div>
              <Input
                label="Amount"
                value={quantity}
                onChange={e => handleQuantityChange(e.target.value)}
                inputMode="decimal"
                pattern="[0-9.]*"
                error={calError && selectedFood ? calError : undefined}
                rightElement={<span>{selectedFood.baseUnit}</span>}
              />
            </>
          )}

          {/* Live search results */}
          {showResults && (
            <ul className={styles.searchResults} role="listbox">
              {searchResults.length > 0 ? (
                searchResults.map(food => {
                  const displayName = food.descriptor
                    ? <>{food.name} <span className={styles.resultDesc}>{food.descriptor}</span></>
                    : food.name
                  return (
                    <li key={food.id} role="option" aria-selected={false}>
                      <button
                        type="button"
                        className={styles.resultItem}
                        onClick={() => applySearchFood(food)}
                      >
                        <span className={styles.resultName}>{displayName}</span>
                        <span className={styles.resultCal}>{food.calories} kcal</span>
                      </button>
                    </li>
                  )
                })
              ) : (
                <li className={styles.resultEmpty}>No matches for "{searchQuery}"</li>
              )}
            </ul>
          )}
        </div>

        {/* ── Recent entries — copy-forward shortcuts ── */}
        {showRecent && recentEvents.length > 0 && (
          <div className={styles.recentSection}>
            <span className={styles.recentHeader}>Recent</span>
            {recentEvents.map(event => {
              const isSingle  = event.entries.length === 1
              const firstEntry = event.entries[0]
              const dateCtx   = event.date === today ? 'Today' : 'Yesterday'
              const slotLabel = MEAL_SLOT_LABELS[firstEntry.mealSlot]

              return (
                <div key={event.loggedAt} className={styles.recentRow}>
                  {/* Row body: pre-fills form (single) or shows event info */}
                  <button
                    type="button"
                    className={styles.recentRowBody}
                    onClick={() =>
                      isSingle
                        ? handleFillFromEntry(firstEntry)
                        : handleInstantLog(event.entries)
                    }
                  >
                    <span className={styles.recentName}>
                      {isSingle
                        ? firstEntry.foodItem.name
                        : `${event.entries.length}\u2009foods`}
                    </span>
                    <span className={styles.recentMeta}>
                      {isSingle
                        ? `${firstEntry.quantityG}\u2009g · ${slotLabel} · ${dateCtx}`
                        : `${slotLabel} · ${dateCtx}`}
                    </span>
                  </button>

                  {/* "+" button: instant re-log (preserves exact entry/entries) */}
                  <button
                    type="button"
                    className={styles.recentLogBtn}
                    onClick={() => handleInstantLog(event.entries)}
                    aria-label={`Log ${isSingle ? firstEntry.foodItem.name : 'meal'} again`}
                  >
                    +
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Direct-entry fields ── */}
        <Input
          label="Calories"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          inputMode="numeric"
          pattern="[0-9]*"
          error={selectedFood === null ? calError : undefined}
          rightElement={<span>kcal</span>}
        />
        <Input
          label="Protein"
          value={protein}
          onChange={(e) => setProtein(e.target.value)}
          inputMode="decimal"
          placeholder="0"
          rightElement={<span>g</span>}
        />
        <Input
          label="Carbs"
          value={carbs}
          onChange={(e) => setCarbs(e.target.value)}
          inputMode="decimal"
          placeholder="0"
          rightElement={<span>g</span>}
        />
        <Input
          label="Fat"
          value={fat}
          onChange={(e) => setFat(e.target.value)}
          inputMode="decimal"
          placeholder="0"
          rightElement={<span>g</span>}
        />
        <Input
          label="Name (optional)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Afternoon snack"
          autoComplete="off"
        />
        <MealSlotPicker value={slot} onChange={setSlot} />
      </div>

      <div className={styles.footer}>
        <Button variant="primary" size="lg" full onClick={handleSubmit}>
          Quick Log
        </Button>
      </div>
    </>
  )
}
