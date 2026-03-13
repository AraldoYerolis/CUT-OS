import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { Screen } from '../../components/layout/Screen'
import { Button } from '../../components/ui/Button'
import styles from './OnboardingScreen.module.css'

/**
 * Onboarding screen.
 * Phase 1: minimal shell that completes onboarding so the app shell is reachable.
 * Multi-step flow with target setup built in Phase 2.
 */
export function OnboardingScreen() {
  const navigate = useNavigate()

  // Phase 1: skip onboarding and go to app
  // Phase 2 will replace this with a real multi-step flow
  function handleSkip() {
    useStore.setState({ onboardingComplete: true })
    navigate('/', { replace: true })
  }

  return (
    <Screen withNav={false}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.wordmark}>cut/os</h1>
          <p className={styles.tagline}>Elite cutting diet tracker</p>
        </div>

        <div className={styles.actions}>
          <Button variant="primary" size="lg" full onClick={handleSkip}>
            Get Started
          </Button>
          <p className={styles.note}>
            Full onboarding with macro targets in Phase 2
          </p>
        </div>
      </div>
    </Screen>
  )
}
