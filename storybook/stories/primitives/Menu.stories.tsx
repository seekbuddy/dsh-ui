import { useState } from 'react'
import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Menu } from '@seekbuddy/dsh-ui'
import type { MenuEntry } from '@seekbuddy/dsh-ui'
import {
  IconChevronDownOutlineRegular,
  IconCopyOutlineRegular,
  IconDownloadOutlineRegular,
  IconEditOutlineRegular,
  IconSettingsOutlineRegular,
  IconShareOutlineRegular,
  IconTrashOutlineRegular,
} from '@seekbuddy/dsh-ui/icons'

type MenuProps = ComponentProps<typeof Menu>

/** 基本菜单：三行带图标的普通条目。 */
const BASIC_ITEMS: readonly MenuEntry[] = [
  { id: 'rename', label: '重命名', icon: <IconEditOutlineRegular /> },
  { id: 'copy', label: '复制链接', icon: <IconCopyOutlineRegular /> },
  { id: 'share', label: '分享', icon: <IconShareOutlineRegular /> },
]

/** 三种条目：`label` 标题行、普通 item、`separator` 分隔线。 */
const ENTRY_KINDS: readonly MenuEntry[] = [
  { type: 'label', id: 'g-edit', text: '编辑' },
  { id: 'rename', label: '重命名' },
  { id: 'copy', label: '复制链接' },
  { type: 'separator', id: 'sep-1' },
  { type: 'label', id: 'g-more', text: '更多' },
  { id: 'settings', label: '设置', icon: <IconSettingsOutlineRegular /> },
]

/** 子菜单：`submenu` 在 hover / 焦点时向右展开。 */
const SUBMENU_ITEMS: readonly MenuEntry[] = [
  { id: 'rename', label: '重命名', icon: <IconEditOutlineRegular /> },
  {
    id: 'export',
    label: '导出',
    icon: <IconDownloadOutlineRegular />,
    submenu: [
      { id: 'export-json', label: 'JSON' },
      { id: 'export-markdown', label: 'Markdown' },
      { id: 'export-pdf', label: 'PDF（暂不可用）', disabled: true },
    ],
  },
]

/** danger / disabled 条目。 */
const DANGER_ITEMS: readonly MenuEntry[] = [
  { id: 'rename', label: '重命名', icon: <IconEditOutlineRegular /> },
  { id: 'archive', label: '归档（无权限）', disabled: true },
  { type: 'separator', id: 'sep-danger' },
  { id: 'delete', label: '删除', icon: <IconTrashOutlineRegular />, danger: true },
]

/** 长列表：配合 `footer` 看"上面滚、底部钉住"。 */
const LONG_ITEMS: readonly MenuEntry[] = Array.from({ length: 24 }, (_, i) => ({
  id: `session-${String(i + 1)}`,
  label: `会话 ${String(i + 1)}`,
}))

const FOOTER_ITEMS: readonly MenuEntry[] = [
  { id: 'settings', label: '管理会话…', icon: <IconSettingsOutlineRegular /> },
]

/** 组合样张：demo 里的完整"操作菜单"。 */
const FULL_ITEMS: readonly MenuEntry[] = [
  { type: 'label', id: 'actions', text: '常用操作' },
  { id: 'rename', label: '重命名', icon: <IconEditOutlineRegular /> },
  { id: 'copy', label: '复制链接', icon: <IconCopyOutlineRegular /> },
  { id: 'disabled', label: '不可用操作', disabled: true },
  {
    id: 'export',
    label: '导出',
    submenu: [
      { id: 'export-json', label: 'JSON' },
      { id: 'export-markdown', label: 'Markdown' },
    ],
  },
  { type: 'separator', id: 'sep-danger' },
  { type: 'label', id: 'g-danger', text: '危险区' },
  { id: 'delete', label: '删除', icon: <IconTrashOutlineRegular />, danger: true },
]

const LANG_ITEMS: readonly MenuEntry[] = [
  { type: 'label', id: 'g-lang', text: '界面语言' },
  { id: 'zh', label: '简体中文' },
  { id: 'en', label: 'English' },
  { id: 'ja', label: '日本語' },
]

