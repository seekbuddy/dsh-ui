import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { AnimatedRows, Button } from '@seekbuddy/dsh-ui'

const INITIAL = ['支付重构', '登录页改版', '日志采样', '灰度发布']

const meta = {
  title: '镜像层（上游同步）/AnimatedRows',
  component: AnimatedRows,
  parameters: {
    docs: {
      description: {
        component: `给按 key 排列的列表行加过渡：行位置变化时平滑滑动到新位置，新增的行淡入、删除的行淡出。每一行要带 \`data-row-key\`，并且和 \`rowKeys\`（按 DOM 顺序）一一对应。上游同步件（\`dsh-v0.2.2-rc.1\` 新增），源码不改。

**什么时候用**：会话列表、排队消息这类会重新排序、增删的短列表。
**什么时候不用**：长列表或虚拟滚动；切换到另一份数据时，改 \`resetKey\` 让列表直接定格，不播放过渡。
**可访问性**：\`role\` 和 \`label\` 透传到列表容器，比如 \`role="list"\` 加本地化的 \`label\`。`,
      },
    },
  },
  args: { className: '', rowKeys: INITIAL, ready: true, resetKey: 'sessions', children: null },
  argTypes: { children: { control: false }, rowKeys: { control: false } },
} satisfies Meta<typeof AnimatedRows>
export default meta
type Story = StoryObj<typeof meta>

/** 点「置顶最后一项」「删除第一项」「新增」看滑动和淡入淡出。 */
export const Default: Story = {
  render: (args) => {
    const [rows, setRows] = useState(INITIAL)
    const [next, setNext] = useState(1)
    return (
      <div style={{ display: 'grid', gap: 12, width: 260, font: 'var(--dsw-font-s-14)' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button size="sm" onClick={() => setRows((r) => [r[r.length - 1]!, ...r.slice(0, -1)])}>
            置顶最后一项
          </Button>
          <Button size="sm" onClick={() => setRows((r) => r.slice(1))}>
            删除第一项
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setRows((r) => [...r, `新会话 ${next}`])
              setNext((n) => n + 1)
            }}
          >
            新增
          </Button>
        </div>
        <AnimatedRows {...args} role="list" label="会话" rowKeys={rows}>
          {rows.map((row) => (
            <div key={row} data-row-key={row} role="listitem" style={{ padding: '6px 8px' }}>
              {row}
            </div>
          ))}
        </AnimatedRows>
      </div>
    )
  },
}
