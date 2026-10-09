import type { CSSProperties } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ShortcutKeys, Tooltip, Button } from '@seekbuddy/dsh-ui'

const meta = {
  title: '镜像层（上游同步）/ShortcutKeys',
  component: ShortcutKeys,
  parameters: {
    docs: {
      description: {
        component: `一条命令的**键帽**：\`keys\` 是已经按平台换算好的键名数组（\`['⌘', 'K']\`、\`['Ctrl', '+', 'K']\`），每个键一个 \`<kbd>\`。它不认识快捷键绑定，也不做本地化，只负责摆出来；上游同步件（\`dsh-v0.1.7-rc.2\` 新增），源码不改。

**两种形态**：\`plain\`（默认）是无边框的灰字，用在菜单行右侧（\`Menu\` 条目的 \`shortcut\` 就是它）；\`tooltip\` 是 16px 高的深底键帽，用在 \`Tooltip\` 的 \`shortcutKeys\` 里，数组里出现 \`'+'\` 时整组并成一块。
**什么时候用**：菜单、Tooltip、设置页里的快捷键说明列。
**什么时候不用**：让用户**录入**快捷键的输入框不是它；正文里提到某个键直接写 \`<kbd>\`。
**可访问性**：\`<kbd>\` 语义原生；放进 Tooltip 时 Tooltip 会把键名拼进 \`aria-label\`，放进 Menu 时条目用 \`aria-keyshortcuts\` 表达、键帽本身 \`aria-hidden\`。
**相关 token**：\`--dsw-alias-label-tertiary\`（plain 文字）、\`--dsw-alias-tooltip-key-bg\`（tooltip 键帽底）、\`--dsw-alias-label-caption\`（菜单里 11px 的键名）。`,
      },
    },
  },
  args: { keys: ['⌘', 'K'], variant: 'plain' },
  argTypes: { variant: { control: 'inline-radio', options: ['plain', 'tooltip'] } },
} satisfies Meta<typeof ShortcutKeys>
export default meta
type Story = StoryObj<typeof meta>

const row: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  color: 'var(--dsw-alias-label-primary)',
  font: 'var(--dsw-font-s-14)',
}

/** `plain`：菜单行右侧的灰色键名。 */
export const Default: Story = {}

/** `tooltip`：深底键帽；`'+'` 分隔的组合键并成一块。 */
export const TooltipVariant: Story = {
  render: () => (
    <div style={{ ...row, padding: 8, borderRadius: 8, background: 'var(--dsw-alias-tooltip-bg)', color: '#fff' }}>
      <ShortcutKeys keys={['⌘', 'K']} variant="tooltip" />
      <ShortcutKeys keys={['Ctrl', '+', 'Shift', '+', 'P']} variant="tooltip" />
      <ShortcutKeys keys={['Esc']} variant="tooltip" />
    </div>
  ),
}

/** 真实宿主：`Tooltip` 的 `shortcutKeys` 把键帽排在文字右侧。 */
export const InsideTooltip: Story = {
  render: () => (
    <div style={row}>
      <Tooltip label="新建会话" shortcutKeys={['⌘', 'N']}>
        <Button size="sm" variant="outline">
          悬停看快捷键
        </Button>
      </Tooltip>
      <Tooltip label="" shortcutKeys={['⌘', 'K']}>
        <Button size="sm" variant="ghost">
          只有键帽
        </Button>
      </Tooltip>
    </div>
  ),
}
