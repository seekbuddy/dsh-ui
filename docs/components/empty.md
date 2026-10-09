# Empty

English | [中文](empty.zh.md)

A placeholder block for the three content states of a page or list region — loading, empty and error — with an icon, a title, an optional description and an action row. One `status` prop picks the state.

```tsx
import { Empty } from '@seekbuddy/dsh-ui/seekbuddy'
// In a Next.js Server Component (without onRetry):
import { Empty as ServerEmpty } from '@seekbuddy/dsh-ui/seekbuddy/empty'
```

## When to use

- A list or page region that is loading, has no data yet, or failed to load.
- Use a small inline `Spinner` instead when only a button or a single value is loading, and a `MessageProvider` message for transient feedback after an action.

Which state wins (for example "loading" while a previous error is still known) is your decision; the component shows exactly the `status` you pass.

## Example

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

## Behaviour

- **Default icons:** a spinner for `loading`, a search glyph for `empty`, a warning glyph for `error`. Pass `icon` to replace it, or `icon={null}` for no icon.
- **Retry button:** rendered only for `status="error"` when both `retryLabel` and `onRetry` are given, after any `action` content.
- **Layout stability:** the block reserves `minHeight` (default 240px), so a list that refreshes into a state does not jump.
- **Frame:** a dashed frame by default; set `bordered={false}` inside an already framed area or for full-page states.

## Accessibility

The block announces itself per state: `role="status"` with `aria-live="polite"` while loading, `role="alert"` for errors, and no live region for empty. The title is the main text, so make it a complete phrase.

## API

Also accepts native `<div>` attributes except `title`.

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
