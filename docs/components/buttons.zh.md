# DangerButton、SubtleButton

[English](buttons.md) | 中文

DSH `Button` 没有的两种变体。两者都包装了它，所以几何尺寸、尺寸档位（`sm` 28px、`md` 36px）、`icon` 插槽和禁用样式都沿用 DSH；它们为各自的颜色补齐了完整的悬停、按下与焦点状态。

```tsx
import { DangerButton, SubtleButton } from '@seekbuddy/dsh-ui/seekbuddy'
```

| 组件 | 外观 | 用途 |
| --- | --- | --- |
| `DangerButton` | 描边胶囊，红色文字与描边 | 破坏性操作（删除、停用）和错误提示，比如点开查看原因的「审核未通过」标签 |
| `SubtleButton` | 幽灵胶囊，次要文字色，悬停时变为主文字色 | 紧挨真正操作的低强调导航：「查看详情」「返回」 |

其他场景都用 DSH 的 `Button`（`primary`、`ghost`、`outline`、`toolbar`）。不要通过 `className` 改 `Button` 的样式来得到这些外观，那样只覆盖了静止状态。

## 示例

```tsx
import { Button } from '@seekbuddy/dsh-ui'
import { IconTrashOutlineRegular } from '@seekbuddy/dsh-ui/icons'
import { DangerButton, SubtleButton } from '@seekbuddy/dsh-ui/seekbuddy'

export function WorkspaceActions({ open, remove, back }: { open: () => void; remove: () => void; back: () => void }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <SubtleButton size="sm" onClick={back}>
        Back
      </SubtleButton>
      <Button variant="primary" size="sm" onClick={open}>
        Open
      </Button>
      <DangerButton size="sm" icon={<IconTrashOutlineRegular />} onClick={remove}>
        Delete
      </DangerButton>
    </div>
  )
}
```

两者都把 ref 转发给 `<button>`，所以可以作为 DSH `Tooltip` 和 `HoverCard` 的锚点。只有图标的按钮需要 `aria-label`。

## API

两者都接受 DSH `Button` 除 `variant` 以外的全部属性，以及 `<button>` 的原生属性。

### DangerButton

<!-- api:props DangerButton -->
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `"sm" \| "md"` |  | 'md' 36px control with 12px corners or 'sm' 28px control with 8px corners. |
| `icon` | `ReactNode` |  | optional leading 16px icon node. |
| `className` | `string` |  | Extra class on the `<button>`, for layout. |
<!-- /api -->

### SubtleButton

<!-- api:props SubtleButton -->
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `"sm" \| "md"` |  | 'md' 36px control with 12px corners or 'sm' 28px control with 8px corners. |
| `icon` | `ReactNode` |  | optional leading 16px icon node. |
| `className` | `string` |  | Extra class on the `<button>`, for layout. |
<!-- /api -->
