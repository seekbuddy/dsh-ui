import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Pill } from '@seekbuddy/dsh-ui'

const FILTERS = [
  { id: 'all', label: '全部' },
  { id: 'running', label: '运行中' },
  { id: 'done', label: '已完成' },
  { id: 'failed', label: '失败' },
] as const
type FilterId = (typeof FILTERS)[number]['id']

const meta = {
  title: '镜像层（上游同步）/Pill',
  component: Pill,
  parameters: {
    docs: {
      description: {
        component: `24px 圆角小胶囊：筛选、标签、徽标、轻量切换。**传了 \`onClick\` 就渲染 \`<button>\`（可点、hover 底色），不传就是静态 \`<span>\`**；\`active\` 表示选中，换成 ghost-active 填充 + 1px 内描边。上游同步件，源码不改。

**什么时候用**：一排筛选条件、状态标签、给列表项打的小徽标；主题偏好这类"几选一"的轻量切换。

**什么时候不用**：插件页的视图切换（技能 / 连接器 / 市场）**正从 Pill 迁到扩展层 [Tabs](?path=/docs/seekbuddy-扩展层-tabs--docs)**——那里有 tablist 语义与键盘导航，新代码不要再用一排 Pill 做视图切换；触发动作用 \`Button\`；下拉选项用 \`Menu\`。

**可访问性**：静态形态是无语义 \`<span>\`，纯展示；交互形态是原生 \`<button type="button">\`，可访问名来自 \`children\`。\`active\` 只是视觉，组件不写 \`aria-pressed\` / \`aria-selected\`——做"几选一"时请调用方自己加 \`aria-pressed={active}\`（本页"一排筛选"样张就是这么写的）。

**相关 token**：\`--dsw-alias-bg-layer-2\`（底色）、\`--dsw-alias-label-secondary\` / \`-primary\`（文字）、\`--dsw-alias-interactive-bg-hover\`、\`--dsw-alias-button-ghost-active-fill\` / \`-border\`（选中态）。`,
      },
    },
  },
  args: { children: '全部', active: false },
  argTypes: { children: { control: 'text' } },
} satisfies Meta<typeof Pill>
export default meta
type Story = StoryObj<typeof meta>

/** 默认：没有 `onClick`，渲染静态 `<span>`，hover 没有反馈。 */
export const Default: Story = {}

/** `active`：选中态填充 + 内描边（静态标签也能用，例如"当前"徽标）。 */
export const Active: Story = { args: { active: true, children: '当前' } }

/** 传了 `onClick` 就变成 `<button>`：光标 pointer、hover 底色；这里统计点击次数。 */
export const Clickable: Story = {
  args: { children: '点我' },
  render: (args) => {
    const [count, setCount] = useState(0)
    return (
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Pill {...args} onClick={() => setCount((c) => c + 1)} />
        <span>已点击 {count} 次</span>
      </div>
    )
  },
}

/** 一排筛选（受控）：选中项由调用方持有，`aria-pressed` 由调用方补上。 */
export const FilterRow: Story = {
  render: () => {
    const [selected, setSelected] = useState<FilterId>('all')
    return (
      <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {FILTERS.map((f) => (
            <Pill
              key={f.id}
              active={selected === f.id}
              aria-pressed={selected === f.id}
              onClick={() => setSelected(f.id)}
            >
              {f.label}
            </Pill>
          ))}
        </div>
        <span>当前筛选：{FILTERS.find((f) => f.id === selected)?.label}</span>
      </div>
    )
  },
}

/** 组合样张：静态 / 静态选中 / 可点击 / 可点击选中 并排，切主题看暗色。 */
export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Pill>静态</Pill>
      <Pill active>静态·选中</Pill>
      <Pill onClick={() => {}}>可点击</Pill>
      <Pill active onClick={() => {}}>
        可点击·选中
      </Pill>
    </div>
  ),
}
