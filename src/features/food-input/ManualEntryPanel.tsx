import { useState } from 'react'
import { useStore } from '../../store'
import type { FoodInputContext } from '../../services/foodInput/FoodInputService'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { MealSlotPicker } from './MealSlotPicker'
import { generateId } from '../../utils/id'
import type { FoodItem, MealSlot } from '../../domain/types'
import styles from './ManualEntryPanel.module.css'

function calcCalories(protein: string, carbs: string, fat: string): number {
  return Math.round(
    (parseFloat(protein) || 0) * 4 +
    (parseFloat(carbs) || 0) * 4 +
    (parseFloat(fat) || 0) * 9
  )
}

export function ManualEntryPanel({ onConfirm }: FoodInputContext) {
  const saveToMyFoods = useStore((s) => s.saveToMyFoods)

  const [name, setName] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [slot, setSlot] = useState<MealSlot>('untagged')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [savedMsg, setSavedMsg] = useState(false)

  const computedCalories = calcCalories(protein, carbs, fat)

  function buildFood(): FoodItem | null {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Required'
    if (computedCalories <= 0) errs.macros = 'Enter at least one macro'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return null
    return {
      id: generateId(),
      name: name.trim(),
      macros: {
        calories: computedCalories,
        protein: Math.max(0, parseFloat(protein) || 0),
        carbs: Math.max(0, parseFloat(carbs) || 0),
        fat: Math.max(0, parseFloat(fat) || 0),
      },
      servingSizeG: 100,
      source: 'manual',
      createdAt: new Date().toISOString(),
    }
  }

  function handleSubmit() {
    const food = buildFood()
    if (!food) return
    onConfirm(food, 100, slot)
  }

  function handleSaveToMyFoods() {
    const food = buildFood()
    if (!food) return
    saveToMyFoods(food)
    setSavedMsg(true)
    setTimeout(() => setSavedMsg(false), 2000)
  }

  return (
    <>
      <div className={styles.scrollContent}>
        <Input
          label="Food name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Chicken breast"
          error={errors.name}
          autoComplete="off"
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

        {/* Live calorie readout — derived from macros, not user input */}
        <div className={[styles.calcRow, errors.macros ? styles.calcRowError : ''].filter(Boolean).join(' ')}>
          <span className={styles.calcLabel}>Calories</span>
          <span className={styles.calcValue}>
            {computedCalories > 0 ? `${computedCalories} kcal` : '—'}
          </span>
          {errors.macros && <span className={styles.calcError}>{errors.macros}</span>}
        </div>

        <MealSlotPicker value={slot} onChange={setSlot} />
      </div>
      <div className={styles.footer}>
        <Button variant="primary" size="lg" full onClick={handleSubmit}>
          Add Food
        </Button>
        <Button variant="ghost" size="lg" full onClick={handleSaveToMyFoods}>
          {savedMsg ? '✓ Saved to My Foods' : 'Save to My Foods'}
        </Button>
      </div>
    </>
  )
}
