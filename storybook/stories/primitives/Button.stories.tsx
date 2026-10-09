import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@seekbuddy/dsh-ui'
import { IconSearchOutlineRegular } from '@seekbuddy/dsh-ui/icons'

const meta = {
  title: '镜像层（上游同步）/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: `标准操作按钮：\`variant\` 选一个 \`--dsw-alias-button-*\` 填充家族，\`size\` 选 36px 胶囊（\`md\`）或 28px 紧凑（\`sm\`），\`icon\` 是前置 16px 图标槽；原生 \`button\` 属性（\`onClick\` / \`disabled\` / \`aria-*\`…）原样透传。上游同步件，源码不改。

**什么时候用**：页面与对话框里的主次操作（\`primary\` 一屏一个、\`ghost\` 默认、\`outline\` 用作对话框"取消"、\`toolbar\` 用在工具条底色上）；纯图标按钮也用它，但必须加 \`aria-label\`，不熟悉的图标再配 \`Tooltip\`。

**什么时候不用**：筛选 / 标签 / 轻量切换用 \`Pill\`；视图切换用扩展层 \`Tabs\`；菜单行是 \`Menu\` 自己渲染的 \`menuitem\`，不要往里塞 Button。

**可访问性**：渲染原生 \`<button type="button">\`，可访问名来自 \`children\` 文本；只有图标时靠调用方传的 \`aria-label\`。\`disabled\` 走原生禁用（40% 透明 + \`not-allowed\`），禁用态不响应 hover / 焦点，需要说明原因时把提示放在旁边而不是 Tooltip 上。

**相关 token**：\`--dsw-alias-label-primary\`、\`--dsw-alias-label-primary-foreground\`、\`--dsw-alias-button-primary-fill\` / \`-hover\`、\`--dsw-alias-button-tool-bar-fill\` / \`-hover\`、\`--dsw-alias-interactive-bg-hover\` / \`-active\`、\`--dsw-alias-border-l3\`（outline 描边）。`,
      },
    },
  },
  args: { variant: 'primary', size: 'md', children: '开始' },
  argTypes: { icon: { control: false }, children: { control: 'text' } },
} satisfies Meta<typeof Button>
export default meta
type Story = StoryObj<typeof meta>

/** 主操作：一屏只放一个，实心品牌色填充。 */
export const Primary: Story = {}

/** 默认 variant：透明底，hover / active 才出现交互底色。 */
export const Ghost: Story = { args: { variant: 'ghost' } }

/** 描边胶囊：对话框里的"取消"（figma 451:18655）。 */
export const Outline: Story = { args: { variant: 'outline' } }

/** 工具条按钮：自带 tool-bar 底色，通常配 `size="sm"`。 */
export const Toolbar: Story = { args: { variant: 'toolbar', size: 'sm', children: '工具栏' } }

/** `icon` 前置图标槽（16px），与文字间距 4px。 */
export const WithIcon: Story = { args: { icon: <IconSearchOutlineRegular />, children: '搜索' } }

/** 原生 `disabled` 透传：40% 透明，光标 not-allowed。 */
export const Disabled: Story = { args: { disabled: true } }

/** 四个 variant 并排，切右上角主题看暗色。 */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button variant="primary">primary</Button>
      <Button variant="ghost">ghost</Button>
      <Button variant="outline">outline</Button>
      <Button variant="toolbar" size="sm">
        toolbar
      </Button>
    </div>
  ),
}
