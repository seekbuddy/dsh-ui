// Pure calendar arithmetic for the date / time picker family.
// Values cross component boundaries as ISO strings; every computation runs on Date.UTC
// components so DST transitions in the host time zone never shift a "calendar square".
// No DOM here — tests/date.test.mjs covers this file through test:unit.

/** Calendar day, `YYYY-MM-DD`. */
export type IsoDate = `${number}-${number}-${number}`
/** Calendar month, `YYYY-MM`. */
export type IsoMonth = `${number}-${number}`
/** Wall-clock time, 24-hour `HH:mm`. */
export type IsoTime = `${number}:${number}`
/** Closed interval, `start <= end`. */
export interface DateRange {
  /** First day of the range, inclusive. */
  start: IsoDate
  /** Last day of the range, inclusive. */
  end: IsoDate
}
/** First day of the week: 1 = Monday, 0 = Sunday. */
export type WeekStart = 0 | 1

export interface DateParts {
  y: number
  m: number
  d: number
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/
const ISO_MONTH = /^(\d{4})-(\d{2})$/
const ISO_TIME = /^(\d{2}):(\d{2})$/

/** A Sunday, used to ask Intl for weekday names in a fixed order. */
const REFERENCE_SUNDAY_UTC = Date.UTC(2024, 0, 7)

const pad2 = (value: number) => String(value).padStart(2, '0')
const pad4 = (value: number) => String(value).padStart(4, '0')

/** Days in a month (`m` is 1-based). */
export function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate()
}

/** Split `YYYY-MM-DD`; throws `RangeError` on malformed or impossible dates ("2025-02-30"). */
export function parseIsoDate(iso: string): DateParts {
  const match = ISO_DATE.exec(iso)
  if (match === null) throw new RangeError(`Invalid ISO date: ${iso}`)
  const y = Number(match[1])
  const m = Number(match[2])
  const d = Number(match[3])
  if (m < 1 || m > 12 || d < 1 || d > daysInMonth(y, m)) throw new RangeError(`Invalid ISO date: ${iso}`)
  return { y, m, d }
}

export function formatIsoDate({ y, m, d }: DateParts): IsoDate {
  return `${pad4(y)}-${pad2(m)}-${pad2(d)}` as IsoDate
}

/** Split `YYYY-MM`; throws `RangeError` when malformed. */
export function parseIsoMonth(month: string): { y: number; m: number } {
  const match = ISO_MONTH.exec(month)
  if (match === null) throw new RangeError(`Invalid ISO month: ${month}`)
  const y = Number(match[1])
  const m = Number(match[2])
  if (m < 1 || m > 12) throw new RangeError(`Invalid ISO month: ${month}`)
  return { y, m }
}

export function formatIsoMonth(y: number, m: number): IsoMonth {
  return `${pad4(y)}-${pad2(m)}` as IsoMonth
}

/** The month a date belongs to. */
export function monthOf(iso: IsoDate): IsoMonth {
  const { y, m } = parseIsoDate(iso)
  return formatIsoMonth(y, m)
}

/** Today in the host's local time zone (the only place local time is consulted). */
export function todayIso(): IsoDate {
  const now = new Date()
  return formatIsoDate({ y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() })
}

function fromUtc(ms: number): IsoDate {
  const date = new Date(ms)
  return formatIsoDate({ y: date.getUTCFullYear(), m: date.getUTCMonth() + 1, d: date.getUTCDate() })
}

export function addDays(iso: IsoDate, n: number): IsoDate {
  const { y, m, d } = parseIsoDate(iso)
  return fromUtc(Date.UTC(y, m - 1, d + n))
}

export function addMonths(month: IsoMonth, n: number): IsoMonth {
  const { y, m } = parseIsoMonth(month)
  const total = y * 12 + (m - 1) + n
  return formatIsoMonth(Math.floor(total / 12), (total % 12) + 1)
}

/**
 * Same-day-of-month shift that clamps to the target month's length
 * (2025-01-31 + 1 month → 2025-02-28); used by PageUp / PageDown.
 */
export function addMonthsToDate(iso: IsoDate, n: number): IsoDate {
  const { d } = parseIsoDate(iso)
  const { y, m } = parseIsoMonth(addMonths(monthOf(iso), n))
  return formatIsoDate({ y, m, d: Math.min(d, daysInMonth(y, m)) })
}

