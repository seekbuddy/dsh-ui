# Date and time pickers

English | [中文](date-time.zh.md)

A family of seven components built on one month grid:

| Component | What it is |
| --- | --- |
| `DateField` | Input-style trigger that opens a `DatePicker`; a pick closes it |
| `DateRangeField` | Input-style trigger that opens a `DateRangePicker`; Apply commits and closes |
| `TimeField` | Input-style trigger that opens a `TimePicker`; stays open while you adjust both columns |
| `DatePicker` | Panel: one month plus a footer with the selection and a "Today" shortcut |
| `DateRangePicker` | Panel: presets, two months, Cancel / Apply |
| `TimePicker` | Panel: hour and minute columns, 24-hour |
| `Calendar` | The bare month grid, single or range, for embedding in your own layout |

```tsx
import { Calendar, DateField, DatePicker, DateRangeField, DateRangePicker, TimeField, TimePicker } from '@seekbuddy/dsh-ui/seekbuddy'
```

Use a field in forms and filter bars; use a panel when it is always visible (a sidebar, your own popover); use `Calendar` when you need the grid without a footer.

## Values are ISO strings

Values cross the component boundary as strings, never `Date` objects:

- `IsoDate` — `'2032-11-24'`
- `IsoMonth` — `'2032-11'`
- `IsoTime` — `'09:30'`, 24-hour
- `DateRange` — `{ start: IsoDate; end: IsoDate }`, inclusive, `start <= end`

A value is a square on the calendar, not an instant: the components do no time-zone conversion. Keep the time zone next to the value in your data if it matters, and compute "today" or presets such as "last 7 days" in the zone you mean.

All components are fully controlled: pass `value` and update it from `onChange`. There is no `defaultValue`.

## Text and locale

Weekday and month names come from `Intl.DateTimeFormat` for `locale` (a BCP 47 tag, default: the browser language). Everything else is in `labels`, including the screen-reader sentence for each day cell, so the components contain no text of their own. `weekStart` picks Monday (`1`, default) or Sunday (`0`).

## Example: date field

```tsx
import { useState } from 'react'
import { DateField, type DateFieldProps, type IsoDate } from '@seekbuddy/dsh-ui/seekbuddy'

const labels: DateFieldProps['labels'] = {
  open: 'Choose date',
  today: 'Today',
  empty: 'No date selected',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  previousYear: 'Previous year',
  nextYear: 'Next year',
  dayLabel: (date, state) =>
    `${new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', { dateStyle: 'full', timeZone: 'UTC' })}${state.selected ? ', selected' : ''}${state.today ? ', today' : ''}`,
}

export function DueDate() {
  const [due, setDue] = useState<IsoDate | null>(null)
  return <DateField value={due} onChange={setDue} placeholder="Due date" locale="en-US" labels={labels} />
}
```

## Example: range field with presets

The picker only edits a draft; `onChange` fires once, on Apply, with a complete range. Presets are plain data you compute.

```tsx
import { useMemo, useState } from 'react'
import { DateRangeField, type DateRange, type DateRangeFieldProps, type IsoDate } from '@seekbuddy/dsh-ui/seekbuddy'

const pad = (n: number) => String(n).padStart(2, '0')
const isoLocal = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` as IsoDate
const daysAgo = (n: number) => isoLocal(new Date(Date.now() - n * 86_400_000))

const labels: DateRangeFieldProps['labels'] = {
  open: 'Choose date range',
  presets: 'Quick ranges',
  cancel: 'Cancel',
  apply: 'Apply',
  pickEnd: 'Pick an end date',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  previousYear: 'Previous year',
  nextYear: 'Next year',
  dayLabel: (date, state) => `${date}${state.inRange ? ', in range' : ''}`,
}

export function UsageFilter({ onFilter }: { onFilter: (range: DateRange) => void }) {
  const [range, setRange] = useState<DateRange | null>(null)
  const presets = useMemo(
    () => [
      { key: '7d', label: 'Last 7 days', range: { start: daysAgo(6), end: daysAgo(0) } },
      { key: '30d', label: 'Last 30 days', range: { start: daysAgo(29), end: daysAgo(0) } },
    ],
    [],
  )
  return (
    <DateRangeField
      value={range}
      onChange={(next) => {
        setRange(next)
        onFilter(next)
      }}
      presets={presets}
      max={daysAgo(0)}
      placeholder="All time"
      labels={labels}
    />
  )
}
```

