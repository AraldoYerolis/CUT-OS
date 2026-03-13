import { useState, useEffect } from 'react'
import { useStore } from '../../store'
import { Sheet } from '../../components/ui/Sheet'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { MealSlotPicker } from '../food-input/MealSlotPicker'
import { computeMacros } from '../../domain/calculations'
import type { LoggedFood, MealSlot } from '../../domain/types'
import styles from './EditEntrySheet.module.css'

interface EditEntrySheetProps {
  entry: LoggedFood | null
  onClose: () => void
}

export function EditEntrySheet({ entry, onClose }: EditEntrySheetProps) {
  const updateLogEntry = useStore((s) => s.updateLogEntry)
  const deleteLogEntry = useStore((s) => s.deleteLogEntry)

  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [slot, setSlot] = useState<MealSlot>('untagged')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Sync form when a different entry is opened
  useEffect(() => {
    if (entry) {
      setName(entry.foodItem.name)
      setCalories(String(entry.macros.calories))
      setProtein(String(entry.macros.protein))
      setCarbs(String(entry.macros.carbs))
      setFat(String(entry.macros.fat))
      setSlot(entry.mealSlot)
      setErrors({})
      setConfirmDelete(false)
    }
  }, [entry?.id])

  function handleSave() {
    if (!entry) return
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Required'
    const cal = Math.round(parseFloat(calories))
    if (!calories || isNaN(cal) || cal <= 0) errs.calories = 'Enter a value > 0'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    const macrosPer100g = {
      calories: cal,
      protein: Math.max(0, parseFloat(protein) || 0),
      carbs: Math.max(0, parseFloat(carbs) || 0),
      fat: Math.max(0, parseFloat(fat) || 0),
    }
    const updated: LoggedFood = {
      ...entry,
      foodItem: { ...entry.foodItem, name: name.trim(), macros: macrosPer100g },
      macros: computeMacros(macrosPer100g, 100),
      mealSlot: slot,
    }
    updateLogEntry(updated)
    onClose()
  }

  function handleDelete() {
    if (!entry) return
    deleteLogEntry(entry.id, entry.date)
    onClose()
  }

  return (
    <Sheet isOpen={entry !== null} onClose={onClose} label="Edit entry">
      <div className={styles.sheetContent}>

        <div className={styles.panelArea}>
          <div className={styles.panel}>
            <Input
              label="Food name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
          </div>
        </div>

        <div className={styles.footer}>
          <Button variant="primary" size="lg" full onClick={handleSave}>
            Save Changes
          </Button>

          {!confirmDelete ? (
            <Button variant="ghost" size="md" full onClick={() => setConfirmDelete(true)}>
              Delete Entry
            </Button>
          ) : (
            <div className={styles.confirmRow}>
              <span className={styles.confirmText}>Delete this entry?</span>
              <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            </div>
          )}
        </div>

      </div>
    </Sheet>
  )
}
