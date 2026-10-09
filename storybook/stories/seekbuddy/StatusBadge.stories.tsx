import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatusBadge } from '@seekbuddy/dsh-ui/seekbuddy'

const meta = {
  title: 'SeekBuddy 扩展层/StatusBadge',
  component: StatusBadge,
  parameters: {
    docs: {
      description: {
        component: `只读**状态标**：上游 \`StateDot\` + 文案，一个 \`tone\` 对应一档语义——\`neutral\`（中性，如「已下架 · 仍可使用」）、\`success\`（运行中）、\`progress\`（挂载中 / 连接中，点是上游那套会动的追逐动画）、\`warning\`（未连接 / 需重新授权）、\`error\`（挂载失败）。适合在列表与详情页表达实例侧状态。

**点用上游的 \`StateDot\`**：与终端块的运行态同一套图形与动效，不另造一套「进行中」的视觉词汇；点 \`aria-hidden\`，语义由文案承担。行里已经有点时传 \`dot={false}\` 去掉。

**为什么在扩展层**：上游 \`Pill\` 没有语义色调变体，而调用方用 \`className\` 改上游组件的内部视觉会和它的内部样式耦合。语义色收在这一处，调用方不必各写一份覆盖。

**不是通用 Badge**：不开放 \`color\` / \`icon\` 之类自由 props，颜色由扩展层按 \`tone\` 定死。要加新档：\`StatusTone\` 联合、CSS 里一个颜色 class、这里一个 story，调用方零改动。

**静态无交互**：不接 \`onClick\`，上游 \`Pill\` 因此渲染 \`<span>\`，没有 hover / focus 态要与默认态对齐。几何形状（胶囊、24px 高、12px 字号）全部留在被包的 \`Pill\` 上。

**token**：\`--dsw-alias-state-success-primary\` / \`-warn-primary\` / \`-error-primary\` 与 \`--dsw-alias-label-tertiary\`，全部主题感知，深色模式无需额外规则。`,
      },
    },
  },
  args: { tone: 'success', children: '运行中', dot: true },
  argTypes: { tone: { control: 'inline-radio', options: ['neutral', 'success', 'progress', 'warning', 'error'] } },
} satisfies Meta<typeof StatusBadge>
export default meta
type Story = StoryObj<typeof meta>

/** 默认：`success`。 */
export const Default: Story = {}

/** 五档并排；`progress` 的点在动。 */
export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <StatusBadge tone="success">运行中</StatusBadge>
      <StatusBadge tone="progress">挂载中</StatusBadge>
      <StatusBadge tone="warning">未连接</StatusBadge>
      <StatusBadge tone="error">挂载失败</StatusBadge>
      <StatusBadge tone="neutral">已下架 · 仍可使用</StatusBadge>
    </div>
  ),
}

/** 不带点：行里已经有状态图形时用，只留文案与语义色。 */
export const WithoutDot: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <StatusBadge tone="success" dot={false}>
        运行中
      </StatusBadge>
      <StatusBadge tone="error" dot={false}>
        挂载失败
      </StatusBadge>
    </div>
  ),
}