/** Lexicographic order is chronological for zero-padded ISO dates, months and times. */
export function compareIso(a: string, b: string): -1 | 0 | 1 {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

/** 0 = Sunday … 6 = Saturday. */
export function weekdayOf(iso: IsoDate): number {
  const { y, m, d } = parseIsoDate(iso)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

/** Distance in days from the start of the week (`0` on the week's first day). */
export function weekOffset(iso: IsoDate, weekStart: WeekStart): number {
  return (weekdayOf(iso) - weekStart + 7) % 7
}

/**
 * Six rows × seven columns covering `month`, padded with the surrounding months' days so
 * every rendered grid has the same height (the 42 cells the mockups show in grey).
 */
export function monthGrid(month: IsoMonth, weekStart: WeekStart): IsoDate[] {
  const first = `${month}-01` as IsoDate
  const start = addDays(first, -weekOffset(first, weekStart))
  const cells: IsoDate[] = []
  for (let index = 0; index < 42; index += 1) cells.push(addDays(start, index))
  return cells
}

export function isInRange(iso: IsoDate, range: DateRange): boolean {
  return compareIso(range.start, iso) <= 0 && compareIso(iso, range.end) <= 0
}

/** Orders two picks into a closed range (clicking the end before the start swaps them). */
export function normalizeRange(a: IsoDate, b: IsoDate): DateRange {
  return compareIso(a, b) <= 0 ? { start: a, end: b } : { start: b, end: a }
}

/** True when `iso` is outside `[min, max]` (either bound optional). */
export function isOutsideBounds(iso: IsoDate, min: IsoDate | undefined, max: IsoDate | undefined): boolean {
  return (min !== undefined && compareIso(iso, min) < 0) || (max !== undefined && compareIso(iso, max) > 0)
}

export type WeekdayNameStyle = 'narrow' | 'short' | 'long'

/** Seven weekday names in `locale`, starting at `weekStart` ("Mon Tue …" or "一 二 …"). */
export function weekdayNames(
  locale: string | undefined,
  weekStart: WeekStart,
  style: WeekdayNameStyle = 'short',
): string[] {
  const format = new Intl.DateTimeFormat(locale, { weekday: style, timeZone: 'UTC' })
  const names: string[] = []
  for (let index = 0; index < 7; index += 1) {
    const weekday = (weekStart + index) % 7
    names.push(format.format(REFERENCE_SUNDAY_UTC + weekday * 86_400_000))
  }
  return names
}

/** Month heading in `locale` ("November 2032" / "2032年11月"). */
export function monthTitle(locale: string | undefined, month: IsoMonth): string {
  const { y, m } = parseIsoMonth(month)
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', timeZone: 'UTC' }).format(
    Date.UTC(y, m - 1, 1),
  )
}

/** Format a calendar day with any `Intl.DateTimeFormat` options (time zone is pinned to UTC). */
export function formatDate(locale: string | undefined, iso: IsoDate, options: Intl.DateTimeFormatOptions): string {
  const { y, m, d } = parseIsoDate(iso)
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(Date.UTC(y, m - 1, d))
}

/** Full date in `locale` for screen readers ("Wednesday, November 24, 2032"). */
export function formatDateLong(locale: string | undefined, iso: IsoDate): string {
  return formatDate(locale, iso, { dateStyle: 'full' })
}

/** Compact date with weekday for pickers' footers ("Wed, Nov 24, 2032" / "2032年11月24日周三"). */
export function formatDateMedium(locale: string | undefined, iso: IsoDate): string {
  return formatDate(locale, iso, { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' })
}

/** Split `HH:mm`; throws `RangeError` outside 00:00–23:59. */
export function parseIsoTime(time: string): { h: number; min: number } {
  const match = ISO_TIME.exec(time)
  if (match === null) throw new RangeError(`Invalid ISO time: ${time}`)
  const h = Number(match[1])
  const min = Number(match[2])
  if (h > 23 || min > 59) throw new RangeError(`Invalid ISO time: ${time}`)
  return { h, min }
}

export function timeToMinutes(time: IsoTime): number {
  const { h, min } = parseIsoTime(time)
  return h * 60 + min
}

/** Minutes since midnight → `HH:mm`; wraps around the day. */
export function minutesToTime(minutes: number): IsoTime {
  const wrapped = ((Math.trunc(minutes) % 1440) + 1440) % 1440
  return `${pad2(Math.floor(wrapped / 60))}:${pad2(wrapped % 60)}` as IsoTime
}

/** Clamp into `[min, max]` (either bound optional). */
export function clampTime(time: IsoTime, min: IsoTime | undefined, max: IsoTime | undefined): IsoTime {
  let minutes = timeToMinutes(time)
  if (min !== undefined) minutes = Math.max(minutes, timeToMinutes(min))
  if (max !== undefined) minutes = Math.min(minutes, timeToMinutes(max))
  return minutesToTime(minutes)
}
