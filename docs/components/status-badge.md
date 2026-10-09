# StatusBadge

English | [中文](status-badge.zh.md)

A read-only status chip: a state dot plus a label, in one of five tones. It wraps the DSH `Pill` and `StateDot`, so the `progress` dot is DSH's animated chase rather than a separate spinner.

```tsx
import { StatusBadge } from '@seekbuddy/dsh-ui/seekbuddy'
```

## When to use

Showing the state of something in a list row or a detail header: running, connecting, not connected, failed, archived. Pick the tone by meaning:

| Tone | Colour | Typical labels |
| --- | --- | --- |
| `neutral` | tertiary label (grey) | Archived, Delisted · still usable |
| `success` | `--dsw-alias-state-success-primary` (green) | Running, Connected |
| `progress` | secondary label, animated dot | Connecting, Mounting |
| `warning` | `--dsw-alias-state-warn-primary` (amber) | Not connected, Needs re-authorization |
| `error` | `--dsw-alias-state-error-primary` (red) | Failed to mount |

It is static: no click handler and no hover state. For a clickable or selectable chip use `Pill` from the DSH layer; for a plain read-only label without a state use `Tag`.

## Example

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

Set `dot={false}` when the row already shows its own state indicator.

## Accessibility

The dot is `aria-hidden`; the label carries the meaning, so always pass text that stands on its own.

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