## Example: time field

```tsx
import { useState } from 'react'
import { TimeField, type IsoTime } from '@seekbuddy/dsh-ui/seekbuddy'

export function RunAt() {
  const [time, setTime] = useState<IsoTime | null>('09:00')
  return (
    <TimeField
      value={time}
      onChange={setTime}
      minuteStep={15}
      min="06:00"
      max="22:00"
      labels={{ open: 'Choose time', hours: 'Hour', minutes: 'Minute' }}
    />
  )
}
```

## Example: inline calendar

In range mode `Calendar` hands you the draft (`{ start, end: null }`) after the first pick; pass it back as `value` until the second pick completes the range.

```tsx
import { useState } from 'react'
import { Calendar, type CalendarLabels, type DateRange, type DateRangeDraft } from '@seekbuddy/dsh-ui/seekbuddy'

export function StayPicker({ labels }: { labels: CalendarLabels }) {
  const [stay, setStay] = useState<DateRange | DateRangeDraft | null>(null)
  return <Calendar mode="range" value={stay} onChange={setStay} numberOfMonths={2} labels={labels} />
}
```

## Behaviour

- **Disabled days:** days before `min` or after `max` (both inclusive bounds) or refused by `isDateDisabled` cannot be picked. "Today" in `DatePicker` is disabled when today is not pickable.
- **Neighbouring months:** the grid always shows 6 weeks; days from the previous and next month are visible and pickable, and turn the page.
- **Range picking:** after the start is picked, hovering or focusing a day previews the range; the second pick commits it in order (picking an earlier day swaps the ends). A third pick starts over.
- **Presets:** choosing one replaces the draft and turns the page to its start; the matching preset shows a check.
- **Time window:** with `min` / `max`, hours with no reachable minute and minutes outside the window are disabled, and a pick that would leave the window is clamped into it.
- **Fields:** the panel opens in a portal below the trigger. Escape, a click outside or moving focus out closes it; Escape and a pick return focus to the trigger.

## Keyboard

**Calendar** (also inside `DatePicker` / `DateRangePicker`): one tab stop for the grid. Arrows move by day and week, Home / End to the start / end of the week, PageUp / PageDown by month, Shift + PageUp / PageDown by year, Enter or Space picks. Moving past the visible months turns the page. Tab order in `DateRangePicker`: presets → calendar → Cancel → Apply.

**TimePicker:** each column is a listbox with one tab stop. ↑ / ↓ / Home / End move the selection and report it at once; nothing wraps.

## Not supported

Multiple separate dates, week or quarter views, time-zone selection, 12-hour clocks, seconds, and non-Gregorian calendars.

## API

### DateField

<!-- api:props DateField -->
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `formatValue` | `(date: IsoDate \| null) => string` |  | Trigger text for the value; defaults to `YYYY/MM/DD`. |
| `placeholder` | `string` |  | Trigger text while `value` is `null`. |
| `disabled` | `boolean` |  | Disables the trigger; the panel cannot open. |
| `labels` | `DatePickerLabels & FieldLabels` | **required** | The panel's labels plus `open` for the trigger; see `FieldLabels`. |
| `value` | `IsoDate \| null` | **required** | Selected day, or `null` for none. |
| `onChange` | `(date: IsoDate) => void` | **required** | Fires on every cell pick and on "Today" — no draft / apply step. |
| `formatSelected` | `(date: IsoDate) => string` |  | Footer rendering of the selected day; defaults to an Intl medium date with a short weekday in `locale` ("Wed, Nov 24, 2032" / "2032年11月24日周三"). |
| `className` | `string` |  | Extra class on the root element, for layout. |
| `autoFocus` | `boolean` |  | Move focus to the tab-stop cell (selected → today → first enabled) on mount. |
| `month` | `IsoMonth` |  | Controlled visible month (the left one when two are shown); uncontrolled follows `value`, then `today`. |
| `onMonthChange` | `(month: IsoMonth) => void` |  | Called with the new visible month when the user navigates. |
| `min` | `IsoDate` |  | Earliest selectable day, inclusive. |
| `max` | `IsoDate` |  | Latest selectable day, inclusive. |
| `isDateDisabled` | `(date: IsoDate) => boolean` |  | Extra disabling rule on top of `min` / `max` ("weekdays only"). |
| `locale` | `string` |  | BCP 47 tag driving weekday / month names; defaults to the browser language. |
| `weekStart` | `0 \| 1` |  | 1 = Monday (default), 0 = Sunday. |
| `today` | `IsoDate` |  | Injected "today" for tests and non-local zones; defaults to the host's local date. |
<!-- /api -->

