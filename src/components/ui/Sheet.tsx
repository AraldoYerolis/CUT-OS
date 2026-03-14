import { useEffect, type ReactNode } from 'react'
import styles from './Sheet.module.css'

interface SheetProps {
  isOpen: boolean
  onClose: () => void
  children?: ReactNode
  /** Rendered outside the scrollable body, pinned to the sheet bottom */
  footer?: ReactNode
  /** Accessible label for the sheet dialog */
  label?: string
}

export function Sheet({ isOpen, onClose, children, footer, label = 'Sheet' }: SheetProps) {
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
      <div
        className={[styles.backdrop, isOpen ? styles.backdropOpen : ''].join(' ')}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={[styles.sheet, isOpen ? styles.sheetOpen : ''].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label={label}
      >
        <div className={styles.handle} aria-hidden="true">
          <div className={styles.handleBar} />
        </div>

        {/* Scrollable content area */}
        <div className={styles.body}>{children}</div>

        {/* Pinned footer — outside .body, never scrolls */}
        {footer != null && (
          <div className={styles.sheetFooter}>{footer}</div>
        )}
      </div>
    </>
  )
}
