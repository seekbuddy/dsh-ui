import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { TimePicker } from '@seekbuddy/dsh-ui/seekbuddy'
import type { IsoTime } from '@seekbuddy/dsh-ui/seekbuddy'

const meta = {
  title: 'SeekBuddy 扩展层/TimePicker',
  component: TimePicker,
  parameters: {
    docs: {
      description: {
        component: `时 / 分两列（效果图 \`design/time-picker.png\`）：24 小时制，值是 \`'HH:mm'\` 字符串，全受控。点选或在列内按 ↑ / ↓ / Home / End 都**即时** \`onChange\`，没有暂存。

**什么时候用**：定时任务表单里选执行时刻。**什么时候不用**：要输入框 + 弹层 → 等 \`TimeField\`；要秒或 12 小时制 → 不支持，不在范围内。

**键盘**：每列一个 Tab 停靠点（焦点在 \`<ul role="listbox">\` 上，高亮项带描边），↑ / ↓ 到相邻可用项、Home / End 到首尾，不环绕；Tab 在时、分之间切换。

**空值**：\`value = null\` 时高亮 00 / 00 位置（浅底，\`aria-selected=false\`），第一次点选或按键才回调。

**边界**：\`min\` / \`max\` 把没有可用分钟的小时整列划掉、把当前小时下越界的分钟划掉；换小时导致越界时结果夹回窗口内。\`minuteStep\` 只列步长倍数。

**相关 token**：选中 \`--dsw-alias-button-primary-fill\` + \`--dsw-alias-label-primary-foreground\`（同上游 Button primary，暗色下底浅字深）；空值占位 \`--dsw-alias-bg-multi-select\`；hover \`--dsw-alias-interactive-bg-hover\`；禁用 \`--dsw-alias-label-dimmed\`；列间线 \`--dsw-alias-border-l1\`；列头 \`--dsw-alias-label-tertiary\` / \`--dsw-font-xxs-12\`；选项 \`--dsw-font-xs-13\`。`,
      },
    },
  },
  args: {
    value: '00:29',
    onChange: () => undefined,
    labels: { hours: '时', minutes: '分' },
  },
  argTypes: { onChange: { control: false }, labels: { control: false } },
  // 受控：把 args.value 接到本地 state，Controls 改 value 也会生效
  render: (args) => {
    const [value, setValue] = useState<IsoTime | null>(args.value)
    return (
      <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
        <code>{JSON.stringify(value)}</code>
        <TimePicker {...args} value={value} onChange={setValue} />
      </div>
    )
  },
} satisfies Meta<typeof TimePicker>
export default meta
type Story = StoryObj<typeof meta>

/** 效果图 `time-picker.png`：00:29 已选，两列各自把选中项滚到中间。 */
export const Default: Story = {}

/** 空值：高亮 00 / 00 但不回调，点一下或按 ↓ 才出值。 */
export const Empty: Story = { args: { value: null } }

/** `minuteStep={15}`：分钟列只有 00 / 15 / 30 / 45。 */
export const Step15: Story = { args: { minuteStep: 15, value: '09:30' } }

/** `min="09:00" max="17:30"`：09 之前、18 之后的小时划掉；选中 17 时 45 分以后划掉，换到 17 会夹回 17:30。 */
export const MinMax: Story = { args: { min: '09:00', max: '17:30', value: '16:45' } }

/** 英文列头 + `autoFocus`：挂载即把焦点放到小时列。 */
export const AutoFocus: Story = {
  args: { labels: { hours: 'Hours', minutes: 'Minutes' }, autoFocus: true, value: '08:00' },
}
