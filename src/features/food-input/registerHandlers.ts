import { registerFoodInputHandler } from '../../services/foodInput/FoodInputService'
import { ManualEntryPanel } from './ManualEntryPanel'
import { QuickAddPanel } from './QuickAddPanel'

registerFoodInputHandler({
  mode: 'manual',
  label: 'Manual',
  isReady: true,
  Panel: ManualEntryPanel,
})

registerFoodInputHandler({
  mode: 'quickAdd',
  label: 'Quick Add',
  isReady: true,
  Panel: QuickAddPanel,
})
