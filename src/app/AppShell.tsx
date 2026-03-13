import { Outlet } from 'react-router-dom'
import { TabNav } from '../components/layout/TabNav'
import { FoodInputSheet } from '../features/food-input/FoodInputSheet'
import { useStore, selectFoodInput } from '../store'

export function AppShell() {
  const foodInput = useStore(selectFoodInput)
  const closeFoodInput = useStore((s) => s.closeFoodInput)

  return (
    <>
      {/* Screen content */}
      <Outlet />

      {/* Persistent bottom nav */}
      <TabNav />

      {/* Global food input sheet — rendered at shell level */}
      <FoodInputSheet
        isOpen={foodInput.isOpen}
        onClose={closeFoodInput}
      />
    </>
  )
}
