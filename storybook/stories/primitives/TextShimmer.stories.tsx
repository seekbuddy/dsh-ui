import type { Meta, StoryObj } from '@storybook/react-vite'
import { TextShimmer } from '@seekbuddy/dsh-ui'

const meta = {
  title: '镜像层（上游同步）/TextShimmer',
  component: TextShimmer,
  parameters: {
    docs: {
      description: {
        component: `给一段文字加"正在进行"的流光：\`active\` 为真时一道高光从左到右扫过，为假时是普通文字，真实文字节点始终不变（切换状态不重挂载，行高、选区、读屏焦点都不跳）。\`dsh-v0.2.0-rc.2\` 重做了实现：高光不再是文字自己的渐变，而是叠在上面的一层 \`aria-hidden\` + \`inert\` 的**装饰副本**，用一条移动的 mask 扫过，颜色取 \`--dsw-alias-label-shimmer\`；所以 \`children\` 现在可以是节点——一整行（标题 + 摘要）包在外层 \`TextShimmer active\` 里，行内每段文字各包一个不带 \`active\` 的 \`TextShimmer\`，共享同一道高光。上游同步件（\`dsh-v0.1.7-rc.1\` 新增），源码只加了 Server Component 的 context 守卫（\`UPSTREAM.md\`）。

**什么时候用**：一行里的运行态标题——工具调用"正在读取…"、子任务名、规划步骤，跑完就停在同一段文字上。
**什么时候不用**：整块加载占位用 \`Spinner\` / 骨架；表达成功 / 失败等结果态用 \`StateDot\` 或 \`StatusBadge\`。图标放在 \`TextShimmer\` 外面；行内的装饰分隔点加 \`data-shimmer-decoration\`，它的底色会跟着高光。
**可访问性**：纯视觉效果，文字本身就是可访问内容；\`prefers-reduced-motion\` 下不动画。运行态要让读屏知道时，由外层 \`aria-live\` / \`aria-busy\` 负责，本组件不报状态。
**相关 token**：\`--dsw-alias-label-shimmer\`（高光色，亮色 30% 黑、暗色 45% 白）；底下的真实文字颜色继承所在元素。`,
      },
    },
  },
  args: { children: '正在读取 src/markdown/render.tsx', active: true },
} satisfies Meta<typeof TextShimmer>
export default meta
type Story = StoryObj<typeof meta>

/** 运行中：高光循环扫过。 */
export const Default: Story = {}

/** 结束：同一个节点，只是停掉动画。 */
export const Inactive: Story = { args: { active: false, children: '已读取 src/markdown/render.tsx' } }

/** 颜色跟随父元素：放进次级文字色的行里。 */
export const InheritsColor: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 8, font: 'var(--dsw-font-s-14)' }}>
      <span style={{ color: 'var(--dsw-alias-label-primary)' }}>
        <TextShimmer {...args} />
      </span>
      <span style={{ color: 'var(--dsw-alias-label-secondary)' }}>
        <TextShimmer {...args}>正在规划下一步</TextShimmer>
      </span>
    </div>
  ),
}

/** 一整行共享一道高光（0.2.0 起）：外层 `active` 包住标题与摘要，行内每段文字各自再包一个不带 `active` 的 `TextShimmer`。 */
export const SharedRow: Story = {
  render: () => (
    <div style={{ font: 'var(--dsw-font-s-14)', color: 'var(--dsw-alias-label-secondary)' }}>
      <TextShimmer active>
        <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          <TextShimmer>正在读取</TextShimmer>
          <span
            data-shimmer-decoration
            style={{ width: 3, height: 3, borderRadius: '999px', background: 'currentColor' }}
          />
          <TextShimmer>src/markdown/render.tsx</TextShimmer>
        </span>
      </TextShimmer>
    </div>
  ),
}
