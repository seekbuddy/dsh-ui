import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Switch } from '@seekbuddy/dsh-ui'

const meta = {
  title: '镜像层（上游同步）/Switch',
  component: Switch,
  parameters: {
    docs: {
      description: {
        component: `两态开关，**完全受控**：\`checked\` 由调用方持有，点击时 \`onChange(next)\` 只报告"用户想切到哪个状态"，写入成功与否由调用方决定。上游同步件（\`dsh-v0.1.5-rc.2\` 新增），源码不改。

**⚠️ 需要 antd 风格接口时用扩展组件 [Switch](?path=/docs/seekbuddy-扩展层-switch--docs)**：那一个是 antd 兼容接口（\`size\`、\`checkedChildren\`、非受控 \`defaultChecked\`、\`onChange(checked, event)\`）。两者分别从根入口 \`@seekbuddy/dsh-ui\` 与 \`@seekbuddy/dsh-ui/seekbuddy\` 导出，接口不兼容，不要混用。

**什么时候用**：对齐上游界面、只需要最简单开关的场景（设置项的启用 / 停用）。
**什么时候不用**：需要尺寸、开关内文字、非受控用法时用扩展层 Switch；多选一用 \`Pill\` 或扩展层 Tabs；触发一次性动作用 \`Button\`。
**可访问性**：原生 \`<button type="button" role="switch" aria-checked>\`；\`label\` **必填**，作为 \`aria-label\`——没有可访问名就交付不了。\`disabled\` 除了"被锁定"，写入进行中也应置上，防止连点；锁定原因放 \`title\`（悬停可见）。
**相关 token**：\`--dsw-alias-border-l3\`（关态轨道）、\`--dsw-alias-brand-primary\`（开态轨道）、\`--dsw-alias-label-primary-foreground\`（滑块）。`,
      },
    },
  },
  args: { checked: false, label: '启用自动同步', disabled: false, onChange: () => {} },
  argTypes: { onChange: { control: false } },
} satisfies Meta<typeof Switch>
export default meta
type Story = StoryObj<typeof meta>

/** 受控用法：状态放在调用方，点击后由 `onChange(next)` 回写。 */
export const Default: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(args.checked)
    return (
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Switch {...args} checked={checked} onChange={setChecked} />
        <span>{checked ? '已开启' : '已关闭'}</span>
      </div>
    )
  },
}

/** 锁定：`disabled` + `title` 说明原因，悬停可见。 */
export const Locked: Story = {
  args: { checked: true, disabled: true, title: '由管理员统一开启，不可修改' },
}
