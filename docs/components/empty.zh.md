# Empty

[English](empty.md) | 中文

页面或列表区域三种内容状态（加载中、空、出错）的占位块，包含图标、标题、可选的说明和操作区。由 `status` 一个属性选择状态。

```tsx
import { Empty } from '@seekbuddy/dsh-ui/seekbuddy'
// In a Next.js Server Component (without onRetry):
import { Empty as ServerEmpty } from '@seekbuddy/dsh-ui/seekbuddy/empty'
```

## 何时使用

- 列表或页面区域正在加载、还没有数据，或者加载失败。
- 只有一个按钮或单个值在加载时，改用行内的小号 `Spinner`；操作完成后的短时反馈用 `MessageProvider` 的消息。

几种状态同时成立时以哪个为准（比如之前的错误还在、又开始重新加载），由你决定；组件只显示你传入的那个 `status`。

## 示例

```tsx
import { Button } from '@seekbuddy/dsh-ui'
import { Empty } from '@seekbuddy/dsh-ui/seekbuddy'

type Load<T> = { state: 'loading' } | { state: 'error' } | { state: 'done'; items: T[] }

export function ProjectsRegion({ load, reload, create }: { load: Load<string>; reload: () => void; create: () => void }) {
  if (load.state === 'loading') return <Empty status="loading" title="Loading projects…" />
  if (load.state === 'error') {
    return (
      <Empty
        status="error"
        title="Projects could not be loaded"
        description="Check your connection and try again."
        retryLabel="Retry"
        onRetry={reload}
      />
    )
  }
  if (load.items.length === 0) {
    return (
      <Empty
        status="empty"
        title="No projects yet"
        description="Projects you create appear here."
        action={<Button variant="primary" onClick={create}>New project</Button>}
      />
    )
  }
  return <ul>{load.items.map((name) => <li key={name}>{name}</li>)}</ul>
}
```

## 行为

- **默认图标：**`loading` 是加载圆环，`empty` 是搜索图形，`error` 是警告图形。传 `icon` 可替换，`icon={null}` 则不显示图标。
- **重试按钮：**只有在 `status="error"` 且同时传了 `retryLabel` 和 `onRetry` 时才渲染，位于 `action` 内容之后。
- **布局稳定：**占位块会保留 `minHeight`（默认 240px）的高度，列表刷新成某个状态时不会跳动。
- **边框：**默认带虚线边框；放在已有边框的区域里或用于整页状态时，设 `bordered={false}`。

## 可访问性

占位块按状态播报：加载中是 `role="status"` 加 `aria-live="polite"`，出错是 `role="alert"`，空状态不设实时区域。标题是主要文字，请写成完整的一句话。

## API

同时接受除 `title` 以外的 `<div>` 原生属性。

<!-- api:props Empty -->
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `status` | `"loading" \| "empty" \| "error"` | **required** | Which state to show. Precedence between loading / error / empty is the caller's decision. |
| `title` | `string` | **required** | Main line; localized by the caller. |
| `description` | `ReactNode` |  | Secondary line under the title. |
| `icon` | `ReactNode` |  | Leading visual. `undefined` picks the default for the status (spinner / search / warning); `null` renders no icon at all. |
| `action` | `ReactNode` |  | Action row (e.g. a "create" button for the empty state). Rendered before the retry button. |
| `retryLabel` | `string` |  | Label of the retry button; rendered only for `status="error"` together with `onRetry`. |
| `onRetry` | `() => void` |  | Retry handler; rendered only for `status="error"` together with `retryLabel`. |
| `minHeight` | `string \| number` | `240` | Reserved height so a list that refreshes into a state does not jump. Default 240. |
| `bordered` | `boolean` | `true` | Dashed frame; turn off for full-screen or already-framed placements. Default `true`. |
<!-- /api -->

### EmptyStatus

<!-- api:type EmptyStatus -->
The three content states a data-driven view has to handle.

```ts
type EmptyStatus = 'loading' | 'empty' | 'error'
```
<!-- /api -->