### DateRangeField

<!-- api:props DateRangeField -->
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `formatValue` | `(range: DateRange \| null) => string` |  | Trigger text for the value; defaults to `YYYY/MM/DD - YYYY/MM/DD`. |
| `placeholder` | `string` |  | Trigger text while `value` is `null`. |
| `disabled` | `boolean` |  | Disables the trigger; the panel cannot open. |
| `labels` | `DateRangePickerLabels & FieldLabels` | **required** | The panel's labels plus `open` for the trigger; see `FieldLabels`. |
| `className` | `string` |  | Extra class on the root element, for layout. |
| `value` | `DateRange \| null` | **required** | Committed range, or `null` for none. |
| `autoFocus` | `boolean` |  | Move focus to the tab-stop cell (selected → today → first enabled) on mount. |
| `onChange` | `(range: DateRange) => void` | **required** | Fires only when "Apply" is pressed with a complete range. |
| `numberOfMonths` | `1 \| 2` |  | Months side by side; single mode defaults to 1, range mode to 2. |
| `month` | `IsoMonth` |  | Controlled visible month (the left one when two are shown); uncontrolled follows `value`, then `today`. |
| `onMonthChange` | `(month: IsoMonth) => void` |  | Called with the new visible month when the user navigates. |
| `min` | `IsoDate` |  | Earliest selectable day, inclusive. |
| `max` | `IsoDate` |  | Latest selectable day, inclusive. |
| `isDateDisabled` | `(date: IsoDate) => boolean` |  | Extra disabling rule on top of `min` / `max` ("weekdays only"). |
| `locale` | `string` |  | BCP 47 tag driving weekday / month names; defaults to the browser language. |
| `weekStart` | `0 \| 1` |  | 1 = Monday (default), 0 = Sunday. |
| `today` | `IsoDate` |  | Injected "today" for tests and non-local zones; defaults to the host's local date. |
| `presets` | `readonly DateRangePreset[]` |  | Shortcut ranges listed on the left; omit to hide the list. |
<!-- /api -->

### TimeField

<!-- api:props TimeField -->
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `formatValue` | `(time: IsoTime \| null) => string` |  | Trigger text for the value; defaults to the `HH:mm` string itself. |
| `placeholder` | `string` |  | Trigger text while `value` is `null`. |
| `disabled` | `boolean` |  | Disables the trigger; the panel cannot open. |
| `labels` | `TimePickerLabels & FieldLabels` | **required** | The panel's labels plus `open` for the trigger; see `FieldLabels`. |
| `value` | `IsoTime \| null` | **required** | 24-hour `HH:mm`; `null` highlights the 00:00 position without reporting a value. |
| `onChange` | `(time: IsoTime) => void` | **required** | Fires on every pick — column click or ↑ / ↓ / Home / End inside a column. |
| `minuteStep` | `1 \| 5 \| 10 \| 15 \| 30` |  | Minute granularity; the minutes column lists only multiples of the step. Default 1. |
| `min` | `IsoTime` |  | Earliest selectable time, inclusive; earlier options are disabled. |
| `max` | `IsoTime` |  | Latest selectable time, inclusive; later options are disabled. |
| `autoFocus` | `boolean` |  | Focus the hours column on mount. |
| `className` | `string` |  | Extra class on the root element, for layout. |
<!-- /api -->

