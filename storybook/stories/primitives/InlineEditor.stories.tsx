import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { InlineEditor } from '@seekbuddy/dsh-ui'

const meta = {
  title: '镜像层（上游同步）/InlineEditor',
  component: InlineEditor,
  parameters: {
    docs: {
      description: {
        component: `原位编辑的多行输入框，用于排队中的消息、目标这类简短草稿：受控 \`value\`，Enter 调 \`onSave\`，Shift+Enter 换行，输入法组字时按 Enter 不触发保存，Esc 调 \`onCancel\`。上游同步件（\`dsh-v0.2.2-rc.1\` 新增），源码不改。

**什么时候用**：在列表或卡片里原位改一段短文字，改完立即保存。
**什么时候不用**：表单里的普通输入（\`Input\`）；长篇编辑。
**可访问性**：\`label\` 是输入框的读屏名称，必填且要本地化。`,
      },
    },
  },
  args: { value: '先补上支付回调的重试', label: '编辑排队消息', onChange: () => {}, onSave: () => {}, onCancel: () => {} },
  argTypes: { onChange: { control: false }, onSave: { control: false }, onCancel: { control: false } },
} satisfies Meta<typeof InlineEditor>
export default meta
type Story = StoryObj<typeof meta>

/** 受控用法：Enter 保存，Shift+Enter 换行，Esc 还原。 */
export const Default: Story = {
  render: (args) => {
    const [saved, setSaved] = useState(args.value)
    const [draft, setDraft] = useState(args.value)
    const [editing, setEditing] = useState(true)
    return (
      <div style={{ display: 'grid', gap: 8, width: 280, font: 'var(--dsw-font-s-14)' }}>
        {editing ? (
          <InlineEditor
            value={draft}
            label={args.label}
            onChange={setDraft}
            onSave={() => {
              setSaved(draft)
              setEditing(false)
            }}
            onCancel={() => {
              setDraft(saved)
              setEditing(false)
            }}
          />
        ) : (
          <button type="button" onClick={() => setEditing(true)}>
            {saved}（点击编辑）
          </button>
        )}
      </div>
    )
  },
}
