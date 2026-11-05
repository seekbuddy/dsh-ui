import type { Meta, StoryObj } from '@storybook/react-vite'
import { QuotePreview } from '@seekbuddy/dsh-ui'

const meta = {
  title: '镜像层（上游同步）/QuotePreview',
  component: QuotePreview,
  parameters: {
    docs: {
      description: {
        component: `引用片段的行内预览：显示用户选中引用的原文，文字被截断时悬停会弹出完整内容。传 \`removal\` 时引号图标变成移除按钮（输入框里用），不传就是已发送消息里的只读引用。上游同步件（\`dsh-v0.2.2-rc.1\` 新增），源码不改。

**什么时候用**：输入框和已发送消息里展示「引用了哪段文字」。
**什么时候不用**：展示一整段 Markdown 引用块（\`MarkdownText\` 会渲染 \`>\`）；要把选中文字变成 Markdown 引用文本时用 \`/markdown\` 入口的 \`formatQuoteText\`。
**可访问性**：移除按钮的读屏名称取 \`removal.label\`，必须本地化。`,
      },
    },
  },
  args: { text: '把重试间隔改成指数退避，上限 30 秒' },
} satisfies Meta<typeof QuotePreview>
export default meta
type Story = StoryObj<typeof meta>

/** 已发送消息里的只读引用。 */
export const Default: Story = {}

/** 输入框里的引用：引号图标悬停变成移除按钮。 */
export const Removable: Story = {
  args: { removal: { label: '移除引用', onRemove: () => {} } },
}

/** 超长文本被截断，悬停查看完整内容。 */
export const Truncated: Story = {
  args: {
    text: '这一段选中的文字很长很长，超过了容器宽度，所以会被截断成一行显示，鼠标悬停时会弹出完整原文，方便确认引用的是哪一段内容。',
  },
  render: (args) => (
    <div style={{ width: 280 }}>
      <QuotePreview {...args} />
    </div>
  ),
}
