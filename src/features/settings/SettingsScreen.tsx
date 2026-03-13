import { Screen } from '../../components/layout/Screen'
import { Header } from '../../components/layout/Header'
import { EmptyState } from '../../components/ui/EmptyState'

/**
 * Settings screen.
 * Phase 1: placeholder. Target editor and profile in Phase 2.
 */
export function SettingsScreen() {
  return (
    <Screen>
      <Header title="Settings" />
      <EmptyState
        icon="⚙"
        title="Settings"
        message="Macro targets and profile configuration coming in Phase 2."
      />
    </Screen>
  )
}
