import type { ReactNode } from 'react'
import styles from './Screen.module.css'

interface ScreenProps {
  children: ReactNode
  /** Whether this screen scrolls or is fixed layout */
  scroll?: boolean
  /** Apply bottom padding for tab nav (default true) */
  withNav?: boolean
  className?: string
}

/**
 * Full-screen wrapper that handles safe areas.
 * Use as the root element of every screen component.
 */
export function Screen({
  children,
  scroll = true,
  withNav = true,
  className,
}: ScreenProps) {
  const classes = [
    styles.screen,
    scroll ? styles.scroll : '',
    withNav ? styles.withNav : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return <div className={classes}>{children}</div>
}
