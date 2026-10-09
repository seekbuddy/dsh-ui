import clsx from 'clsx'
import { useState } from 'react'
import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react'
import css from './Switch.module.css'

/** `large` = 44×22 (antd default), `medium` = 36×20 (default), `small` = 28×16 for dense rows and table cells. */
export type SwitchSize = 'large' | 'medium' | 'small'

export interface SwitchProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange' | 'onClick' | 'children' | 'type' | 'role' | 'aria-checked' | 'defaultValue'
> {
  /** Controlled state; when given, the caller owns it and `defaultChecked` is ignored. */
  checked?: boolean | undefined
  /** Initial state for the uncontrolled form. */
  defaultChecked?: boolean | undefined
  /** Alias of `defaultChecked` (antd parity). */
  defaultValue?: boolean | undefined
  /** Content shown inside the track while on (short text or a 12px icon). */
  checkedChildren?: ReactNode
  /** Content shown inside the track while off. */
  unCheckedChildren?: ReactNode
  /** Blocks clicks and dims the switch; `onChange` does not fire. */
  disabled?: boolean | undefined
  /** Track size; see `SwitchSize`. Default `medium`. */
  size?: SwitchSize | undefined
  /** Fires when the value flips (after `onClick`); not fired while `disabled`. */
  onChange?: ((checked: boolean, event: MouseEvent<HTMLButtonElement>) => void) | undefined
  /** Fires on every click with the value the switch is about to take. */
  onClick?: ((checked: boolean, event: MouseEvent<HTMLButtonElement>) => void) | undefined
}

/**
 * Binary on/off toggle (`role="switch"`, WAI-ARIA switch pattern) with the antd `Switch` prop
 * shape. Upstream's own `Switch` is a minimal, fully controlled control with a different prop shape; this
 * one keeps antd's. Colours follow upstream's: on track
 * `--dsw-alias-brand-primary` with thumb and track text in `--dsw-alias-label-primary-foreground`,
 * off track a 40 % `color-mix` of `--dsw-alias-label-primary` with a `--dsw-alias-switch-thumb`
 * thumb; capsule and thumb are true circles (`corner-shape: round`); no motion. Differences from antd (deliberate, only these two): the default `size` is `medium`
 * (36×20) rather than `large`, and there is no `loading` prop.
 *
 * Accessibility: a switch without `checkedChildren` / `unCheckedChildren` is purely graphical, so
 * pass `aria-label` (or `aria-labelledby` pointing at the visible row label).
 */
export function Switch({
  checked,
  defaultChecked,
  defaultValue,
  checkedChildren,
  unCheckedChildren,
  disabled,
  size = 'medium',
  onChange,
  onClick,
  className,
  ...rest
}: SwitchProps) {
  const [inner, setInner] = useState(defaultChecked ?? defaultValue ?? false)
  const isControlled = checked !== undefined
  const on = isControlled ? checked : inner
  const hasChildren = checkedChildren !== undefined || unCheckedChildren !== undefined

  return (
    <button
      {...rest}
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      className={clsx(css.switch, css[size], on && css.on, hasChildren && css.withChildren, className)}
      onClick={(event) => {
        if (disabled) return
        const next = !on
        onClick?.(next, event)
        if (event.defaultPrevented) return
        if (!isControlled) setInner(next)
        onChange?.(next, event)
      }}
    >
      <span className={css.thumb} aria-hidden="true" />
      {hasChildren && <span className={css.inner}>{on ? checkedChildren : unCheckedChildren}</span>}
    </button>
  )
}
