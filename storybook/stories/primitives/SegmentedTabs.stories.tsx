import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SegmentedTabs } from '@seekbuddy/dsh-ui'
import type { SegmentedTab } from '@seekbuddy/dsh-ui'

type Scope = 'workspace' | 'global'

const ITEMS: readonly [SegmentedTab<Scope>, ...SegmentedTab<Scope>[]] = [
  { value: 'workspace', label: '当前工作区', id: 'scope-tab-workspace', panelId: 'scope-panel-workspace' },
  { value: 'global', label: '全局', id: 'scope-tab-global', panelId: 'scope-panel-global' },
]

const meta = {
  title: '镜像层（上游同步）/SegmentedTabs',
  component: SegmentedTabs<Scope>,
  parameters: {
    docs: {
      description: {
        component: `等宽铺满的受控标签页，带滑动选中指示；只渲染 tablist，**面板归调用方**，每项自带 \`id\` / \`panelId\` 两个 DOM id。至少一项（元组类型保证非空）。上游同步件（\`dsh-v0.1.7-rc.1\` 新增，dsh 设置页的"工作区 / 全局"切换就是它），源码不改。

**什么时候用**：两到四个同级范围之间切换，且希望标签铺满容器宽度（设置作用域、左右两栏的数据源）。
**什么时候不用**：视图模式切换、需要单项禁用用 \`SegmentedControl\`；页面级导航、带计数徽标用扩展层 \`Tabs\`。
**可访问性**：\`role="tablist"\` + \`aria-label\`（\`label\` **必填**），←/→ 循环、Home/End 跳首尾，键盘选中同时移焦点，只有选中项是 tab stop；每个 tab 用 \`aria-controls\` 指向 \`panelId\`。
**相关 token**：\`--dsw-alias-bg-module-platform\`（轨道）、\`--dsw-alias-bg-layer-3\`（指示块）、\`--dsw-alias-border-l3\`（指示块描边）、\`--dsw-alias-label-primary\` / \`-secondary\`（选中 / 未选文字）。`,
      },
    },
  },
  args: { items: ITEMS, value: 'workspace', label: '设置作用域', onChange: () => {} },
  argTypes: { onChange: { control: false }, items: { control: false } },
} satisfies Meta<typeof SegmentedTabs<Scope>>
export default meta
type Story = StoryObj<typeof meta>

/** 受控用法，面板由调用方按 `panelId` 渲染。 */
export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState<Scope>(args.value)
    const active = ITEMS.find((item) => item.value === value) ?? ITEMS[0]
    return (
      <div style={{ display: 'grid', gap: 12, width: 320 }}>
        <SegmentedTabs {...args} value={value} onChange={setValue} />
        <div
          role="tabpanel"
          id={active.panelId}
          aria-labelledby={active.id}
          style={{ font: 'var(--dsw-font-s-14)', color: 'var(--dsw-alias-label-secondary)' }}
        >
          {value === 'workspace' ? '只对当前工作区生效' : '对所有工作区生效'}
        </div>
      </div>
    )
  },
}
