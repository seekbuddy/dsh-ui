import clsx from 'clsx'
import { useAnchoredPosition, useDismissOnOutsidePointer } from '@seekbuddy/dsh-ui'
import { IconClockOutlineRegular } from '@seekbuddy/dsh-ui/icons'
import { useCallback, useId, useRef, useState } from 'react'
import type { CSSProperties, FocusEvent, KeyboardEvent, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { DatePicker } from './DatePicker.tsx'
import type { DatePickerProps } from './DatePicker.tsx'
import { DateRangePicker } from './DateRangePicker.tsx'
import type { DateRangePickerProps } from './DateRangePicker.tsx'
import { TimePicker } from './TimePicker.tsx'
import type { TimePickerProps } from './TimePicker.tsx'
import css from './fields.module.css'
import type { DateRange, IsoDate, IsoTime } from './date.ts'

/** Labels every trigger adds on top of its panel's labels. */
export interface FieldLabels {
  /** Read after the value on the trigger ("open date picker") and used as the dialog's name. */
  open: string
}

interface FieldShellProps {
  labels: FieldLabels
  /** Trigger text; `null` shows `placeholder` dimmed. */
  display: string | null
  placeholder?: string | undefined
  disabled?: boolean | undefined
  icon: ReactNode
  className?: string | undefined
  /** Panel content; receives `close` so a pick / apply / cancel can dismiss and refocus the trigger. */
  children: (close: () => void) => ReactNode
}

const MEASURE_STYLE: CSSProperties = { visibility: 'hidden', left: 0, top: 0 }

/**
 * Shared trigger + portaled popover for the three fields: an input-looking
 * `<button aria-haspopup="dialog" aria-expanded>` and a `role="dialog"` panel anchored below it
 * (upstream `useAnchoredPosition`), dismissed by an outside pointer (`useDismissOnOutsidePointer`),
 * Escape, or focus leaving the panel. Closing through Escape or a pick moves focus back to the
 * trigger; an outside click leaves focus where the user put it.
 */
function FieldShell({ labels, display, placeholder, disabled = false, icon, className, children }: FieldShellProps) {
  const id = useId()
  const rootRef = useRef<HTMLSpanElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const position = useAnchoredPosition({ open, anchorRef: triggerRef, panelRef, gap: 4, margin: 8 })
  useDismissOnOutsidePointer(rootRef, open, setOpen, panelRef)

  const close = useCallback(() => {
    setOpen(false)
    triggerRef.current?.focus()
  }, [])

  const onPanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape') return
    event.stopPropagation()
    close()
  }
  const onPanelBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget
    if (next instanceof Node && (panelRef.current?.contains(next) === true || rootRef.current?.contains(next) === true))
      return
    if (next === null) return // window blur / removal: keep the panel, the outside-pointer rule handles clicks
    setOpen(false)
  }

  const panel = open && (
    <div
      ref={panelRef}
      id={`${id}-dialog`}
      role="dialog"
      aria-label={labels.open}
      className={css.panel}
      style={position ?? MEASURE_STYLE}
      onKeyDown={onPanelKeyDown}
      onBlur={onPanelBlur}
    >
      {children(close)}
    </div>
  )

  return (
    <span ref={rootRef} className={clsx(css.field, className)}>
      <button
        ref={triggerRef}
        type="button"
        className={clsx(css.trigger, open && css.open)}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? `${id}-dialog` : undefined}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && open) close()
        }}
      >
        <span className={clsx(css.value, display === null && css.placeholder)}>{display ?? placeholder ?? ''}</span>
        <span className={css.srOnly}>{labels.open}</span>
        <span className={css.icon} aria-hidden="true">
          {icon}
        </span>
      </button>
      {panel !== false && createPortal(panel, document.body)}
    </span>
  )
}

function CalendarGlyph() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    >
      <rect x="2.5" y="3.5" width="11" height="10" rx="2" />
      <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" />
    </svg>
  )
}