const OPTION_ITEMS: readonly MenuEntry[] = [
  { type: 'label', id: 'g-show', text: '显示' },
  { id: 'show-time', label: '时间戳' },
  { id: 'show-tokens', label: 'Token 用量' },
  { type: 'separator', id: 'sep-opt' },
  { type: 'label', id: 'g-sort', text: '排序' },
  { id: 'sort-recent', label: '最近更新' },
  { id: 'sort-name', label: '名称' },
]

/**
 * 受控外壳：open / 最近选中都是本地 state；anchor 用一个会切换 open 的 Button 替换掉 args 里的占位。
 * onSelect 后关闭菜单，这是消费者的标准写法。
 */
function MenuDemo({ open: initialOpen, anchor: _anchor, onSelect: _onSelect, onClose: _onClose, ...rest }: MenuProps) {
  const [open, setOpen] = useState(initialOpen)
  const [last, setLast] = useState<string | null>(null)
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
      <Menu
        {...rest}
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(id) => {
          setLast(id)
          setOpen(false)
        }}
        anchor={
          <Button variant="outline" icon={<IconChevronDownOutlineRegular />} onClick={() => setOpen((o) => !o)}>
            操作菜单
          </Button>
        }
      />
      <span>最近选中：{last ?? '（无）'}</span>
    </div>
  )
}

/** 单选：`selectedId` 由调用方持有，选中行尾部出现对勾。 */
function SingleSelectMenu(props: MenuProps) {
  const [open, setOpen] = useState(false)
  const [lang, setLang] = useState('zh')
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
      <Menu
        {...props}
        items={LANG_ITEMS}
        open={open}
        selectedId={lang}
        onClose={() => setOpen(false)}
        onSelect={(id) => {
          setLang(id)
          setOpen(false)
        }}
        anchor={
          <Button variant="outline" icon={<IconChevronDownOutlineRegular />} onClick={() => setOpen((o) => !o)}>
            语言
          </Button>
        }
      />
      <span>selectedId = {lang}</span>
    </div>
  )
}

/** 多组独立选项：`selectedIds` 数组，点一行切换该行；菜单不自动关闭，方便连续勾选。 */
function MultiSelectMenu(props: MenuProps) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<readonly string[]>(['show-time', 'sort-recent'])
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
      <Menu
        {...props}
        items={OPTION_ITEMS}
        open={open}
        selectedIds={selected}
        onClose={() => setOpen(false)}
        onSelect={(id) => setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))}
        anchor={
          <Button variant="outline" icon={<IconChevronDownOutlineRegular />} onClick={() => setOpen((o) => !o)}>
            视图选项
          </Button>
        }
      />
      <span>selectedIds = [{selected.join(', ')}]</span>
    </div>
  )
}

/** portal 对照：同一个 overflow:hidden 容器里，就地渲染的列表被裁掉，portal 的列表完整浮在外面。 */
function PortalContrast(props: MenuProps) {
  const [openInPlace, setOpenInPlace] = useState(false)
  const [openPortal, setOpenPortal] = useState(false)
  return (
    <div
      style={{
        display: 'flex',
        gap: 24,
        height: 56,
        padding: 8,
        overflow: 'hidden',
        border: '1px dashed var(--dsw-alias-border-l3)',
        borderRadius: 8,
      }}
    >
      <Menu
        {...props}
        portal={false}
        open={openInPlace}
        onClose={() => setOpenInPlace(false)}
        onSelect={() => setOpenInPlace(false)}
        anchor={
          <Button variant="outline" icon={<IconChevronDownOutlineRegular />} onClick={() => setOpenInPlace((o) => !o)}>
            就地（被裁）
          </Button>
        }
      />
      <Menu
        {...props}
        portal
        open={openPortal}
        onClose={() => setOpenPortal(false)}
        onSelect={() => setOpenPortal(false)}
        anchor={
          <Button variant="outline" icon={<IconChevronDownOutlineRegular />} onClick={() => setOpenPortal((o) => !o)}>
            portal（完整）
          </Button>
        }
      />
    </div>
  )
}

