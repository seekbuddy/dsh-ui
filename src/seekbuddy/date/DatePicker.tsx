import clsx from 'clsx'
import { Button } from '@seekbuddy/dsh-ui'
import { useState } from 'react'
import { Calendar } from './Calendar.tsx'
import type { CalendarBaseProps, CalendarLabels } from './Calendar.tsx'
import css from './DatePicker.module.css'
import { formatDateMedium, isOutsideBounds, monthOf, todayIso } from './date.ts'
import type { IsoDate, IsoMonth } from './date.ts'

export interface DatePickerLabels extends CalendarLabels {
  /** The "Today" shortcut button. */
  today: string
  /** Footer text while nothing is selected. */
  empty: string
}

export interface DatePickerProps extends Omit<CalendarBaseProps, 'numberOfMonths' | 'labels'> {
  /** Selected day, or `null` for none. */
  value: IsoDate | null
  /** Fires on every cell pick and on "Today" — no draft / apply step. */
  onChange: (date: IsoDate) => void
  /** All visible and screen-reader text; see `DatePickerLabels`. */
  labels: DatePickerLabels
  /**
   * Footer rendering of the selected day; defaults to an Intl medium date with a short weekday
   * in `locale` ("Wed, Nov 24, 2032" / "2032年11月24日周三").
   */
  formatSelected?: ((date: IsoDate) => string) | undefined
}

/**
 * Single-date panel: `Calendar mode="single"` plus a footer
 * with the formatted selection on the left and a "Today" shortcut on the right. "Today" turns
 * the page to the current month and selects it; it is disabled when today is outside
 * `min` / `max` or rejected by `isDateDisabled`. The month is owned here (controlled into the
 * calendar) so the shortcut can turn the page even when today is already the value.
 */
export function DatePicker({
  value,
  onChange,
  labels,
  formatSelected,
  month,
  onMonthChange,
  min,
  max,
  isDateDisabled,
  locale,
  today: todayProp,
  className,
  ...calendar
}: DatePickerProps) {
  const [todayFallback] = useState(() => todayProp ?? todayIso())
  const today = todayProp ?? todayFallback

  // Same follow rule as the calendar: the uncontrolled month tracks `value` when it leaves the view.
  const [monthState, setMonthState] = useState<IsoMonth>(() => monthOf(value ?? today))
  const [seenValue, setSeenValue] = useState(value)
  if (value !== seenValue) {
    setSeenValue(value)
    if (value !== null && monthOf(value) !== monthState) setMonthState(monthOf(value))
  }
  const visibleMonth = month ?? monthState
  const showMonth = (next: IsoMonth) => {
    if (month === undefined) setMonthState(next)
    onMonthChange?.(next)
  }

  const todayDisabled = isOutsideBounds(today, min, max) || (isDateDisabled?.(today) ?? false)
  const pickToday = () => {
    if (monthOf(today) !== visibleMonth) showMonth(monthOf(today))
    onChange(today)
  }
  const format = formatSelected ?? ((date: IsoDate) => formatDateMedium(locale, date))

  return (
    <div className={clsx(css.picker, className)}>
      <Calendar
        {...calendar}
        mode="single"
        value={value}
        onChange={onChange}
        month={visibleMonth}
        onMonthChange={showMonth}
        min={min}
        max={max}
        isDateDisabled={isDateDisabled}
        locale={locale}
        today={today}
        labels={labels}
      />
      <div className={css.footer}>
        <span className={clsx(css.summary, value === null && css.empty)}>
          {value === null ? labels.empty : format(value)}
        </span>
        <Button variant="ghost" size="sm" className={css.today} disabled={todayDisabled} onClick={pickToday}>
          {labels.today}
        </Button>
      </div>
    </div>
  )
}
