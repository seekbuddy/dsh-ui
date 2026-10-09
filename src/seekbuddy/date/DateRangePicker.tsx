import clsx from 'clsx'
import { Button } from '@seekbuddy/dsh-ui'
import { IconCheckOutlineRegular } from '@seekbuddy/dsh-ui/icons'
import { useId, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Calendar } from './Calendar.tsx'
import type { CalendarBaseProps, CalendarLabels, DateRangeDraft } from './Calendar.tsx'
import css from './DateRangePicker.module.css'
import { addMonths, compareIso, monthOf, todayIso } from './date.ts'
import type { DateRange, IsoDate, IsoMonth } from './date.ts'

export interface DateRangePreset {
  /** Stable identity of the preset. */
  key: string
  /** Visible preset text, e.g. "Last 7 days". */
  label: string
  /** Computed by the caller — "last 7 days" depends on today and the time zone, not on the component. */
  range: DateRange
}

export interface DateRangePickerLabels extends CalendarLabels {
  /** Accessible name of the presets list. */
  presets: string
  /** Caption of the button that discards the draft. */
  cancel: string
  /** Caption of the button that commits the range. */
  apply: string
  /** Status shown (and announced) while the start is picked and the end is still pending. */
  pickEnd: string
}

export interface DateRangePickerProps extends Omit<CalendarBaseProps, 'labels'> {
  /** Committed range, or `null` for none. */
  value: DateRange | null
  /** Fires only when "Apply" is pressed with a complete range. */
  onChange: (range: DateRange) => void
  /** Fires after "Cancel" rolled the draft back to `value`. */
  onCancel?: (() => void) | undefined
  /** Shortcut ranges listed on the left; omit to hide the list. */
  presets?: ReadonlyArray<DateRangePreset> | undefined
  /** All visible and screen-reader text; see `DateRangePickerLabels`. */
  labels: DateRangePickerLabels
}

const sameRange = (a: DateRangeDraft | null, b: DateRange) => a !== null && a.start === b.start && a.end === b.end

/**
 * Range panel: presets on the left, a two-month range
 * `Calendar` in the middle, "Cancel / Apply" below. Picks inside the panel only edit a draft;
 * `onChange` fires once on "Apply" with a complete range, "Cancel" restores `value` and calls
 * `onCancel`. Choosing a preset replaces the draft and turns the page to its start month; a
 * preset shows a check while the draft equals it exactly. The month is owned here (controlled
 * into the calendar) so presets can turn the page. Tab order: presets → calendar → Cancel → Apply.
 */
export function DateRangePicker({
  value,
  onChange,
  onCancel,
  presets,
  labels,
  month,
  onMonthChange,
  numberOfMonths = 2,
  today: todayProp,
  className,
  ...calendar
}: DateRangePickerProps) {
  const idBase = useId()
  const [todayFallback] = useState(() => todayProp ?? todayIso())
  const today = todayProp ?? todayFallback

  // Draft: starts as `value` and is reset whenever `value` changes from outside.
  const [draft, setDraft] = useState<DateRangeDraft | null>(value)
  const [seenValue, setSeenValue] = useState(value)
  const [monthState, setMonthState] = useState<IsoMonth>(() => monthOf(value?.start ?? today))
  const visibleMonth = month ?? monthState
  const inView = (date: IsoDate) => {
    const m = monthOf(date)
    return compareIso(m, visibleMonth) >= 0 && compareIso(m, addMonths(visibleMonth, numberOfMonths - 1)) <= 0
  }
  if (value !== seenValue) {
    setSeenValue(value)
    setDraft(value)
    if (value !== null && month === undefined && !inView(value.start)) setMonthState(monthOf(value.start))
  }
  const showMonth = (next: IsoMonth) => {
    if (month === undefined) setMonthState(next)
    onMonthChange?.(next)
  }

  // Presets: one tab stop, ↑ / ↓ move the highlight, Enter / Space pick it.
  const [highlighted, setHighlighted] = useState(0)
  const choosePreset = (preset: DateRangePreset) => {
    setDraft(preset.range)
    if (!inView(preset.range.start)) showMonth(monthOf(preset.range.start))
  }
  const onPresetsKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (presets === undefined || presets.length === 0) return
    let next = highlighted
    if (event.key === 'ArrowDown') next = Math.min(presets.length - 1, highlighted + 1)
    else if (event.key === 'ArrowUp') next = Math.max(0, highlighted - 1)
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = presets.length - 1
    else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const preset = presets[highlighted]
      if (preset !== undefined) choosePreset(preset)
      return
    } else return
    event.preventDefault()
    setHighlighted(next)
  }
  const presetId = (index: number) => `${idBase}-preset-${index}`

  const complete = draft !== null && draft.end !== null
  const drafting = draft !== null && draft.end === null
  const apply = () => {
    if (draft !== null && draft.end !== null) onChange({ start: draft.start, end: draft.end })
  }
  const cancel = () => {
    setDraft(value)
    onCancel?.()
  }

  return (
    <div className={clsx(css.picker, className)}>
      {presets !== undefined && presets.length > 0 && (
        <ul
          role="listbox"
          aria-label={labels.presets}
          aria-activedescendant={presetId(Math.min(highlighted, presets.length - 1))}
          tabIndex={0}
          className={css.presets}
          onKeyDown={onPresetsKeyDown}
        >
          {presets.map((preset, index) => {
            const selected = sameRange(draft, preset.range)
            return (
              <li
                key={preset.key}
                id={presetId(index)}
                role="option"
                aria-selected={selected}
                data-active={index === highlighted || undefined}
                className={clsx(css.preset, selected && css.presetSelected)}
                onClick={() => {
                  setHighlighted(index)
                  choosePreset(preset)
                }}
              >
                <span className={css.presetLabel}>{preset.label}</span>
                {selected && <IconCheckOutlineRegular size={14} className={css.check} />}
              </li>
            )
          })}
        </ul>
      )}
      <Calendar
        {...calendar}
        mode="range"
        value={draft}
        onChange={setDraft}
        month={visibleMonth}
        onMonthChange={showMonth}
        numberOfMonths={numberOfMonths}
        today={today}
        labels={labels}
        className={css.calendar}
      />
      <div className={css.footer}>
        <span className={css.status} role="status" aria-live="polite">
          {drafting ? labels.pickEnd : ''}
        </span>
        <span className={css.actions}>
          <Button variant="outline" size="sm" onClick={cancel}>
            {labels.cancel}
          </Button>
          <Button variant="primary" size="sm" disabled={!complete} onClick={apply}>
            {labels.apply}
          </Button>
        </span>
      </div>
    </div>
  )
}