const meta = {
  title: '镜像层（上游同步）/Menu',
  component: Menu,
  parameters: {
    docs: {
      description: {
        component: `锚定下拉菜单：\`anchor\` 是触发元素（就地渲染），\`items\` 是 \`MenuEntry[]\`——普通行 \`MenuItem\`（可带 \`icon\` / \`disabled\` / \`danger\` / \`submenu\`）、分隔线 \`{ type: 'separator' }\`、标题行 \`{ type: 'label', text }\`。**open 与选中完全受控**：\`open\` / \`onClose\`（外点、Escape）/ \`onSelect(id)\` 由调用方持有，\`selectedId\` 单选打勾、\`selectedIds\` 多组独立选项。\`side\`（\`bottom\` 默认 / \`top\` / \`right\`）与 \`align\`（\`start\` / \`end\`）定位；\`portal\` 把列表渲染到 body 并按锚点 rect 定 fixed 位置，祖先有 overflow 裁剪时用它；\`footer\` 钉在滚动区下方；\`dense\` / \`compact\` 收紧行距与字号；\`closeOnPointerLeave\` 让指针离开后经宽限期自动关。上游同步件，源码不改。

**什么时候用**：一个触发器下挂多条操作或选项（会话行的「…」、模型选择、视图选项）。

**什么时候不用**：只有一两个动作直接放 \`Button\`；平铺可见的筛选用 \`Pill\`；视图切换用扩展层 Tabs；需要表单的弹层用 \`Modal\`。

**可访问性**：列表 \`role="menu"\`，每行原生 \`<button role="menuitem">\`，disabled 走原生禁用；带子菜单的行有 \`aria-haspopup="menu"\` + \`aria-expanded\`；分隔线 \`role="separator"\`；标题行 \`role="presentation"\`（非交互）。Escape 关闭由组件处理；行间方向键导航上游未实现，Tab 顺序即 DOM 顺序。触发按钮的 \`aria-expanded\` 需要调用方自己加。

**注意**：\`side="right"\` 只在 \`portal\` 模式下生效——就地模式没有对应的 CSS 定位，会退回到 bottom；带 \`submenu\` 的菜单不套视口高度上限（overflow 裁剪会切掉侧卡）。

**相关 token**：\`--dsw-specific-menu\`（卡片底）、\`--dsw-elevation-prominent\`、\`--dsw-alias-border-l1\` / \`-l2\`（描边、分隔线、footer 线）、\`--dsw-alias-label-primary\` / \`-tertiary\`（行文字 / 图标 / 标题行）、\`--dsw-alias-interactive-bg-hover\` / \`-hover-danger\`、\`--dsw-alias-state-error-primary\`（danger 行）、\`--dsw-alias-scrollbar-bg-l2\` / \`-hover-l2\`。`,
      },
    },
  },
  args: {
    open: false,
    items: BASIC_ITEMS,
    // 占位：render 里会换成一个切换 open 的 Button
    anchor: <Button variant="outline">操作菜单</Button>,
    align: 'start',
    side: 'bottom',
    portal: false,
    dense: false,
    compact: false,
    // 占位：render 里的受控外壳会接管这两个回调
    onSelect: () => {},
    onClose: () => {},
  },
  argTypes: {
    anchor: { control: false },
    items: { control: false },
    footer: { control: false },
    getAnchorRect: { control: false },
    onSelect: { control: false },
    onClose: { control: false },
  },
  render: (args) => <MenuDemo {...args} />,
} satisfies Meta<typeof Menu>
export default meta
type Story = StoryObj<typeof meta>

/** 基本菜单：三行带图标的普通条目；点触发按钮打开，选中后关闭，外点 / Escape 也关闭。 */
export const Default: Story = {}

/** `MenuEntry` 三种条目同框：`label` 标题行、普通 item、`separator` 分隔线。 */
export const EntryKinds: Story = { args: { items: ENTRY_KINDS } }

