import { Screen } from '../../components/layout/Screen'
import { Header } from '../../components/layout/Header'
import { EmptyState } from '../../components/ui/EmptyState'

/**
 * Meal templates screen.
 * Phase 1: placeholder. Full implementation in Phase 7.
 */
export function TemplatesScreen() {
  return (
    <Screen>
      <Header title="Templates" />
      <EmptyState
        icon="⊞"
        title="No templates yet"
        message="Save meals as templates to log them again in one tap."
      />
    </Screen>
  )
}
