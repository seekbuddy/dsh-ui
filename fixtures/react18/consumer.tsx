import { Button, ConnectionIndicator } from '@seekbuddy/dsh-ui'
import {
  Calendar,
  Card,
  DateField,
  DatePicker,
  DateRangePicker,
  Empty,
  Mark,
  MessageProvider,
  Pagination,
  QrCode,
  Spinner,
  StatusBadge,
  Switch,
  Tabs,
  TimePicker,
  Timeline,
  Upload,
} from '@seekbuddy/dsh-ui/seekbuddy'
import type { ThemePreference } from '@seekbuddy/dsh-ui/theme'

const preference: ThemePreference = 'system'

const calendarLabels = {
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  previousYear: 'Previous year',
  nextYear: 'Next year',
  dayLabel: (date: string) => date,
}

export const view = (
  <div data-theme={preference}>
    <Button variant="primary">React 18</Button>
    <ConnectionIndicator
      state="recovered"
      disconnectedLabel="Disconnected"
      connectingLabel="Connecting"
      recoveredLabel="Connected"
      reconnectActionLabel="Reconnect now"
      restartActionLabel="Restart connection"
      onReconnect={() => {}}
    />
    <Card as="article" padding="sm" interactive>
      Card body
    </Card>
    <Spinner size="md" tone="page" label="Loading" />
    <StatusBadge tone="progress">Mounting</StatusBadge>
    <QrCode text="https://example.com/auth?state=fixture" label="Scan to authorize" size={120} />
    <Empty status="error" title="Failed" description="Try again" retryLabel="Retry" onRetry={() => {}} />
    <Mark kind="official" label="Official" size={14} />
    <MessageProvider top={24}>
      <Button variant="outline">Notify</Button>
    </MessageProvider>
    <Pagination
      total={1000}
      pageSize={20}
      current={25}
      onChange={() => {}}
      labels={{
        navigation: 'Pages',
        previous: 'Previous',
        next: 'Next',
        page: (page) => `Page ${page}`,
        jumpPrevious: 'Back',
        jumpNext: 'Forward',
      }}
    />
    <Upload
      layout="dragger"
      multiple
      upload={() => Promise.resolve()}
      defaultItems={[{ uid: 'u1', name: 'archive.zip', size: 2048, status: 'uploading', percent: 40 }]}
      labels={{
        trigger: 'Choose files',
        hint: 'ZIP only',
        list: 'Files',
        remove: 'Remove',
        retry: 'Retry',
        uploading: 'Uploading',
        done: 'Uploaded',
        error: 'Failed',
      }}
    />
    <Switch checked aria-label="Enabled" onChange={() => {}} />
    <Tabs
      label="Views"
      items={[
        { key: 'a', label: 'A', count: 1 },
        { key: 'b', label: 'B' },
      ]}
      activeKey="a"
      onChange={() => {}}
    />
    <Timeline
      label="Runs"
      statusLabels={{ running: 'Running', succeeded: 'Succeeded', failed: 'Failed', canceled: 'Canceled' }}
      groups={[
        {
          key: 'today',
          heading: 'Today',
          items: [{ key: 'r1', status: 'succeeded', title: 'Job', meta: ['manual', '08:00'] }],
        },
      ]}
    />
    <Calendar
      mode="single"
      value="2032-11-24"
      onChange={() => {}}
      today="2032-11-18"
      locale="en-US"
      labels={calendarLabels}
    />
    <DatePicker
      value="2032-11-24"
      onChange={() => {}}
      today="2032-11-18"
      locale="en-US"
      labels={{ ...calendarLabels, today: 'Today', empty: 'No date' }}
    />
    <DateRangePicker
      value={{ start: '2032-11-12', end: '2032-11-18' }}
      onChange={() => {}}
      today="2032-11-18"
      locale="en-US"
      presets={[{ key: 'last7', label: 'Last 7 days', range: { start: '2032-11-12', end: '2032-11-18' } }]}
      labels={{ ...calendarLabels, presets: 'Quick ranges', cancel: 'Cancel', apply: 'Apply', pickEnd: 'Pick an end' }}
    />
    <TimePicker value="00:29" onChange={() => {}} labels={{ hours: 'Hours', minutes: 'Minutes' }} />
    <DateField
      value="2032-11-24"
      onChange={() => {}}
      today="2032-11-18"
      locale="en-US"
      labels={{ ...calendarLabels, today: 'Today', empty: 'No date', open: 'open date picker' }}
    />
  </div>
)