/** `submenu`：把鼠标移到「导出」或用 Tab 聚焦，子菜单向右展开；子项也可 `disabled`。 */
export const WithSubmenu: Story = { args: { items: SUBMENU_ITEMS } }

/** `danger` 行用 error 色 + 危险 hover 底；`disabled` 行 40% 透明且不触发 onSelect。 */
export const DangerAndDisabled: Story = { args: { items: DANGER_ITEMS } }

/** `footer`：24 条会话在上方滚动，「管理会话…」钉在底部始终可见。 */
export const WithFooter: Story = { args: { items: LONG_ITEMS, footer: FOOTER_ITEMS } }

/** `side="top"`：向上展开（空态工作区芯片的形态）；这里用上边距留出空间。 */
export const SideTop: Story = {
  args: { side: 'top' },
  render: (args) => (
    <div style={{ paddingTop: 200 }}>
      <MenuDemo {...args} />
    </div>
  ),
}

/** `side="right"` + `portal`：列表贴在锚点右侧、顶部对齐。就地模式没有 right 定位，必须 portal。 */
export const SideRight: Story = { args: { side: 'right', portal: true } }

/** `align="end"`：列表右边缘与锚点右边缘对齐（锚点靠右时用）。 */
export const AlignEnd: Story = {
  args: { align: 'end' },
  render: (args) => (
    <div style={{ display: 'flex', justifyContent: 'flex-end', width: 420, maxWidth: '100%' }}>
      <MenuDemo {...args} />
    </div>
  ),
}

/** `portal`：容器 overflow:hidden 时就地列表被裁掉，portal 列表 fixed 在 body 上完整显示，且随滚动 / resize 跟随锚点。 */
export const Portal: Story = {
  render: (args) => <PortalContrast {...args} />,
}

/** 受控单选：`selectedId` 由调用方持有，选中行尾部出现对勾（不是填充）。 */
export const ControlledSelection: Story = {
  render: (args) => <SingleSelectMenu {...args} />,
}

/** 多组独立选项：`selectedIds` 数组，点一行切换该行，菜单保持打开方便连续勾选。 */
export const MultiSelection: Story = {
  render: (args) => <MultiSelectMenu {...args} />,
}

/** `dense`：行高 40 → 34；`compact`：字号 12、卡片 164 宽、圆角收小——密集工具面板用。 */
export const DenseAndCompact: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      <MenuDemo {...args} items={ENTRY_KINDS} dense />
      <MenuDemo {...args} items={ENTRY_KINDS} compact />
    </div>
  ),
}

/** `closeOnPointerLeave`：指针离开触发器和列表一小段时间后自动关闭，移回来则取消关闭。 */
export const CloseOnPointerLeave: Story = { args: { closeOnPointerLeave: true } }

/** 组合样张：标题行、图标、禁用、子菜单、分隔线、danger 一个都不少（demo 里的操作菜单）。 */
export const AllTogether: Story = { args: { items: FULL_ITEMS, footer: FOOTER_ITEMS } }

/** 快捷键：条目 `shortcut: { keys, aria }` 在行尾摆出 `ShortcutKeys` 键帽（`aria` 写进 `aria-keyshortcuts`），`dsh-v0.1.7-rc.2` 新增。 */
const SHORTCUT_ITEMS: readonly MenuEntry[] = [
  { id: 'new', label: '新建会话', icon: <IconEditOutlineRegular />, shortcut: { keys: ['⌘', 'N'], aria: 'Meta+N' } },
  { id: 'copy', label: '复制链接', icon: <IconCopyOutlineRegular />, shortcut: { keys: ['⌘', 'C'], aria: 'Meta+C' } },
  { type: 'separator', id: 'sep' },
  {
    id: 'settings',
    label: '设置',
    icon: <IconSettingsOutlineRegular />,
    shortcut: { keys: ['⌘', ','], aria: 'Meta+Comma' },
  },
]

export const WithShortcuts: Story = {
  args: { items: SHORTCUT_ITEMS },
}
