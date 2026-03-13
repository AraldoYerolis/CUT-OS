import type { InputHTMLAttributes, ReactNode } from 'react'
import styles from './Input.module.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  rightElement?: ReactNode
}

export function Input({
  label,
  hint,
  error,
  rightElement,
  className,
  ...props
}: InputProps) {
  return (
    <div className={[styles.wrapper, error ? styles.error : '', className ?? ''].filter(Boolean).join(' ')}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.inputWrapper}>
        <input
          className={[styles.input, rightElement ? styles.hasRight : ''].filter(Boolean).join(' ')}
          {...props}
        />
        {rightElement && <span className={styles.right}>{rightElement}</span>}
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
    </div>
  )
}
