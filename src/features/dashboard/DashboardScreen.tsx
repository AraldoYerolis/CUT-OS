import { Screen } from '../../components/layout/Screen'
import { EmptyState } from '../../components/ui/EmptyState'
import styles from './DashboardScreen.module.css'

/**
 * Dashboard / Today screen.
 * Phase 1: placeholder layout with correct structure.
 * Macro ring, totals, and log preview added in Phase 3.
 */
export function DashboardScreen() {
  return (
    <Screen>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Today</h1>
        </header>

        <div className={styles.content}>
          <EmptyState
            icon="○"
            title="Ready to log"
            message="Tap + to add your first food entry for today."
          />
        </div>
      </div>
    </Screen>
  )
}
