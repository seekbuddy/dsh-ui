import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DateRangeField } from '@seekbuddy/dsh-ui/seekbuddy'
import type { DateRange, DateRangeFieldProps, DateRangePreset } from '@seekbuddy/dsh-ui/seekbuddy'

const labels: DateRangeFieldProps['labels'] = {
  previousMonth: '上个月',
  nextMonth: '下个月',
  previousYear: '上一年',
  nextYear: '下一年',
  presets: '快捷区间',
  cancel: '取消',
  apply: '应用',
  pickEnd: '请选择结束日期',
  open: '打开日期区间选择',
  dayLabel: (date, state) => {
    const [y, m, d] = date.split('-').map(Number)
    const parts = [`${y}年${m}月${d}日`]
    if (state.today) parts.push('今天')
    if (state.selected) parts.push('已选中')
    else if (state.inRange) parts.push('在所选区间内')
    return parts.join('，')
  },
}

const presets: DateRangePreset[] = [
  { key: 'today', label: '今天', range: { start: '2032-11-18', end: '2032-11-18' } },
  { key: 'last7', label: '近 7 天', range: { start: '2032-11-12', end: '2032-11-18' } },
  { key: 'last30', label: '近 30 天', range: { start: '2032-10-20', end: '2032-11-18' } },
  { key: 'thisMonth', label: '本月', range: { start: '2032-11-01', end: '2032-11-30' } },
]

const meta = {
  title: 'SeekBuddy 扩展层/DateRangeField',
  component: DateRangeField,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `区间触发框（效果图 \`design/date-range-picker.png\` 上方的输入框）：点开是 \`DateRangePicker\` 面板——预设 + 双月 + 取消 / 应用。「应用」回调新区间并关闭，「取消」只关闭（\`onCancel\` 被触发框接管，不再暴露）。显示值默认 \`YYYY/MM/DD - YYYY/MM/DD\`。

关闭与可访问性同 \`DateField\`。`,
      },
    },
  },
  args: {
    value: { start: '2032-11-12', end: '2032-11-18' },
    onChange: () => undefined,
    presets,
    today: '2032-11-18',
    locale: 'zh-CN',
    placeholder: '选择日期区间',
    labels,
  },
  argTypes: {
    onChange: { control: false },
    labels: { control: false },
    presets: { control: false },
    isDateDisabled: { control: false },
    formatValue: { control: false },
  },
  render: (args) => {
    const [value, setValue] = useState<DateRange | null>(args.value)
    return (
      <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
        <code>value = {JSON.stringify(value)}</code>
        <DateRangeField {...args} value={value} onChange={setValue} />
      </div>
    )
  },
} satisfies Meta<typeof DateRangeField>
export default meta
type Story = StoryObj<typeof meta>

/** 关闭态显示 2032/11/12 - 2032/11/18；点开改选后要按「应用」。 */
export const Default: Story = {}

/** 空值：显示 placeholder，面板里「应用」禁用直到选满两端。 */
export const Empty: Story = { args: { value: null } }

/** 禁用。 */
export const Disabled: Story = { args: { disabled: true } }

/** 打开态：`play` 点了触发框，弹层钉在下方（portal 到 body，Docs 页里看要点 Canvas）。 */
export const Open: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /打开日期区间选择$/ }))
  },
}
