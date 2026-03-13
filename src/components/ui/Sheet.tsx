import { useEffect, type ReactNode } from 'react'
import styles from './Sheet.module.css'

interface SheetProps {
  isOpen: boolean
  onClose: () => void
  children?: ReactNode
  /** Accessible label for the sheet dialog */
  label?: string
}

/**
 * Bottom sheet component.
 * Phase 1: open/close with CSS transition + backdrop dismiss.
 * Drag-to-close gesture will be added in Phase 4.
 */
export function Sheet({ isOpen, onClose, children, label = 'Sheet' }: SheetProps) {
  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Backdrop */}
      <div
        className={[styles.backdrop, isOpen ? styles.backdropOpen : ''].join(' ')}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={[styles.sheet, isOpen ? styles.sheetOpen : ''].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label={label}
      >
        <div className={styles.handle} aria-hidden="true">
          <div className={styles.handleBar} />
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </>
  )
}
