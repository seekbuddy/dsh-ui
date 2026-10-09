import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DateField } from '@seekbuddy/dsh-ui/seekbuddy'
import type { DateFieldProps, IsoDate } from '@seekbuddy/dsh-ui/seekbuddy'

const labels: DateFieldProps['labels'] = {
  previousMonth: '上个月',
  nextMonth: '下个月',
  previousYear: '上一年',
  nextYear: '下一年',
  today: '今天',
  empty: '未选择日期',
  open: '打开日期选择',
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
  title: 'SeekBuddy 扩展层/DateField',
  component: DateField,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `单日期触发框（效果图 \`design/date-picker.png\` 上方的输入框 + 日历图标）：点开是 \`DatePicker\` 面板，点格或「今天」即回调并关闭，焦点回到触发框。触发框几何照上游 \`Input\`，显示值默认 \`YYYY/MM/DD\`（\`formatValue\` 可换）。

**关闭**：Escape（焦点回触发框）、点外面（焦点留在原处）、Tab 离开面板。**可访问性**：触发器 \`aria-haspopup="dialog" aria-expanded aria-controls\`，可访问名 = 显示值 + \`labels.open\`；弹层 \`role="dialog"\` 由上游 \`useAnchoredPosition\` 钉在下方、\`useDismissOnOutsidePointer\` 外点关闭。

**相关 token**：触发框 \`--dsw-alias-border-l4\` / focus \`--dsw-alias-brand-primary\` / 底 \`--dsw-alias-bg-layer-1\`；占位 \`--dsw-alias-label-dimmed\`；图标 \`--dsw-alias-label-tertiary\`；卡片 \`--dsw-specific-menu\` + \`--dsw-elevation-prominent\`。`,
      },
    },
  },
  args: {
    value: '2032-11-24',
    onChange: () => undefined,
    today: '2032-11-18',
    locale: 'zh-CN',
    placeholder: '选择日期',
    labels,
  },
  argTypes: {
    onChange: { control: false },
    labels: { control: false },
    isDateDisabled: { control: false },
    formatSelected: { control: false },
    formatValue: { control: false },
  },
  render: (args) => {
    const [value, setValue] = useState<IsoDate | null>(args.value)
    return <DateField {...args} value={value} onChange={setValue} />
  },
} satisfies Meta<typeof DateField>
export default meta
type Story = StoryObj<typeof meta>

/** 关闭态显示 2032/11/24；点开选一格即关。 */
export const Default: Story = {}

/** 空值：显示 placeholder。 */
export const Empty: Story = { args: { value: null } }

/** 禁用：不可点开。 */
export const Disabled: Story = { args: { disabled: true } }

/** 自定义显示：`formatValue` 输出中文长日期。 */
export const CustomFormat: Story = {
  args: {
    formatValue: (date) =>
      date === null
        ? ''
        : new Intl.DateTimeFormat('zh-CN', { dateStyle: 'long', timeZone: 'UTC' }).format(
            new Date(`${date}T00:00:00Z`),
          ),
  },
}

/** 打开态：`play` 点了触发框，弹层钉在下方（portal 到 body，Docs 页里看要点 Canvas）。 */
export const Open: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /打开日期选择$/ }))
  },
}
