import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@seekbuddy/dsh-ui'
import { SubtleButton } from '@seekbuddy/dsh-ui/seekbuddy'

const meta = {
  title: 'SeekBuddy 扩展层/SubtleButton',
  component: SubtleButton,
  parameters: {
    docs: {
      description: {
        component: `次要色文字的幽灵胶囊按钮：包住上游 \`Button\`（外形固定 \`ghost\`），文字用次要色，悬停 / 按下转主色；其余 props（\`size\` / \`icon\` / \`disabled\` / 原生按钮属性）原样透传。上游 \`ButtonVariant\` 没有「安静」族，而调用方用 \`className\` 改文字色往往只顾到默认态，所以收进扩展组件一次把状态补齐。

**什么时候用**：挨着真正动作的低强调导航入口——卡片上的「查看详情」、详情页的「返回」。

**什么时候不用**：页面主操作（用 \`primary\` / \`outline\`）；破坏性动作（用 \`DangerButton\`）；需要和普通幽灵按钮一样醒目的入口（直接用上游 \`ghost\`）。

**状态**：静止次要色文字；悬停 / 按下文字转主色，底色沿用上游 ghost 的 hover / active 填充；键盘焦点 2px business-primary 焦点环（与 DangerButton / Switch / Tabs 同色）；禁用沿用上游 40% 半透明。

**相关 token**：\`--dsw-alias-label-secondary\`（静止文字）、\`--dsw-alias-label-primary\`（悬停 / 按下文字）、\`--dsw-alias-state-business-primary\`（焦点环）。全部随主题切换，暗色无需特判。`,
      },
    },
  },
  args: { children: '查看详情', size: 'sm', disabled: false },
  argTypes: { size: { control: 'inline-radio', options: ['md', 'sm'] } },
} satisfies Meta<typeof SubtleButton>
export default meta
type Story = StoryObj<typeof meta>

/** 默认：sm 28px 胶囊（卡片底栏的用法）。悬停看文字转主色，Tab 聚焦看焦点环。 */
export const Default: Story = {}

/** 两档尺寸：md（详情页顶栏的「返回」）/ sm（卡片与行内）。 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <SubtleButton>返回</SubtleButton>
      <SubtleButton size="sm">查看详情</SubtleButton>
    </div>
  ),
}

/** 禁用：沿用上游 40% 半透明，不可点。 */
export const Disabled: Story = { args: { disabled: true } }

/** 与普通幽灵按钮并排：安静的那一个把视线让给旁边的动作。 */
export const WithGhost: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <SubtleButton size="sm">查看详情</SubtleButton>
      <Button variant="ghost" size="sm">
        幽灵（主色对照）
      </Button>
    </div>
  ),
}
