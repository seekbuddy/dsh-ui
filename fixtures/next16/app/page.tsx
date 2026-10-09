import { Card } from '@seekbuddy/dsh-ui/seekbuddy/card'
import { Empty } from '@seekbuddy/dsh-ui/seekbuddy/empty'
import { Spinner } from '@seekbuddy/dsh-ui/seekbuddy/spinner'
import { Timeline } from '@seekbuddy/dsh-ui/seekbuddy/timeline'
import { Consumer } from './consumer'

export default function Page() {
  return (
    <>
      <Card as="section" aria-label="Server card">
        Server card
      </Card>
      <Empty status="empty" title="Server empty state" description="Nothing here yet." />
      <Spinner size="md" tone="page" label="Server loading" />
      <Timeline
        label="Server runs"
        statusLabels={{ running: 'Running', succeeded: 'Succeeded', failed: 'Failed', canceled: 'Canceled' }}
        groups={[{ key: 'today', heading: 'Today', items: [{ key: 'run-1', status: 'succeeded', title: 'Build' }] }]}
      />
      <Consumer />
    </>
  )
}
