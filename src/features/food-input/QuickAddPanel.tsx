import { useState } from 'react'
import { useStore, selectUser } from '../../store'
import type { FoodInputContext } from '../../services/foodInput/FoodInputService'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { MealSlotPicker } from './MealSlotPicker'
import { generateId } from '../../utils/id'
import {
  PRESET_FOOD_BY_ID,
  DEFAULT_QUICK_PRESET_IDS,
  type PresetFood,
} from '../../domain/foodPresets'
import type { FoodItem, MealSlot } from '../../domain/types'
import styles from './QuickAddPanel.module.css'

export function QuickAddPanel({ onConfirm }: FoodInputContext) {
  const user = useStore(selectUser)

  const [calories, setCalories] = useState('')
  const [protein, setProtein]   = useState('')
  const [carbs, setCarbs]       = useState('')
  const [fat, setFat]           = useState('')
  const [label, setLabel]       = useState('')
  const [slot, setSlot]         = useState<MealSlot>('untagged')
  const [calError, setCalError] = useState('')

  // ─── Determine preset list from user preferences ───────────────────────
  const presets: PresetFood[] = (() => {
    const prefs = user?.foodPreferences
    const ids = prefs && prefs.selectedFoods.length > 0
      ? prefs.selectedFoods
      : DEFAULT_QUICK_PRESET_IDS

    // Filter out excluded foods (by category match against exclusion labels)
    const excluded = new Set((prefs?.excludedFoods ?? []).map(e => e.toLowerCase()))
    const exclusionMap: Record<string, string[]> = {
      dairy:    ['greek_yogurt', 'cottage_cheese', 'cheese', 'whey_protein'],
      eggs:     ['eggs'],
      nuts:     ['almonds', 'peanut_butter'],
      soy:      ['whey_protein'],
      gluten:   ['bread', 'pasta', 'oats'],
      'red meat': ['ground_beef'],
      pork:     [],
      shellfish: [],
    }
    const blockedIds = new Set<string>()
    for (const [excl, foodIds] of Object.entries(exclusionMap)) {
      if (excluded.has(excl)) foodIds.forEach(id => blockedIds.add(id))
    }

    return ids
      .filter(id => !blockedIds.has(id))
      .map(id => PRESET_FOOD_BY_ID.get(id))
      .filter((f): f is PresetFood => f !== undefined)
  })()

  function applyPreset(preset: PresetFood) {
    setCalories(String(preset.calories))
    setProtein(String(preset.protein))
    setCarbs(String(preset.carbs))
    setFat(String(preset.fat))
    setLabel(preset.name)
    setCalError('')
  }

  function handleSubmit() {
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
        carbs: Math.max(0, parseFloat(carbs) || 0),
        fat: Math.max(0, parseFloat(fat) || 0),
      },
      servingSizeG: 100,
      source: 'quickadd',
      createdAt: new Date().toISOString(),
    }
    onConfirm(food, 100, slot)
  }

  return (
    <>
      <div className={styles.scrollContent}>
        <p className={styles.hint}>Fast macro entry — nothing saved to your food library.</p>

        {/* Preset chips */}
        {presets.length > 0 && (
          <div className={styles.presets}>
            {presets.map(preset => (
              <button
                key={preset.id}
                type="button"
                className={styles.presetChip}
                onClick={() => applyPreset(preset)}
              >
                {preset.name}
                <span className={styles.presetCal}>{preset.calories} kcal</span>
              </button>
            ))}
          </div>
        )}

        <Input
          label="Calories"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          inputMode="numeric"
          pattern="[0-9]*"
          error={calError}
          autoFocus
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
