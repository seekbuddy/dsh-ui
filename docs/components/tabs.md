# Tabs

English | [中文](tabs.zh.md)

An underline tab list following the WAI-ARIA tabs pattern with automatic activation. Data-driven like antd's `items`, and fully controlled: you own `activeKey`.

```tsx
import { Tabs } from '@seekbuddy/dsh-ui/seekbuddy'
```

## When to use

- Switching between views of the same page or section.
- `size="sm"` (default) in toolbars and inside cards; `size="lg" bold` for a page's main view switch.

DSH's `SegmentedTabs` (equal-width, filled segments) and `SegmentedControl` (mode switch inside a card) are the alternatives when the design calls for a segmented look.

## Example: panels rendered by Tabs

When items carry `children`, Tabs renders the active panel itself and wires `aria-controls` / `aria-labelledby`.

```tsx
import { useState } from 'react'
import { Tabs } from '@seekbuddy/dsh-ui/seekbuddy'

export function SkillTabs() {
  const [active, setActive] = useState<'installed' | 'catalog'>('installed')
  return (
    <Tabs
      label="Skill views"
      activeKey={active}
      onChange={setActive}
      items={[
        { key: 'installed', label: 'Installed', count: 3, children: <p>Installed skills…</p> },
        { key: 'catalog', label: 'Catalog', children: <p>Catalog…</p> },
      ]}
    />
  )
}
```

## Example: panel rendered by you

For routed content, leave out `children` and give the panel an id. Each tab then gets `aria-controls={panelId}` and the id `<panelId>-tab-<key>`, which the panel uses for `aria-labelledby`.

```tsx
import type { ReactNode } from 'react'
import { Tabs } from '@seekbuddy/dsh-ui/seekbuddy'

export function RoutedTabs({ tab, go, children }: { tab: 'overview' | 'runs'; go: (tab: 'overview' | 'runs') => void; children: ReactNode }) {
  return (
    <>
      <Tabs
        label="Task views"
        activeKey={tab}
        onChange={go}
        panelId="task-panel"
        items={[
          { key: 'overview', label: 'Overview' },
          { key: 'runs', label: 'Runs' },
        ]}
      />
      <section id="task-panel" role="tabpanel" aria-labelledby={`task-panel-tab-${tab}`}>
        {children}
      </section>
    </>
  )
}
```

## Keyboard

One tab stop for the whole list (roving `tabindex`). ← / ↑ and → / ↓ move to the previous / next tab and select it, wrapping at the ends; Home / End jump to the first / last. Disabled tabs are skipped.

## API

`T` is the union of your tab keys; `onChange` receives it typed.

<!-- api:props Tabs -->
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | **required** | Accessible name of the tab list ("Skill views"). |
| `items` | `readonly TabItem<T>[]` | **required** | Tabs in display order. |
| `activeKey` | `string` | **required** | Controlled selection (antd `activeKey`); the caller owns it (URL state, useState, …). |
| `onChange` | `(key: T) => void` | **required** | Called with the key of the tab the user selects. |
| `panelId` | `string` |  | DOM id of a caller-rendered panel showing the selected tab's content. Every tab then declares `aria-controls={panelId}` and gets the id `<panelId>-tab-<key>` for the panel's `aria-labelledby`. Ignored when items carry `children` (ids are generated and wired automatically). |
| `size` | `"sm" \| "md" \| "lg"` | `sm` | Type scale of the tab labels: `sm` = `--dsw-font-xxs-12` (default; toolbars and in-card switches), `md` = `--dsw-font-s-14`, `lg` = `--dsw-font-base-16` (page-level view switches). |
| `bold` | `boolean` | `false` | Bold labels: every tab takes the `-strong-` variant of its size's font token (weight 600 in the theme). |
| `className` | `string` |  | Extra class on the root element, for layout. |
<!-- /api -->

### TabItem

<!-- api:type TabItem -->
| Field | Type | Description |
| --- | --- | --- |
| `key` | `T` | Stable identity of the tab; also the value handed to `onChange` (antd `items[].key`). |
| `label` | `ReactNode` | Visible tab text. |
| `count?` | `number` | Optional count badge; omitted when undefined. |
| `disabled?` | `boolean` | Skipped by the arrow keys and not selectable. |
| `children?` | `ReactNode` | Optional panel content. When any item carries `children`, the component renders the active item's panel itself (`role="tabpanel"`, wired with `aria-controls` / `aria-labelledby`). Leave it out when the panel is routed content the caller renders (for example a router outlet). |
<!-- /api -->
