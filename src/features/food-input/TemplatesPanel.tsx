import { useState } from 'react'
import { useStore, selectTemplates, selectActiveDate } from '../../store'
import type { FoodInputContext } from '../../services/foodInput/FoodInputService'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { MealSlotPicker } from './MealSlotPicker'
import { computeMacros, sumMacros } from '../../domain/calculations'
import { generateId } from '../../utils/id'
import type { MealTemplate, MealSlot, LoggedFood, MealItem, MyMeal } from '../../domain/types'
import styles from './TemplatesPanel.module.css'

// ─── Use-template view ────────────────────────────────────────────────────

interface UseViewProps {
  template: MealTemplate
  activeDate: string
  onLog: (entries: LoggedFood[]) => void
  onSaveAsMeal: (meal: MyMeal) => void
  onBack: () => void
}

function UseView({ template, activeDate, onLog, onSaveAsMeal, onBack }: UseViewProps) {
  // Pre-fill quantities from the stored defaults (quantityG)
  const [quantities, setQuantities] = useState<string[]>(
    template.items.map(item => String(item.quantityG))
  )
  const [slot, setSlot]           = useState<MealSlot>(
    template.items[0]?.mealSlot ?? 'untagged'
  )
  const [savedMsg, setSavedMsg]   = useState(false)
  const [logError, setLogError]   = useState('')

  function setQty(index: number, val: string) {
    setQuantities(prev => prev.map((q, i) => (i === index ? val : q)))
    setLogError('')
  }

  // Compute live macros for one item; returns null if qty is invalid
  function liveMacros(index: number) {
    const q = parseFloat(quantities[index])
    if (!quantities[index].trim() || isNaN(q) || q <= 0) return null
    return computeMacros(template.items[index].foodItem.macros, q)
  }

  // Live total across all items with valid quantities
  const validMacros = template.items
    .map((_, i) => liveMacros(i))
    .filter((m): m is NonNullable<typeof m> => m !== null)

  const totals = validMacros.length > 0
    ? sumMacros(validMacros)
    : null

  function buildEntries(): LoggedFood[] | null {
    const now = new Date().toISOString()
    const entries: LoggedFood[] = []
    for (let i = 0; i < template.items.length; i++) {
      const q = parseFloat(quantities[i])
      if (!quantities[i].trim() || isNaN(q) || q <= 0) continue
      const item = template.items[i]
      entries.push({
        id:        generateId(),
        date:      activeDate,
        foodItem:  item.foodItem,
        quantityG: q,
        macros:    computeMacros(item.foodItem.macros, q),
        mealSlot:  slot,
        loggedAt:  now,
      })
    }
    return entries.length > 0 ? entries : null
  }

  function handleLog() {
    const entries = buildEntries()
    if (!entries) {
      setLogError('Enter at least one ingredient amount')
      return
    }
    onLog(entries)
  }

  function handleSaveAsMeal() {
    const entries = buildEntries()
    if (!entries) {
      setLogError('Enter at least one ingredient amount to save')
      return
    }
    const now = new Date().toISOString()
    const mealItems: MealItem[] = entries.map(e => ({
      id:       generateId(),
      name:     e.foodItem.name,
      calories: e.macros.calories,
      protein:  e.macros.protein,
      carbs:    e.macros.carbs,
      fat:      e.macros.fat,
      amount:   e.quantityG,
      unit:     'g',
    }))
    const meal: MyMeal = {
      id:        generateId(),
      name:      template.name,
      items:     mealItems,
      createdAt: now,
      useCount:  0,
    }
    onSaveAsMeal(meal)
    setSavedMsg(true)
    setTimeout(() => setSavedMsg(false), 2500)
  }

  return (
    <>
      <div className={styles.useScroll}>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          ← Templates
        </button>

        <div className={styles.useHeader}>
          <span className={styles.useTitle}>{template.name}</span>
          <span className={styles.useHint}>Enter amounts to use</span>
        </div>

        {template.items.map((item, i) => {
          const m = liveMacros(i)
          return (
            <div key={`${item.foodItem.id}-${i}`} className={styles.ingredientRow}>
              <span className={styles.ingredientName}>{item.foodItem.name}</span>
              <div className={styles.ingredientInputRow}>
                <Input
                  label="Amount"
                  value={quantities[i]}
                  onChange={e => setQty(i, e.target.value)}
                  inputMode="decimal"
                  pattern="[0-9.]*"
                  rightElement={<span>g</span>}
                />
              </div>
              {m && (
                <span className={styles.ingredientMacros}>
                  {m.calories} kcal · {m.protein}g P · {m.carbs}g C · {m.fat}g F
                </span>
              )}
            </div>
          )
        })}

        {totals && (
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total</span>
            <span className={styles.totalMacros}>
              {totals.calories} kcal · {totals.protein}g P · {totals.carbs}g C · {totals.fat}g F
            </span>
          </div>
        )}

        <MealSlotPicker value={slot} onChange={setSlot} />

        {logError && <p className={styles.logError}>{logError}</p>}

        {savedMsg && (
          <p className={styles.savedMsg}>✓ Saved to My Meals</p>
        )}
      </div>

      <div className={styles.useFooter}>
        <Button variant="primary" size="lg" full onClick={handleLog}>
          Log Meal
        </Button>
        <Button variant="ghost" size="lg" full onClick={handleSaveAsMeal}>
          Save as My Meal
        </Button>
      </div>
    </>
  )
}

// ─── List view ─────────────────────────────────────────────────────────────

export function TemplatesPanel({ onCancel }: FoodInputContext) {
  const templates      = useStore(selectTemplates)
  const deleteTemplate = useStore(s => s.deleteTemplate)
  const addLogEntry    = useStore(s => s.addLogEntry)
  const saveMyMeal     = useStore(s => s.saveMyMeal)
  const activeDate     = useStore(selectActiveDate)

  const [active, setActive] = useState<MealTemplate | null>(null)

  function handleLog(entries: LoggedFood[]) {
    for (const entry of entries) addLogEntry(entry)
    onCancel()
  }

  function handleSaveAsMeal(meal: MyMeal) {
    saveMyMeal(meal)
  }

  if (active) {
    return (
      <UseView
        template={active}
        activeDate={activeDate}
        onLog={handleLog}
        onSaveAsMeal={handleSaveAsMeal}
        onBack={() => setActive(null)}
      />
    )
  }

  if (templates.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>No templates yet</p>
        <p className={styles.emptyNote}>
          Open the Log tab, tap "Save template", select entries, and name it.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.panel}>
      {templates.map((tmpl) => {
        const defaultKcal = Math.round(
          tmpl.items.reduce(
            (sum, item) => sum + (item.foodItem.macros.calories * item.quantityG) / 100,
            0
          )
        )
        return (
          <div key={tmpl.id} className={styles.row}>
            <button
              className={styles.tapArea}
              onClick={() => setActive(tmpl)}
              type="button"
            >
              <span className={styles.name}>{tmpl.name}</span>
              <span className={styles.meta}>
                {tmpl.items.length} item{tmpl.items.length !== 1 ? 's' : ''}
                {' · '}
                {defaultKcal} kcal default
              </span>
              <span className={styles.metaHint}>Tap to set amounts</span>
            </button>
            <button
              className={styles.deleteBtn}
              onClick={() => deleteTemplate(tmpl.id)}
              aria-label={`Delete ${tmpl.name}`}
              type="button"
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}
