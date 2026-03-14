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
  const [protein, setProtein] = useState(String(user?.targets.protein ?? 150))
  const [carbs, setCarbs] = useState(String(user?.targets.carbs ?? 200))
  const [fat, setFat] = useState(String(user?.targets.fat ?? 65))

  // Calories are derived from macros — never entered directly.
  const derivedCalories = Math.round(
    (parseFloat(protein) || 0) * 4 +
    (parseFloat(carbs) || 0) * 4 +
    (parseFloat(fat) || 0) * 9
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Sync form whenever the canonical store user changes.
  // [user] dep ensures the form mirrors stored state after every save.
  useEffect(() => {
    if (user) {
      setName(user.name)
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
    const pro = parseInt(protein, 10)
    const car = parseInt(carbs, 10)
    const f = parseInt(fat, 10)
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
      calories: derivedCalories,
      protein: parseInt(protein, 10),
      carbs: parseInt(carbs, 10),
      fat: parseInt(fat, 10),
    }

    setIsSaving(true)
    setErrors({})
    try {
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

          {/* Calories: read-only, derived from macro targets */}
          <div className={styles.derivedField}>
            <span className={styles.derivedLabel}>Calories</span>
            <div className={styles.derivedRow}>
              <span className={styles.derivedNumber}>
                {derivedCalories > 0 ? derivedCalories : '—'}
              </span>
              <span className={styles.derivedUnit}>kcal · from macros</span>
            </div>
          </div>

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
