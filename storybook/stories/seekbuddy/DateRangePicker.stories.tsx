import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DateRangePicker } from '@seekbuddy/dsh-ui/seekbuddy'
import type { DateRange, DateRangePickerLabels, DateRangePreset } from '@seekbuddy/dsh-ui/seekbuddy'

// 消费者的真实写法：文案与预设区间由插件经 ctx.locale / 今天算好再传进来
const labels: DateRangePickerLabels = {
  previousMonth: '上个月',
  nextMonth: '下个月',
  previousYear: '上一年',
  nextYear: '下一年',
  presets: '快捷区间',
  cancel: '取消',
  apply: '应用',
  pickEnd: '请选择结束日期',
  dayLabel: (date, state) => {
    const [y, m, d] = date.split('-').map(Number)
    const parts = [`${y}年${m}月${d}日`]
    if (state.today) parts.push('今天')
    if (state.selected) parts.push('已选中')
    else if (state.inRange) parts.push('在所选区间内')
    if (state.disabled) parts.push('不可选')
    return parts.join('，')
  },
}

// 今天 = 2032-11-18（注入），预设按它算
const presets: DateRangePreset[] = [
  { key: 'today', label: '今天', range: { start: '2032-11-18', end: '2032-11-18' } },
  { key: 'yesterday', label: '昨天', range: { start: '2032-11-17', end: '2032-11-17' } },
  { key: 'last7', label: '近 7 天', range: { start: '2032-11-12', end: '2032-11-18' } },
  { key: 'last30', label: '近 30 天', range: { start: '2032-10-20', end: '2032-11-18' } },
  { key: 'thisMonth', label: '本月', range: { start: '2032-11-01', end: '2032-11-30' } },
  { key: 'lastMonth', label: '上月', range: { start: '2032-10-01', end: '2032-10-31' } },
]

const meta = {
  title: 'SeekBuddy 扩展层/DateRangePicker',
  component: DateRangePicker,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `区间面板（效果图 \`design/date-range-picker.png\`）：左侧预设列表、中间双月 \`Calendar mode="range"\`、底部「取消 / 应用」。**暂存语义**：面板内的点选只改草稿，\`onChange\` 只在「应用」时触发一次；「取消」丢弃草稿回到 \`value\` 并 \`onCancel\`。

**什么时候用**：运行记录筛选条、用量 / 账单报表的日期区间。**什么时候不用**：要输入框 + 弹层 → 等 \`DateRangeField\`；不需要暂存、点了就生效 → 直接用 \`Calendar mode="range"\`。

**预设**：由调用方算好传 \`presets[{ key, label, range }]\`（"近 7 天"依赖今天与时区，不归组件）；点预设 = 草稿换成它并翻月到起点；草稿与某预设**恰好相等**时该预设带勾。

**键盘**：预设列一个 Tab 停靠点，↑ / ↓ / Home / End 移高亮、Enter / Space 选；然后是日历（同 \`Calendar\`）、取消、应用。起点已选终点未选时 footer 左侧显示 \`labels.pickEnd\`（\`role="status"\`）。

**相关 token**：预设选中 \`--dsw-alias-bg-multi-select\`、勾 \`--dsw-alias-state-business-primary\`；分隔线 \`--dsw-alias-border-l1\`；状态文案 \`--dsw-alias-label-tertiary\`；网格部分同 \`Calendar\`。`,
      },
    },
  },
  args: {
    value: { start: '2032-11-12', end: '2032-11-18' },
    onChange: () => undefined,
    presets,
    today: '2032-11-18',
    locale: 'zh-CN',
    labels,
  },
  argTypes: {
    onChange: { control: false },
    onCancel: { control: false },
    labels: { control: false },
    presets: { control: false },
    isDateDisabled: { control: false },
  },
  // 受控：应用后把新区间写回 value，并把最近一次事件打印出来
  render: (args) => {
    const [value, setValue] = useState<DateRange | null>(args.value)
    const [event, setEvent] = useState('（还没有应用或取消）')
    return (
      <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
        <code>
          value = {JSON.stringify(value)} · {event}
        </code>
        <DateRangePicker
          {...args}
          value={value}
          onChange={(range) => {
            setValue(range)
            setEvent(`onChange(${range.start} → ${range.end})`)
          }}
          onCancel={() => setEvent('onCancel()')}
        />
      </div>
    )
  },
} satisfies Meta<typeof DateRangePicker>
export default meta
type Story = StoryObj<typeof meta>

/** 效果图 `date-range-picker.png`：预设「近 7 天」勾中，双月 11 / 12 月，带子 11-12 ～ 11-18。改选后要点「应用」value 才变。 */
export const Default: Story = {}

/** 没有预设：只剩日历 + 取消 / 应用。 */
export const NoPresets: Story = { args: { presets: undefined } }

/** 空值：什么都没选，「应用」禁用；点两格再应用。 */
export const Empty: Story = { args: { value: null } }

/** 取消回滚：先随便点一个区间，再点「取消」，草稿回到 value，`onCancel` 触发。 */
export const CancelRollback: Story = { args: { value: { start: '2032-11-01', end: '2032-11-05' } } }

/** 单月：`numberOfMonths={1}`，预设列照旧。 */
export const OneMonth: Story = { args: { numberOfMonths: 1 } }

/** 起点已选、终点未选：`play` 先点了 11-24，footer 显示「请选择结束日期」，悬停或键盘移动会画预览带；「应用」禁用。 */
export const Drafting: Story = {
  args: { value: null },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /^2032年11月24日/ }))
  },
}
