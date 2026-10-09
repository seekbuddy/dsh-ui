import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Switch } from '@seekbuddy/dsh-ui/seekbuddy'

const meta = {
  title: 'SeekBuddy 扩展层/Switch',
  component: Switch,
  parameters: {
    docs: {
      description: {
        component: `二态开关（WAI-ARIA switch，\`role="switch"\` + \`aria-checked\`），props 形状对齐 antd \`Switch\`：\`checked\` 受控 / \`defaultChecked\`（别名 \`defaultValue\`）非受控，\`checkedChildren\` / \`unCheckedChildren\` 轨道内文字，\`size\` 三档（\`large\` 44×22 / \`medium\` 36×20 默认 / \`small\` 28×16），\`onChange(checked, event)\` 与 \`onClick(checked, event)\`（onClick 先于 onChange，\`preventDefault\` 可拦下切换）。上游 primitives 没有开关——它的设置卡（ui-settings-plugins）是手写的——所以这是 SeekBuddy 扩展层组件（conventions.md §6.1）。

**什么时候用**：改动立刻生效的二态设置（任务启停、功能开关）。

**什么时候不用**：值要随表单一起提交的（用 checkbox）；三态或多选（用 Pill 组 / Menu）；需要"保存"才生效的设置页。

**与 antd 的差异（只有这两处）**：默认尺寸是 \`medium\`（36×20）不是 \`large\`；没有 \`loading\` 属性，需要时另议。

**可访问性**：没有轨道内文字时它是纯图形控件，必须传 \`aria-label\`（或 \`aria-labelledby\` 指向可见行标题）；\`disabled\` 时不可点、半透明；焦点环宽度与颜色来自主题的 \`focus.css\`。无过渡动画，reduced-motion 无需特判。

**相关 token**（配色与上游 \`Switch\` 一致）：\`--dsw-alias-brand-primary\`（开启轨道：亮色黑、暗色近白）、\`--dsw-alias-label-primary-foreground\`（开启时的滑块与轨道内文字，与轨道反色）、\`--dsw-alias-switch-thumb\`（关闭时的滑块：亮色白、暗色灰）、\`--dsw-alias-label-primary\` 的 40% \`color-mix\`（关闭轨道：亮色约等于 antd 的 45% 黑，暗色是 40% 白；上游用的 \`border-l3\` 只是 12–16% 的淡洗，压在滑块下不够分明）、\`--dsw-font-xs-13\` / \`--dsw-font-xxs-12\` / \`--dsw-font-xxxs-11\`（三档轨道内文字）。胶囊与滑块显式 \`corner-shape: round\`，否则主题的超椭圆圆角会把两端切方。`,
      },
    },
  },
  args: { defaultChecked: false, disabled: false, size: 'medium', 'aria-label': '启用任务' },
  argTypes: {
    onChange: { control: false },
    onClick: { control: false },
    checked: { control: false },
    size: { control: 'inline-radio', options: ['large', 'medium', 'small'] },
  },
} satisfies Meta<typeof Switch>
export default meta
type Story = StoryObj<typeof meta>

/** 默认：非受控，`defaultChecked` 给初值，点击自己切换。 */
export const Default: Story = {}

/** 受控：`checked` 由调用方持有，`onChange` 回写。 */
export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState(true)
    return <Switch {...args} checked={value} onChange={setValue} />
  },
}

/** 轨道内文字：`checkedChildren` / `unCheckedChildren`，轨道随内容加宽，滑块贴另一端。 */
export const WithChildren: Story = {
  args: { defaultChecked: true, checkedChildren: '开', unCheckedChildren: '关' },
}

/** 三档尺寸并排：`large` 44×22（antd 默认）、`medium` 36×20（默认）、`small` 28×16（表格行 / 紧凑列表）。 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Switch size="large" defaultChecked aria-label="大号开" />
      <Switch size="medium" defaultChecked aria-label="中号开" />
      <Switch size="small" defaultChecked aria-label="小号开" />
      <Switch size="large" defaultChecked checkedChildren="ON" unCheckedChildren="OFF" />
      <Switch size="medium" defaultChecked checkedChildren="ON" unCheckedChildren="OFF" />
      <Switch size="small" defaultChecked checkedChildren="ON" unCheckedChildren="OFF" />
    </div>
  ),
}

/** 禁用：半透明、不可点，两种值都要看。 */
export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Switch disabled aria-label="关闭且禁用" />
      <Switch disabled defaultChecked aria-label="开启且禁用" />
    </div>
  ),
}

/** `onClick` 里 `preventDefault` 可以拦下这次切换（例如先弹确认）。 */
export const GuardedByOnClick: Story = {
  render: () => {
    const [value, setValue] = useState(true)
    return (
      <label style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span>关闭前需确认</span>
        <Switch
          checked={value}
          aria-label="关闭前需确认"
          onClick={(next, event) => {
            if (!next && !window.confirm('确定停用？')) event.preventDefault()
          }}
          onChange={setValue}
        />
      </label>
    )
  },
}
