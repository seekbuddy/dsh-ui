import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { Button } from '@seekbuddy/dsh-ui'
import { Card } from '@seekbuddy/dsh-ui/seekbuddy/card'
import { Empty } from '@seekbuddy/dsh-ui/seekbuddy/empty'
import { Spinner } from '@seekbuddy/dsh-ui/seekbuddy/spinner'
import { Tabs } from '@seekbuddy/dsh-ui/seekbuddy/tabs'
import { Timeline } from '@seekbuddy/dsh-ui/seekbuddy/timeline'
import {
  Calendar,
  DateField,
  DatePicker,
  DateRangePicker,
  Mark,
  MessageProvider,
  Pagination,
  QrCode,
  StatusBadge,
  Upload,
  Switch,
  TimePicker,
} from '@seekbuddy/dsh-ui/seekbuddy'

const html = renderToString(createElement(Button, { variant: 'primary' }, 'React 18'))
if (!html.includes('React 18')) throw new Error('server render did not produce Button content')
const card = renderToString(createElement(Card, { as: 'li', padding: 'sm', interactive: true, id: 'c1' }, 'Card body'))
if (
  !card.startsWith('<li') ||
  !card.includes('id="c1"') ||
  !card.includes('Card body') ||
  (card.match(/class="([^"]+)"/)?.[1].split(' ').length ?? 0) !== 3
) {
  throw new Error('server render did not produce the seekbuddy Card surface with padding and interactive classes')
}
const emptyState = renderToString(
  createElement(Empty, { status: 'empty', title: 'Nothing yet', description: 'Create one', id: 'e1' }),
)
if (
  !emptyState.startsWith('<div') ||
  emptyState.includes('role=') ||
  !emptyState.includes('min-height:240px') ||
  !emptyState.includes('<svg') ||
  !emptyState.includes('Nothing yet') ||
  !emptyState.includes('Create one') ||
  emptyState.includes('<button')
) {
  throw new Error('server render did not produce the seekbuddy Empty placeholder without a role or button')
}
const errorState = renderToString(
  createElement(Empty, { status: 'error', title: 'Failed', retryLabel: 'Retry', onRetry: () => {}, bordered: false }),
)
if (!errorState.includes('role="alert"') || !errorState.includes('>Retry<') || errorState.includes('aria-live')) {
  throw new Error('server render did not produce the seekbuddy Empty error state with a retry button')
}
const spinner = renderToString(createElement(Spinner, { size: 'md', tone: 'page', label: 'Loading' }))
if (!spinner.includes('role="status"') || !spinner.includes('Loading')) {
  throw new Error('server render did not produce the seekbuddy Spinner status region')
}
const tabs = renderToString(
  createElement(Tabs, {
    label: 'Views',
    items: [
      { key: 'a', label: 'A', count: 1 },
      { key: 'b', label: 'B' },
    ],
    activeKey: 'a',
    onChange: () => {},
  }),
)
if (!tabs.includes('role="tablist"') || !tabs.includes('aria-selected="true"') || !tabs.includes('tabindex="-1"')) {
  throw new Error('server render did not produce the seekbuddy Tabs list with roving tabindex')
}
const timeline = renderToString(
  createElement(Timeline, {
    label: 'Runs',
    statusLabels: { running: 'Running', succeeded: 'Succeeded', failed: 'Failed', canceled: 'Canceled' },
    groups: [
      {
        key: 'today',
        heading: 'Today',
        items: [
          { key: 'r1', status: 'failed', title: 'Job', meta: ['manual', '08:00'], message: 'quota exhausted' },
          { key: 'r0', status: 'running', title: 'Job' },
        ],
      },
    ],
  }),
)
if (
  !timeline.includes('<ol') ||
  !timeline.includes('>Failed<') ||
  !timeline.includes('role="status"') ||
  !timeline.includes('quota exhausted')
) {
  throw new Error('server render did not produce the seekbuddy Timeline list with status text')
}
const calendarLabels = {
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  previousYear: 'Previous year',
  nextYear: 'Next year',
  dayLabel: (date) => date,
}
const calendar = renderToString(
  createElement(Calendar, {
    mode: 'single',
    value: '2032-11-24',
    onChange: () => {},
    today: '2032-11-18',
    locale: 'en-US',
    labels: calendarLabels,
  }),
)
if (
  !calendar.includes('role="grid"') ||
  !calendar.includes('November 2032') ||
  !calendar.includes('aria-selected="true"') ||
  (calendar.match(/tabindex="0"/g) ?? []).length !== 1
) {
  throw new Error('server render did not produce the seekbuddy Calendar grid with one tab stop')
}
const datePicker = renderToString(
  createElement(DatePicker, {
    value: '2032-11-24',
    onChange: () => {},
    today: '2032-11-18',
    locale: 'en-US',
    labels: { ...calendarLabels, today: 'Today', empty: 'No date' },
  }),
)
if (!datePicker.includes('Wed, Nov 24, 2032') || !datePicker.includes('>Today<')) {
  throw new Error('server render did not produce the seekbuddy DatePicker footer')
}
const rangePicker = renderToString(
  createElement(DateRangePicker, {
    value: { start: '2032-11-12', end: '2032-11-18' },
    onChange: () => {},
    today: '2032-11-18',
    locale: 'en-US',
    presets: [{ key: 'last7', label: 'Last 7 days', range: { start: '2032-11-12', end: '2032-11-18' } }],
    labels: { ...calendarLabels, presets: 'Quick ranges', cancel: 'Cancel', apply: 'Apply', pickEnd: 'Pick an end' },
  }),
)
if (
  !rangePicker.includes('role="listbox"') ||
  !rangePicker.includes('December 2032') ||
  !rangePicker.includes('data-range="middle"') ||
  !rangePicker.includes('>Apply<')
) {
  throw new Error('server render did not produce the seekbuddy DateRangePicker with presets, two months and a band')
}
const timePicker = renderToString(
  createElement(TimePicker, { value: '00:29', onChange: () => {}, labels: { hours: 'Hours', minutes: 'Minutes' } }),
)
if (
  (timePicker.match(/role="listbox"/g) ?? []).length !== 2 ||
  (timePicker.match(/aria-selected="true"/g) ?? []).length !== 2
) {
  throw new Error('server render did not produce the seekbuddy TimePicker columns with one selection each')
}
const dateField = renderToString(
  createElement(DateField, {
    value: '2032-11-24',
    onChange: () => {},
    today: '2032-11-18',
    locale: 'en-US',
    labels: { ...calendarLabels, today: 'Today', empty: 'No date', open: 'open date picker' },
  }),
)
if (
  !dateField.includes('aria-haspopup="dialog"') ||
  !dateField.includes('2032/11/24') ||
  dateField.includes('role="dialog"')
) {
  throw new Error('server render did not produce a closed seekbuddy DateField trigger')
}
const switchOn = renderToString(
  createElement(Switch, { checked: true, checkedChildren: 'On', unCheckedChildren: 'Off', onChange: () => {} }),
)
if (
  !switchOn.includes('role="switch"') ||
  !switchOn.includes('aria-checked="true"') ||
  !switchOn.includes('type="button"') ||
  !switchOn.includes('>On<') ||
  switchOn.includes('>Off<')
) {
  throw new Error('server render did not produce the seekbuddy Switch in its on state')
}
const switchOff = renderToString(createElement(Switch, { defaultChecked: false, 'aria-label': 'Enabled' }))
if (!switchOff.includes('aria-checked="false"') || !switchOff.includes('aria-label="Enabled"')) {
  throw new Error('server render did not produce an uncontrolled off seekbuddy Switch')
}
const officialMark = renderToString(createElement(Mark, { kind: 'official', label: 'Official', size: 20 }))
if (
  !officialMark.includes('role="img"') ||
  !officialMark.includes('aria-label="Official"') ||
  !officialMark.includes('tabindex="0"') ||
  !officialMark.includes('width="20"') ||
  !officialMark.includes('aria-hidden="true"')
) {
  throw new Error('server render did not produce the seekbuddy Mark as a named, focusable img with a decorative SVG')
}
const bareMark = renderToString(createElement(Mark, { kind: 'official', label: 'Official', tooltip: false }))
if (!bareMark.startsWith('<span') || bareMark.includes('role="tooltip"')) {
  throw new Error('server render of a tooltip-less seekbuddy Mark must be the bare span')
}
const pager = renderToString(
  createElement(Pagination, {
    total: 1000,
    pageSize: 20,
    current: 25,
    onChange: () => {},
    labels: {
      navigation: 'Pages',
      previous: 'Previous',
      next: 'Next',
      page: (page) => `Page ${page}`,
      jumpPrevious: 'Back',
      jumpNext: 'Forward',
    },
  }),
)
if (
  !pager.startsWith('<nav') ||
  !pager.includes('aria-current="page"') ||
  (pager.match(/<button/g) ?? []).length !== 11 || // prev, 1, «, 23-27, », 50, next
  !pager.includes('aria-label="Back"') ||
  !pager.includes('aria-label="Forward"')
) {
  throw new Error('server render did not produce the seekbuddy Pagination strip with first/last pages and both jumps')
}
const uploader = renderToString(
  createElement(Upload, {
    layout: 'dragger',
    upload: () => Promise.resolve(),
    defaultItems: [
      { uid: 'u1', name: 'archive.zip', size: 2048, status: 'uploading', percent: 40 },
      { uid: 'u2', name: 'broken.zip', size: 5, status: 'error', percent: 0, error: 'checksum' },
    ],
    labels: {
      trigger: 'Choose files',
      hint: 'ZIP only',
      list: 'Files',
      remove: 'Remove',
      retry: 'Retry',
      uploading: 'Uploading',
      done: 'Uploaded',
      error: 'Failed',
    },
  }),
)
if (
  !uploader.includes('role="button"') ||
  !uploader.includes('type="file"') ||
  !uploader.includes('aria-label="Files"') ||
  !uploader.includes('role="progressbar"') ||
  !uploader.includes('aria-valuenow="40"') ||
  !uploader.includes('2 KB') ||
  !uploader.includes('checksum') ||
  uploader.includes('aria-label="Retry"') // backfilled error items carry no File, so no retry button
) {
  throw new Error('server render did not produce the seekbuddy Upload drop zone with a progress row and an error row')
}
const provider = renderToString(createElement(MessageProvider, { maxCount: 1 }, createElement('span', null, 'inside')))
if (provider !== '<span>inside</span>') {
  throw new Error(
    'server render of an empty seekbuddy MessageProvider must be its children only (no portal, no document access)',
  )
}
const badge = renderToString(createElement(StatusBadge, { tone: 'progress', className: 'extra' }, 'Mounting'))
if (
  !badge.startsWith('<span') ||
  badge.includes('<button') ||
  !/class="[^"]*progress[^"]*"/.test(badge) ||
  !badge.includes('data-state="ongoing"') ||
  !badge.includes('aria-hidden="true"') ||
  !badge.includes('extra') ||
  !badge.includes('Mounting')
) {
  throw new Error(
    'server render did not produce the seekbuddy StatusBadge as a static span with the animated upstream dot',
  )
}
const bareBadge = renderToString(createElement(StatusBadge, { tone: 'neutral', dot: false }, 'Delisted'))
if (bareBadge.includes('data-state=')) throw new Error('StatusBadge dot={false} must render no StateDot')
// QR: version 2 (25 modules) plus the 4-module quiet zone on each side.
const qr = renderToString(
  createElement(QrCode, { text: 'https://example.com/auth', label: 'Scan to authorize', size: 120 }),
)
if (
  !qr.includes('role="img"') ||
  !qr.includes('aria-label="Scan to authorize"') ||
  !qr.includes('viewBox="0 0 33 33"') ||
  !qr.includes('width="120"') ||
  !qr.includes('fill="#000"') ||
  !/<path d="M\d+ \d+h1v1h-1z/.test(qr)
) {
  throw new Error('server render did not produce the seekbuddy QrCode as a labelled SVG with a single module path')
}
const unencodable = renderToString(
  createElement(QrCode, {
    text: 'x'.repeat(700),
    label: 'Too long',
    fallback: createElement('a', { href: '#' }, 'Open link'),
  }),
)
if (unencodable !== '<a href="#">Open link</a>') {
  throw new Error('a payload past version 20 must render the QrCode fallback instead of an SVG')
}
console.log('[react18] server rendering passed')
