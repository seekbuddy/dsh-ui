import clsx from 'clsx'
import type { HTMLAttributes } from 'react'
import css from './Card.module.css'

/** Inner padding: `none` = 0 (self-laid-out content such as a cover image), `sm` = 14px (dense catalog cards), `md` = 16px (default). */
export type CardPadding = 'none' | 'sm' | 'md'
/** Rendered element; pick `li` inside a list so the card needs no wrapper. */
export type CardElement = 'div' | 'section' | 'article' | 'li'

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Inner padding; see `CardPadding`. Default `md` (16px). */
  padding?: CardPadding | undefined
  /**
   * Hover feedback for cards the caller makes clickable: the translucent `--dsw-alias-interactive-bg-hover`
   * fill upstream's plugin cards use, plus the pointer cursor.
   * Styling only — clicking is wired by the caller (`onClick` here, or a `<button>` inside).
   */
  interactive?: boolean | undefined
  /** Element to render; see `CardElement`. Default `div`. */
  as?: CardElement | undefined
}

/**
 * Card surface only — background, hairline stroke, radius, elevation, padding — with the content
 * left entirely to `children`. Upstream primitives ship no card / panel, so hand-rolled cards
 * tend to drift apart. No header / footer / title slots by design:
 * business cards do not share an inner structure, so the library does not pretend they do.
 *
 * Server-safe (no hooks, no DOM access): a Next.js Server Component may import it from
 * `@seekbuddy/dsh-ui/seekbuddy/card`. Sets no `role` / `tabIndex` — a fully clickable card is the
 * caller's accessibility decision (put a `<button>` inside, or wire `role="button"` + keyboard).
 */
export function Card({ padding = 'md', interactive = false, as: Element = 'div', className, ...rest }: CardProps) {
  return <Element {...rest} className={clsx(css.card, css[padding], interactive && css.interactive, className)} />
}
