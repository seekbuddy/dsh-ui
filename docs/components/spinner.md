# Spinner

English | [中文](spinner.zh.md)

The loading ring: a track at 35% of the current colour with a full-colour arc. Under `prefers-reduced-motion` it stops spinning and stays a static two-tone ring.

```tsx
import { Spinner } from '@seekbuddy/dsh-ui/seekbuddy'
// In a Next.js Server Component:
import { Spinner as ServerSpinner } from '@seekbuddy/dsh-ui/seekbuddy/spinner'
```

## When to use

- `size="sm"` inside buttons and next to inline text; it takes the text colour (`tone="inherit"`).
- `size="md"` with `tone="page"` for a page-level wait.
- For a whole list region that is loading, `Empty status="loading"` already includes a spinner and reserves the space.

## Example

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

## Accessibility

Without `label` the ring is decorative (`aria-hidden`): the surrounding text has to say what is loading, as in the button above. With `label` it becomes a `role="status"` live region that announces the text.

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
