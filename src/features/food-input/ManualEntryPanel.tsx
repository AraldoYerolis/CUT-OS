import { useState } from 'react'
import type { FoodInputContext } from '../../services/foodInput/FoodInputService'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { MealSlotPicker } from './MealSlotPicker'
import { generateId } from '../../utils/id'
import type { FoodItem, MealSlot } from '../../domain/types'
import styles from './ManualEntryPanel.module.css'

export function ManualEntryPanel({ onConfirm }: FoodInputContext) {
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [slot, setSlot] = useState<MealSlot>('untagged')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleSubmit() {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Required'
    const cal = parseInt(calories, 10)
    if (!calories || isNaN(cal) || cal <= 0) errs.calories = 'Enter a value > 0'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    const food: FoodItem = {
      id: generateId(),
      name: name.trim(),
      // Store entered values as "per 100g"; quantity will be 100g → same macros
      macros: {
        calories: cal,
        protein: Math.max(0, parseFloat(protein) || 0),
        carbs: Math.max(0, parseFloat(carbs) || 0),
        fat: Math.max(0, parseFloat(fat) || 0),
      },
      servingSizeG: 100,
      source: 'manual',
      createdAt: new Date().toISOString(),
    }
    onConfirm(food, 100, slot)
  }

  return (
    <div className={styles.panel}>
      <Input
        label="Food name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Chicken breast"
        error={errors.name}
        autoComplete="off"
      />
      <Input
        label="Calories"
        value={calories}
        onChange={(e) => setCalories(e.target.value)}
        inputMode="numeric"
        pattern="[0-9]*"
        error={errors.calories}
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
      <MealSlotPicker value={slot} onChange={setSlot} />
      <div className={styles.footer}>
        <Button variant="primary" size="lg" full onClick={handleSubmit}>
          Add Food
        </Button>
      </div>
    </div>
  )
}
