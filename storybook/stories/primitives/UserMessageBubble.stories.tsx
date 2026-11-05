import type { Meta, StoryObj } from '@storybook/react-vite'
import { ReferenceChip, UserMessageBubble, UserTextRun } from '@seekbuddy/dsh-ui'

const meta = {
  title: '镜像层（上游同步）/UserMessageBubble',
  component: UserMessageBubble,
  parameters: {
    docs: {
      description: {
        component: `用户消息的气泡表面：只画底色、圆角和内边距，**不管行内定位和操作按钮**，内容由调用方给。接受原生 \`div\` 属性。上游同步件（\`dsh-v0.2.2-rc.1\` 新增），源码不改。

**什么时候用**：展示用户已发送的一条消息；里面的文字用 \`UserTextRun\`，引用用 \`ReferenceChip\`。
**什么时候不用**：助手回复（Markdown，用 \`MarkdownText\`）；需要边框和投影的通用容器（扩展层 \`Card\`）。
**相关 token**：\`--dsw-specific-bubble\`（底色）、\`--dsw-radius-xl\`（圆角）、\`--dsw-alias-label-primary\`（文字）；字号跟随 \`--dsh-content-font-size\`。`,
      },
    },
  },
  args: { children: '帮我看看这个接口为什么返回 502' },
} satisfies Meta<typeof UserMessageBubble>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** 与 `UserTextRun`、`ReferenceChip` 组合：纯文本段和引用芯片都是行内元素，单行消息不会被拆行。 */
export const WithReferences: Story = {
  args: {
    children: (
      <>
        <UserTextRun text="请参考 " />
        <ReferenceChip appearance="file" label="design.md" title="docs/design.md" />
        <UserTextRun text=" 和 " />
        <ReferenceChip appearance="command" label="/review" title="/review" />
        <UserTextRun text=" 的结论继续改。" />
      </>
    ),
  },
}
