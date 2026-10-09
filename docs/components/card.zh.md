# Card

[English](card.md) | 中文

卡片表面：底色、发丝描边、`--dsw-radius-lg` 圆角、面板投影和内边距。内容完全由你决定；组件不提供页头、页脚或标题插槽，因为真实产品里的卡片很少共用同一套内部结构。

```tsx
import { Card } from '@seekbuddy/dsh-ui/seekbuddy'
// In a Next.js Server Component:
import { Card as ServerCard } from '@seekbuddy/dsh-ui/seekbuddy/card'
```

## 何时使用

- 目录条目、任务卡与模板卡、设置分组：页面上任何「有边界的一块」。
- 在列表里用 `as="li"` 把卡片本身渲染成列表项，不必再包一层。

加载中、空、出错的占位用 `Empty`；对话框用 DSH 层的 `Modal`。

## 示例

```tsx
import { Button } from '@seekbuddy/dsh-ui'
import { Card } from '@seekbuddy/dsh-ui/seekbuddy'

export function PluginList({ plugins }: { plugins: { id: string; name: string; summary: string }[] }) {
  return (
    <ul style={{ display: 'grid', gap: 12, padding: 0 }}>
      {plugins.map((plugin) => (
        <Card key={plugin.id} as="li" padding="sm">
          <h3>{plugin.name}</h3>
          <p>{plugin.summary}</p>
          <Button size="sm">Install</Button>
        </Card>
      ))}
    </ul>
  )
}
```

## 可点击的卡片

`interactive` 只加上悬停底色和手形光标。点击和键盘操作怎么接，由你决定：

- 在卡片里放一个真正的 `<button>` 或 `<a>` 承载操作；或者
- 让整张卡片成为控件：加上 `onClick`、`role="button"`、`tabIndex={0}` 和处理 Enter / Space 的按键事件。可聚焦的卡片会显示主题的焦点环。

## 状态

卡片只是表面。加载中、空、出错是其**内容**的状态：在卡片里渲染 `Spinner`、一句简短说明，或一行错误信息加重试按钮。要禁用可点击的卡片，去掉 `interactive` 和点击处理函数即可。

## API

同时接受所渲染元素的全部原生属性（`id`、`onClick`、`aria-*` 等）。

<!-- api:props Card -->
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `padding` | `"none" \| "sm" \| "md"` | `md` | Inner padding; see `CardPadding`. Default `md` (16px). |
| `interactive` | `boolean` | `false` | Hover feedback for cards the caller makes clickable: the translucent `--dsw-alias-interactive-bg-hover` fill upstream's plugin cards use, plus the pointer cursor. Styling only — clicking is wired by the caller (`onClick` here, or a `<button>` inside). |
| `as` | `"div" \| "section" \| "article" \| "li"` | `div` | Element to render; see `CardElement`. Default `div`. |
<!-- /api -->

### CardPadding

<!-- api:type CardPadding -->
Inner padding: `none` = 0 (self-laid-out content such as a cover image), `sm` = 14px (dense catalog cards), `md` = 16px (default).

```ts
type CardPadding = 'none' | 'sm' | 'md'
```
<!-- /api -->

### CardElement

<!-- api:type CardElement -->
Rendered element; pick `li` inside a list so the card needs no wrapper.

```ts
type CardElement = 'div' | 'section' | 'article' | 'li'
```
<!-- /api -->
