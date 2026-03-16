import { useState } from 'react'
import { useStore, selectTemplates, selectActiveDate } from '../../store'
import type { FoodInputContext } from '../../services/foodInput/FoodInputService'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { MealSlotPicker } from './MealSlotPicker'
import { computeMacros, sumMacros } from '../../domain/calculations'
import { searchFoods, type SearchableFood } from '../../domain/searchFoods'
import { generateId } from '../../utils/id'
import type {
  MealTemplate,
  TemplateItem,
  FoodItem,
  MealSlot,
  LoggedFood,
  MealItem,
  MyMeal,
} from '../../domain/types'
import styles from './TemplatesPanel.module.css'

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Normalize a SearchableFood to a per-100g FoodItem for template storage. */
function searchFoodToFoodItem(sf: SearchableFood): FoodItem {
  const f = 100 / sf.baseAmount
  return {
    id:           generateId(),
    name:         [sf.name, sf.descriptor].filter(Boolean).join(' — '),
    macros: {
      calories: Math.round(sf.calories * f),
      protein:  Math.round(sf.protein  * f * 10) / 10,
      carbs:    Math.round(sf.carbs    * f * 10) / 10,
      fat:      Math.round(sf.fat      * f * 10) / 10,
    },
    servingSizeG: 100,
    source:       'search',
    createdAt:    new Date().toISOString(),
  }
}

// ─── EditView ─────────────────────────────────────────────────────────────

interface EditItem {
  key: string        // stable React key — original foodItem.id or newly generated
  foodItem: FoodItem
  quantityStr: string
  mealSlot: MealSlot
}

interface EditViewProps {
  template: MealTemplate
  onSave: (updated: MealTemplate) => void
  onBack: () => void
}

