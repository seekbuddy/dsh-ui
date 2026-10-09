'use client'

import { useState } from 'react'
import { Button } from '@seekbuddy/dsh-ui'
import { TerminalBlock } from '@seekbuddy/dsh-ui/blocks'
import { MarkdownText } from '@seekbuddy/dsh-ui/markdown'
import { IconCheckOutlineRegular } from '@seekbuddy/dsh-ui/icons'
import {
  DateField,
  Empty,
  Mark,
  MessageProvider,
  Pagination,
  QrCode,
  StatusBadge,
  Switch,
  TimeField,
  Upload,
  useMessage,
} from '@seekbuddy/dsh-ui/seekbuddy'
import { Spinner } from '@seekbuddy/dsh-ui/seekbuddy/spinner'
import { Tabs } from '@seekbuddy/dsh-ui/seekbuddy/tabs'
import { setThemePreference, useIsDark } from '@seekbuddy/dsh-ui/theme'

const markdownLabels = {
  code: { copyLabel: 'Copy', copiedLabel: 'Copied' },
  footnotes: 'Footnotes',
}

const terminalLabels = {
  signal: (signal: string) => `Signal ${signal}`,
  exitCode: (code: number) => `Exit ${code}`,
  noExitCode: 'No exit code',
  running: 'Running',
  failed: 'Failed',
  done: 'Done',
  copy: 'Copy',
  copied: 'Copied',
  noOutput: 'No output',
  collapseAria: 'Collapse output',
  collapse: 'Collapse',
  expandAria: (hidden: number) => `Expand ${hidden} lines`,
  expand: (hidden: number) => `Expand ${hidden} lines`,
}

function Notify() {
  const message = useMessage()
  return (
    <Button variant="outline" onClick={() => message.success('Saved')}>
      Notify
    </Button>
  )
}

export function Consumer() {
  const dark = useIsDark()
  const [tab, setTab] = useState<'components' | 'tokens'>('components')
  return (
    <main>
      <Button variant="primary" onClick={() => setThemePreference(dark ? 'light' : 'dark')}>
        <IconCheckOutlineRegular /> Toggle theme
      </Button>
      <TerminalBlock labels={terminalLabels} command="npm test" output="passed" exitCode={0} />
      <MarkdownText labels={markdownLabels} text={'Math: $x^2$'} />
      <Spinner size="md" tone="page" label="Loading" />
      <Switch defaultChecked aria-label="Enabled" />
      <Mark kind="official" label="Official" />
      <StatusBadge tone="success">Running</StatusBadge>
      <QrCode text="https://example.com/auth?state=next16" label="Scan to authorize" size={140} />
      <MessageProvider>
        <Notify />
      </MessageProvider>
      <Pagination
        total={85}
        pageSize={20}
        defaultCurrent={2}
        labels={{
          navigation: 'Pages',
          previous: 'Previous',
          next: 'Next',
          page: (page) => `Page ${page}`,
          jumpPrevious: 'Back',
          jumpNext: 'Forward',
        }}
      />
      <Empty status="error" title="Client error state" retryLabel="Retry" onRetry={() => {}} minHeight={120} />
      <Upload
        accept=".zip"
        maxCount={1}
        upload={(file, { onProgress }) => {
          onProgress(50)
          return Promise.resolve({ name: file.name })
        }}
        labels={{
          trigger: 'Choose file',
          list: 'Files',
          remove: 'Remove',
          retry: 'Retry',
          uploading: 'Uploading',
          done: 'Uploaded',
          error: 'Failed',
        }}
      />
      <Tabs
        label="Documentation views"
        items={[
          { key: 'components', label: 'Components' },
          { key: 'tokens', label: 'Tokens' },
        ]}
        activeKey={tab}
        onChange={setTab}
      />
      <DateField
        value="2032-11-24"
        onChange={() => {}}
        today="2032-11-18"
        locale="en-US"
        labels={{
          previousMonth: 'Previous month',
          nextMonth: 'Next month',
          previousYear: 'Previous year',
          nextYear: 'Next year',
          today: 'Today',
          empty: 'No date',
          open: 'open date picker',
          dayLabel: (date) => date,
        }}
      />
      <TimeField
        value="00:29"
        onChange={() => {}}
        labels={{ hours: 'Hours', minutes: 'Minutes', open: 'open time picker' }}
      />
    </main>
  )
}
