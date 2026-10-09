# MessageProvider、useMessage

[English](message.md) | 中文

堆叠在视口顶部附近的短时消息，API 形态与 antd 的 `message` / `useMessage` 一致：五种类型、显示时长、按 `key` 原地更新，以及同时显示条数的上限。每一条的外观与 DSH 的 `Toast` 相同。

```tsx
import { MessageProvider, useMessage } from '@seekbuddy/dsh-ui/seekbuddy'
```

## 接入

在每个页面（或整个应用）的根部附近挂载一个 `MessageProvider`，在它下面调用 `useMessage()`。这里刻意不提供全局的 `message.success(...)` 单例：同一页面上分别构建的各个 bundle 会各自带一份这个模块，模块级的存储会在它们之间分裂。

```tsx
import type { ReactNode } from 'react'
import { MessageProvider } from '@seekbuddy/dsh-ui/seekbuddy'

export function AppShell({ children }: { children: ReactNode }) {
  return <MessageProvider maxCount={3}>{children}</MessageProvider>
}
```

## 示例

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

`loading` 消息在被替换或关闭之前会一直显示，所以要像上面那样用同一个 `key` 显示结果，或者调用 `open()` 返回的函数关闭它。

## 行为

- **显示时长：**默认 3 秒；`0` 表示一直显示到被关闭。`loading` 默认为 `0`。
- **关闭：**每次调用都返回一个关闭该条消息的函数；`destroy(key)` 按 key 关闭一条，`destroy()` 关闭全部。
- **`maxCount`：**打开的消息超过上限时，最早的一条会关闭。
- **渲染：**消息通过 Portal 渲染到 `document.body`，并且只在至少有一条显示时才渲染，因此服务端渲染不会访问 DOM。每条消息用 1 秒淡出，`onClose` 在淡出结束后触发。

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
