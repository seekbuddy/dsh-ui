import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { TimeField } from '@seekbuddy/dsh-ui/seekbuddy'
import type { IsoTime } from '@seekbuddy/dsh-ui/seekbuddy'

const meta = {
  title: 'SeekBuddy 扩展层/TimeField',
  component: TimeField,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `时间触发框（效果图 \`design/time-picker.png\` 上方的输入框 + 时钟图标）：点开是 \`TimePicker\` 两列。点选**不关闭**（通常要连调时和分），Escape / 点外面 / Tab 离开才关。显示值默认就是 \`HH:mm\`。

关闭与可访问性同 \`DateField\`；图标用上游 \`IconClockOutlineRegular\`。`,
      },
    },
  },
  args: {
    value: '00:29',
    onChange: () => undefined,
    placeholder: '选择时间',
    labels: { hours: '时', minutes: '分', open: '打开时间选择' },
  },
  argTypes: { onChange: { control: false }, labels: { control: false }, formatValue: { control: false } },
  render: (args) => {
    const [value, setValue] = useState<IsoTime | null>(args.value)
    return (
      <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
        <code>value = {JSON.stringify(value)}</code>
        <TimeField {...args} value={value} onChange={setValue} />
      </div>
    )
  },
} satisfies Meta<typeof TimeField>
export default meta
type Story = StoryObj<typeof meta>

/** 关闭态显示 00:29；点开两列即时改值，面板保持打开。 */
export const Default: Story = {}

/** 空值 + `minuteStep={15}`。 */
export const Empty: Story = { args: { value: null, minuteStep: 15 } }

/** 禁用。 */
export const Disabled: Story = { args: { disabled: true } }

/** 打开态：`play` 点了触发框，弹层钉在下方（portal 到 body，Docs 页里看要点 Canvas）。 */
export const Open: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /打开时间选择$/ }))
  },
}
