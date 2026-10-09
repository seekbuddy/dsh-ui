import assert from 'node:assert/strict'
import test from 'node:test'

const date = await import(process.env.DATE_CORE_URL)

test('parseIsoDate accepts real dates and rejects malformed or impossible ones', () => {
  assert.deepEqual(date.parseIsoDate('2032-11-24'), { y: 2032, m: 11, d: 24 })
  assert.deepEqual(date.parseIsoDate('2024-02-29'), { y: 2024, m: 2, d: 29 })
  for (const bad of ['2025-02-29', '2025-13-01', '2025-00-10', '2025-1-1', '20250101', 'yesterday', '']) {
    assert.throws(() => date.parseIsoDate(bad), RangeError, bad)
  }
  assert.equal(date.formatIsoDate({ y: 2032, m: 1, d: 5 }), '2032-01-05')
})

test('month helpers parse, format and shift across year boundaries', () => {
  assert.deepEqual(date.parseIsoMonth('2032-11'), { y: 2032, m: 11 })
  assert.throws(() => date.parseIsoMonth('2032-13'), RangeError)
  assert.equal(date.monthOf('2032-11-24'), '2032-11')
  assert.equal(date.addMonths('2032-11', 1), '2032-12')
  assert.equal(date.addMonths('2032-11', 2), '2033-01')
  assert.equal(date.addMonths('2032-01', -1), '2031-12')
  assert.equal(date.addMonths('2032-01', -13), '2030-12')
  assert.equal(date.addMonths('2032-06', 12), '2033-06')
})

test('addDays walks across month, year and leap-day boundaries without DST drift', () => {
  assert.equal(date.addDays('2032-11-24', 1), '2032-11-25')
  assert.equal(date.addDays('2032-11-30', 1), '2032-12-01')
  assert.equal(date.addDays('2032-12-31', 1), '2033-01-01')
  assert.equal(date.addDays('2024-03-01', -1), '2024-02-29')
  assert.equal(date.addDays('2025-03-01', -1), '2025-02-28')
  assert.equal(date.addDays('2025-03-30', 1), '2025-03-31') // EU DST switch day
  assert.equal(date.addDays('2025-11-02', 7), '2025-11-09') // US DST switch week
  assert.equal(date.addDays('2032-11-24', -365), '2031-11-25')
})

test('addMonthsToDate clamps to the target month length', () => {
  assert.equal(date.addMonthsToDate('2025-01-31', 1), '2025-02-28')
  assert.equal(date.addMonthsToDate('2024-01-31', 1), '2024-02-29')
  assert.equal(date.addMonthsToDate('2025-03-31', -1), '2025-02-28')
  assert.equal(date.addMonthsToDate('2025-02-28', 12), '2026-02-28')
  assert.equal(date.addMonthsToDate('2024-02-29', 12), '2025-02-28')
})

test('compareIso orders dates, months and times chronologically', () => {
  assert.equal(date.compareIso('2032-11-24', '2032-11-25'), -1)
  assert.equal(date.compareIso('2033-01-01', '2032-12-31'), 1)
  assert.equal(date.compareIso('2032-11-24', '2032-11-24'), 0)
  assert.equal(date.compareIso('2032-11', '2033-01'), -1)
  assert.equal(date.compareIso('09:30', '10:00'), -1)
})

test('weekday helpers know Sunday and the offset from the configured week start', () => {
  assert.equal(date.weekdayOf('2024-01-07'), 0)
  assert.equal(date.weekdayOf('2032-11-24'), 3) // Wednesday
  assert.equal(date.weekOffset('2032-11-24', 1), 2)
  assert.equal(date.weekOffset('2032-11-24', 0), 3)
  assert.equal(date.weekOffset('2032-11-22', 1), 0) // Monday on a Monday-start week
  assert.equal(date.weekOffset('2032-11-21', 0), 0) // Sunday on a Sunday-start week
})

