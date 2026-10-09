# Spinner

[English](spinner.md) | 中文

加载圆环：底轨是当前颜色的 35%，弧线是当前颜色。在 `prefers-reduced-motion` 下停止旋转，保持静态的双色圆环。

```tsx
import { Spinner } from '@seekbuddy/dsh-ui/seekbuddy'
// In a Next.js Server Component:
import { Spinner as ServerSpinner } from '@seekbuddy/dsh-ui/seekbuddy/spinner'
```

## 何时使用

- 按钮里和行内文字旁用 `size="sm"`，它沿用文字颜色（`tone="inherit"`）。
- 页面级等待用 `size="md"` 加 `tone="page"`。
- 整个列表区域在加载时，`Empty status="loading"` 已经带有圆环，并会保留占位高度。

## 示例

```tsx
import { Button } from '@seekbuddy/dsh-ui'
import { Spinner } from '@seekbuddy/dsh-ui/seekbuddy'

export function SaveButton({ saving, onSave }: { saving: boolean; onSave: () => void }) {
  return (
    <Button variant="primary" disabled={saving} onClick={onSave} icon={saving ? <Spinner /> : undefined}>
      {saving ? 'Saving…' : 'Save'}
    </Button>
  )
}

export function PageLoading() {
  return <Spinner size="md" tone="page" label="Loading workspace" />
}
```

## 可访问性

不传 `label` 时圆环只是装饰（`aria-hidden`），需要由周围的文字说明正在加载什么，就像上面的按钮那样。传了 `label` 后，它会成为 `role="status"` 实时区域并播报这段文字。

## API

<!-- api:props Spinner -->
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `"sm" \| "md"` | `sm` | Ring size; see `SpinnerSize`. Default `sm`. |
| `tone` | `"inherit" \| "page"` | `inherit` | Ring colour source; see `SpinnerTone`. Default `inherit`. |
| `label` | `string` |  | Screen-reader text; when present the spinner becomes a live status region instead of aria-hidden. |
| `className` | `string` |  | Extra class on the root element, for layout. |
<!-- /api -->

### SpinnerSize

<!-- api:type SpinnerSize -->
`sm` = 0.85rem / 2px ring for buttons and inline text; `md` = 2rem / 3px for page-level waits.

```ts
type SpinnerSize = 'sm' | 'md'
```
<!-- /api -->

### SpinnerTone

<!-- api:type SpinnerTone -->
`inherit` rides `currentColor` (button foreground); `page` pins `--dsw-alias-label-primary`.

```ts
type SpinnerTone = 'inherit' | 'page'
```
<!-- /api -->
