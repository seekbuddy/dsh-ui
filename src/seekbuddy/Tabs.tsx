import clsx from 'clsx'
import { useId, useRef } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import css from './Tabs.module.css'

export interface TabItem<T extends string> {
  /** Stable identity of the tab; also the value handed to `onChange` (antd `items[].key`). */
  key: T
  /** Visible tab text. */
  label: ReactNode
  /** Optional count badge; omitted when undefined. */
  count?: number | undefined
  /** Skipped by the arrow keys and not selectable. */
  disabled?: boolean | undefined
  /**
   * Optional panel content. When any item carries `children`, the component renders the
   * active item's panel itself (`role="tabpanel"`, wired with `aria-controls` / `aria-labelledby`).
   * Leave it out when the panel is routed content the caller renders (for example a router outlet).
   */
  children?: ReactNode | undefined
}

export interface TabsProps<T extends string> {
  /** Accessible name of the tab list ("Skill views"). */
  label: string
  /** Tabs in display order. */
  items: ReadonlyArray<TabItem<T>>
  /** Controlled selection (antd `activeKey`); the caller owns it (URL state, useState, …). */
  activeKey: T
  /** Called with the key of the tab the user selects. */
  onChange: (key: T) => void
  /**
   * DOM id of a caller-rendered panel showing the selected tab's content. Every tab then declares
   * `aria-controls={panelId}` and gets the id `<panelId>-tab-<key>` for the panel's `aria-labelledby`.
   * Ignored when items carry `children` (ids are generated and wired automatically).
   */
  panelId?: string | undefined
  /**
   * Type scale of the tab labels: `sm` = `--dsw-font-xxs-12` (default; toolbars and in-card switches),
   * `md` = `--dsw-font-s-14`, `lg` = `--dsw-font-base-16` (page-level view switches).
   */
  size?: 'sm' | 'md' | 'lg' | undefined
  /** Bold labels: every tab takes the `-strong-` variant of its size's font token (weight 600 in the theme). */
  bold?: boolean | undefined
  /** Extra class on the root element, for layout. */
  className?: string | undefined
}

const NEXT_KEYS = new Set(['ArrowRight', 'ArrowDown'])
const PREVIOUS_KEYS = new Set(['ArrowLeft', 'ArrowUp'])

/**
 * Underline tab list (WAI-ARIA tabs, automatic activation): roving tabindex, arrow /
 * Home / End keys move selection and focus, disabled tabs are skipped. Upstream ships
 * no Tabs — its view switchers are rows of `Pill` — so this package provides one.
 * Data-driven like antd's `items`.
 */
export function Tabs<T extends string>({
  label,
  items,
  activeKey,
  onChange,
  panelId,
  size = 'sm',
  bold = false,
  className,
}: TabsProps<T>) {
  const generatedId = useId()
  const buttons = useRef(new Map<T, HTMLButtonElement>())
  const withPanels = items.some((item) => item.children !== undefined)
  const idBase = panelId === undefined || withPanels ? generatedId : panelId
  const tabId = (key: T) => `${idBase}-tab-${key}`
  const ownPanelId = (key: T) => `${idBase}-panel-${key}`
  const enabled = items.filter((item) => item.disabled !== true)
  const selected = enabled.some((item) => item.key === activeKey) ? activeKey : enabled[0]?.key
  const active = items.find((item) => item.key === selected)

  const move = (event: KeyboardEvent<HTMLDivElement>) => {
    if (enabled.length === 0) return
    const current = Math.max(
      0,
      enabled.findIndex((item) => item.key === selected),
    )
    let next: number
    if (NEXT_KEYS.has(event.key)) next = (current + 1) % enabled.length
    else if (PREVIOUS_KEYS.has(event.key)) next = (current - 1 + enabled.length) % enabled.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = enabled.length - 1
    else return
    event.preventDefault()
    const target = enabled[next]
    if (target === undefined) return
    onChange(target.key)
    buttons.current.get(target.key)?.focus()
  }

  const tablist = (
    <div
      className={clsx(css.tablist, css[size], bold && css.bold, !withPanels && className)}
      role="tablist"
      aria-label={label}
      onKeyDown={move}
    >
      {items.map((item) => {
        const isActive = item.key === selected
        return (
          <button
            key={item.key}
            ref={(node) => {
              if (node === null) buttons.current.delete(item.key)
              else buttons.current.set(item.key, node)
            }}
            type="button"
            role="tab"
            id={tabId(item.key)}
            aria-selected={isActive}
            aria-controls={withPanels ? ownPanelId(item.key) : panelId}
            tabIndex={isActive ? 0 : -1}
            disabled={item.disabled}
            className={clsx(css.tab, isActive && css.active)}
            onClick={() => {
              if (!isActive) onChange(item.key)
            }}
          >
            {item.label}
            {item.count !== undefined && <span className={css.count}>{item.count}</span>}
          </button>
        )
      })}
    </div>
  )

  if (!withPanels) return tablist
  return (
    <div className={clsx(css.tabs, className)}>
      {tablist}
      {active !== undefined && (
        <div
          role="tabpanel"
          id={ownPanelId(active.key)}
          aria-labelledby={tabId(active.key)}
          tabIndex={0}
          className={css.panel}
        >
          {active.children}
        </div>
      )}
    </div>
  )
}
