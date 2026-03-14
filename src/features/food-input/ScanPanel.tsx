import { useState, useRef } from 'react'
import type { FoodInputContext } from '../../services/foodInput/FoodInputService'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { MealSlotPicker } from './MealSlotPicker'
import { generateId } from '../../utils/id'
import type { FoodItem, MealSlot } from '../../domain/types'
import styles from './ScanPanel.module.css'

type ScanStep = 'idle' | 'barcode' | 'review'
type ScanMode = 'barcode' | 'labelscan'

const hasBarcodeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window

export function ScanPanel({ onConfirm }: FoodInputContext) {
  const [step, setStep] = useState<ScanStep>('idle')
  const [scanMode, setScanMode] = useState<ScanMode>('barcode')
  const [barcodeValue, setBarcodeValue] = useState('')
  const [labelImageUrl, setLabelImageUrl] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)

  // Review form
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [slot, setSlot] = useState<MealSlot>('untagged')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const labelFileRef = useRef<HTMLInputElement>(null)
  const barcodeFileRef = useRef<HTMLInputElement>(null)

  function goToReview() {
    setStep('review')
    setErrors({})
  }

  function handleBarcodeCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (hasBarcodeDetector) {
      setScanning(true)
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = async () => {
        try {
          // @ts-expect-error BarcodeDetector not yet in TS lib
          const detector = new BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'],
          })
          const codes = await detector.detect(img)
          if (codes.length > 0) {
            setBarcodeValue(codes[0].rawValue as string)
          }
        } catch {
          // detection failed — user can type manually
        } finally {
          URL.revokeObjectURL(url)
          setScanning(false)
        }
      }
      img.src = url
    }
    e.target.value = ''
  }

  function handleLabelCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setLabelImageUrl(reader.result as string)
      goToReview()
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function handleStartBarcode() {
    setScanMode('barcode')
    setBarcodeValue('')
    setStep('barcode')
  }

  function handleStartLabel() {
    setScanMode('labelscan')
    setLabelImageUrl(null)
    labelFileRef.current?.click()
  }

  function handleSubmit() {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Required'
    const cal = Math.round(parseFloat(calories))
    if (!calories || isNaN(cal) || cal <= 0) errs.calories = 'Enter a calorie amount'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    const food: FoodItem = {
      id: generateId(),
      name: name.trim(),
      barcode: barcodeValue.trim() || undefined,
      macros: {
        calories: cal,
        protein: Math.max(0, parseFloat(protein) || 0),
        carbs: Math.max(0, parseFloat(carbs) || 0),
        fat: Math.max(0, parseFloat(fat) || 0),
      },
      servingSizeG: 100,
      source: scanMode === 'labelscan' ? 'labelscan' : 'barcode',
      createdAt: new Date().toISOString(),
    }
    onConfirm(food, 100, slot)
  }

  // ── Idle ──────────────────────────────────────────────────────────────────

  if (step === 'idle') {
    return (
      <>
        <div className={styles.scrollContent}>
          <p className={styles.hint}>
            Scan a product barcode or photograph a nutrition label.
          </p>
          <div className={styles.modeGrid}>
            <button type="button" className={styles.modeCard} onClick={handleStartBarcode}>
              <span className={styles.modeIcon} aria-hidden>⬛</span>
              <span className={styles.modeLabel}>Scan Barcode</span>
              <span className={styles.modeDesc}>Enter or photograph a product barcode</span>
            </button>
            <button type="button" className={styles.modeCard} onClick={handleStartLabel}>
              <span className={styles.modeIcon} aria-hidden>📷</span>
              <span className={styles.modeLabel}>Label Photo</span>
              <span className={styles.modeDesc}>Photograph a nutrition facts label</span>
            </button>
          </div>
          {/* Hidden file input — label photo capture */}
          <input
            ref={labelFileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className={styles.hiddenInput}
            onChange={handleLabelCapture}
          />
        </div>
        <div className={styles.footer}>
          <p className={styles.footerNote}>Enter macros manually using the Manual tab.</p>
        </div>
      </>
    )
  }

  // ── Barcode ───────────────────────────────────────────────────────────────

  if (step === 'barcode') {
    return (
      <>
        <div className={styles.scrollContent}>
          <p className={styles.hint}>Type or scan the barcode number from the packaging.</p>
          <Input
            label="Barcode"
            value={barcodeValue}
            onChange={(e) => setBarcodeValue(e.target.value)}
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="e.g. 012345678905"
            autoFocus
          />
          {hasBarcodeDetector && (
            <>
              <p className={styles.orDivider}>— or —</p>
              <button
                type="button"
                className={styles.cameraBtn}
                onClick={() => barcodeFileRef.current?.click()}
                disabled={scanning}
              >
                {scanning ? 'Scanning…' : '📷  Open Camera to Scan'}
              </button>
              <input
                ref={barcodeFileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className={styles.hiddenInput}
                onChange={handleBarcodeCapture}
              />
            </>
          )}
        </div>
        <div className={styles.footer}>
          <Button variant="primary" size="lg" full onClick={goToReview} disabled={scanning}>
            Continue to Review
          </Button>
          <button type="button" className={styles.skipBtn} onClick={goToReview}>
            Skip barcode — enter macros only
          </button>
        </div>
      </>
    )
  }

  // ── Review ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className={styles.scrollContent}>
        {labelImageUrl && (
          <div className={styles.labelPreview}>
            <img src={labelImageUrl} alt="Nutrition label" className={styles.labelImage} />
          </div>
        )}
        {barcodeValue && (
          <p className={styles.barcodeChip}>Barcode: {barcodeValue}</p>
        )}
        <Input
          label="Food name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Protein Bar"
          error={errors.name}
          autoComplete="off"
          autoFocus
        />
        <Input
          label="Calories"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          inputMode="numeric"
          pattern="[0-9]*"
          error={errors.calories}
          rightElement={<span>kcal</span>}
        />
        <Input
          label="Protein"
          value={protein}
          onChange={(e) => setProtein(e.target.value)}
          inputMode="decimal"
          placeholder="0"
          rightElement={<span>g</span>}
        />
        <Input
          label="Carbs"
          value={carbs}
          onChange={(e) => setCarbs(e.target.value)}
          inputMode="decimal"
          placeholder="0"
          rightElement={<span>g</span>}
        />
        <Input
          label="Fat"
          value={fat}
          onChange={(e) => setFat(e.target.value)}
          inputMode="decimal"
          placeholder="0"
          rightElement={<span>g</span>}
        />
        <MealSlotPicker value={slot} onChange={setSlot} />
      </div>
      <div className={styles.footer}>
        <Button variant="primary" size="lg" full onClick={handleSubmit}>
          Log Food
        </Button>
        <button
          type="button"
          className={styles.skipBtn}
          onClick={() => setStep(scanMode === 'barcode' ? 'barcode' : 'idle')}
        >
          ← Back
        </button>
      </div>
    </>
  )
}
