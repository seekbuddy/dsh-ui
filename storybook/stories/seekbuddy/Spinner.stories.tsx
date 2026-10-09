import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@seekbuddy/dsh-ui'
import { Spinner } from '@seekbuddy/dsh-ui/seekbuddy/spinner'

const meta = {
  title: 'SeekBuddy 扩展层/Spinner',
  component: Spinner,
  parameters: {
    docs: {
      description: {
        component: `共享的加载圆环实现：底轨 currentColor 35%、进度弧 currentColor，\`prefers-reduced-motion\` 下停转、保留静态双色环。SeekBuddy 扩展组件，不要再手写圆环。

**什么时候用**：按钮内等待（\`size="sm"\`，继承按钮前景色，不传 \`tone\`）、行内文字旁的短等待、页面级首屏加载（\`size="md" tone="page"\`）。

**什么时候不用**：有明确进度百分比的任务（用进度条）；列表数据尚未到达时的占位（骨架屏更合适）；auth 直出页有自己的 AuthSpinner，不引本组件。

**可访问性**：不传 \`label\` 时圆环是装饰（\`aria-hidden\`），周围文字必须说明在加载什么；传 \`label\` 则自身成为 \`role="status" aria-live="polite"\` 的实时区域，文字视觉隐藏但读屏可读。动画遵守 reduced-motion。

**相关 token**：颜色只来自 \`currentColor\`；\`tone="page"\` 唯一钉死 \`--dsw-alias-label-primary\`。`,
      },
    },
  },
  args: { size: 'sm', tone: 'inherit' },
} satisfies Meta<typeof Spinner>
export default meta
type Story = StoryObj<typeof meta>

/** 默认：`sm` 尺寸、继承当前文字色，装饰性（aria-hidden）。 */
export const Default: Story = {}

/** `size="md"`：2rem / 3px 环，页面级等待用。 */
export const Medium: Story = { args: { size: 'md' } }

/** 传 `label` 后变成 role=status 实时区域，读屏会播报文案。 */
export const WithLabel: Story = { args: { label: '正在加载' } }

/** 按钮内：继承按钮前景色，不用传 tone。 */
export const InsideButton: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <Button variant="primary" disabled>
        <Spinner /> 保存中
      </Button>
      <Button variant="outline" disabled>
        <Spinner /> 加载
      </Button>
    </div>
  ),
}

/** 页面级：`size="md" tone="page"` 钉 `--dsw-alias-label-primary`，带读屏文案。 */
export const PageLevel: Story = {
  args: { size: 'md', tone: 'page', label: '正在加载技能列表' },
}

/** 两个尺寸 × 两种 tone 并排；`inherit` 列放在次要文字色 / 主题色容器里看继承效果。 */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto', gap: 16, alignItems: 'center' }}>
      <span>sm / inherit</span>
      <span style={{ color: 'var(--dsw-alias-label-tertiary)' }}>
        <Spinner size="sm" />
      </span>
      <span style={{ color: 'var(--dsw-alias-label-tertiary)' }}>继承次要文字色</span>
      <span>md / inherit</span>
      <span style={{ color: 'var(--dsw-alias-state-business-primary)' }}>
        <Spinner size="md" />
      </span>
      <span style={{ color: 'var(--dsw-alias-state-business-primary)' }}>继承主题色</span>
      <span>sm / page</span>
      <Spinner size="sm" tone="page" />
      <span>钉 label-primary</span>
      <span>md / page</span>
      <Spinner size="md" tone="page" />
      <span>钉 label-primary</span>
    </div>
  ),
}