test('monthGrid is always 42 cells, padded with the neighbouring months', () => {
  const monday = date.monthGrid('2032-11', 1)
  assert.equal(monday.length, 42)
  assert.equal(monday[0], '2032-11-01') // Nov 1 2032 is a Monday → no leading padding
  assert.equal(monday[29], '2032-11-30')
  assert.equal(monday[41], '2032-12-12')

  const sunday = date.monthGrid('2032-11', 0)
  assert.equal(sunday[0], '2032-10-31')
  assert.equal(sunday[1], '2032-11-01')
  assert.equal(sunday[41], '2032-12-11')

  // Sunday start shifts the same month by one column.
  const feb = date.monthGrid('2027-02', 1) // 2027-02-01 is a Monday
  assert.equal(feb[0], '2027-02-01')
  assert.equal(feb[27], '2027-02-28')
  assert.equal(feb[41], '2027-03-14')
  assert.equal(new Set(feb).size, 42)
})

test('range helpers normalise picks and test membership on a closed interval', () => {
  assert.deepEqual(date.normalizeRange('2032-11-24', '2032-11-20'), { start: '2032-11-20', end: '2032-11-24' })
  assert.deepEqual(date.normalizeRange('2032-11-20', '2032-11-24'), { start: '2032-11-20', end: '2032-11-24' })
  const range = { start: '2032-11-20', end: '2032-11-24' }
  assert.equal(date.isInRange('2032-11-20', range), true)
  assert.equal(date.isInRange('2032-11-24', range), true)
  assert.equal(date.isInRange('2032-11-22', range), true)
  assert.equal(date.isInRange('2032-11-19', range), false)
  assert.equal(date.isInRange('2032-11-25', range), false)
  assert.equal(date.isOutsideBounds('2032-11-22', '2032-11-20', '2032-11-24'), false)
  assert.equal(date.isOutsideBounds('2032-11-19', '2032-11-20', undefined), true)
  assert.equal(date.isOutsideBounds('2032-11-25', undefined, '2032-11-24'), true)
  assert.equal(date.isOutsideBounds('2032-11-25', undefined, undefined), false)
})

