import type { Meta, StoryObj } from '@storybook/react-vite'
import { HoverCard, HoverCardGroup } from '@seekbuddy/dsh-ui'

const SESSIONS = ['支付重构', '登录页改版', '日志采样']

const meta = {
  title: '镜像层（上游同步）/HoverCardGroup',
  component: HoverCardGroup,
  parameters: {
    docs: {
      description: {
        component: `让一组 \`HoverCard\` 共享首次显示的等待时间：第一张卡片照常等 \`openDelayMs\`，之后在同一组里移到相邻锚点，新卡片立即替换旧卡片，不用再等。只有设了 \`grouped\` 的 \`HoverCard\` 参与。上游同步件（\`dsh-v0.2.2-rc.1\` 新增），源码不改。

**什么时候用**：会话列表、引用列表这类相邻锚点都带悬停卡片的地方。
**什么时候不用**：页面上只有零散的单个悬停卡片。
**布局**：\`as="span"\` 时容器是行内元素，不打断文字排版。`,
      },
    },
  },
  args: { children: null },
  argTypes: { children: { control: false } },
} satisfies Meta<typeof HoverCardGroup>
export default meta
type Story = StoryObj<typeof meta>

/** 在第一项停留等卡片出现，再上下移动：相邻项的卡片立即切换。 */
export const Default: Story = {
  render: () => (
    <HoverCardGroup>
      <div style={{ display: 'grid', gap: 4, width: 200, font: 'var(--dsw-font-s-14)' }}>
        {SESSIONS.map((title) => (
          <HoverCard key={title} grouped anchor={<div style={{ padding: '6px 8px' }}>{title}</div>} content={`会话：${title}`} />
        ))}
      </div>
    </HoverCardGroup>
  ),
}
