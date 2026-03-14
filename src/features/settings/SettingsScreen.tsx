import { useState, useEffect } from 'react'
import { useStore, selectUser } from '../../store'
import { Screen } from '../../components/layout/Screen'
import { Header } from '../../components/layout/Header'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import styles from './SettingsScreen.module.css'

export function SettingsScreen() {
  const user = useStore(selectUser)
  const updateProfile = useStore((s) => s.updateProfile)

  const [name, setName] = useState(user?.name ?? '')
  const [calories, setCalories] = useState(String(user?.targets.calories ?? 2000))
  const [protein, setProtein] = useState(String(user?.targets.protein ?? 150))
  const [carbs, setCarbs] = useState(String(user?.targets.carbs ?? 200))
  const [fat, setFat] = useState(String(user?.targets.fat ?? 65))

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Sync form whenever the canonical store user changes.
  // Using [user] (not [user?.id]) ensures the form always mirrors the stored
  // state — including immediately after updateProfile commits the new values.
  useEffect(() => {
    if (user) {
      setName(user.name)
      setCalories(String(user.targets.calories))
      setProtein(String(user.targets.protein))
      setCarbs(String(user.targets.carbs))
      setFat(String(user.targets.fat))
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  function markDirty() {
    setSaved(false)
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Name is required'
    const cal = parseInt(calories, 10)
    const pro = parseInt(protein, 10)
    const car = parseInt(carbs, 10)
    const f = parseInt(fat, 10)
    if (!calories || isNaN(cal) || cal < 500 || cal > 9999) errs.calories = '500–9999'
    if (!protein || isNaN(pro) || pro < 0 || pro > 999) errs.protein = '0–999'
    if (!carbs || isNaN(car) || car < 0 || car > 999) errs.carbs = '0–999'
    if (!fat || isNaN(f) || f < 0 || f > 999) errs.fat = '0–999'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSave() {
    if (!validate()) return

    const newName = name.trim()
    const newTargets = {
      calories: parseInt(calories, 10),
      protein: parseInt(protein, 10),
      carbs: parseInt(carbs, 10),
      fat: parseInt(fat, 10),
    }

    setIsSaving(true)
    setErrors({})
    try {
      // updateProfile updates in-memory state synchronously, then returns the
      // persist middleware's async IDB setItem() Promise (typed void but is a
      // Promise at runtime). Awaiting via Promise.resolve() ensures we only
      // show "Saved" once the storage write has actually committed.
      await Promise.resolve(updateProfile(newName, newTargets))
      setSaved(true)
    } catch {
      setErrors({ _save: 'Failed to save. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Screen>
      <Header title="Settings" />
      <div className={styles.container}>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Profile</h2>
          <Input
            label="Name"
            value={name}
            onChange={(e) => { setName(e.target.value); markDirty() }}
            error={errors.name}
            autoComplete="given-name"
          />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Daily Targets</h2>
          <Input
            label="Calories"
            value={calories}
            onChange={(e) => { setCalories(e.target.value); markDirty() }}
            inputMode="numeric"
            pattern="[0-9]*"
            error={errors.calories}
            rightElement={<span>kcal</span>}
          />
          <Input
            label="Protein"
            value={protein}
            onChange={(e) => { setProtein(e.target.value); markDirty() }}
            inputMode="numeric"
            pattern="[0-9]*"
            error={errors.protein}
            rightElement={<span>g</span>}
          />
          <Input
            label="Carbs"
            value={carbs}
            onChange={(e) => { setCarbs(e.target.value); markDirty() }}
            inputMode="numeric"
            pattern="[0-9]*"
            error={errors.carbs}
            rightElement={<span>g</span>}
          />
          <Input
            label="Fat"
            value={fat}
            onChange={(e) => { setFat(e.target.value); markDirty() }}
            inputMode="numeric"
            pattern="[0-9]*"
            error={errors.fat}
            rightElement={<span>g</span>}
          />
        </section>

        {errors._save && <p className={styles.saveError}>{errors._save}</p>}

        <div className={styles.saveRow}>
          <Button variant="primary" size="lg" full onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving…' : saved ? 'Saved' : 'Save Changes'}
          </Button>
          {saved && <p className={styles.savedNote}>Changes saved</p>}
        </div>

      </div>
    </Screen>
  )
}
