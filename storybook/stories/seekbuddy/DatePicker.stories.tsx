import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DatePicker } from '@seekbuddy/dsh-ui/seekbuddy'
import type { DatePickerLabels, IsoDate } from '@seekbuddy/dsh-ui/seekbuddy'

// 消费者的真实写法：文案由插件经 ctx.locale 算好再传进来，组件内没有一个中文字
const labels: DatePickerLabels = {
  previousMonth: '上个月',
  nextMonth: '下个月',
  previousYear: '上一年',
  nextYear: '下一年',
  today: '今天',
  empty: '未选择日期',
  dayLabel: (date, state) => {
    const [y, m, d] = date.split('-').map(Number)
    const parts = [`${y}年${m}月${d}日`]
    if (state.today) parts.push('今天')
    if (state.selected) parts.push('已选中')
    if (state.disabled) parts.push('不可选')
    return parts.join('，')
  },
}

const meta = {
  title: 'SeekBuddy 扩展层/DatePicker',
  component: DatePicker,
  parameters: {
    docs: {
      description: {
        component: `单日期面板（效果图 \`design/date-picker.png\`）：\`Calendar mode="single"\` + 底部信息条——左侧所选日期（\`formatSelected\`，默认 Intl 中等日期 + 短星期），右侧「今天」快捷。点格即 \`onChange\`，没有暂存 / 应用。

**什么时候用**：表单里选一个日期（如一次性任务的执行日）。**什么时候不用**：要输入框 + 弹层 → 等 \`DateField\`；选区间 → \`DateRangePicker\`；只要网格不要 footer → 直接用 \`Calendar\`。

**「今天」**：翻到本月并选中今天；被 \`min\` / \`max\` / \`isDateDisabled\` 挡住时按钮禁用。月份由面板持有，所以 value 已经是今天、只是翻到了别的月，点它也会把页翻回来。

**可访问性**：网格部分同 \`Calendar\`；footer 文案是纯文本，「今天」是上游 \`Button\`。

**相关 token**：footer 分隔线 \`--dsw-alias-border-l1\`；已选文案 \`--dsw-alias-label-secondary\`、空态 \`--dsw-alias-label-tertiary\`（\`--dsw-font-xs-13\`）；「今天」\`--dsw-alias-state-business-primary\`。`,
      },
    },
  },
  args: {
    value: '2032-11-24',
    onChange: () => undefined,
    today: '2032-11-18',
    locale: 'zh-CN',
    labels,
  },
  argTypes: {
    onChange: { control: false },
    labels: { control: false },
    isDateDisabled: { control: false },
    formatSelected: { control: false },
  },
  // 受控：把 args.value 接到本地 state，Controls 改 value 也会生效
  render: (args) => {
    const [value, setValue] = useState<IsoDate | null>(args.value)
    return <DatePicker {...args} value={value} onChange={setValue} />
  },
} satisfies Meta<typeof DatePicker>
export default meta
type Story = StoryObj<typeof meta>

/** 效果图 `date-picker.png`：2032-11-24 已选，footer 显示「2032年11月24日周三」，右侧「今天」。 */
export const Default: Story = {}

/** 空值：footer 显示 `labels.empty`，Tab 落在今天格。 */
export const Empty: Story = { args: { value: null } }

/** 今天被 `max` 挡住（max = 昨天）：「今天」按钮禁用，网格里今天格划掉。 */
export const TodayDisabled: Story = { args: { max: '2032-11-17', value: '2032-11-10' } }

/** 自定义 footer 格式：`formatSelected` 输出 ISO 原文。 */
export const CustomFormat: Story = { args: { formatSelected: (date) => date } }

/** `locale="en-US"` + 英文 labels：footer 变成 "Wed, Nov 24, 2032"。 */
export const LocaleEnUS: Story = {
  args: {
    locale: 'en-US',
    labels: {
      ...labels,
      previousMonth: 'Previous month',
      nextMonth: 'Next month',
      previousYear: 'Previous year',
      nextYear: 'Next year',
      today: 'Today',
      empty: 'No date selected',
      dayLabel: (date, state) =>
        [date, state.today ? 'today' : null, state.selected ? 'selected' : null, state.disabled ? 'unavailable' : null]
          .filter(Boolean)
          .join(', '),
    },
  },
}

/** 翻到别的月再点「今天」：页翻回 2032-11 并选中 11-18（value 已是今天时也翻页）。 */
export const TodayTurnsPage: Story = {
  render: (args) => {
    const [value, setValue] = useState<IsoDate | null>('2032-11-18')
    return <DatePicker {...args} value={value} onChange={setValue} month={undefined} />
  },
}