### DatePicker

<!-- api:props DatePicker -->
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `IsoDate \| null` | **required** | Selected day, or `null` for none. |
| `onChange` | `(date: IsoDate) => void` | **required** | Fires on every cell pick and on "Today" — no draft / apply step. |
| `labels` | `DatePickerLabels` | **required** | All visible and screen-reader text; see `DatePickerLabels`. |
| `formatSelected` | `(date: IsoDate) => string` |  | Footer rendering of the selected day; defaults to an Intl medium date with a short weekday in `locale` ("Wed, Nov 24, 2032" / "2032年11月24日周三"). |
| `className` | `string` |  | Extra class on the root element, for layout. |
| `autoFocus` | `boolean` |  | Move focus to the tab-stop cell (selected → today → first enabled) on mount. |
| `month` | `IsoMonth` |  | Controlled visible month (the left one when two are shown); uncontrolled follows `value`, then `today`. |
| `onMonthChange` | `(month: IsoMonth) => void` |  | Called with the new visible month when the user navigates. |
| `min` | `IsoDate` |  | Earliest selectable day, inclusive. |
| `max` | `IsoDate` |  | Latest selectable day, inclusive. |
| `isDateDisabled` | `(date: IsoDate) => boolean` |  | Extra disabling rule on top of `min` / `max` ("weekdays only"). |
| `locale` | `string` |  | BCP 47 tag driving weekday / month names; defaults to the browser language. |
| `weekStart` | `0 \| 1` |  | 1 = Monday (default), 0 = Sunday. |
| `today` | `IsoDate` |  | Injected "today" for tests and non-local zones; defaults to the host's local date. |
<!-- /api -->

### DateRangePicker

<!-- api:props DateRangePicker -->
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `DateRange \| null` | **required** | Committed range, or `null` for none. |
| `onChange` | `(range: DateRange) => void` | **required** | Fires only when "Apply" is pressed with a complete range. |
| `onCancel` | `() => void` |  | Fires after "Cancel" rolled the draft back to `value`. |
| `presets` | `readonly DateRangePreset[]` |  | Shortcut ranges listed on the left; omit to hide the list. |
| `labels` | `DateRangePickerLabels` | **required** | All visible and screen-reader text; see `DateRangePickerLabels`. |
| `className` | `string` |  | Extra class on the root element, for layout. |
| `autoFocus` | `boolean` |  | Move focus to the tab-stop cell (selected → today → first enabled) on mount. |
| `numberOfMonths` | `1 \| 2` | `2` | Months side by side; single mode defaults to 1, range mode to 2. |
| `month` | `IsoMonth` |  | Controlled visible month (the left one when two are shown); uncontrolled follows `value`, then `today`. |
| `onMonthChange` | `(month: IsoMonth) => void` |  | Called with the new visible month when the user navigates. |
| `min` | `IsoDate` |  | Earliest selectable day, inclusive. |
| `max` | `IsoDate` |  | Latest selectable day, inclusive. |
| `isDateDisabled` | `(date: IsoDate) => boolean` |  | Extra disabling rule on top of `min` / `max` ("weekdays only"). |
| `locale` | `string` |  | BCP 47 tag driving weekday / month names; defaults to the browser language. |
| `weekStart` | `0 \| 1` |  | 1 = Monday (default), 0 = Sunday. |
| `today` | `IsoDate` |  | Injected "today" for tests and non-local zones; defaults to the host's local date. |
<!-- /api -->

### TimePicker

<!-- api:props TimePicker -->
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `IsoTime \| null` | **required** | 24-hour `HH:mm`; `null` highlights the 00:00 position without reporting a value. |
| `onChange` | `(time: IsoTime) => void` | **required** | Fires on every pick — column click or ↑ / ↓ / Home / End inside a column. |
| `minuteStep` | `1 \| 5 \| 10 \| 15 \| 30` | `1` | Minute granularity; the minutes column lists only multiples of the step. Default 1. |
| `min` | `IsoTime` |  | Earliest selectable time, inclusive; earlier options are disabled. |
| `max` | `IsoTime` |  | Latest selectable time, inclusive; later options are disabled. |
| `labels` | `TimePickerLabels` | **required** | Column headings; see `TimePickerLabels`. |
| `autoFocus` | `boolean` | `false` | Focus the hours column on mount. |
| `className` | `string` |  | Extra class on the root element, for layout. |
<!-- /api -->