const slashes = (iso: string) => iso.replaceAll('-', '/')

export interface DateFieldProps extends DatePickerProps {
  /** Trigger text for the value; defaults to `YYYY/MM/DD`. */
  formatValue?: ((date: IsoDate | null) => string) | undefined
  /** Trigger text while `value` is `null`. */
  placeholder?: string | undefined
  /** Disables the trigger; the panel cannot open. */
  disabled?: boolean | undefined
  /** The panel's labels plus `open` for the trigger; see `FieldLabels`. */
  labels: DatePickerProps['labels'] & FieldLabels
}

/** Input-looking trigger that opens a `DatePicker`; a pick (or "Today") closes the panel. */
export function DateField({
  formatValue,
  placeholder,
  disabled,
  className,
  labels,
  onChange,
  ...picker
}: DateFieldProps) {
  const display =
    picker.value === null ? null : formatValue === undefined ? slashes(picker.value) : formatValue(picker.value)
  return (
    <FieldShell
      labels={labels}
      display={display}
      placeholder={placeholder}
      disabled={disabled}
      icon={<CalendarGlyph />}
      className={className}
    >
      {(close) => (
        <DatePicker
          {...picker}
          labels={labels}
          autoFocus
          onChange={(date) => {
            onChange(date)
            close()
          }}
        />
      )}
    </FieldShell>
  )
}

export interface DateRangeFieldProps extends Omit<DateRangePickerProps, 'onCancel'> {
  /** Trigger text for the value; defaults to `YYYY/MM/DD - YYYY/MM/DD`. */
  formatValue?: ((range: DateRange | null) => string) | undefined
  /** Trigger text while `value` is `null`. */
  placeholder?: string | undefined
  /** Disables the trigger; the panel cannot open. */
  disabled?: boolean | undefined
  /** The panel's labels plus `open` for the trigger; see `FieldLabels`. */
  labels: DateRangePickerProps['labels'] & FieldLabels
}

/** Input-looking trigger that opens a `DateRangePicker`; "Apply" reports and closes, "Cancel" just closes. */
export function DateRangeField({
  formatValue,
  placeholder,
  disabled,
  className,
  labels,
  onChange,
  ...picker
}: DateRangeFieldProps) {
  const display =
    picker.value === null
      ? null
      : formatValue === undefined
        ? `${slashes(picker.value.start)} - ${slashes(picker.value.end)}`
        : formatValue(picker.value)
  return (
    <FieldShell
      labels={labels}
      display={display}
      placeholder={placeholder}
      disabled={disabled}
      icon={<CalendarGlyph />}
      className={className}
    >
      {(close) => (
        <DateRangePicker
          {...picker}
          labels={labels}
          autoFocus
          onChange={(range) => {
            onChange(range)
            close()
          }}
          onCancel={close}
        />
      )}
    </FieldShell>
  )
}

export interface TimeFieldProps extends TimePickerProps {
  /** Trigger text for the value; defaults to the `HH:mm` string itself. */
  formatValue?: ((time: IsoTime | null) => string) | undefined
  /** Trigger text while `value` is `null`. */
  placeholder?: string | undefined
  /** Disables the trigger; the panel cannot open. */
  disabled?: boolean | undefined
  /** The panel's labels plus `open` for the trigger; see `FieldLabels`. */
  labels: TimePickerProps['labels'] & FieldLabels
}

/** Input-looking trigger that opens a `TimePicker`; picks keep the panel open (both columns are usually adjusted). */
export function TimeField({ formatValue, placeholder, disabled, className, labels, ...picker }: TimeFieldProps) {
  const display = picker.value === null ? null : formatValue === undefined ? picker.value : formatValue(picker.value)
  return (
    <FieldShell
      labels={labels}
      display={display}
      placeholder={placeholder}
      disabled={disabled}
      icon={<IconClockOutlineRegular />}
      className={className}
    >
      {() => <TimePicker {...picker} labels={labels} autoFocus />}
    </FieldShell>
  )
}
