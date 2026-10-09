import clsx from 'clsx'
import { Button } from '@seekbuddy/dsh-ui'
import { IconChevronLeftOutlineRegular, IconChevronRightOutlineRegular } from '@seekbuddy/dsh-ui/icons'
import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import css from './Calendar.module.css'
import {
  addDays,
  addMonths,
  addMonthsToDate,
  compareIso,
  isInRange,
  isOutsideBounds,
  monthGrid,
  monthOf,
  monthTitle,
  normalizeRange,
  todayIso,
  weekOffset,
  weekdayNames,
} from './date.ts'
import type { DateRange, IsoDate, IsoMonth, WeekStart } from './date.ts'

/** Cell state handed to `labels.dayLabel` so the caller can phrase the screen-reader sentence. */
export interface CalendarDayState {
  /** Single mode: the value. Range mode: the start or the end. */
  selected: boolean
  /** The cell is today (`today` prop, or the host's local date). */
  today: boolean
  /** Outside `min` / `max` or refused by `isDateDisabled`. */
  disabled: boolean
  /** Range mode: inside the committed range (ends included). Always false in single mode. */
  inRange: boolean
}

export interface CalendarLabels {
  /** `aria-label` of the previous-month button. */
  previousMonth: string
  /** `aria-label` of the next-month button. */
  nextMonth: string
  /** `aria-label` of the previous-year button. */
  previousYear: string
  /** `aria-label` of the next-year button. */
  nextYear: string
  /**
   * Screen-reader name of one day cell, `(date, state)` → a full sentence such as
   * "Wednesday, November 24, 2032, selected". Week / month names come from `locale`; this is the only per-cell copy.
   */
  dayLabel: (date: IsoDate, state: CalendarDayState) => string
}

export interface CalendarBaseProps {
  /** Controlled visible month (the left one when two are shown); uncontrolled follows `value`, then `today`. */
  month?: IsoMonth | undefined
  /** Called with the new visible month when the user navigates. */
  onMonthChange?: ((month: IsoMonth) => void) | undefined
  /** Months side by side; single mode defaults to 1, range mode to 2. */
  numberOfMonths?: 1 | 2 | undefined
  /** Earliest selectable day, inclusive. */
  min?: IsoDate | undefined
  /** Latest selectable day, inclusive. */
  max?: IsoDate | undefined
  /** Extra disabling rule on top of `min` / `max` ("weekdays only"). */
  isDateDisabled?: ((date: IsoDate) => boolean) | undefined
  /** BCP 47 tag driving weekday / month names; defaults to the browser language. */
  locale?: string | undefined
  /** 1 = Monday (default), 0 = Sunday. */
  weekStart?: WeekStart | undefined
  /** Injected "today" for tests and non-local zones; defaults to the host's local date. */
  today?: IsoDate | undefined
  /** Navigation and screen-reader text; see `CalendarLabels`. */
  labels: CalendarLabels
  /** Move focus to the tab-stop cell (selected → today → first enabled) on mount. */
  autoFocus?: boolean | undefined
  /** Extra class on the root element, for layout. */
  className?: string | undefined
}

export interface CalendarSingleProps extends CalendarBaseProps {
  /** `single` picks one day; `range` picks a start and an end. */
  mode: 'single'
  /** Selected day, or `null` for none. */
  value: IsoDate | null
  /** Called with the picked day. */
  onChange: (date: IsoDate) => void
}

/** A range whose end is still being picked (`end: null`); `DateRange` is the completed form. */
export interface DateRangeDraft {
  /** The first picked day. */
  start: IsoDate
  /** `null` until the second day is picked. */
  end: IsoDate | null
}

export interface CalendarRangeProps extends CalendarBaseProps {
  /** `single` picks one day; `range` picks a start and an end. */
  mode: 'range'
  /** Pass the draft back as-is while the end is pending — the component is fully controlled. */
  value: DateRange | DateRangeDraft | null
  /**
   * First pick → `{ start, end: null }`; second pick → the ordered `DateRange` (a reversed
   * pick swaps the ends). A third pick starts a new draft.
   */
  onChange: (range: DateRange | DateRangeDraft) => void
}

