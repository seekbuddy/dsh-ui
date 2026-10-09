import type { Meta, StoryObj } from '@storybook/react-vite'
import { StateDot } from '@seekbuddy/dsh-ui'
import type { StateDotState } from '@seekbuddy/dsh-ui'

/** 五态对应的可感知文字：圆点本身 aria-hidden，读屏只听得到这些。 */
const STATE_LABELS: Record<StateDotState, string> = {
  done: '已完成',
  warning: '需要关注',
  ongoing: '进行中',
  error: '出错',
  idle: '空闲',
}

const meta = {
  title: '镜像层（上游同步）/StateDot',
  component: StateDot,
  parameters: {
    docs: {
      description: {
        component: `状态圆点（五态）：\`done\`（绿）/ \`warning\`（琥珀）/ \`error\`（红）是实心点 + 10% 同色光晕；\`ongoing\`（蓝）是 3×3 像素矩阵的跑马灯动画；\`idle\`（灰，\`dsh-v0.1.5-rc.2\` 新增）表示被跟踪的对象当前没有活动——它不是第四种结果，所以用三级文字色退到背景里。\`size\` 是外径 px（默认 10，figma 尺寸）。上游同步件，源码不改。

**什么时候用**：流式工具行、任务列表、会话条目前面的状态标记，总是跟一段文字并排。
**什么时候不用**：需要文字本身带底色的状态用 \`Pill\`；断线 / 重连这种带操作的反馈用 \`ConnectionIndicator\`；加载圆环用扩展层 \`Spinner\`（\`ongoing\` 是"任务在跑"的语义标记，不是加载指示）。
**可访问性**：**自身 \`aria-hidden="true"\`，旁边必须有可感知文字**（"已完成 / 进行中…"），否则读屏用户完全得不到状态。\`ongoing\` 的动画目前没有 reduced-motion 分支。
**相关 token**：\`--dsw-alias-state-success-primary\`（done）、\`--dsw-alias-state-warn-primary\`（warning）、\`--dsw-alias-state-error-primary\`（error）、\`--dsw-alias-label-tertiary\`（idle）；\`ongoing\` 的蓝没有 alias token，组件级变量 \`--dsh-state-ongoing\` 钉在静态色阶 \`--dsw-static-deepseek-450\`。`,
      },
    },
  },
  args: { state: 'done', size: 10 },
} satisfies Meta<typeof StateDot>
export default meta
type Story = StoryObj<typeof meta>

/** 默认：`done`，10px 实心绿点带光晕。 */
export const Default: Story = {}

/** `done`：任务已完成。 */
export const Done: Story = { args: { state: 'done' } }

/** `warning`：需要用户关注（等待确认、有告警）。 */
export const Warning: Story = { args: { state: 'warning' } }

/** `ongoing`：进行中，像素矩阵顺时针跑马灯。 */
export const Ongoing: Story = { args: { state: 'ongoing' } }

/** `error`：出错。 */
export const ErrorState: Story = { args: { state: 'error' } }

/** `idle`：被跟踪的对象当前没有活动（rc.2 新增），灰色退后，不与三种结果色抢眼。 */
export const Idle: Story = { args: { state: 'idle' } }

/** 放大到 16px：光晕与核心按比例缩放，`ongoing` 的像素矩阵也按 viewBox 缩放。 */
export const Large: Story = { args: { state: 'ongoing', size: 16 } }

/** 并排样张：五态各配一段可感知文字——这才是消费者应有的写法，圆点单独出现对读屏是空的。 */
export const AllStates: Story = {
  render: (args) => (
    <ul style={{ display: 'flex', gap: 24, listStyle: 'none', margin: 0, padding: 0 }}>
      {(Object.keys(STATE_LABELS) as StateDotState[]).map((state) => (
        <li key={state} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <StateDot {...args} state={state} />
          {STATE_LABELS[state]}
        </li>
      ))}
    </ul>
  ),
}
