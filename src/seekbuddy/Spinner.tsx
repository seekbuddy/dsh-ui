import clsx from 'clsx'
import css from './Spinner.module.css'

/** `sm` = 0.85rem / 2px ring for buttons and inline text; `md` = 2rem / 3px for page-level waits. */
export type SpinnerSize = 'sm' | 'md'

/** `inherit` rides `currentColor` (button foreground); `page` pins `--dsw-alias-label-primary`. */
export type SpinnerTone = 'inherit' | 'page'

export interface SpinnerProps {
  /** Ring size; see `SpinnerSize`. Default `sm`. */
  size?: SpinnerSize | undefined
  /** Ring colour source; see `SpinnerTone`. Default `inherit`. */
  tone?: SpinnerTone | undefined
  /** Screen-reader text; when present the spinner becomes a live status region instead of aria-hidden. */
  label?: string | undefined
  /** Extra class on the root element, for layout. */
  className?: string | undefined
}

/**
 * The shared loading ring: track = currentColor at
 * 35%, arc = currentColor, reduced motion keeps a static two-tone ring. Without `label`
 * it is decorative (`aria-hidden`) and the surrounding text must say what is loading.
 */
export function Spinner({ size = 'sm', tone = 'inherit', label, className }: SpinnerProps) {
  const ring = clsx(css.ring, css[size], tone === 'page' && css.page)
  if (label === undefined) return <span className={clsx(ring, className)} aria-hidden="true" />
  return (
    <span className={clsx(css.status, className)} role="status" aria-live="polite">
      <span className={ring} aria-hidden="true" />
      <span className={css.label}>{label}</span>
    </span>
  )
}
