# Switch

[English](switch.md) | 中文

开关（`role="switch"`），属性与 antd 的 `Switch` 一致：支持受控与非受控、轨道内可选文字、三种尺寸。配色与 DSH 自带的 `Switch` 相同。

```tsx
import { Switch } from '@seekbuddy/dsh-ui/seekbuddy'
```

## 选哪个 Switch

DSH 层也从 `@seekbuddy/dsh-ui` 导出了一个 `Switch`：极简、始终受控的控件（`checked`、`onChange(next)`、必填的 `label`）。这里的 Switch 保留 antd 的 API（`defaultChecked`、`checkedChildren`、`size`、`onChange(checked, event)`）。两者不能互换，同一个代码库里选定一个。

与 antd 的差异：默认 `size` 是 `medium`（36×20）而不是 `large`，并且没有 `loading` 属性。

## 示例

```tsx
import { useState } from 'react'
import { Switch } from '@seekbuddy/dsh-ui/seekbuddy'

export function TaskToggle({ enabled, setEnabled }: { enabled: boolean; setEnabled: (next: boolean) => Promise<void> }) {
  const [saving, setSaving] = useState(false)
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span id="task-toggle-label">Run every morning</span>
      <Switch
        aria-labelledby="task-toggle-label"
        checked={enabled}
        disabled={saving}
        onChange={async (next) => {
          setSaving(true)
          await setEnabled(next)
          setSaving(false)
        }}
      />
    </label>
  )
}
```

非受控、轨道内带文字：

```tsx
import { Switch } from '@seekbuddy/dsh-ui/seekbuddy'

export const Notifications = () => <Switch aria-label="Notifications" defaultChecked checkedChildren="On" unCheckedChildren="Off" />
```

## 取消一次切换

`onClick` 在值翻转之前触发，参数是即将变成的值。在这里调用 `event.preventDefault()` 可以保留当前值，此时 `onChange` 不会触发。

```tsx
import { Switch } from '@seekbuddy/dsh-ui/seekbuddy'

export function DangerousToggle({ on, setOn }: { on: boolean; setOn: (next: boolean) => void }) {
  return (
    <Switch
      aria-label="Public access"
      checked={on}
      onClick={(next, event) => {
        if (next && !window.confirm('Make this workspace public?')) event.preventDefault()
      }}
      onChange={setOn}
    />
  )
}
```

## 可访问性

没有 `checkedChildren` / `unCheckedChildren` 时，开关是纯图形控件：用 `aria-label` 给它命名，或用 `aria-labelledby` 指向行内可见的标题。键盘：Tab 聚焦，Space 或 Enter 切换（原生 `<button>`）。

## API

同时接受 `<button>` 的原生属性，但 `type`、`role`、`aria-checked`、`children` 以及上面的点击 / 变更处理函数除外。

<!-- api:props Switch -->
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `checked` | `boolean` |  | Controlled state; when given, the caller owns it and `defaultChecked` is ignored. |
| `defaultChecked` | `boolean` |  | Initial state for the uncontrolled form. |
| `defaultValue` | `boolean` |  | Alias of `defaultChecked` (antd parity). |
| `checkedChildren` | `ReactNode` |  | Content shown inside the track while on (short text or a 12px icon). |
| `unCheckedChildren` | `ReactNode` |  | Content shown inside the track while off. |
| `disabled` | `boolean` |  | Blocks clicks and dims the switch; `onChange` does not fire. |
| `size` | `"large" \| "medium" \| "small"` | `medium` | Track size; see `SwitchSize`. Default `medium`. |
| `onChange` | `(checked: boolean, event: MouseEvent<HTMLButtonElement, MouseEvent>) => void` |  | Fires when the value flips (after `onClick`); not fired while `disabled`. |
| `onClick` | `(checked: boolean, event: MouseEvent<HTMLButtonElement, MouseEvent>) => void` |  | Fires on every click with the value the switch is about to take. |
<!-- /api -->

### SwitchSize

<!-- api:type SwitchSize -->
`large` = 44×22 (antd default), `medium` = 36×20 (default), `small` = 28×16 for dense rows and table cells.

```ts
type SwitchSize = 'large' | 'medium' | 'small'
```
<!-- /api -->
