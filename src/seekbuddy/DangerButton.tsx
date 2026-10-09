import clsx from 'clsx'
import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { Button } from '@seekbuddy/dsh-ui'
import css from './DangerButton.module.css'

/** Upstream `Button` props minus `variant`: the shape is fixed to the outline capsule. */
export type DangerButtonProps = Omit<ComponentPropsWithoutRef<typeof Button>, 'variant' | 'className'> & {
  /** Extra class on the `<button>`, for layout. */
  className?: string | undefined
}

/**
 * Outline capsule in the error tone — red label and stroke — for destructive actions (delete,
 * disable) and error-state affordances (e.g. a "review failed" chip that opens the reason).
 *
 * Upstream `ButtonVariant` has no danger family, and restyling the upstream `Button` through a
 * consumer `className` tends to cover only the hover state. This owns the whole state set
 * once — hover, active, focus-visible — while geometry, sizes and the disabled 40 % opacity stay
 * with the upstream `Button` it wraps.
 *
 * Tokens: `--dsw-alias-state-error-primary` (label and stroke; the same token upstream `Menu`
 * uses for its danger item), `--dsw-alias-interactive-bg-hover-danger` (hover fill), an 18 %
 * `color-mix` of the error tone (active fill; no dedicated alias token), and the shared focus ring (width and colour from the theme's `focus.css`).
 * All are theme-aware, so dark mode needs no extra rules.
 */
export const DangerButton = forwardRef<HTMLButtonElement, DangerButtonProps>(function DangerButton({ className, ...rest }, ref) {
  return <Button {...rest} ref={ref} variant="outline" className={clsx(css.danger, className)} />
})
