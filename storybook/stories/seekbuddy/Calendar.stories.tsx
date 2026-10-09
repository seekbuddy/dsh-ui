import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Calendar } from '@seekbuddy/dsh-ui/seekbuddy'
import type {
  CalendarBaseProps,
  CalendarLabels,
  CalendarSingleProps,
  DateRangeDraft,
  IsoDate,
  IsoMonth,
} from '@seekbuddy/dsh-ui/seekbuddy'

// 消费者的真实写法：文案由插件经 ctx.locale 算好再传进来，组件内没有一个中文字
const labels: CalendarLabels = {
  previousMonth: '上个月',
  nextMonth: '下个月',
  previousYear: '上一年',
  nextYear: '下一年',
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

const TODAY: IsoDate = '2032-11-18'

const meta = {
  title: 'SeekBuddy 扩展层/Calendar',
  component: Calendar,
  parameters: {
    docs: {
      description: {
        component: `月份网格（WAI-ARIA grid）：单选模式下点格即 \`onChange\`；区间模式两次点选（第一次回调 \`{ start, end: null }\` 草稿，第二次回调排好序的 \`DateRange\`，反向点选自动交换，再点一次重新开始），起点已选后悬停 / 键盘焦点画预览带；\`DatePicker\` / \`DateRangePicker\` 都由它组合而成，公开导出是为了让表单可以**内嵌**日历而不带弹层与 footer。值一律 ISO 字符串（\`'YYYY-MM-DD'\`），全受控，无 \`defaultValue\`、无实例方法。

**什么时候用**：表单里要一眼看到整月并直接点选（内嵌形态）。**什么时候不用**：要触发框 + 弹层 → 等 \`DateField\`；只需要"今天"快捷与所选日期回显 → 用 \`DatePicker\`。

**键盘**：整个日历只有一格在 Tab 序里（选中格 → 今天 → 首个可用格）；←/→ ±1 天，↑/↓ ±7 天，Home / End 到本周首尾，PageUp / PageDown ±1 月，Shift+PageUp / PageDown ±1 年，Enter / Space 选中；焦点越出当前可见月时自动翻月并保持焦点。前后月补位格灰字可点（点了翻月并选中），不进 Tab 序。

**可访问性**：\`<table role="grid" aria-labelledby=月标题>\`，\`<th scope="col" abbr=全名>\` 星期，\`<td role="gridcell" aria-selected aria-disabled>\` 内一个 \`<button aria-label={labels.dayLabel(date, state)}>\`；月标题 \`aria-live="polite"\`；星期 / 月份名由 \`locale\` 经 Intl 生成。

**区间三态**：已提交区间的格带 \`data-range="start" | "middle" | "end"\`（单日区间为 \`single\`），预览带用 \`data-range-preview\` 同样取值；补位格不画带。\`labels.dayLabel\` 的 \`state.inRange\` 在已提交区间内（含两端）为真。

**相关 token**：区间中段与预览带同色 \`--dsw-alias-interactive-bg-hover\`；选中 \`--dsw-alias-button-primary-fill\` + \`--dsw-alias-label-primary-foreground\`（同上游 Button primary，暗色下底浅字深）；今天 \`--dsw-alias-state-business-primary\` 描边（也是焦点环）；补位 / 禁用 \`--dsw-alias-label-dimmed\`；hover \`--dsw-alias-interactive-bg-hover\`；星期 \`--dsw-alias-label-tertiary\` + \`--dsw-font-xxs-12\`；日期 \`--dsw-font-xs-13\`；标题 \`--dsw-font-s-strong-14\`。`,
      },
    },
  },
  args: {
    mode: 'single',
    value: '2032-11-24',
    onChange: () => undefined,
    today: TODAY,
    locale: 'zh-CN',
    labels,
  },
  argTypes: { onChange: { control: false }, labels: { control: false }, isDateDisabled: { control: false } },
  // 受控：把 args.value 接到本地 state，Controls 改 value 也会生效
  render: (args) => {
    const [value, setValue] = useState<IsoDate | null>((args as CalendarSingleProps).value)
    return <Calendar {...(args as CalendarSingleProps)} value={value} onChange={setValue} />
  },
} satisfies Meta<typeof Calendar>
export default meta
type Story = StoryObj<typeof meta>

/** 单选：2032-11-24 已选中，11-18 是注入的"今天"（描边）。Tab 进来后用键盘走一走。 */
export const Single: Story = {}

/** 空值：没有选中格，Tab 落在今天格上。 */
export const Empty: Story = { args: { value: null } }

/** 禁用规则：`min` / `max` 圈住 11-10 ～ 11-25，且 `isDateDisabled` 把周末划掉（删除线 + 不可点）。 */
export const DisabledRules: Story = {
  args: {
    min: '2032-11-10',
    max: '2032-11-25',
    isDateDisabled: (date) => {
      const [y, m, d] = date.split('-').map(Number)
      const weekday = new Date(Date.UTC(y ?? 0, (m ?? 1) - 1, d ?? 1)).getUTCDay()
      return weekday === 0 || weekday === 6
    },
  },
}

/** `weekStart={0}`：周日开头（美式），列名与补位随之移动。 */
export const WeekStartSunday: Story = { args: { weekStart: 0 } }

/** `locale="en-US"`：星期与月标题都由 Intl 出（"Mon Tue …" / "November 2032"），组件本身不含文案。 */
export const LocaleEnUS: Story = {
  args: {
    locale: 'en-US',
    labels: {
      previousMonth: 'Previous month',
      nextMonth: 'Next month',
      previousYear: 'Previous year',
      nextYear: 'Next year',
      dayLabel: (date, state) =>
        [
          new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeZone: 'UTC' }).format(
            new Date(`${date}T00:00:00Z`),
          ),
          state.today ? 'today' : null,
          state.selected ? 'selected' : null,
          state.disabled ? 'unavailable' : null,
        ]
          .filter(Boolean)
          .join(', '),
    },
  },
}

