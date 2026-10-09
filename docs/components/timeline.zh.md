# Timeline

[English](timeline.md) | 中文

纵向的运行记录：按组排列（比如「今天」「昨天」），每组是一个有序的条目列表，每个条目带状态徽标、标题、灰色的元信息行和可选的消息。同一组内的徽标之间有一条竖线相连。

```tsx
import { Timeline } from '@seekbuddy/dsh-ui/seekbuddy'
// In a Next.js Server Component (entries without onSelect):
import { Timeline as ServerTimeline } from '@seekbuddy/dsh-ui/seekbuddy/timeline'
```

## 何时使用

按时间排列、每条都有状态的运行或事件列表：任务运行记录、同步历史、部署历史。分组、排序、文案和时间格式都由你决定，组件只负责排版你传入的内容。

| 状态 | 徽标 |
| --- | --- |
| `running` | 灰色加载圆环 |
| `succeeded` | 绿色对勾 |
| `failed` | 红色叉号；该条目的 `message` 变为红色 |
| `canceled` | 灰色横线 |

## 示例

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

## 行为

- 带 `onSelect` 的条目渲染为覆盖整个条目的 `<button>`，它的 `message` 里不要再放其他可交互元素。
- 不传 `heading` 时，就是一个没有分组标题的单一列表。

## 可访问性

时间线是一个以 `label` 命名的 `<section>`，每组是一个有序列表。状态徽标是绘制的图形，读屏文字由 `statusLabels` 提供，所以要像其他文案一样翻译它。

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
