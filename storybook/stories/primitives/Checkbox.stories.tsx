import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Checkbox } from '@seekbuddy/dsh-ui'

const meta = {
  title: '镜像层（上游同步）/Checkbox',
  component: Checkbox,
  parameters: {
    docs: {
      description: {
        component: `原生复选框加可见文字，**完全受控**：\`checked\` 由调用方持有，\`onChange(next)\` 只报告想切到的状态。整个 \`<label>\` 都可点，键盘、表单语义全是原生的。上游同步件（\`dsh-v0.1.7-rc.1\` 新增），源码不改。

**什么时候用**：多个相互独立的选项里各自勾选（批量操作的"全选"、表单里的同意条款、多选过滤）。
**什么时候不用**：单个立即生效的开关用 \`Switch\`；多选一用 \`SegmentedControl\` / \`Pill\`；没有文字说明的纯图标勾选不在它的范围里。
**可访问性**：原生 \`<input type="checkbox">\` 包在 \`<label>\` 里，\`label\` **必填**，既是可见文字也是可访问名；\`disabled\` 时的原因放 \`title\`。
**相关 token**：\`--dsw-alias-brand-primary\`（勾选色，走 \`accent-color\`）、\`--dsw-alias-label-primary\`（文字）。`,
      },
    },
  },
  args: { checked: false, label: '同时删除本地缓存', disabled: false, onChange: () => {} },
  argTypes: { onChange: { control: false } },
} satisfies Meta<typeof Checkbox>
export default meta
type Story = StoryObj<typeof meta>

/** 受控用法：状态在调用方，`onChange(next)` 回写。 */
export const Default: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(args.checked)
    return <Checkbox {...args} checked={checked} onChange={setChecked} />
  },
}

/** 一组独立选项：每个各自受控。 */
export const Group: Story = {
  render: () => {
    const [picked, setPicked] = useState<ReadonlySet<string>>(new Set(['skills']))
    const toggle = (key: string) => (next: boolean) =>
      setPicked((all) => {
        const copy = new Set(all)
        if (next) copy.add(key)
        else copy.delete(key)
        return copy
      })
    return (
      <div style={{ display: 'grid', gap: 8 }}>
        <Checkbox label="技能" checked={picked.has('skills')} onChange={toggle('skills')} />
        <Checkbox label="连接器" checked={picked.has('connectors')} onChange={toggle('connectors')} />
        <Checkbox label="插件" checked={picked.has('plugins')} onChange={toggle('plugins')} />
      </div>
    )
  },
}

/** 锁定：`disabled` + `title` 说明原因。 */
export const Disabled: Story = { args: { checked: true, disabled: true, title: '由管理员统一设置' } }
