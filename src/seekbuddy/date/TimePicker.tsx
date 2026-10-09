import clsx from 'clsx'
import { useEffect, useId, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import css from './TimePicker.module.css'
import { clampTime, minutesToTime, parseIsoTime, timeToMinutes } from './date.ts'
import type { IsoTime } from './date.ts'

export type MinuteStep = 1 | 5 | 10 | 15 | 30

export interface TimePickerLabels {
  /** Hours column heading, also the listbox's accessible name. */
  hours: string
  /** Minutes column heading, also the listbox's accessible name. */
  minutes: string
}

export interface TimePickerProps {
  /** 24-hour `HH:mm`; `null` highlights the 00:00 position without reporting a value. */
  value: IsoTime | null
  /** Fires on every pick — column click or ↑ / ↓ / Home / End inside a column. */
  onChange: (time: IsoTime) => void
  /** Minute granularity; the minutes column lists only multiples of the step. Default 1. */
  minuteStep?: MinuteStep | undefined
  /** Earliest selectable time, inclusive; earlier options are disabled. */
  min?: IsoTime | undefined
  /** Latest selectable time, inclusive; later options are disabled. */
  max?: IsoTime | undefined
  /** Column headings; see `TimePickerLabels`. */
  labels: TimePickerLabels
  /** Focus the hours column on mount. */
  autoFocus?: boolean | undefined
  /** Extra class on the root element, for layout. */
  className?: string | undefined
}

const pad2 = (value: number) => String(value).padStart(2, '0')

interface Column {
  kind: 'hours' | 'minutes'
  label: string
  options: number[]
  /** Highlighted option: the value's component, or 0 while the value is null. */
  cursor: number
  isDisabled: (option: number) => boolean
  pick: (option: number) => void
}

/**
 * Two-column time list: hours 00–23 and minutes in
 * `minuteStep`, each a `role="listbox"` with one tab stop and `aria-activedescendant`;
 * ↑ / ↓ / Home / End move the selection and fire `onChange` at once, clicks do the same,
 * nothing wraps. `min` / `max` disable hours with no reachable minute and minutes outside the
 * window; a pick that would leave the window is clamped into it. The highlighted option
 * scrolls to the column's centre on mount and on every change. Upstream ships no time picker.
 */
export function TimePicker({
  value,
  onChange,
  minuteStep = 1,
  min,
  max,
  labels,
  autoFocus = false,
  className,
}: TimePickerProps) {
  const idBase = useId()
  const optionRefs = useRef(new Map<string, HTMLLIElement>())
  const hoursRef = useRef<HTMLUListElement>(null)
  const pendingAutoFocus = useRef(autoFocus)

  const parsed = value === null ? { h: 0, min: 0 } : parseIsoTime(value)
  const lower = min === undefined ? 0 : timeToMinutes(min)
  const upper = max === undefined ? 1439 : timeToMinutes(max)
  const inWindow = (minutes: number) => minutes >= lower && minutes <= upper

  const hours = Array.from({ length: 24 }, (_, hour) => hour)
  const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, index) => index * minuteStep)

  const emit = (h: number, m: number) => {
    const next = clampTime(minutesToTime(h * 60 + m), min, max)
    if (next !== value) onChange(next)
  }

  const columns: Column[] = [
    {
      kind: 'hours',
      label: labels.hours,
      options: hours,
      cursor: parsed.h,
      isDisabled: (hour) => !minutes.some((minute) => inWindow(hour * 60 + minute)),
      pick: (hour) => emit(hour, parsed.min),
    },
    {
      kind: 'minutes',
      label: labels.minutes,
      options: minutes,
      cursor: parsed.min,
      isDisabled: (minute) => !inWindow(parsed.h * 60 + minute),
      pick: (minute) => emit(parsed.h, minute),
    },
  ]

  const optionId = (kind: Column['kind'], option: number) => `${idBase}-${kind}-${option}`

  // Centre the highlighted option in each column on mount and whenever the value moves.
  useEffect(() => {
    for (const column of columns) {
      const node = optionRefs.current.get(optionId(column.kind, column.cursor))
      if (node !== undefined && typeof node.scrollIntoView === 'function') node.scrollIntoView({ block: 'center' })
    }
    if (pendingAutoFocus.current) {
      pendingAutoFocus.current = false
      hoursRef.current?.focus()
    }
  })

  const onKeyDown = (column: Column) => (event: KeyboardEvent<HTMLUListElement>) => {
    const enabled = column.options.filter((option) => !column.isDisabled(option))
    if (enabled.length === 0) return
    let target: number | undefined
    if (event.key === 'Home') target = enabled[0]
    else if (event.key === 'End') target = enabled[enabled.length - 1]
    else if (event.key === 'ArrowDown') target = enabled.find((option) => option > column.cursor)
    else if (event.key === 'ArrowUp') {
      for (const option of enabled) if (option < column.cursor) target = option
    } else return
    event.preventDefault()
    if (target !== undefined && (target !== column.cursor || value === null)) column.pick(target)
  }

  return (
    <div className={clsx(css.picker, className)}>
      {columns.map((column) => {
        const headingId = `${idBase}-${column.kind}-heading`
        return (
          <div key={column.kind} className={css.column}>
            <div id={headingId} className={css.heading}>
              {column.label}
            </div>
            <ul
              ref={column.kind === 'hours' ? hoursRef : undefined}
              role="listbox"
              aria-labelledby={headingId}
              aria-activedescendant={optionId(column.kind, column.cursor)}
              tabIndex={0}
              className={css.list}
              onKeyDown={onKeyDown(column)}
            >
              {column.options.map((option) => {
                const id = optionId(column.kind, option)
                const disabled = column.isDisabled(option)
                const active = column.cursor === option
                const selected = active && value !== null
                return (
                  <li
                    key={option}
                    id={id}
                    ref={(node) => {
                      if (node === null) optionRefs.current.delete(id)
                      else optionRefs.current.set(id, node)
                    }}
                    role="option"
                    aria-selected={selected}
                    aria-disabled={disabled || undefined}
                    data-active={active || undefined}
                    className={clsx(
                      css.option,
                      selected && css.selected,
                      active && !selected && css.placeholder,
                      disabled && css.disabled,
                    )}
                    onClick={() => {
                      if (!disabled) column.pick(option)
                    }}
                  >
                    {pad2(option)}
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