function EditView({ template, onSave, onBack }: EditViewProps) {
  const defaultSlot = template.items[0]?.mealSlot ?? 'untagged'

  const [templateName, setTemplateName] = useState(template.name)
  const [nameError,    setNameError]    = useState('')
  const [editItems,    setEditItems]    = useState<EditItem[]>(
    template.items.map(item => ({
      key:         item.foodItem.id,
      foodItem:    item.foodItem,
      quantityStr: String(item.quantityG),
      mealSlot:    item.mealSlot,
    }))
  )

  // Food-search state for adding new ingredients
  const [searchQuery,  setSearchQuery]  = useState('')
  const [pendingFood,  setPendingFood]  = useState<SearchableFood | null>(null)
  const [pendingQty,   setPendingQty]   = useState('')
  const [pendingErr,   setPendingErr]   = useState('')

  const showResults   = searchQuery.length >= 1 && pendingFood === null
  const searchResults = showResults ? searchFoods(searchQuery, 8) : []

  // ── Ingredient list handlers ──────────────────────────────────────────

  function updateQty(key: string, val: string) {
    setEditItems(prev =>
      prev.map(item => item.key === key ? { ...item, quantityStr: val } : item)
    )
    setNameError('')
  }

  function removeItem(key: string) {
    setEditItems(prev => prev.filter(item => item.key !== key))
    setNameError('')
  }

  // ── Add-ingredient handlers ────────────────────────────────────────────

  function selectFood(sf: SearchableFood) {
    setPendingFood(sf)
    setPendingQty(String(sf.baseAmount))
    setPendingErr('')
    setSearchQuery('')
  }

  function confirmPending() {
    if (!pendingFood) return
    const q = parseFloat(pendingQty)
    if (!pendingQty.trim() || isNaN(q) || q <= 0) {
      setPendingErr('Enter a valid amount')
      return
    }
    const newFoodItem = searchFoodToFoodItem(pendingFood)
    const key = generateId()
    setEditItems(prev => [
      ...prev,
      { key, foodItem: newFoodItem, quantityStr: pendingQty, mealSlot: defaultSlot },
    ])
    setPendingFood(null)
    setPendingQty('')
    setPendingErr('')
  }

  // ── Save ──────────────────────────────────────────────────────────────

  function handleSave() {
    const name = templateName.trim()
    if (!name) {
      setNameError('Name is required')
      return
    }
    const newItems: TemplateItem[] = editItems.flatMap(item => {
      const q = parseFloat(item.quantityStr)
      if (!item.quantityStr.trim() || isNaN(q) || q <= 0) return []
      return [{ foodItem: item.foodItem, quantityG: q, mealSlot: item.mealSlot }]
    })
    if (newItems.length === 0) {
      setNameError('Add at least one ingredient')
      return
    }
    setNameError('')
    onSave({ ...template, name, items: newItems })
  }

  // ── Pending live preview ──────────────────────────────────────────────

  const pendingPreview = (() => {
    if (!pendingFood) return null
    const q = parseFloat(pendingQty)
    if (!pendingQty.trim() || isNaN(q) || q <= 0) return null
    const f = q / pendingFood.baseAmount
    return {
      calories: Math.round(pendingFood.calories * f),
      protein:  Math.round(pendingFood.protein  * f * 10) / 10,
      carbs:    Math.round(pendingFood.carbs     * f * 10) / 10,
      fat:      Math.round(pendingFood.fat       * f * 10) / 10,
    }
  })()

  return (
    <>
      <div className={styles.useScroll}>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          ← Templates
        </button>

        {/* Template name */}
        <div className={styles.editNameWrap}>
          <Input
            label="Template name"
            value={templateName}
            onChange={e => { setTemplateName(e.target.value); setNameError('') }}
            error={nameError}
            autoComplete="off"
          />
        </div>

        {/* Existing ingredients */}
        {editItems.length > 0 && (
          <div className={styles.editItemsSection}>
            <span className={styles.editSectionLabel}>
              Ingredients ({editItems.length})
            </span>
            {editItems.map(item => {
              const q  = parseFloat(item.quantityStr)
              const m  = (!item.quantityStr.trim() || isNaN(q) || q <= 0)
                ? null
                : computeMacros(item.foodItem.macros, q)
              return (
                <div key={item.key} className={styles.editItemRow}>
                  <div className={styles.editItemInfo}>
                    <span className={styles.editItemName}>{item.foodItem.name}</span>
                    <div className={styles.editItemInputRow}>
                      <Input
                        label="Amount"
                        value={item.quantityStr}
                        onChange={e => updateQty(item.key, e.target.value)}
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
                  <button
                    type="button"
                    className={styles.editRemoveBtn}
                    onClick={() => removeItem(item.key)}
                    aria-label={`Remove ${item.foodItem.name}`}
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Add ingredient */}
        <div className={styles.editAddSection}>
          <span className={styles.editSectionLabel}>Add ingredient</span>

          <div className={styles.searchRow}>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search foods to add…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            {searchQuery.length > 0 && (
              <button
                type="button"
                className={styles.searchClear}
                onClick={() => setSearchQuery('')}
                aria-label="Clear"
              >
                ✕
              </button>
            )}
          </div>

          {showResults && (
            <ul className={styles.searchResults} role="listbox">
              {searchResults.length > 0 ? (
                searchResults.map(food => (
                  <li key={food.id} role="option" aria-selected={false}>
                    <button
                      type="button"
                      className={styles.resultItem}
                      onClick={() => selectFood(food)}
                    >
                      <span className={styles.resultName}>
                        {food.name}
                        {food.descriptor && (
                          <span className={styles.resultDesc}> {food.descriptor}</span>
                        )}
                      </span>
                      <span className={styles.resultCal}>{food.calories} kcal</span>
                    </button>
                  </li>
                ))
              ) : (
                <li className={styles.resultEmpty}>
                  No matches for "{searchQuery}"
                </li>
              )}
            </ul>
          )}

          {pendingFood && (
            <div className={styles.pendingWidget}>
              <div className={styles.pendingHeader}>
                <span className={styles.pendingName}>
                  {[pendingFood.name, pendingFood.descriptor].filter(Boolean).join(' — ')}
                </span>
                <button
                  type="button"
                  className={styles.pendingCancel}
                  onClick={() => { setPendingFood(null); setPendingQty(''); setPendingErr('') }}
                  aria-label="Cancel"
                >
                  ✕
                </button>
              </div>
              <Input
                label={`Amount (${pendingFood.baseUnit})`}
                value={pendingQty}
                onChange={e => { setPendingQty(e.target.value); setPendingErr('') }}
                inputMode="decimal"
                pattern="[0-9.]*"
                error={pendingErr}
                rightElement={<span>{pendingFood.baseUnit}</span>}
              />
              {pendingPreview && (
                <p className={styles.pendingPreview}>
                  {pendingPreview.calories} kcal · {pendingPreview.protein}g P · {pendingPreview.carbs}g C · {pendingPreview.fat}g F
                </p>
              )}
              <Button variant="secondary" size="sm" full onClick={confirmPending}>
                + Add to Template
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.useFooter}>
        <Button variant="primary" size="lg" full onClick={handleSave}>
          Save Changes
        </Button>
        <Button variant="ghost" size="lg" full onClick={onBack}>
          Cancel
        </Button>
      </div>
    </>
  )
}

// ─── Use-template view ────────────────────────────────────────────────────

interface UseViewProps {
  template: MealTemplate
  activeDate: string
  onLog: (entries: LoggedFood[]) => void
  onSaveAsMeal: (meal: MyMeal) => void
  onBack: () => void
}

function UseView({ template, activeDate, onLog, onSaveAsMeal, onBack }: UseViewProps) {
  const [quantities, setQuantities] = useState<string[]>(
    template.items.map(item => String(item.quantityG))
  )
  const [slot, setSlot]         = useState<MealSlot>(
    template.items[0]?.mealSlot ?? 'untagged'
  )
  const [savedMsg, setSavedMsg] = useState(false)
  const [logError, setLogError] = useState('')

  function setQty(index: number, val: string) {
    setQuantities(prev => prev.map((q, i) => (i === index ? val : q)))
    setLogError('')
  }

  function liveMacros(index: number) {
    const q = parseFloat(quantities[index])
    if (!quantities[index].trim() || isNaN(q) || q <= 0) return null
    return computeMacros(template.items[index].foodItem.macros, q)
  }

  const validMacros = template.items
    .map((_, i) => liveMacros(i))
    .filter((m): m is NonNullable<typeof m> => m !== null)

  const totals = validMacros.length > 0 ? sumMacros(validMacros) : null

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
    if (!entries) { setLogError('Enter at least one ingredient amount'); return }
    onLog(entries)
  }

  function handleSaveAsMeal() {
    const entries = buildEntries()
    if (!entries) { setLogError('Enter at least one ingredient amount to save'); return }
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
    onSaveAsMeal({
      id:        generateId(),
      name:      template.name,
      items:     mealItems,
      createdAt: now,
      useCount:  0,
    })
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
        {logError  && <p className={styles.logError}>{logError}</p>}
        {savedMsg  && <p className={styles.savedMsg}>✓ Saved to My Meals</p>}
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

type ViewState =
  | { type: 'list' }
  | { type: 'use';  template: MealTemplate }
  | { type: 'edit'; template: MealTemplate }

export function TemplatesPanel({ onCancel }: FoodInputContext) {
  const templates       = useStore(selectTemplates)
  const deleteTemplate  = useStore(s => s.deleteTemplate)
  const updateTemplate  = useStore(s => s.updateTemplate)
  const addLogEntry     = useStore(s => s.addLogEntry)
  const saveMyMeal      = useStore(s => s.saveMyMeal)
  const activeDate      = useStore(selectActiveDate)

  const [view, setView] = useState<ViewState>({ type: 'list' })

  function handleLog(entries: LoggedFood[]) {
    for (const entry of entries) addLogEntry(entry)
    onCancel()
  }

  function handleSaveUpdated(updated: MealTemplate) {
    updateTemplate(updated)
    setView({ type: 'list' })
  }

  if (view.type === 'use') {
    return (
      <UseView
        template={view.template}
        activeDate={activeDate}
        onLog={handleLog}
        onSaveAsMeal={meal => saveMyMeal(meal)}
        onBack={() => setView({ type: 'list' })}
      />
    )
  }

  if (view.type === 'edit') {
    return (
      <EditView
        template={view.template}
        onSave={handleSaveUpdated}
        onBack={() => setView({ type: 'list' })}
      />
    )
  }

  // ── List ──────────────────────────────────────────────────────────────

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
      {templates.map(tmpl => {
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
              onClick={() => setView({ type: 'use', template: tmpl })}
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
              className={styles.editBtn}
              onClick={() => setView({ type: 'edit', template: tmpl })}
              aria-label={`Edit ${tmpl.name}`}
              type="button"
            >
              Edit
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