/** 受控月份：`month` / `onMonthChange` 由外层持有，翻页不再改内部状态（面板里"今天"按钮要翻月就靠这个）。 */
export const ControlledMonth: Story = {
  render: (args) => {
    const [value, setValue] = useState<IsoDate | null>((args as CalendarSingleProps).value)
    const [month, setMonth] = useState<IsoMonth>('2032-11')
    return (
      <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
        <code>month = {month}</code>
        <Calendar
          {...(args as CalendarSingleProps)}
          value={value}
          onChange={setValue}
          month={month}
          onMonthChange={setMonth}
        />
      </div>
    )
  },
}

/** 区间模式默认双月：2032-11-20 ～ 11-24 已提交，起止深色、中段浅色带。再点一格会重新开始选。 */
export const Range: Story = {
  render: (args) => {
    const [value, setValue] = useState<DateRangeDraft | null>({ start: '2032-11-20', end: '2032-11-24' })
    return <Calendar {...(args as CalendarBaseProps)} mode="range" value={value} onChange={setValue} />
  },
}

/** 起点已选、终点未选的草稿态：悬停或用键盘移动焦点即可看到预览带，点第二格提交（反向自动交换）。 */
export const RangeDrafting: Story = {
  render: (args) => {
    const [value, setValue] = useState<DateRangeDraft | null>({ start: '2032-11-20', end: null })
    return (
      <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
        <code>{JSON.stringify(value)}</code>
        <Calendar {...(args as CalendarBaseProps)} mode="range" value={value} onChange={setValue} />
      </div>
    )
  },
}

/** 跨月区间：带子在两张 grid 间连续，11 月里 12 月的补位格不重复画带。 */
export const RangeAcrossMonths: Story = {
  render: (args) => {
    const [value, setValue] = useState<DateRangeDraft | null>({ start: '2032-11-29', end: '2032-12-03' })
    return <Calendar {...(args as CalendarBaseProps)} mode="range" value={value} onChange={setValue} />
  },
}

/** 区间 + 单月：`numberOfMonths={1}` 时头部恢复前后年按钮。 */
export const RangeOneMonth: Story = {
  render: (args) => {
    const [value, setValue] = useState<DateRangeDraft | null>({ start: '2032-11-08', end: '2032-11-12' })
    return (
      <Calendar {...(args as CalendarBaseProps)} mode="range" numberOfMonths={1} value={value} onChange={setValue} />
    )
  },
}
