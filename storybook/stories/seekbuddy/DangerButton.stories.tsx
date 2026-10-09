import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@seekbuddy/dsh-ui'
import { DangerButton } from '@seekbuddy/dsh-ui/seekbuddy'

const meta = {
  title: 'SeekBuddy 扩展层/DangerButton',
  component: DangerButton,
  parameters: {
    docs: {
      description: {
        component: `错误语义的描边胶囊按钮：红字红边，包住上游 \`Button\`（外形固定 \`outline\`），其余 props（\`size\` / \`icon\` / \`disabled\` / 原生按钮属性）原样透传。上游 \`ButtonVariant\` 没有 danger 族，而调用方用 \`className\` 改上游 \`Button\` 的内部视觉往往只顾到 hover，所以收进扩展组件一次把状态补齐。

**什么时候用**：破坏性动作（删除、停用），以及需要红色强调的出错态入口（如「审核失败」点开驳回原因）。

**什么时候不用**：可撤销的普通动作（用中性 \`outline\`）；确认弹窗里的破坏性确认键（弹窗自带样式）；只读的状态标（用 \`Pill\` 改前景色）。

**状态**：hover 危险底色；按下 18% 错误色填充；键盘焦点 2px business-primary 焦点环（与 Switch / Tabs / 日期族同色）；禁用沿用上游 40% 半透明。

**相关 token**：\`--dsw-alias-state-error-primary\`（前景与描边，与上游 Menu 的 danger 项同一 token）、\`--dsw-alias-interactive-bg-hover-danger\`（hover 底）、\`--dsw-alias-state-business-primary\`（焦点环）。全部随主题切换，暗色无需特判。`,
      },
    },
  },
  args: { children: '删除', size: 'md', disabled: false },
  argTypes: { size: { control: 'inline-radio', options: ['md', 'sm'] } },
} satisfies Meta<typeof DangerButton>
export default meta
type Story = StoryObj<typeof meta>

/** 默认：md 36px 胶囊。Tab 聚焦看焦点环，按住看按下态。 */
export const Default: Story = {}

/** 两档尺寸：md（详情页主操作）/ sm（卡片与行内）。 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <DangerButton>删除</DangerButton>
      <DangerButton size="sm">停用</DangerButton>
    </div>
  ),
}

/** 禁用：沿用上游 40% 半透明，不可点。 */
export const Disabled: Story = { args: { disabled: true } }

/** 与中性描边按钮并排：破坏性只给真正破坏性的那一个。 */
export const WithNeutral: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button variant="outline" size="sm">
        卸载
      </Button>
      <DangerButton size="sm">停用</DangerButton>
    </div>
  ),
}
