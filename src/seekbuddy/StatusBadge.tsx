import clsx from 'clsx'
import type { ReactNode } from 'react'
import { Pill, StateDot, type StateDotState } from '@seekbuddy/dsh-ui'
import css from './StatusBadge.module.css'

/**
 * Closed set of tones. Each one is a fixed meaning with its own state dot and theme token; adding a
 * tone means adding an entry here and in `DOTS`, a colour class in `StatusBadge.module.css` and a
 * story — callers only pick a tone, never a colour.
 */
export type StatusTone = 'neutral' | 'success' | 'progress' | 'warning' | 'error'

/** Tone to the upstream dot's own state vocabulary. `progress` is the animated one. */
const DOTS: Readonly<Record<StatusTone, StateDotState>> = {
  neutral: 'idle',
  success: 'done',
  progress: 'ongoing',
  warning: 'warning',
  error: 'error',
}

export interface StatusBadgeProps {
  /** Meaning of the badge, which fixes its dot and colour; see `StatusTone`. */
  tone: StatusTone
  /** Label text; localized by the caller. */
  children: ReactNode
  /** Drop the leading dot when the row already carries one. Default `true`. */
  dot?: boolean | undefined
  /** Extra class on the root element, for layout. */
  className?: string | undefined
}

/**
 * Read-only status chip: a state dot plus a label, in one of five tones — "running", "mounting",
 * "not connected", "mount failed", "delisted" and friends.
 *
 * The dot is the upstream `StateDot` (the same glyph the terminal block uses for run state), so
 * `progress` gets upstream's animated chase rather than a second spinner vocabulary. Colour comes
 * from the tone: upstream `Pill` has no tone variants, and recolouring an upstream component through
 * a consumer `className` couples the caller to its internal styles. This owns the tones once so no
 * call site needs that override. Geometry — capsule,
 * height, font — stays with the `Pill` it wraps.
 *
 * Static by design: no `onClick`, so `Pill` renders a `<span>` and there are no interactive states
 * to keep in sync. The dot is `aria-hidden`; the label carries the meaning. Tokens are theme-aware
 * (`--dsw-alias-state-*` / `--dsw-alias-label-tertiary`), so dark mode needs no extra rules.
 */
export function StatusBadge({ tone, children, dot = true, className }: StatusBadgeProps) {
  return (
    // Static Pill forwards only className / children, so the tone is carried by its class alone.
    <Pill className={clsx(css.badge, css[tone], className)}>
      {dot && <StateDot state={DOTS[tone]} size={8} className={css.dot} />}
      {children}
    </Pill>
  )
}
