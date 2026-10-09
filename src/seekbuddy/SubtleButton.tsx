import clsx from 'clsx'
import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { Button } from '@seekbuddy/dsh-ui'
import css from './SubtleButton.module.css'

/** Upstream `Button` props minus `variant`: the shape is fixed to the ghost capsule. */
export type SubtleButtonProps = Omit<ComponentPropsWithoutRef<typeof Button>, 'variant' | 'className'> & {
  /** Extra class on the `<button>`, for layout. */
  className?: string | undefined
}

/**
 * Ghost capsule with a secondary label — for low-emphasis navigation that sits next to real actions
 * (a card's "view details" link, a back button), where the default ghost label would compete with them.
 *
 * Upstream `ButtonVariant` has no quiet family, and setting `color` on a ghost `Button` through a consumer
 * `className` covers its resting state only. This owns the whole state set once — the label steps up to the
 * primary label on hover and press, plus a focus-visible ring — while geometry, sizes, the hover / press
 * fills and the disabled 40 % opacity stay with the upstream ghost `Button` it wraps.
 *
 * Tokens: `--dsw-alias-label-secondary` (resting label), `--dsw-alias-label-primary` (hover / press label)
 * and the shared focus ring (width and colour from the theme's `focus.css`).
 * All are theme-aware, so dark mode needs no extra rules.
 */
export const SubtleButton = forwardRef<HTMLButtonElement, SubtleButtonProps>(function SubtleButton({ className, ...rest }, ref) {
  return <Button {...rest} ref={ref} variant="ghost" className={clsx(css.subtle, className)} />
})
