import type { Meta, StoryObj } from '@storybook/react-vite'
import { Pill } from '@seekbuddy/dsh-ui'
import { Timeline } from '@seekbuddy/dsh-ui/seekbuddy/timeline'
import type { TimelineGroup } from '@seekbuddy/dsh-ui/seekbuddy/timeline'

// 消费者的真实写法：状态文案与 meta 由插件经 ctx.locale / Intl 算好再传进来
const statusLabels = { running: '运行中', succeeded: '成功', failed: '失败', canceled: '已取消' }

const today: TimelineGroup = {
  key: 'today',
  heading: '今天',
  items: [
    {
      key: 'run_4',
      status: 'failed',
      title: (
        <>
          每日 AI 新闻简报 <Pill>Work</Pill>
        </>
      ),
      meta: ['手动触发', '14:52 - 1m 13s'],
      message: '你的套餐用量已用完，请升级套餐或等待用量重置',
    },
    {
      key: 'run_3',
      status: 'succeeded',
      title: (
        <>
          股价监控与预警 <Pill>Work</Pill>
        </>
      ),
      meta: ['定时触发', '08:00 - 3m 31s'],
    },
    {
      key: 'run_2',
      status: 'succeeded',
      title: (
        <>
          股价监控与预警 <Pill>Work</Pill>
        </>
      ),
      meta: ['手动触发', '07:54 - 1m 21s'],
    },
    {
      key: 'run_1',
      status: 'succeeded',
      title: (
        <>
          每日 AI 新闻简报 <Pill>Work</Pill>
        </>
      ),
      meta: ['手动触发', '07:53 - 2m 45s'],
    },
  ],
}

const yesterday: TimelineGroup = {
  key: 'yesterday',
  heading: '昨天',
  items: [
    {
      key: 'run_0',
      status: 'canceled',
      title: (
        <>
          每日 AI 新闻简报 <Pill>Work</Pill>
        </>
      ),
      meta: ['定时触发', '08:00 - 0m 12s'],
      message: '任务已被停用',
    },
  ],
}

const meta = {
  title: 'SeekBuddy 扩展层/Timeline',
  component: Timeline,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `运行记录时间线：按日期分桶的 \`groups\`，每组一个有序列表；每项左侧状态徽标（运行中转圈 / 绿勾 / 红叉 / 灰横线）、标题（可含 \`Pill\`）、灰色 meta 行、可选消息行（\`failed\` 红字），竖轨在组内连续。

**什么时候用**：按时间倒序展示一串有状态的事件——任务的运行记录、同步历史。
**什么时候不用**：只是普通列表没有状态与时序 → 直接用列表；要横向步骤条 → 现在不支持。
**可访问性**：\`<section aria-label>\` → \`<h3>\` + \`<ol>\`；徽标 aria-hidden，状态靠 \`statusLabels\` 的隐藏文本朗读；\`running\` 项自身是 role=status；给了 \`onSelect\` 整项是 button 且有焦点环。
**相关 token**：\`--dsw-alias-state-success-primary\`、\`--dsw-alias-state-error-primary\`、\`--dsw-alias-border-l1\`、\`--dsw-alias-label-tertiary\`。

组件只管排版：分桶、排序、文案（statusLabels / meta）、时间格式都留在调用方。`,
      },
    },
  },
  args: { label: '运行记录', statusLabels, groups: [today] },
  argTypes: { groups: { control: false }, statusLabels: { control: false } },
} satisfies Meta<typeof Timeline>
export default meta
type Story = StoryObj<typeof meta>

/** 效果图 design/timeline.png：今天四条，第一条失败带错误消息。 */
export const Default: Story = {}

/** 效果图 design/timeline-running.png：第一条还在跑——灰色转圈、只有开始时间、没有消息行。 */
export const Running: Story = {
  args: {
    groups: [
      {
        ...today,
        items: [
          {
            key: 'run_4',
            status: 'running',
            title: (
              <>
                每日 AI 新闻简报 <Pill>Work</Pill>
              </>
            ),
            meta: ['手动触发', '14:52'],
          },
          ...today.items.slice(1),
        ],
      },
    ],
  },
}

/** 多分组：竖轨组内连续、组间留白；昨天那条是 canceled（灰横线 + 普通灰消息）。 */
export const Groups: Story = { args: { groups: [today, yesterday] } }

/** 给了 onSelect 的项整项可点（hover 标题变色、Tab 可达、焦点环）。 */
export const Selectable: Story = {
  args: {
    groups: [
      {
        ...today,
        items: today.items.map((item) => ({ ...item, onSelect: () => alert(`打开会话：${item.key}`) })),
      },
    ],
  },
}

/** 只有一桶时省掉 heading。 */
export const Headless: Story = { args: { groups: [{ key: 'all', items: today.items.slice(0, 2) }] } }
