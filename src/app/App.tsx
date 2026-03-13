import { BrowserRouter } from 'react-router-dom'
import { useStore, selectIsHydrated } from '../store'
import { Router } from './Router'
import styles from './App.module.css'

function LoadingScreen() {
  return <div className={styles.loading} aria-label="Loading" />
}

export function App() {
  const isHydrated = useStore(selectIsHydrated)

  if (!isHydrated) {
    return <LoadingScreen />
  }

  return (
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  )
}
