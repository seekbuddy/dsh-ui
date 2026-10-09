# MessageProvider, useMessage

English | [中文](message.zh.md)

Stacked transient messages near the top of the viewport, with the API shape of antd's `message` / `useMessage`: five types, a duration, in-place updates by `key`, and a cap on how many show at once. Each row looks like DSH's `Toast`.

```tsx
import { MessageProvider, useMessage } from '@seekbuddy/dsh-ui/seekbuddy'
```

## Setup

Mount one `MessageProvider` near the root of each page (or app) and call `useMessage()` below it. There is deliberately no global `message.success(...)` singleton: separately built bundles on one page each carry their own copy of the module, and a module-level store would split between them.

```tsx
import type { ReactNode } from 'react'
import { MessageProvider } from '@seekbuddy/dsh-ui/seekbuddy'

export function AppShell({ children }: { children: ReactNode }) {
  return <MessageProvider maxCount={3}>{children}</MessageProvider>
}
```

## Example

```tsx
import { Button } from '@seekbuddy/dsh-ui'
import { useMessage } from '@seekbuddy/dsh-ui/seekbuddy'

export function PublishButton({ publish }: { publish: () => Promise<void> }) {
  const message = useMessage()
  return (
    <Button
      variant="primary"
      onClick={async () => {
        // Same key throughout, so each call replaces the previous message in place.
        message.open({ key: 'publish', type: 'loading', content: 'Publishing…' })
        try {
          await publish()
          message.open({ key: 'publish', type: 'success', content: 'Published' })
        } catch {
          message.open({ key: 'publish', type: 'error', content: 'Publishing failed', duration: 5 })
        }
      }}
    >
      Publish
    </Button>
  )
}
```

A `loading` message stays open until it is replaced or closed, so always reuse its `key` for the result, as above, or close it with the function `open()` returns.

## Behaviour

- **Duration:** 3 seconds by default; `0` keeps the message until it is closed. `loading` defaults to `0`.
- **Closing:** every call returns a function that closes that message; `destroy(key)` closes one by key and `destroy()` closes all.
- **`maxCount`:** when more messages are open, the oldest closes.
- **Rendering:** messages render through a portal into `document.body`, only while at least one is showing, so server rendering never touches the DOM. Rows fade out over 1 second; `onClose` fires after the fade.

## API

### MessageProvider

<!-- api:props MessageProvider -->
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `top` | `number` | `120` | Distance from the viewport top in px. Default 120, where the upstream Toast sits. |
| `maxCount` | `number` | `3` | Messages shown at once; the oldest closes when exceeded. Default 3. |
| `children` | `ReactNode` | **required** | The subtree that may call `useMessage()`. |
<!-- /api -->

### useMessage

<!-- api:fn useMessage -->
```ts
function useMessage(): MessageApi
```

The message API of the nearest `MessageProvider`; stable across renders. Throws outside one.
<!-- /api -->

### MessageApi

<!-- api:type MessageApi -->
| Field | Type | Description |
| --- | --- | --- |
| `open` | `(options: MessageOptions) => MessageClose` | Shows a message with full options; returns a function that closes it. |
| `success` | `(content: ReactNode, duration?: number) => MessageClose` | Shows a success message; `duration` in seconds (default 3, `0` keeps it open). |
| `info` | `(content: ReactNode, duration?: number) => MessageClose` | Shows an info message; `duration` in seconds (default 3, `0` keeps it open). |
| `warning` | `(content: ReactNode, duration?: number) => MessageClose` | Shows a warning message; `duration` in seconds (default 3, `0` keeps it open). |
| `error` | `(content: ReactNode, duration?: number) => MessageClose` | Shows an error message; `duration` in seconds (default 3, `0` keeps it open). |
| `loading` | `(content: ReactNode, duration?: number) => MessageClose` | Shows a loading message; it stays until closed unless `duration` is given. |
| `destroy` | `(key?: string) => void` | Without a key closes every message. |
<!-- /api -->

### MessageOptions

<!-- api:type MessageOptions -->
| Field | Type | Description |
| --- | --- | --- |
| `type?` | `MessageType` | Default `info`. |
| `content` | `ReactNode` | Message text or nodes. |
| `duration?` | `number` | Seconds. Default 3; `0` stays until closed. `loading` defaults to 0. |
| `key?` | `string` | Re-opening with the same key updates that message in place (e.g. loading → success). |
| `icon?` | `ReactNode` | Replaces the type's default glyph. |
| `onClose?` | `() => void` | Called after the message has faded out, however it closed: timeout, `close()`, `destroy`, or eviction by `maxCount`. |
<!-- /api -->

### MessageType

<!-- api:type MessageType -->
```ts
type MessageType = 'success' | 'info' | 'warning' | 'error' | 'loading'
```
<!-- /api -->

### MessageClose

<!-- api:type MessageClose -->
Closes the message it was returned for.

```ts
type MessageClose = () => void
```
<!-- /api -->