export type CalendarProps = CalendarSingleProps | CalendarRangeProps

/** Position of a cell inside a committed or previewed range (`data-range` / `data-range-preview`). */
export type CalendarRangePosition = 'start' | 'middle' | 'end' | 'single'

const DAY_KEYS: Readonly<Record<string, number>> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }

interface VisibleMonth {
  month: IsoMonth
  title: string
  titleId: string
  cells: IsoDate[]
}

function rangePosition(date: IsoDate, range: DateRange): CalendarRangePosition | undefined {
  if (!isInRange(date, range)) return undefined
  if (range.start === range.end) return 'single'
  if (date === range.start) return 'start'
  if (date === range.end) return 'end'
  return 'middle'
}

/**
 * Month grid with WAI-ARIA grid keyboard support: one roving tab stop for the whole calendar,
 * arrows move by day / week, Home / End to the week's ends, PageUp / PageDown by month
 * (Shift: by year), Enter / Space pick. Moving focus past the visible months turns the page.
 * Padding days from the neighbouring months are visible, clickable (they turn the page as
 * they pick) and never the tab stop. Range mode adds a two-pick state machine: after the
 * start is picked, hovering or keyboard-focusing a day previews the range (`data-range-preview`),
 * the second pick commits it ordered, and committed cells carry `data-range` positions.
 * Upstream primitives ship no calendar, so this package provides
 * one; `DatePicker` / `DateRangePicker` compose it.
 */
