# StatusBadge

[English](status-badge.md) | 中文

只读状态标：一个状态点加一段文字，共五种色调。它包装了 DSH 的 `Pill` 和 `StateDot`，所以 `progress` 的状态点是 DSH 自带的追逐动画，而不是另一个加载圆环。

```tsx
import { StatusBadge } from '@seekbuddy/dsh-ui/seekbuddy'
```

## 何时使用

在列表行或详情页标题里展示某个对象的状态：运行中、连接中、未连接、失败、已归档。按含义选择色调：

| 色调 | 颜色 | 典型文案 |
| --- | --- | --- |
| `neutral` | 三级文字色（灰） | 已归档、已下架 · 仍可使用 |
| `success` | `--dsw-alias-state-success-primary`（绿） | 运行中、已连接 |
| `progress` | 二级文字色，状态点带动画 | 连接中、挂载中 |
| `warning` | `--dsw-alias-state-warn-primary`（琥珀色） | 未连接、需重新授权 |
| `error` | `--dsw-alias-state-error-primary`（红） | 挂载失败 |

它是静态的：没有点击处理，也没有悬停态。需要可点击或可选中的标签时，用 DSH 层的 `Pill`；不带状态的只读标签用 `Tag`。

## 示例

```tsx
import { StatusBadge, type StatusTone } from '@seekbuddy/dsh-ui/seekbuddy'

const TONES: Record<'running' | 'connecting' | 'failed', { tone: StatusTone; label: string }> = {
  running: { tone: 'success', label: 'Running' },
  connecting: { tone: 'progress', label: 'Connecting' },
  failed: { tone: 'error', label: 'Failed to mount' },
}

export function ConnectorState({ state }: { state: keyof typeof TONES }) {
  const { tone, label } = TONES[state]
  return <StatusBadge tone={tone}>{label}</StatusBadge>
}
```

行内已经有自己的状态指示时，设 `dot={false}`。

## 可访问性

状态点是 `aria-hidden` 的，含义由文字承载，所以务必传入能独立成立的文字。

## API

<!-- api:props StatusBadge -->
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tone` | `"error" \| "neutral" \| "success" \| "progress" \| "warning"` | **required** | Meaning of the badge, which fixes its dot and colour; see `StatusTone`. |
| `children` | `ReactNode` | **required** | Label text; localized by the caller. |
| `dot` | `boolean` | `true` | Drop the leading dot when the row already carries one. Default `true`. |
| `className` | `string` |  | Extra class on the root element, for layout. |
<!-- /api -->

### StatusTone

<!-- api:type StatusTone -->
Closed set of tones. Each one is a fixed meaning with its own state dot and theme token; adding a
tone means adding an entry here and in `DOTS`, a colour class in `StatusBadge.module.css` and a
story — callers only pick a tone, never a colour.

```ts
type StatusTone = 'neutral' | 'success' | 'progress' | 'warning' | 'error'
```
<!-- /api -->
