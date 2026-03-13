import { Screen } from '../../components/layout/Screen'
import { Header } from '../../components/layout/Header'
import { EmptyState } from '../../components/ui/EmptyState'

/**
 * Daily food log screen.
 * Phase 1: placeholder. Full log CRUD in Phase 5.
 */
export function LogScreen() {
  return (
    <Screen>
      <Header title="Log" />
      <EmptyState
        icon="≡"
        title="No entries yet"
        message="Tap + to log your first food for today."
      />
    </Screen>
  )
}