### Calendar

`Calendar` takes `mode="single"` with an `IsoDate | null` value, or `mode="range"` with a `DateRange | DateRangeDraft | null` value; the table lists both.

<!-- api:props Calendar -->
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `mode` | `"single" \| "range"` | **required** | `single` picks one day; `range` picks a start and an end. |
| `value` | `IsoDate \| DateRange \| DateRangeDraft \| null` | **required** | Selected day, or `null` for none. Pass the draft back as-is while the end is pending — the component is fully controlled. |
| `onChange` | `(date: IsoDate) => void) \| ((range: DateRange \| DateRangeDraft) => void` | **required** | Called with the picked day. First pick → `{ start, end: null }`; second pick → the ordered `DateRange` (a reversed pick swaps the ends). A third pick starts a new draft. |
| `month` | `IsoMonth` |  | Controlled visible month (the left one when two are shown); uncontrolled follows `value`, then `today`. |
| `onMonthChange` | `(month: IsoMonth) => void` |  | Called with the new visible month when the user navigates. |
| `numberOfMonths` | `1 \| 2` |  | Months side by side; single mode defaults to 1, range mode to 2. |
| `min` | `IsoDate` |  | Earliest selectable day, inclusive. |
| `max` | `IsoDate` |  | Latest selectable day, inclusive. |
| `isDateDisabled` | `(date: IsoDate) => boolean` |  | Extra disabling rule on top of `min` / `max` ("weekdays only"). |
| `locale` | `string` |  | BCP 47 tag driving weekday / month names; defaults to the browser language. |
| `weekStart` | `0 \| 1` |  | 1 = Monday (default), 0 = Sunday. |
| `today` | `IsoDate` |  | Injected "today" for tests and non-local zones; defaults to the host's local date. |
| `labels` | `CalendarLabels` | **required** | Navigation and screen-reader text; see `CalendarLabels`. |
| `autoFocus` | `boolean` |  | Move focus to the tab-stop cell (selected → today → first enabled) on mount. |
| `className` | `string` |  | Extra class on the root element, for layout. |
<!-- /api -->

### Labels

<!-- api:type CalendarLabels -->
| Field | Type | Description |
| --- | --- | --- |
| `previousMonth` | `string` | `aria-label` of the previous-month button. |
| `nextMonth` | `string` | `aria-label` of the next-month button. |
| `previousYear` | `string` | `aria-label` of the previous-year button. |
| `nextYear` | `string` | `aria-label` of the next-year button. |
| `dayLabel` | `(date: IsoDate, state: CalendarDayState) => string` | Screen-reader name of one day cell, `(date, state)` → a full sentence such as "Wednesday, November 24, 2032, selected". Week / month names come from `locale`; this is the only per-cell copy. |
<!-- /api -->

`DatePickerLabels` extends `CalendarLabels` with `today` and `empty`:

<!-- api:type DatePickerLabels -->
| Field | Type | Description |
| --- | --- | --- |
| `today` | `string` | The "Today" shortcut button. |
| `empty` | `string` | Footer text while nothing is selected. |
| `previousMonth` | `string` | `aria-label` of the previous-month button. |
| `nextMonth` | `string` | `aria-label` of the next-month button. |
| `previousYear` | `string` | `aria-label` of the previous-year button. |
| `nextYear` | `string` | `aria-label` of the next-year button. |
| `dayLabel` | `(date: IsoDate, state: CalendarDayState) => string` | Screen-reader name of one day cell, `(date, state)` → a full sentence such as "Wednesday, November 24, 2032, selected". Week / month names come from `locale`; this is the only per-cell copy. |
<!-- /api -->