test('Intl-backed names follow locale and week start', () => {
  assert.deepEqual(date.weekdayNames('en-US', 1), ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
  assert.deepEqual(date.weekdayNames('en-US', 0), ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
  assert.deepEqual(date.weekdayNames('en-US', 1, 'long').slice(0, 2), ['Monday', 'Tuesday'])
  assert.deepEqual(date.weekdayNames('zh-CN', 1).slice(0, 2), ['周一', '周二'])
  assert.equal(date.monthTitle('en-US', '2032-11'), 'November 2032')
  assert.equal(date.monthTitle('zh-CN', '2032-11'), '2032年11月')
  assert.equal(date.formatDateLong('en-US', '2032-11-24'), 'Wednesday, November 24, 2032')
})

test('todayIso is a valid ISO date in local time', () => {
  const today = date.todayIso()
  assert.match(today, /^\d{4}-\d{2}-\d{2}$/)
  const now = new Date()
  assert.deepEqual(date.parseIsoDate(today), { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() })
})

test('time helpers convert, wrap and clamp on a 24-hour clock', () => {
  assert.deepEqual(date.parseIsoTime('08:30'), { h: 8, min: 30 })
  assert.throws(() => date.parseIsoTime('24:00'), RangeError)
  assert.throws(() => date.parseIsoTime('8:30'), RangeError)
  assert.throws(() => date.parseIsoTime('08:60'), RangeError)
  assert.equal(date.timeToMinutes('00:29'), 29)
  assert.equal(date.timeToMinutes('23:59'), 1439)
  assert.equal(date.minutesToTime(0), '00:00')
  assert.equal(date.minutesToTime(1439), '23:59')
  assert.equal(date.minutesToTime(1440), '00:00')
  assert.equal(date.minutesToTime(-1), '23:59')
  assert.equal(date.clampTime('08:30', '09:00', undefined), '09:00')
  assert.equal(date.clampTime('18:30', undefined, '17:00'), '17:00')
  assert.equal(date.clampTime('12:00', '09:00', '17:00'), '12:00')
})

test('formatIsoDate zero-pads every component, including years below 1000', () => {
  assert.equal(date.formatIsoDate({ y: 999, m: 1, d: 1 }), '0999-01-01')
  assert.equal(date.formatIsoDate({ y: 2032, m: 11, d: 24 }), '2032-11-24')
  assert.equal(date.formatIsoMonth(2032, 1), '2032-01')
  // parse ∘ format is the identity on every day of a year
  for (let m = 1; m <= 12; m += 1) {
    for (let d = 1; d <= date.daysInMonth(2032, m); d += 1) {
      const parts = { y: 2032, m, d }
      assert.deepEqual(date.parseIsoDate(date.formatIsoDate(parts)), parts)
    }
  }
})

test('daysInMonth follows the Gregorian leap rules (÷4, not ÷100, unless ÷400)', () => {
  assert.deepEqual(
    Array.from({ length: 12 }, (_, index) => date.daysInMonth(2025, index + 1)),
    [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
  )
  assert.equal(date.daysInMonth(2024, 2), 29)
  assert.equal(date.daysInMonth(2000, 2), 29)
  assert.equal(date.daysInMonth(1900, 2), 28)
  assert.equal(date.daysInMonth(2100, 2), 28)
  assert.throws(() => date.parseIsoDate('1900-02-29'), RangeError)
  assert.throws(() => date.parseIsoDate('2100-02-29'), RangeError)
  assert.deepEqual(date.parseIsoDate('2000-02-29'), { y: 2000, m: 2, d: 29 })
  assert.throws(() => date.parseIsoDate('2025-04-31'), RangeError)
  assert.throws(() => date.parseIsoDate('2025-06-31'), RangeError)
})

test('addDays: zero is identity, large steps and negatives cross many years', () => {
  assert.equal(date.addDays('2032-11-24', 0), '2032-11-24')
  assert.equal(date.addDays('2032-11-24', 366), '2033-11-25') // 2032 is leap but the span starts after Feb
  assert.equal(date.addDays('2031-11-24', 366), '2032-11-24') // spans 2032-02-29
  assert.equal(date.addDays('2032-01-01', -1), '2031-12-31')
  assert.equal(date.addDays('2032-01-01', -366), '2030-12-31')
  assert.equal(date.addDays('2032-11-24', 10_000), '2060-04-11')
  // inverse: stepping back returns to the origin for every day of a leap year
  for (let index = 0; index < 366; index += 1) {
    const day = date.addDays('2032-01-01', index)
    assert.equal(date.addDays(day, -index), '2032-01-01')
  }
})

test('addMonths: zero is identity, whole years and multi-year jumps', () => {
  assert.equal(date.addMonths('2032-11', 0), '2032-11')
  assert.equal(date.addMonths('2032-11', -12), '2031-11')
  assert.equal(date.addMonths('2032-11', 24), '2034-11')
  assert.equal(date.addMonths('2032-12', 1), '2033-01')
  assert.equal(date.addMonths('2032-11', -11), '2031-12')
  assert.equal(date.addMonths('2032-11', -23), '2030-12')
  assert.equal(date.addMonths('2032-11', 25), '2034-12')
  // walking twelve single steps equals one year
  let month = '2032-01'
  for (let index = 0; index < 12; index += 1) month = date.addMonths(month, 1)
  assert.equal(month, '2033-01')
})

test('addMonthsToDate keeps the day when it fits and only clamps at short months', () => {
  assert.equal(date.addMonthsToDate('2032-11-24', 0), '2032-11-24')
  assert.equal(date.addMonthsToDate('2032-01-31', 2), '2032-03-31')
  assert.equal(date.addMonthsToDate('2032-08-31', 1), '2032-09-30')
  assert.equal(date.addMonthsToDate('2032-11-30', -1), '2032-10-30')
  assert.equal(date.addMonthsToDate('2032-12-31', 1), '2033-01-31')
  assert.equal(date.addMonthsToDate('2032-02-29', -12), '2031-02-28')
  assert.equal(date.addMonthsToDate('2032-02-29', 48), '2036-02-29')
  assert.equal(date.addMonthsToDate('2032-01-31', -1), '2031-12-31')
})

test('weekdayOf covers a full week and weekOffset gives a 0–6 table for both week starts', () => {
  // 2032-11-01 is Monday … 2032-11-07 is Sunday
  assert.deepEqual(
    Array.from({ length: 7 }, (_, index) => date.weekdayOf(date.addDays('2032-11-01', index))),
    [1, 2, 3, 4, 5, 6, 0],
  )
  assert.deepEqual(
    Array.from({ length: 7 }, (_, index) => date.weekOffset(date.addDays('2032-11-01', index), 1)),
    [0, 1, 2, 3, 4, 5, 6],
  )
  assert.deepEqual(
    Array.from({ length: 7 }, (_, index) => date.weekOffset(date.addDays('2032-11-01', index), 0)),
    [1, 2, 3, 4, 5, 6, 0],
  )
  assert.equal(date.weekdayOf('2000-01-01'), 6) // Saturday
  assert.equal(date.weekdayOf('2033-01-01'), 6)
  assert.equal(date.weekdayOf('1970-01-01'), 4) // Thursday
})

test('monthGrid invariants hold for every month of a decade and both week starts', () => {
  for (let y = 2024; y <= 2033; y += 1) {
    for (let m = 1; m <= 12; m += 1) {
      const month = date.formatIsoMonth(y, m)
      for (const weekStart of [0, 1]) {
        const grid = date.monthGrid(month, weekStart)
        assert.equal(grid.length, 42, `${month}/${weekStart} length`)
        assert.equal(date.weekdayOf(grid[0]), weekStart, `${month}/${weekStart} first cell weekday`)
        for (let index = 1; index < 42; index += 1) {
          assert.equal(grid[index], date.addDays(grid[index - 1], 1), `${month}/${weekStart} consecutive at ${index}`)
        }
        const first = `${month}-01`
        const firstIndex = grid.indexOf(first)
        assert.equal(firstIndex, date.weekOffset(first, weekStart), `${month}/${weekStart} day 1 column`)
        assert.ok(firstIndex >= 0 && firstIndex <= 6)
        const last = date.formatIsoDate({ y, m, d: date.daysInMonth(y, m) })
        assert.ok(grid.includes(last), `${month}/${weekStart} contains last day`)
        assert.equal(grid.filter((day) => date.monthOf(day) === month).length, date.daysInMonth(y, m))
      }
    }
  }
})

test('monthGrid pads across a year boundary from both sides', () => {
  const december = date.monthGrid('2032-12', 1) // Dec 1 2032 is Wednesday
  assert.equal(december[0], '2032-11-29')
  assert.equal(december[2], '2032-12-01')
  assert.equal(december[41], '2033-01-09')
  const january = date.monthGrid('2033-01', 1) // Jan 1 2033 is Saturday
  assert.equal(january[0], '2032-12-27')
  assert.equal(january[5], '2033-01-01')
  assert.equal(january[41], '2033-02-06')
  const januarySunday = date.monthGrid('2033-01', 0)
  assert.equal(januarySunday[0], '2032-12-26')
  assert.equal(januarySunday[6], '2033-01-01')
})

test('range helpers handle single-day ranges and inclusive bounds', () => {
  assert.deepEqual(date.normalizeRange('2032-11-24', '2032-11-24'), { start: '2032-11-24', end: '2032-11-24' })
  const single = { start: '2032-11-24', end: '2032-11-24' }
  assert.equal(date.isInRange('2032-11-24', single), true)
  assert.equal(date.isInRange('2032-11-23', single), false)
  assert.equal(date.isInRange('2032-11-25', single), false)
  const acrossYears = { start: '2032-12-30', end: '2033-01-02' }
  assert.equal(date.isInRange('2033-01-01', acrossYears), true)
  assert.equal(date.isInRange('2032-12-29', acrossYears), false)
  assert.equal(date.isOutsideBounds('2032-11-20', '2032-11-20', '2032-11-24'), false)
  assert.equal(date.isOutsideBounds('2032-11-24', '2032-11-20', '2032-11-24'), false)
  assert.equal(date.isOutsideBounds('2032-11-24', '2032-11-24', '2032-11-24'), false)
  assert.equal(date.isOutsideBounds('2032-11-23', '2032-11-24', '2032-11-24'), true)
})

test('Intl names: narrow / long styles, Chinese long names, other locales and months', () => {
  assert.deepEqual(date.weekdayNames('en-US', 1, 'narrow'), ['M', 'T', 'W', 'T', 'F', 'S', 'S'])
  assert.deepEqual(date.weekdayNames('zh-CN', 1, 'long'), [
    '星期一',
    '星期二',
    '星期三',
    '星期四',
    '星期五',
    '星期六',
    '星期日',
  ])
  assert.deepEqual(date.weekdayNames('zh-CN', 0).slice(0, 2), ['周日', '周一'])
  // de-DE short names differ between CLDR releases ('Mo' vs 'Mo.'), so only the ordering is pinned
  assert.match(date.weekdayNames('de-DE', 1)[0], /^Mo\.?$/)
  assert.match(date.weekdayNames('de-DE', 0)[0], /^So\.?$/)
  assert.equal(date.weekdayNames('en-US', 1).length, 7)
  assert.equal(date.monthTitle('en-US', '2033-01'), 'January 2033')
  assert.equal(date.monthTitle('en-US', '2032-02'), 'February 2032')
  assert.equal(date.monthTitle('zh-CN', '2033-01'), '2033年1月')
  assert.equal(date.monthTitle('de-DE', '2032-11'), 'November 2032')
  assert.equal(date.formatDateLong('zh-CN', '2032-11-24'), '2032年11月24日星期三')
  assert.equal(date.formatDateLong('en-US', '2033-01-01'), 'Saturday, January 1, 2033')
})

test('parseIsoTime accepts the clock bounds and rejects every loose format', () => {
  assert.deepEqual(date.parseIsoTime('00:00'), { h: 0, min: 0 })
  assert.deepEqual(date.parseIsoTime('23:59'), { h: 23, min: 59 })
  for (const bad of ['1:30', '08:5', '08:30:00', '-1:00', '08-30', '0830', '', '24:00', '23:60', 'ab:cd']) {
    assert.throws(() => date.parseIsoTime(bad), RangeError, bad)
  }
})

test('minutes ⇄ time round-trips every minute of the day and truncates fractions', () => {
  for (let minutes = 0; minutes < 1440; minutes += 1) {
    assert.equal(date.timeToMinutes(date.minutesToTime(minutes)), minutes)
  }
  assert.equal(date.minutesToTime(90.9), '01:30')
  assert.equal(date.minutesToTime(2880 + 30), '00:30')
  assert.equal(date.minutesToTime(-1440), '00:00')
  assert.equal(date.minutesToTime(-90), '22:30')
})

test('clampTime is identity inside the bounds and pins to the touched bound', () => {
  assert.equal(date.clampTime('09:00', '09:00', '17:00'), '09:00')
  assert.equal(date.clampTime('17:00', '09:00', '17:00'), '17:00')
  assert.equal(date.clampTime('00:00', undefined, undefined), '00:00')
  assert.equal(date.clampTime('23:59', '00:00', '23:59'), '23:59')
  assert.equal(date.clampTime('00:00', '00:01', undefined), '00:01')
  assert.equal(date.clampTime('23:59', undefined, '23:58'), '23:58')
})

test('formatDate / formatDateMedium honour locale and options with a UTC-pinned zone', () => {
  assert.equal(date.formatDate('en-US', '2032-11-24', { month: 'long', day: 'numeric' }), 'November 24')
  assert.equal(
    date.formatDate('en-US', '2032-11-24', { year: 'numeric', month: '2-digit', day: '2-digit' }),
    '11/24/2032',
  )
  assert.equal(date.formatDateMedium('en-US', '2032-11-24'), 'Wed, Nov 24, 2032')
  assert.match(date.formatDateMedium('zh-CN', '2032-11-24'), /^2032年11月24日\s?周三$/) // ICU spacing varies
  // Midnight UTC never rolls into the previous day, whatever the host zone.
  assert.equal(date.formatDate('en-US', '2033-01-01', { day: 'numeric' }), '1')
})
