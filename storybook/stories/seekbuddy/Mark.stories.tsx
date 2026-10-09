import type { Meta, StoryObj } from '@storybook/react-vite'
import { Mark } from '@seekbuddy/dsh-ui/seekbuddy'

const meta = {
  title: 'SeekBuddy 扩展层/Mark',
  component: Mark,
  parameters: {
    docs: {
      description: {
        component: `行内**状态标记**：一个 \`kind\` 对应一种固定语义、一种固定图形与颜色，首版只有 \`official\`（平台官方出品 / 已认证）。卡片标题与详情大标题挂官方标时用它，保证各处图形与颜色一致。

**不是通用 Badge**：不开放 \`icon\` / \`color\` 之类自由 props，图形与颜色由扩展层按 \`kind\` 定死，调用方只能选 kind。**要加新标记**：在 \`Mark.tsx\` 的 \`MarkKind\` 联合与 \`GLYPHS\` 表各加一项、\`Mark.module.css\` 加一个颜色 class、这里加一个 story，调用方零改动。

**结构与可访问性**：\`<span role="img" aria-label tabIndex={0}>\` 包一枚 \`aria-hidden\` 的内联 SVG（24 网格、2px 描边、\`currentColor\`，不引 lucide）；\`label\` 必填、由调用方本地化，同时充当读屏名称与 Tooltip 文本；\`tooltip\` 默认开、包上游 \`Tooltip\`（\`side="top"\`，键盘聚焦即时出泡），传 \`false\` 时不包 Tooltip、不注册任何浮层与事件。焦点环与 Tabs / Switch / Card 同一套 business-primary。

**尺寸与排版**：\`size\` 14 / 16 / 18 / 20 / 24，默认 16；卡片标题行用 14 / 16，详情大标题用 20 / 24。行内元素，\`line-height: 0\` + \`vertical-align: middle\`，不撑高行盒，无外边距，间距归调用方的行。

**token**：\`official\` 描边 \`--dsw-alias-state-business-primary\`；焦点环同 token；无动效，Reduced Motion 天然满足。`,
      },
    },
  },
  args: { kind: 'official', label: '官方认证', size: 16, tooltip: true },
  argTypes: {
    kind: { control: 'inline-radio', options: ['official'] },
    size: { control: 'inline-radio', options: [14, 16, 18, 20, 24] },
  },
} satisfies Meta<typeof Mark>
export default meta
type Story = StoryObj<typeof meta>

/** 默认：`official`，16px，带 Tooltip。悬停或 Tab 聚焦看气泡。 */
export const Default: Story = {}

/** 五个尺寸并排，各自贴在同字号的文字旁，看基线对齐与行高不被撑开。 */
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      {([14, 16, 18, 20, 24] as const).map((size) => (
        <div
          key={size}
          style={{ display: 'flex', alignItems: 'center', gap: 6, font: `500 ${size}px/1.4 var(--dsw-font-family)` }}
        >
          <span>股价监控与预警</span>
          <Mark {...args} size={size} />
          <span style={{ color: 'var(--dsw-alias-label-tertiary)', font: 'var(--dsw-font-xs-13)' }}>size={size}</span>
        </div>
      ))}
    </div>
  ),
}

/** 卡片标题行（14）与详情大标题行（24）的真实落位。 */
export const InTitles: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 16, width: 360 }}>
      <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6, font: 'var(--dsw-font-s-strong-14)' }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>每日 AI 新闻简报</span>
        <Mark {...args} size={14} />
      </h3>
      <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, font: 'var(--dsw-font-l-20)' }}>
        <span>每日 AI 新闻简报</span>
        <Mark {...args} size={24} />
      </h2>
    </div>
  ),
}

/** `tooltip={false}`：旁边已有文字说明时关掉气泡，不再注册浮层；光标也回到默认。 */
export const WithoutTooltip: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Mark {...args} tooltip={false} />
      <span>官方认证</span>
    </div>
  ),
}

/** 键盘聚焦：Tab 到标记上出现 business-primary 焦点环，Tooltip 即时出泡（无 hover 延迟）。 */
export const KeyboardFocus: Story = {
  play: async ({ canvasElement }) => {
    canvasElement.querySelector<HTMLElement>('[role="img"]')?.focus()
  },
}
