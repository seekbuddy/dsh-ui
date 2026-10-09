# 日期与时间选择器

[English](date-time.md) | 中文

基于同一个月份网格构建的七个组件：

| 组件 | 是什么 |
| --- | --- |
| `DateField` | 输入框形态的触发器，打开 `DatePicker`；选中后关闭 |
| `DateRangeField` | 输入框形态的触发器，打开 `DateRangePicker`；点「应用」提交并关闭 |
| `TimeField` | 输入框形态的触发器，打开 `TimePicker`；调整两列时保持打开 |
| `DatePicker` | 面板：一个月份加底栏，底栏显示当前选择和「今天」快捷按钮 |
| `DateRangePicker` | 面板：预设、两个月份、取消 / 应用 |
| `TimePicker` | 面板：时、分两列，24 小时制 |
| `Calendar` | 裸的月份网格，单选或区间，用于嵌入你自己的布局 |

```tsx
import { Calendar, DateField, DatePicker, DateRangeField, DateRangePicker, TimeField, TimePicker } from '@seekbuddy/dsh-ui/seekbuddy'
```

表单和筛选栏里用触发器；需要常驻显示时（侧栏、你自己的弹层）用面板；只要网格、不要底栏时用 `Calendar`。

## 值是 ISO 字符串

值以字符串形式进出组件，从不使用 `Date` 对象：

- `IsoDate`：`'2032-11-24'`
- `IsoMonth`：`'2032-11'`
- `IsoTime`：`'09:30'`，24 小时制
- `DateRange`：`{ start: IsoDate; end: IsoDate }`，闭区间，`start <= end`

值表示日历上的一格，而不是一个时间点：组件不做任何时区换算。如果时区有意义，请在数据里把时区和值存在一起，并按你指的那个时区计算「今天」以及「最近 7 天」这类预设。

所有组件都是完全受控的：传入 `value`，并在 `onChange` 中更新它。没有 `defaultValue`。

## 文案与 locale

星期和月份名称由 `Intl.DateTimeFormat` 按 `locale`（BCP 47 标签，默认为浏览器语言）生成。其他文字都在 `labels` 里，包括每个日期格子的读屏句子，所以组件本身不含任何文案。`weekStart` 选择每周从周一（`1`，默认）还是周日（`0`）开始。

## 示例：日期触发器

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

## 示例：带预设的区间触发器

选择器只编辑一份草稿；`onChange` 只在点「应用」时触发一次，并带上完整的区间。预设是你计算好的普通数据。

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

## 示例：时间触发器

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

## 示例：内嵌日历

区间模式下，`Calendar` 在第一次点选后交给你一份草稿（`{ start, end: null }`）；在第二次点选补全区间之前，把它原样作为 `value` 传回去。

```tsx
import { useState } from 'react'
import { Calendar, type CalendarLabels, type DateRange, type DateRangeDraft } from '@seekbuddy/dsh-ui/seekbuddy'

export function StayPicker({ labels }: { labels: CalendarLabels }) {
  const [stay, setStay] = useState<DateRange | DateRangeDraft | null>(null)
  return <Calendar mode="range" value={stay} onChange={setStay} numberOfMonths={2} labels={labels} />
}
```

## 行为

- **禁用日期：**早于 `min`、晚于 `max`（两端都包含在可选范围内），或被 `isDateDisabled` 拒绝的日期不能选。今天不可选时，`DatePicker` 里的「今天」按钮会禁用。
- **相邻月份：**网格始终显示 6 周；上个月和下个月的日期可见、可选，选中时会翻页。
- **区间选择：**选好起点后，悬停或聚焦某一天会预览区间；第二次点选按先后顺序提交（点了更早的日期会交换两端）。第三次点选重新开始。
- **预设：**选中一个预设会替换草稿，并翻到它起点所在的月份；与草稿完全一致的预设显示对勾。
- **时间范围：**设置 `min` / `max` 后，没有任何可选分钟的小时、超出范围的分钟都会禁用；会超出范围的选择会被夹回范围内。
- **触发器：**面板以 Portal 形式在触发器下方打开。按 Escape、点击外部或焦点移出都会关闭面板；按 Escape 和完成选择后，焦点回到触发器。

## 键盘

**Calendar**（`DatePicker` / `DateRangePicker` 内的也一样）：整个网格只有一个 Tab 停靠点。方向键按天、按周移动，Home / End 移到本周首尾，PageUp / PageDown 按月翻页，Shift + PageUp / PageDown 按年翻页，Enter 或 Space 选中。移出当前可见的月份时会自动翻页。`DateRangePicker` 的 Tab 顺序：预设 → 日历 → 取消 → 应用。

**TimePicker：**每一列是一个只有一个 Tab 停靠点的 listbox。↑ / ↓ / Home / End 移动选中项并立即上报；到头不循环。

## 不支持

多个分散日期、周视图或季度视图、时区选择、12 小时制、秒，以及非公历历法。

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

`Calendar` 接受 `mode="single"` 加 `IsoDate | null` 类型的值，或 `mode="range"` 加 `DateRange | DateRangeDraft | null` 类型的值；下表同时列出两种模式的属性。

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

`DatePickerLabels` 在 `CalendarLabels` 的基础上增加 `today` 和 `empty`：

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

`DateRangePickerLabels` 在 `CalendarLabels` 的基础上增加 `presets`、`cancel`、`apply` 和 `pickEnd`：

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

各触发器接受对应面板的 labels，另加：

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

### 值类型

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
