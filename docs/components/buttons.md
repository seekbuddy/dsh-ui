# DangerButton, SubtleButton

English | [中文](buttons.zh.md)

Two variants that the DSH `Button` does not have. Both wrap it, so geometry, sizes (`sm` 28px, `md` 36px), the `icon` slot and the disabled style are DSH's; they add a complete set of hover, active and focus states for their colour.

```tsx
import { DangerButton, SubtleButton } from '@seekbuddy/dsh-ui/seekbuddy'
```

| Component | Looks like | Use for |
| --- | --- | --- |
| `DangerButton` | Outline capsule, red label and stroke | Destructive actions (delete, disable) and error affordances, such as a "Review failed" chip that opens the reason |
| `SubtleButton` | Ghost capsule, secondary label that turns primary on hover | Low-emphasis navigation next to real actions: "View details", "Back" |

For everything else use the DSH `Button` (`primary`, `ghost`, `outline`, `toolbar`). Do not restyle `Button` through `className` to get these looks; that covers the resting state only.

## Example

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

Both forward their ref to the `<button>`, so they work as anchors for DSH's `Tooltip` and `HoverCard`. An icon-only button needs an `aria-label`.

## API

Both take every prop of the DSH `Button` except `variant`, plus native `<button>` attributes.

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
