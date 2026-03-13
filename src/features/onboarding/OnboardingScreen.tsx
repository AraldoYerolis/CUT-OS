import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { Screen } from '../../components/layout/Screen'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { DEFAULT_TARGETS } from '../../domain/constants'
import { generateId } from '../../utils/id'
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

  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Step 1
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')

  // Step 2
  const [calories, setCalories] = useState(String(DEFAULT_TARGETS.calories))
  const [protein, setProtein] = useState(String(DEFAULT_TARGETS.protein))
  const [carbs, setCarbs] = useState(String(DEFAULT_TARGETS.carbs))
  const [fat, setFat] = useState(String(DEFAULT_TARGETS.fat))
  const [macroErrors, setMacroErrors] = useState<Record<string, string>>({})

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
    const cal = parseInt(calories, 10)
    const pro = parseInt(protein, 10)
    const car = parseInt(carbs, 10)
    const f = parseInt(fat, 10)
    if (!calories || isNaN(cal) || cal < 500 || cal > 9999) errs.calories = 'Enter 500–9999'
    if (!protein || isNaN(pro) || pro < 0 || pro > 999) errs.protein = 'Enter 0–999'
    if (!carbs || isNaN(car) || car < 0 || car > 999) errs.carbs = 'Enter 0–999'
    if (!fat || isNaN(f) || f < 0 || f > 999) errs.fat = 'Enter 0–999'
    setMacroErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleNext() {
    if (step === 1 && validateName()) setStep(2)
    else if (step === 2 && validateMacros()) setStep(3)
  }

  function handleFinish() {
    const profile: UserProfile = {
      id: generateId(),
      name: name.trim(),
      targets: {
        calories: parseInt(calories, 10),
        protein: parseInt(protein, 10),
        carbs: parseInt(carbs, 10),
        fat: parseInt(fat, 10),
      },
      units: 'metric',
      createdAt: new Date().toISOString(),
    }
    completeOnboarding(profile)
    navigate('/', { replace: true })
  }

  return (
    <Screen withNav={false}>
      <div className={styles.container}>

        {step === 1 && (
          <>
            <div className={styles.hero}>
              <h1 className={styles.wordmark}>cut/os</h1>
              <p className={styles.tagline}>Elite cutting diet tracker</p>
            </div>

            <div className={styles.body}>
              <StepDots current={1} total={3} />
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

        {step === 2 && (
          <>
            <div className={styles.stepHeader}>
              <StepDots current={2} total={3} />
              <h2 className={styles.stepTitle}>Set your daily targets</h2>
              <p className={styles.stepSub}>You can change these any time in Settings.</p>
            </div>

            <div className={styles.body}>
              <Input
                label="Calories"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                inputMode="numeric"
                pattern="[0-9]*"
                error={macroErrors.calories}
                rightElement={<span>kcal</span>}
              />
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

        {step === 3 && (
          <>
            <div className={styles.stepHeader}>
              <StepDots current={3} total={3} />
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
                <span className={styles.reviewValue}>{calories} kcal</span>
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
            </div>

            <div className={styles.actions}>
              <Button variant="primary" size="lg" full onClick={handleFinish}>
                Start Tracking
              </Button>
              <Button variant="ghost" size="lg" full onClick={() => setStep(2)}>
                Back
              </Button>
            </div>
          </>
        )}

      </div>
    </Screen>
  )
}
