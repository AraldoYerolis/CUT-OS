import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { Screen } from '../../components/layout/Screen'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { DEFAULT_TARGETS } from '../../domain/constants'
import { generateId } from '../../utils/id'
import { PRESET_FOODS, EXCLUSION_OPTIONS } from '../../domain/foodPresets'
import type { UserProfile } from '../../domain/types'
import styles from './OnboardingScreen.module.css'

// ─── Step indicator ───────────────────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className={styles.stepDots}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={[styles.dot, i + 1 === current ? styles.dotActive : ''].join(' ')}
        />
      ))}
    </div>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────

export function OnboardingScreen() {
  const navigate = useNavigate()
  const completeOnboarding = useStore((s) => s.completeOnboarding)

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  // Step 1
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')

  // Step 2 — macros (calories derived)
  const [protein, setProtein] = useState(String(DEFAULT_TARGETS.protein))
  const [carbs, setCarbs]     = useState(String(DEFAULT_TARGETS.carbs))
  const [fat, setFat]         = useState(String(DEFAULT_TARGETS.fat))
  const [macroErrors, setMacroErrors] = useState<Record<string, string>>({})

  const derivedCalories = Math.round(
    (parseFloat(protein) || 0) * 4 +
    (parseFloat(carbs)   || 0) * 4 +
    (parseFloat(fat)     || 0) * 9
  )

  // Step 3 — food preferences
  const [selectedFoods, setSelectedFoods] = useState<string[]>([])
  const [excludedFoods, setExcludedFoods] = useState<string[]>([])

  function toggleFood(id: string) {
    setSelectedFoods(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function toggleExclusion(label: string) {
    setExcludedFoods(prev =>
      prev.includes(label) ? prev.filter(x => x !== label) : [...prev, label]
    )
  }

  // ─── Validation ─────────────────────────────────────────────────────────

  function validateName(): boolean {
    if (!name.trim()) {
      setNameError('Name is required')
      return false
    }
    setNameError('')
    return true
  }

  function validateMacros(): boolean {
    const errs: Record<string, string> = {}
    const pro = parseInt(protein, 10)
    const car = parseInt(carbs, 10)
    const f   = parseInt(fat, 10)
    if (!protein || isNaN(pro) || pro < 0 || pro > 999) errs.protein = 'Enter 0–999'
    if (!carbs   || isNaN(car) || car < 0 || car > 999) errs.carbs   = 'Enter 0–999'
    if (!fat     || isNaN(f)   || f   < 0 || f   > 999) errs.fat     = 'Enter 0–999'
    setMacroErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ─── Navigation ─────────────────────────────────────────────────────────

  function handleNext() {
    if (step === 1 && validateName()) setStep(2)
    else if (step === 2 && validateMacros()) setStep(3)
    else if (step === 3) setStep(4)
  }

  function handleFinish() {
    const profile: UserProfile = {
      id: generateId(),
      name: name.trim(),
      targets: {
        calories: derivedCalories,
        protein: parseInt(protein, 10),
        carbs: parseInt(carbs, 10),
        fat: parseInt(fat, 10),
      },
      units: 'metric',
      createdAt: new Date().toISOString(),
      foodPreferences: {
        selectedFoods,
        excludedFoods,
      },
    }
    completeOnboarding(profile)
    navigate('/', { replace: true })
  }

  // ─── Chips by category ──────────────────────────────────────────────────

  const categories: { label: string; key: 'protein' | 'carb' | 'fat' | 'snack' }[] = [
    { label: 'Proteins',  key: 'protein' },
    { label: 'Carbs',     key: 'carb' },
    { label: 'Fats',      key: 'fat' },
    { label: 'Snacks',    key: 'snack' },
  ]

  return (
    <Screen withNav={false}>
      <div className={styles.container}>

        {/* ── Step 1: Name ── */}
        {step === 1 && (
          <>
            <div className={styles.hero}>
              <h1 className={styles.wordmark}>cut/os</h1>
              <p className={styles.tagline}>Elite cutting diet tracker</p>
            </div>

            <div className={styles.body}>
              <StepDots current={1} total={4} />
              <h2 className={styles.stepTitle}>What's your name?</h2>
              <Input
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex"
                error={nameError}
                autoFocus
                autoComplete="given-name"
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              />
            </div>

            <div className={styles.actions}>
              <Button variant="primary" size="lg" full onClick={handleNext}>
                Next
              </Button>
            </div>
          </>
        )}

        {/* ── Step 2: Daily targets ── */}
        {step === 2 && (
          <>
            <div className={styles.stepHeader}>
              <StepDots current={2} total={4} />
              <h2 className={styles.stepTitle}>Set your daily targets</h2>
              <p className={styles.stepSub}>You can change these any time in Settings.</p>
            </div>

            <div className={styles.body}>
              {/* Derived calories — read only */}
              <div className={styles.derivedCal}>
                <span className={styles.derivedCalLabel}>Calories</span>
                <div className={styles.derivedCalRow}>
                  <span className={styles.derivedCalValue}>
                    {derivedCalories > 0 ? derivedCalories : '—'}
                  </span>
                  <span className={styles.derivedCalUnit}>kcal · from macros</span>
                </div>
              </div>

              <Input
                label="Protein"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                inputMode="numeric"
                pattern="[0-9]*"
                error={macroErrors.protein}
                rightElement={<span>g</span>}
              />
              <Input
                label="Carbs"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                inputMode="numeric"
                pattern="[0-9]*"
                error={macroErrors.carbs}
                rightElement={<span>g</span>}
              />
              <Input
                label="Fat"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                inputMode="numeric"
                pattern="[0-9]*"
                error={macroErrors.fat}
                rightElement={<span>g</span>}
              />
            </div>

            <div className={styles.actions}>
              <Button variant="primary" size="lg" full onClick={handleNext}>
                Next
              </Button>
              <Button variant="ghost" size="lg" full onClick={() => setStep(1)}>
                Back
              </Button>
            </div>
          </>
        )}

        {/* ── Step 3: Food preferences ── */}
        {step === 3 && (
          <>
            <div className={styles.stepHeader}>
              <StepDots current={3} total={4} />
              <h2 className={styles.stepTitle}>What do you eat?</h2>
              <p className={styles.stepSub}>Select your common foods for faster logging. Skip to use defaults.</p>
            </div>

            <div className={styles.body}>
              {categories.map(({ label, key }) => {
                const foods = PRESET_FOODS.filter(f => f.category === key)
                return (
                  <div key={key} className={styles.chipSection}>
                    <span className={styles.chipSectionLabel}>{label}</span>
                    <div className={styles.chipGrid}>
                      {foods.map(food => (
                        <button
                          key={food.id}
                          type="button"
                          className={[
                            styles.chip,
                            selectedFoods.includes(food.id) ? styles.chipActive : '',
                          ].join(' ')}
                          onClick={() => toggleFood(food.id)}
                        >
                          {food.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}

              <div className={styles.chipSection}>
                <span className={styles.chipSectionLabel}>Exclude / Avoid</span>
                <div className={styles.chipGrid}>
                  {EXCLUSION_OPTIONS.map(label => (
                    <button
                      key={label}
                      type="button"
                      className={[
                        styles.chip,
                        excludedFoods.includes(label) ? styles.chipExcluded : '',
                      ].join(' ')}
                      onClick={() => toggleExclusion(label)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <Button variant="primary" size="lg" full onClick={handleNext}>
                {selectedFoods.length > 0 ? 'Next' : 'Skip'}
              </Button>
              <Button variant="ghost" size="lg" full onClick={() => setStep(2)}>
                Back
              </Button>
            </div>
          </>
        )}

        {/* ── Step 4: Review ── */}
        {step === 4 && (
          <>
            <div className={styles.stepHeader}>
              <StepDots current={4} total={4} />
              <h2 className={styles.stepTitle}>Ready to go</h2>
            </div>

            <div className={styles.reviewCard}>
              <div className={styles.reviewRow}>
                <span className={styles.reviewLabel}>Name</span>
                <span className={styles.reviewValue}>{name.trim()}</span>
              </div>
              <div className={styles.reviewDivider} />
              <div className={styles.reviewRow}>
                <span className={styles.reviewLabel}>Calories</span>
                <span className={styles.reviewValue}>{derivedCalories} kcal</span>
              </div>
              <div className={styles.reviewRow}>
                <span className={styles.reviewLabel}>Protein</span>
                <span className={styles.reviewValue}>{protein} g</span>
              </div>
              <div className={styles.reviewRow}>
                <span className={styles.reviewLabel}>Carbs</span>
                <span className={styles.reviewValue}>{carbs} g</span>
              </div>
              <div className={styles.reviewRow}>
                <span className={styles.reviewLabel}>Fat</span>
                <span className={styles.reviewValue}>{fat} g</span>
              </div>
              {selectedFoods.length > 0 && (
                <>
                  <div className={styles.reviewDivider} />
                  <div className={styles.reviewRow}>
                    <span className={styles.reviewLabel}>Fav. foods</span>
                    <span className={styles.reviewValue}>{selectedFoods.length} selected</span>
                  </div>
                </>
              )}
              {excludedFoods.length > 0 && (
                <div className={styles.reviewRow}>
                  <span className={styles.reviewLabel}>Excluding</span>
                  <span className={styles.reviewValue}>{excludedFoods.join(', ')}</span>
                </div>
              )}
            </div>

            <div className={styles.actions}>
              <Button variant="primary" size="lg" full onClick={handleFinish}>
                Start Tracking
              </Button>
              <Button variant="ghost" size="lg" full onClick={() => setStep(3)}>
                Back
              </Button>
            </div>
          </>
        )}

      </div>
    </Screen>
  )
}
