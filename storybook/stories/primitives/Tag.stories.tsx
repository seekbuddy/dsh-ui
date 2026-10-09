import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tag } from '@seekbuddy/dsh-ui'
import type { TagTone } from '@seekbuddy/dsh-ui'

/** 八种 tone 与各自的语义（顺序同上游 `TagTone` 定义）。 */
const TONES: ReadonlyArray<readonly [TagTone, string]> = [
  ['outline', '只读（默认）'],
  ['solid', '当前选中'],
  ['neutral', '中性事实'],
  ['quiet', '更弱的事实'],
  ['success', '健康 / 已启用'],
  ['info', '信息分类'],
  ['warning', '需要关注'],
  ['danger', '失败'],
]

const meta = {
  title: '镜像层（上游同步）/Tag',
  component: Tag,
  parameters: {
    docs: {
      description: {
        component: `只读胶囊徽标：给列表项、卡片标一个**不可点击**的事实——状态、分类、版本号。\`tone\` 选调色（默认 \`outline\`），文字由调用方传入并负责本地化。上游同步件（\`dsh-v0.1.5-rc.2\` 新增），源码不改。

**什么时候用**：状态标签（已启用 / 失败）、分类标签、"当前"标记（\`solid\`，一组里只放一个）；与状态无关的中性信息用 \`neutral\` / \`quiet\`。
**什么时候不用**：要点击、要选中的胶囊用 \`Pill\`——Tag **不接 \`onClick\`、没有 \`active\`**；状态点用 \`StateDot\`；视图切换用扩展层 [Tabs](?path=/docs/seekbuddy-扩展层-tabs--docs)。
**可访问性**：渲染为无语义的 \`<span data-tone>\`，只是文本。颜色不是唯一信号——\`success\` / \`danger\` 等 tone 的含义必须写进文字本身（写"失败"，而不是只把"构建"染红）。
**相关 token**：\`--dsw-alias-border-l4\`（outline 描边）、\`--dsw-alias-bg-layer-3\` / \`--dsw-alias-bg-module-platform\`（填充）、\`--dsw-alias-label-primary\` / \`-secondary\` / \`-tertiary\`（文字）、\`--dsw-alias-state-success-primary\` / \`-business-primary\` / \`-warn-primary\` / \`-error-primary\`（四种状态色）。`,
      },
    },
  },
  args: { tone: 'outline', children: '只读' },
  argTypes: {
    tone: { control: 'select', options: TONES.map(([tone]) => tone) },
    children: { control: 'text' },
  },
} satisfies Meta<typeof Tag>
export default meta
type Story = StoryObj<typeof meta>

/** 默认 `outline`：发丝描边 + 三级文字，最安静的只读形态。 */
export const Default: Story = {}

/** 八种 tone 一排看全；每个标签的文字都自带含义，不靠颜色区分。 */
export const AllTones: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {TONES.map(([tone, label]) => (
        <Tag key={tone} tone={tone}>
          {`${tone} · ${label}`}
        </Tag>
      ))}
    </div>
  ),
}
