# Timeline

English | [中文](timeline.zh.md)

A vertical run history: groups (such as "Today", "Yesterday"), each an ordered list of entries with a status badge, a title, a grey metadata line and an optional message. A rail connects the badges inside a group.

```tsx
import { Timeline } from '@seekbuddy/dsh-ui/seekbuddy'
// In a Next.js Server Component (entries without onSelect):
import { Timeline as ServerTimeline } from '@seekbuddy/dsh-ui/seekbuddy/timeline'
```

## When to use

A chronological list of runs or events that each have a state: task runs, sync history, deployment history. Grouping, sorting, wording and time formatting are yours; the component lays out what you pass.

| Status | Badge |
| --- | --- |
| `running` | grey spinner |
| `succeeded` | green check |
| `failed` | red cross; the entry's `message` turns red |
| `canceled` | grey dash |

## Example

```tsx
import { Timeline, type TimelineGroup } from '@seekbuddy/dsh-ui/seekbuddy'

const statusLabels = { running: 'Running', succeeded: 'Succeeded', failed: 'Failed', canceled: 'Canceled' }

export function RunHistory({ openRun }: { openRun: (id: string) => void }) {
  const groups: TimelineGroup[] = [
    {
      key: 'today',
      heading: 'Today',
      items: [
        { key: 'r3', status: 'running', title: 'Daily digest', meta: ['Scheduled', '09:00'] },
        {
          key: 'r2',
          status: 'failed',
          title: 'Daily digest',
          meta: ['Manual', '08:12', '14 s'],
          message: 'The mail provider rejected the request.',
          onSelect: () => openRun('r2'),
        },
      ],
    },
    {
      key: 'yesterday',
      heading: 'Yesterday',
      items: [{ key: 'r1', status: 'succeeded', title: 'Daily digest', meta: ['Scheduled', '09:00', '41 s'] }],
    },
  ]
  return <Timeline label="Run history" statusLabels={statusLabels} groups={groups} />
}
```

## Behaviour

- An entry with `onSelect` renders as a `<button>` covering the whole entry; keep its `message` free of other interactive elements.
- Omit `heading` for a single list without a group title.

## Accessibility

The timeline is a `<section>` named by `label`, each group an ordered list. Status badges are drawn shapes; `statusLabels` provides their screen-reader text, so translate it like any other copy.

## API

<!-- api:props Timeline -->
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | **required** | Accessible name of the whole timeline ("Run history"). |
| `statusLabels` | `Readonly<Record<TimelineStatus, string>>` | **required** | Screen-reader text per status; badges themselves are aria-hidden. Copy comes from the caller's locale. |
| `groups` | `readonly TimelineGroup[]` | **required** | Groups in display order; ordering and bucketing are the caller's. |
| `className` | `string` |  | Extra class on the root element, for layout. |
<!-- /api -->

### TimelineGroup

<!-- api:type TimelineGroup -->
| Field | Type | Description |
| --- | --- | --- |
| `key` | `string` | Stable identity of the group (React key). |
| `heading?` | `ReactNode` | Group heading such as a date bucket ("Today"); omit for a headless single group. |
| `items` | `ReadonlyArray<TimelineItem>` | Entries of the group, in display order. |
<!-- /api -->

### TimelineItem

<!-- api:type TimelineItem -->
| Field | Type | Description |
| --- | --- | --- |
| `key` | `string` | Stable identity of the entry (React key). |
| `status` | `TimelineStatus` | Run state shown by the left badge. |
| `title` | `ReactNode` | Title line; may carry a `Pill` tag or other inline nodes. |
| `meta?` | `ReadonlyArray<ReactNode>` | Grey metadata parts (trigger kind, time, duration); the component spaces them. |
| `message?` | `ReactNode` | Optional third line — rendered in the error color for `failed`, grey otherwise. |
| `onSelect?` | `() => void` | When given the whole entry becomes a button (keep `message` free of interactive nodes). |
<!-- /api -->

### TimelineStatus

<!-- api:type TimelineStatus -->
Run state shown by the left badge: grey spinner / green check / red cross / grey dash.

```ts
type TimelineStatus = 'running' | 'succeeded' | 'failed' | 'canceled'
```
<!-- /api -->
