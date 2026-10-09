# Mark

[English](mark.md) | 中文

贴在标题旁、落在文字基线上的行内状态标记，比如目录卡片上表示「官方」的对勾。每个 `kind` 对应一种固定的含义、图形和颜色；它不是通用的图标徽标，所以没有图标或颜色属性。

```tsx
import { Mark } from '@seekbuddy/dsh-ui/seekbuddy'
```

## 何时使用

给标题加上一个在整个产品中含义固定的状态。目前可用的 kind：`official`（由平台发布或认证）。

要用文字表达状态，用 `StatusBadge`。要新增一种 kind，在源码的 `MarkKind` 里加上它和对应的图形、颜色，见 [CONTRIBUTING](../../CONTRIBUTING.zh.md)。

## 示例

```tsx
import { Mark } from '@seekbuddy/dsh-ui/seekbuddy'

export function SkillTitle({ name, official }: { name: string; official: boolean }) {
  return (
    <h3 style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {name}
      {official && <Mark kind="official" label="Official" size={16} />}
    </h3>
  )
}
```

卡片标题旁用 14 或 16，页面标题旁用 20 或 24。

## 可访问性

标记渲染为 `<span role="img" aria-label={label} tabIndex={0}>`，读屏软件会读出 `label`，键盘用户可以聚焦它来查看提示。标记旁边已经写明含义时，传 `tooltip={false}`。

## API

<!-- api:props Mark -->
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `kind` | `"official"` | **required** | Which mark to draw; each kind has a fixed glyph and colour. |
| `label` | `string` | **required** | Screen-reader name and tooltip text, e.g. "Official"; localized by the caller. |
| `size` | `14 \| 16 \| 18 \| 20 \| 24` | `16` | Default 16. |
| `tooltip` | `boolean` | `true` | Wrap in a hover / focus tooltip showing `label`. Default `true`; pass `false` when the meaning is already spelled out next to the mark. |
| `className` | `string` |  | Extra class on the root element, for layout. |
<!-- /api -->

### MarkKind

<!-- api:type MarkKind -->
Closed set of marks the extension layer knows how to draw. Each kind is one fixed meaning with
its own glyph and colour token; adding a kind means adding an entry to `GLYPHS`, a colour class
in `Mark.module.css` and a story — callers only ever pick a kind.

```ts
type MarkKind = 'official'
```
<!-- /api -->

### MarkSize

<!-- api:type MarkSize -->
Pixel edge of the glyph. 14 / 16 next to card titles, 20 / 24 next to detail-page headings.

```ts
type MarkSize = 14 | 16 | 18 | 20 | 24
```
<!-- /api -->
