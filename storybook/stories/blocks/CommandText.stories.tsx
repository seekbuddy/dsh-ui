import type { Meta, StoryObj } from '@storybook/react-vite'
import { CommandText } from '@seekbuddy/dsh-ui/blocks'

const meta = {
  title: '镜像层（上游同步）/Blocks/CommandText',
  component: CommandText,
  parameters: {
    docs: {
      description: {
        component: `命令或参数的单行展示：**不截断**原文，放不下时变成可横向滚动的区域，此时才可以用 Tab 聚焦，并以 \`label\` 作为读屏名称。上游同步件（\`dsh-v0.2.2-rc.1\` 新增，\`TerminalBlock\` 的命令行就用它），源码不改。

**什么时候用**：工具调用卡片里展示完整命令、参数，用户可能需要横向查看或复制全文。
**什么时候不用**：多行代码（\`CodeBlock\`）；完整的终端输出（\`TerminalBlock\`）。
**可访问性**：只在溢出时加 \`role="group"\`、\`tabIndex=0\` 和 \`aria-label\`，不溢出时就是普通文本。`,
      },
    },
  },
  args: { text: 'bun test ./tests/unit', label: '完整命令' },
} satisfies Meta<typeof CommandText>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** 超出容器宽度：可以横向滚动，并能用 Tab 聚焦。 */
export const Overflow: Story = {
  args: {
    text: 'git -C deepseek-harness diff --stat dsh-v0.2.0-rc.2 dsh-v0.2.2-rc.1 -- packages/client packages/boot vendor/cordis',
  },
  render: (args) => (
    <div style={{ width: 280, font: 'var(--dsw-font-s-14)' }}>
      <CommandText {...args} />
    </div>
  ),
}
