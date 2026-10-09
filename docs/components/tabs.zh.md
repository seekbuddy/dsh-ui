# Tabs

[English](tabs.md) | 中文

下划线式标签页，遵循 WAI-ARIA tabs 模式，焦点移到哪个标签就激活哪个。像 antd 的 `items` 一样由数据驱动，并且完全受控：`activeKey` 由你持有。

```tsx
import { Tabs } from '@seekbuddy/dsh-ui/seekbuddy'
```

## 何时使用

- 在同一页面或区域的几个视图之间切换。
- 工具栏和卡片内用 `size="sm"`（默认）；页面的主视图切换用 `size="lg" bold`。

设计需要分段式外观时，可以改用 DSH 的 `SegmentedTabs`（等宽、带填充的分段）或 `SegmentedControl`（卡片内的模式切换）。

## 示例：由 Tabs 渲染面板

条目带有 `children` 时，Tabs 会自己渲染当前面板，并接好 `aria-controls` / `aria-labelledby`。

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

## 示例：由你渲染面板

面板是路由内容时，不传 `children`，而是给面板一个 id。每个标签随后会带上 `aria-controls={panelId}` 和 id `<panelId>-tab-<key>`，面板用它作为 `aria-labelledby`。

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

## 键盘

整个标签列表只有一个 Tab 停靠点（roving `tabindex`）。← / ↑ 与 → / ↓ 移到上一个 / 下一个标签并选中它，到头后循环；Home / End 跳到第一个 / 最后一个。禁用的标签会被跳过。

## API

`T` 是你的各个标签 key 组成的联合类型，`onChange` 收到的值带有这个类型。

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