`DateRangePickerLabels` extends `CalendarLabels` with `presets`, `cancel`, `apply` and `pickEnd`:

<!-- api:type DateRangePickerLabels -->
| Field | Type | Description |
| --- | --- | --- |
| `presets` | `string` | Accessible name of the presets list. |
| `cancel` | `string` | Caption of the button that discards the draft. |
| `apply` | `string` | Caption of the button that commits the range. |
| `pickEnd` | `string` | Status shown (and announced) while the start is picked and the end is still pending. |
| `previousMonth` | `string` | `aria-label` of the previous-month button. |
| `nextMonth` | `string` | `aria-label` of the next-month button. |
| `previousYear` | `string` | `aria-label` of the previous-year button. |
| `nextYear` | `string` | `aria-label` of the next-year button. |
| `dayLabel` | `(date: IsoDate, state: CalendarDayState) => string` | Screen-reader name of one day cell, `(date, state)` → a full sentence such as "Wednesday, November 24, 2032, selected". Week / month names come from `locale`; this is the only per-cell copy. |
<!-- /api -->

<!-- api:type TimePickerLabels -->
| Field | Type | Description |
| --- | --- | --- |
| `hours` | `string` | Hours column heading, also the listbox's accessible name. |
| `minutes` | `string` | Minutes column heading, also the listbox's accessible name. |
<!-- /api -->

The fields take their panel's labels plus:

<!-- api:type FieldLabels -->
Labels every trigger adds on top of its panel's labels.

| Field | Type | Description |
| --- | --- | --- |
| `open` | `string` | Read after the value on the trigger ("open date picker") and used as the dialog's name. |
<!-- /api -->

### CalendarDayState

<!-- api:type CalendarDayState -->
Cell state handed to `labels.dayLabel` so the caller can phrase the screen-reader sentence.

| Field | Type | Description |
| --- | --- | --- |
| `selected` | `boolean` | Single mode: the value. Range mode: the start or the end. |
| `today` | `boolean` | The cell is today (`today` prop, or the host's local date). |
| `disabled` | `boolean` | Outside `min` / `max` or refused by `isDateDisabled`. |
| `inRange` | `boolean` | Range mode: inside the committed range (ends included). Always false in single mode. |
<!-- /api -->

### DateRangePreset

<!-- api:type DateRangePreset -->
| Field | Type | Description |
| --- | --- | --- |
| `key` | `string` | Stable identity of the preset. |
| `label` | `string` | Visible preset text, e.g. "Last 7 days". |
| `range` | `DateRange` | Computed by the caller — "last 7 days" depends on today and the time zone, not on the component. |
<!-- /api -->

### Value types

<!-- api:type IsoDate -->
Calendar day, `YYYY-MM-DD`.

```ts
type IsoDate = `${number}-${number}-${number}`
```
<!-- /api -->

<!-- api:type IsoMonth -->
Calendar month, `YYYY-MM`.

```ts
type IsoMonth = `${number}-${number}`
```
<!-- /api -->

<!-- api:type IsoTime -->
Wall-clock time, 24-hour `HH:mm`.

```ts
type IsoTime = `${number}:${number}`
```
<!-- /api -->

<!-- api:type DateRange -->
Closed interval, `start <= end`.

| Field | Type | Description |
| --- | --- | --- |
| `start` | `IsoDate` | First day of the range, inclusive. |
| `end` | `IsoDate` | Last day of the range, inclusive. |
<!-- /api -->

<!-- api:type DateRangeDraft -->
A range whose end is still being picked (`end: null`); `DateRange` is the completed form.

| Field | Type | Description |
| --- | --- | --- |
| `start` | `IsoDate` | The first picked day. |
| `end` | `IsoDate \| null` | `null` until the second day is picked. |
<!-- /api -->

<!-- api:type WeekStart -->
First day of the week: 1 = Monday, 0 = Sunday.

```ts
type WeekStart = 0 | 1
```
<!-- /api -->

<!-- api:type MinuteStep -->
```ts
type MinuteStep = 1 | 5 | 10 | 15 | 30
```
<!-- /api -->
