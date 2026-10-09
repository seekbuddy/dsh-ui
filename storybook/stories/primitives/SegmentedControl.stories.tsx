import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SegmentedControl } from '@seekbuddy/dsh-ui'
import type { SegmentedControlOption } from '@seekbuddy/dsh-ui'

type View = 'preview' | 'source' | 'diff'

const OPTIONS: readonly SegmentedControlOption<View>[] = [
  { value: 'preview', label: '预览' },
  { value: 'source', label: '源码' },
  { value: 'diff', label: '对比' },
]

const meta = {
  title: '镜像层（上游同步）/SegmentedControl',
  component: SegmentedControl<View>,
  parameters: {
    docs: {
      description: {
        component: `两个及以上等宽分段加一块滑动指示，在一张卡片 / 面板的几种**模式**之间切换，**完全受控**。每个分段是 \`<id>-<value>\` 的 tab，控制 \`<id>-<value>-panel\`——面板由调用方渲染并用 \`aria-labelledby\` 指回来。单个分段可 \`disabled\`（配 \`title\` 说原因），键盘游走会跳过它。上游同步件（\`dsh-v0.1.7-rc.1\` 新增），源码不改。

**什么时候用**：同一块内容的视图切换（预览 / 源码 / 对比）、少量互斥模式。
**什么时候不用**：页面级分组导航用扩展层 \`Tabs\`；两个选项且语义是开关用 \`Switch\`；标签页要各带面板 id 且等宽铺满用 \`SegmentedTabs\`。
**可访问性**：WAI-ARIA tabs 模式：\`role="tablist"\` + \`aria-label\`（\`label\` **必填**），方向键 / Home / End 游走并跟随选中，只有选中项是 tab stop。
**相关 token**：\`--dsw-alias-bg-layer-1\`（指示块）、\`--dsw-elevation-soft\`（指示块投影）、\`--dsw-alias-interactive-bg-hover\`（悬停）、\`--dsw-alias-label-primary\` / \`-secondary\`（选中 / 未选文字）、\`--dsw-alias-brand-primary\`（焦点环）。`,
      },
    },
  },
  args: {
    id: 'artifact-view',
    value: 'preview',
    options: OPTIONS,
    label: '产物视图',
    disabled: false,
    onChange: () => {},
  },
  argTypes: { onChange: { control: false }, options: { control: false } },
} satisfies Meta<typeof SegmentedControl<View>>
export default meta
type Story = StoryObj<typeof meta>

/** 受控用法 + 调用方渲染的面板（`aria-labelledby` 指回 tab）。 */
export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState<View>(args.value)
    return (
      <div style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
        <SegmentedControl {...args} value={value} onChange={setValue} />
        <div
          role="tabpanel"
          id={`${args.id}-${value}-panel`}
          aria-labelledby={`${args.id}-${value}`}
          style={{ font: 'var(--dsw-font-s-14)', color: 'var(--dsw-alias-label-secondary)' }}
        >
          当前面板：{OPTIONS.find((option) => option.value === value)?.label}
        </div>
      </div>
    )
  },
}

/** 单个分段锁定：`disabled` + `title`，键盘游走跳过它。 */
export const DisabledOption: Story = {
  render: (args) => {
    const [value, setValue] = useState<View>('preview')
    const options: readonly SegmentedControlOption<View>[] = [
      OPTIONS[0]!,
      OPTIONS[1]!,
      { value: 'diff', label: '对比', disabled: true, title: '只有一个版本，无可对比' },
    ]
    return <SegmentedControl {...args} options={options} value={value} onChange={setValue} />
  },
}

/** 整体禁用。 */
export const Disabled: Story = { args: { disabled: true } }