export function Calendar(props: CalendarProps) {
  const {
    month,
    onMonthChange,
    numberOfMonths = props.mode === 'range' ? 2 : 1,
    min,
    max,
    isDateDisabled,
    locale,
    weekStart = 1,
    today: todayProp,
    labels,
    autoFocus = false,
    className,
  } = props
  const idBase = useId()
  const [today] = useState(() => todayProp ?? todayIso())
  const resolvedToday = todayProp ?? today

  // Selection, flattened for both modes.
  const single = props.mode === 'single' ? props.value : null
  const rangeStart = props.mode === 'range' ? (props.value?.start ?? null) : null
  const rangeEnd = props.mode === 'range' ? (props.value?.end ?? null) : null
  const committed: DateRange | null =
    rangeStart !== null && rangeEnd !== null ? { start: rangeStart, end: rangeEnd } : null
  const drafting = props.mode === 'range' && rangeStart !== null && rangeEnd === null
  /** The date the visible month follows and the first tab-stop candidate. */
  const anchor = props.mode === 'single' ? single : rangeStart

  // Uncontrolled month follows the anchor when it changes to a month that is not on screen
  // (render-time adjustment, no effect flash); picks inside the visible months never jump the view.
  const [monthState, setMonthState] = useState<IsoMonth>(() => monthOf(anchor ?? resolvedToday))
  const [seenAnchor, setSeenAnchor] = useState(anchor)
  if (anchor !== seenAnchor) {
    setSeenAnchor(anchor)
    if (anchor !== null) {
      const anchorMonth = monthOf(anchor)
      const visibleUntil = addMonths(monthState, numberOfMonths - 1)
      if (compareIso(anchorMonth, monthState) < 0 || compareIso(anchorMonth, visibleUntil) > 0) {
        setMonthState(anchorMonth)
      }
    }
  }
  const firstMonth = month ?? monthState
  const lastMonth = addMonths(firstMonth, numberOfMonths - 1)
  const showMonth = (next: IsoMonth) => {
    if (month === undefined) setMonthState(next)
    onMonthChange?.(next)
  }

  // Roving focus: the date whose cell owns tabIndex=0; `pendingFocus` moves DOM focus after a re-render.
  const [focused, setFocused] = useState<IsoDate | null>(null)
  const pendingFocus = useRef<IsoDate | null>(null)
  const pendingAutoFocus = useRef(autoFocus)
  const cellRefs = useRef(new Map<IsoDate, HTMLButtonElement>())

  // Range preview target: the hovered day, else the day that currently holds DOM focus.
  const [hovered, setHovered] = useState<IsoDate | null>(null)
  const [focusedCell, setFocusedCell] = useState<IsoDate | null>(null)
  const previewTarget = drafting ? (hovered ?? focusedCell) : null
  const preview: DateRange | null =
    previewTarget !== null && rangeStart !== null && previewTarget !== rangeStart
      ? normalizeRange(rangeStart, previewTarget)
      : null

  const isDisabled = (date: IsoDate) => isOutsideBounds(date, min, max) || (isDateDisabled?.(date) ?? false)
  const inView = (date: IsoDate) => {
    const m = monthOf(date)
    return compareIso(m, firstMonth) >= 0 && compareIso(m, lastMonth) <= 0
  }

  const months: VisibleMonth[] = []
  for (let index = 0; index < numberOfMonths; index += 1) {
    const current = addMonths(firstMonth, index)
    months.push({
      month: current,
      title: monthTitle(locale, current),
      titleId: `${idBase}-title-${index}`,
      cells: monthGrid(current, weekStart),
    })
  }

  // Tab stop: focused cell if still in view → anchor (value / range start) → today → first enabled in-month cell.
  let tabStop: IsoDate | null = null
  if (focused !== null && inView(focused)) tabStop = focused
  else if (anchor !== null && inView(anchor)) tabStop = anchor
  else if (inView(resolvedToday)) tabStop = resolvedToday
  else {
    outer: for (const visible of months) {
      for (const date of visible.cells) {
        if (monthOf(date) === visible.month && !isDisabled(date)) {
          tabStop = date
          break outer
        }
      }
    }
  }

  useEffect(() => {
    const target = pendingAutoFocus.current ? tabStop : pendingFocus.current
    pendingAutoFocus.current = false
    pendingFocus.current = null
    if (target !== null) cellRefs.current.get(target)?.focus()
  })

  const moveFocus = (next: IsoDate) => {
    setFocused(next)
    pendingFocus.current = next
    if (compareIso(monthOf(next), firstMonth) < 0) showMonth(monthOf(next))
    else if (compareIso(monthOf(next), lastMonth) > 0) showMonth(addMonths(monthOf(next), -(numberOfMonths - 1)))
  }

  const onGridKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
    const origin = (event.target as HTMLElement).dataset['date'] as IsoDate | undefined
    if (origin === undefined) return
    let next: IsoDate
    const days = DAY_KEYS[event.key]
    if (days !== undefined) next = addDays(origin, days)
    else if (event.key === 'Home') next = addDays(origin, -weekOffset(origin, weekStart))
    else if (event.key === 'End') next = addDays(origin, 6 - weekOffset(origin, weekStart))
    else if (event.key === 'PageUp') next = addMonthsToDate(origin, event.shiftKey ? -12 : -1)
    else if (event.key === 'PageDown') next = addMonthsToDate(origin, event.shiftKey ? 12 : 1)
    else return
    event.preventDefault()
    moveFocus(next)
  }

  const current = props
  const pick = (date: IsoDate) => {
    if (isDisabled(date)) return
    setFocused(date)
    if (!inView(date)) {
      pendingFocus.current = date
      showMonth(monthOf(date))
    }
    if (current.mode === 'single') current.onChange(date)
    else if (drafting && rangeStart !== null) {
      setHovered(null)
      current.onChange(normalizeRange(rangeStart, date))
    } else current.onChange({ start: date, end: null })
  }

  const weekdaysShort = weekdayNames(locale, weekStart, 'short')
  const weekdaysLong = weekdayNames(locale, weekStart, 'long')
  const twoMonths = numberOfMonths === 2

  const nav = (label: string, onClick: () => void, icon: 'prev' | 'next', double: boolean) => {
    const Chevron = icon === 'prev' ? IconChevronLeftOutlineRegular : IconChevronRightOutlineRegular
    return (
      <Button
        variant="ghost"
        size="sm"
        className={css.nav}
        aria-label={label}
        onClick={onClick}
        icon={
          double ? (
            <span className={css.double} aria-hidden="true">
              <Chevron />
              <Chevron />
            </span>
          ) : (
            <Chevron />
          )
        }
      />
    )
  }

  const renderMonth = (visible: VisibleMonth, index: number) => (
    <div key={index} className={css.month}>
      <div className={css.header}>
        {twoMonths ? (
          index === 0 && nav(labels.previousMonth, () => showMonth(addMonths(firstMonth, -1)), 'prev', false)
        ) : (
          <span className={css.navGroup}>
            {nav(labels.previousYear, () => showMonth(addMonths(firstMonth, -12)), 'prev', true)}
            {nav(labels.previousMonth, () => showMonth(addMonths(firstMonth, -1)), 'prev', false)}
          </span>
        )}
        <span id={visible.titleId} className={css.title} aria-live="polite">
          {visible.title}
        </span>
        {twoMonths ? (
          index === numberOfMonths - 1 &&
          nav(labels.nextMonth, () => showMonth(addMonths(firstMonth, 1)), 'next', false)
        ) : (
          <span className={css.navGroup}>
            {nav(labels.nextMonth, () => showMonth(addMonths(firstMonth, 1)), 'next', false)}
            {nav(labels.nextYear, () => showMonth(addMonths(firstMonth, 12)), 'next', true)}
          </span>
        )}
      </div>
      <table role="grid" aria-labelledby={visible.titleId} className={css.grid} onKeyDown={onGridKeyDown}>
        <thead>
          <tr>
            {weekdaysShort.map((name, column) => (
              <th key={name} scope="col" abbr={weekdaysLong[column]} className={css.weekday}>
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }, (_, row) => (
            <tr key={row}>
              {visible.cells.slice(row * 7, row * 7 + 7).map((date) => {
                const outside = monthOf(date) !== visible.month
                const state: CalendarDayState = {
                  selected: props.mode === 'single' ? single === date : date === rangeStart || date === rangeEnd,
                  today: date === resolvedToday,
                  disabled: isDisabled(date),
                  inRange: committed !== null && isInRange(date, committed),
                }
                // Range bands only paint on in-month cells; padding twins would double the band.
                const position = !outside && committed !== null ? rangePosition(date, committed) : undefined
                const previewPosition =
                  !outside && preview !== null && date !== rangeStart ? rangePosition(date, preview) : undefined
                return (
                  <td
                    key={date}
                    role="gridcell"
                    aria-selected={state.selected}
                    aria-disabled={state.disabled || undefined}
                    className={css.cell}
                  >
                    <button
                      type="button"
                      ref={(node) => {
                        // Padding cells also render in the neighbouring month; only in-month cells own the ref.
                        if (outside) return
                        if (node === null) cellRefs.current.delete(date)
                        else cellRefs.current.set(date, node)
                      }}
                      tabIndex={!outside && date === tabStop ? 0 : -1}
                      aria-label={labels.dayLabel(date, state)}
                      aria-disabled={state.disabled || undefined}
                      data-date={date}
                      data-outside={outside || undefined}
                      data-range={position}
                      data-range-preview={previewPosition}
                      className={clsx(
                        css.day,
                        state.selected && !outside && css.selected,
                        state.today && css.today,
                        outside && css.outside,
                        state.disabled && css.disabled,
                      )}
                      onClick={() => pick(date)}
                      onPointerEnter={drafting ? () => setHovered(date) : undefined}
                      onFocus={props.mode === 'range' ? () => setFocusedCell(date) : undefined}
                      onBlur={props.mode === 'range' ? () => setFocusedCell(null) : undefined}
                    >
                      {Number(date.slice(-2))}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div
      className={clsx(css.calendar, twoMonths && css.twoMonths, props.mode === 'range' && css.range, className)}
      onPointerLeave={drafting ? () => setHovered(null) : undefined}
    >
      {months.map(renderMonth)}
    </div>
  )
}
