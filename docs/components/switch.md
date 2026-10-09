# Switch

English | [中文](switch.zh.md)

An on / off toggle (`role="switch"`) with antd's `Switch` props: controlled or uncontrolled, optional text inside the track, three sizes. Colours match DSH's own `Switch`.

```tsx
import { Switch } from '@seekbuddy/dsh-ui/seekbuddy'
```

## Which Switch

The DSH layer also exports a `Switch` from `@seekbuddy/dsh-ui`: a minimal, always-controlled control (`checked`, `onChange(next)`, required `label`). This one keeps antd's API (`defaultChecked`, `checkedChildren`, `size`, `onChange(checked, event)`). The two are not interchangeable; pick one per codebase.

Differences from antd: the default `size` is `medium` (36×20) rather than `large`, and there is no `loading` prop.

## Example

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

Uncontrolled, with text in the track:

```tsx
import { Switch } from '@seekbuddy/dsh-ui/seekbuddy'

export const Notifications = () => <Switch aria-label="Notifications" defaultChecked checkedChildren="On" unCheckedChildren="Off" />
```

## Cancelling a change

`onClick` fires before the value flips, with the value it is about to take. Call `event.preventDefault()` there to keep the current value; `onChange` then does not fire.

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

## Accessibility

Without `checkedChildren` / `unCheckedChildren` the switch is purely graphical: give it a name with `aria-label`, or `aria-labelledby` pointing at the visible row label. Keyboard: Tab to focus, Space or Enter to toggle (native `<button>`).

## API

Also accepts native `<button>` attributes except `type`, `role`, `aria-checked`, `children` and the click / change handlers above.

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
