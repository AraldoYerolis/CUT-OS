import { Screen } from '../../components/layout/Screen'
import { Header } from '../../components/layout/Header'
import { EmptyState } from '../../components/ui/EmptyState'

/**
 * History screen — 7-day macro summary.
 * Phase 1: placeholder. Full implementation in Phase 5.
 */
export function HistoryScreen() {
  return (
    <Screen>
      <Header title="History" />
      <EmptyState
        icon="□"
        title="No history yet"
        message="Your daily summaries will appear here after you start logging."
      />
    </Screen>
  )
}
