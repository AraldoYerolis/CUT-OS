import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from '../store'
import { AppShell } from './AppShell'
import { DashboardScreen } from '../features/dashboard/DashboardScreen'
import { LogScreen } from '../features/log/LogScreen'
import { HistoryScreen } from '../features/history/HistoryScreen'
import { SettingsScreen } from '../features/settings/SettingsScreen'
import { TemplatesScreen } from '../features/templates/TemplatesScreen'
import { OnboardingScreen } from '../features/onboarding/OnboardingScreen'

export function Router() {
  const onboardingComplete = useStore((s) => s.onboardingComplete)

  if (!onboardingComplete) {
    return (
      <Routes>
        <Route path="/onboarding" element={<OnboardingScreen />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardScreen />} />
        <Route path="log" element={<LogScreen />} />
        <Route path="history" element={<HistoryScreen />} />
        <Route path="settings" element={<SettingsScreen />} />
        <Route path="templates" element={<TemplatesScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
