import { useState } from 'react'
import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Input, Modal } from '@seekbuddy/dsh-ui'

type ModalProps = ComponentProps<typeof Modal>

const LONG_PARAGRAPHS = Array.from(
  { length: 12 },
  (_, i) =>
    `第 ${String(i + 1)} 段：这是一段用来撑高对话框的说明文字。对话框卡片本身 overflow: hidden 且没有最大高度，所以长内容要由调用方自己限制高度并开滚动——把可滚动区域放在 children 里，或者通过 contentClassName 给内容区加 max-height + overflow-y: auto。`,
)

/**
 * 受控外壳：触发按钮 + 本地 open；标准模式的 footer 由这里生成（取消 / 确定都关闭），
 * 记录 onClose 触发次数用来演示 Escape / 遮罩关闭。
 */
function ModalDemo({ open: initialOpen, onClose: _onClose, footer: _footer, ...rest }: ModalProps) {
  const [open, setOpen] = useState(initialOpen)
  const [closes, setCloses] = useState(0)
  const close = () => setOpen(false)
  const onClose = () => {
    setCloses((n) => n + 1)
    close()
  }
  const footer =
    rest.headless === true ? undefined : (
      <>
        <Button variant="outline" onClick={close}>
          取消
        </Button>
        <Button variant="primary" onClick={close}>
          确定
        </Button>
      </>
    )
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
      <Button variant="primary" onClick={() => setOpen(true)}>
        打开对话框
      </Button>
      <span>onClose（Escape / 点遮罩 / 关闭按钮）已触发 {closes} 次</span>
      <Modal {...rest} open={open} onClose={onClose} footer={footer} />
    </div>
  )
}

const meta = {
  title: '镜像层（上游同步）/Modal',
  component: Modal,
  parameters: {
    docs: {
      description: {
        component: `居中模态层：portal 到 body，遮罩带模糊，卡片 380px 宽、圆角 \`--dsw-radius-panel\`（28）。**标准模式**渲染标题行（\`title\` + 关闭按钮）、\`description\`、\`children\` 正文与 \`footer\` 操作行，此时 \`closeLabel\`（关闭按钮的可访问名）**必传**且需本地化；**\`headless\` 模式**只保留遮罩、卡片、Escape 与 \`aria-label\`，\`children\` 直接铺进卡片，自己画头尾。\`open\` / \`onClose\` 受控：Escape 和点遮罩都只是调 \`onClose\`，关不关由调用方决定。上游同步件，源码不改。

**什么时候用**：需要用户当场决定的短流程——新建会话、重命名、确认表单。

**什么时候不用**：高风险破坏性操作用 \`RiskConfirmation\`（带勾选确认）；短暂状态反馈用 \`Toast\`；锚定在某个按钮旁边的选项用 \`Menu\`。

**可访问性**：卡片 \`role="dialog" aria-modal="true"\`，\`aria-label\` 在两种模式下都取 \`title\`；关闭按钮的可访问名是 \`closeLabel\`；遮罩 \`aria-hidden\`。\`dsh-v0.1.7-rc.2\` 起内部用 \`useModalLayer\`：打开时焦点进卡片（优先 \`[data-modal-autofocus]\` 标记的控件，**别用** React \`autoFocus\`，它抢在前面会丢掉回焦目标）、Tab 在卡片内循环、只有最上层的模态响应 Escape、关闭后焦点回到打开前的元素；\`backdropBlur={false}\` 给已经自己模糊了页面的调用方。

**注意**：卡片 \`overflow: hidden\` 且没有 max-height，长内容不会自动滚——把滚动区放在 \`children\` 里或用 \`contentClassName\` 给内容区加 \`max-height\` + \`overflow-y: auto\`（见"长内容滚动"样张）。

**相关 token**：\`--dsw-alias-bg-mask-1\` + \`--dsw-mask-blur\`（遮罩）、\`--dsw-alias-bg-layer-2\`（卡片底）、\`--dsw-elevation-prominent\`、\`--dsw-alias-label-primary\` / \`-secondary\`（标题 / 关闭按钮）、\`--dsw-alias-interactive-bg-hover\`。`,
      },
    },
  },
  args: {
    open: false,
    title: '新建会话',
    closeLabel: '关闭',
    description: '创建一个新的工作会话。',
    children: <Input placeholder="会话名称" aria-label="会话名称" data-modal-autofocus="" />,
    // 占位：render 里的受控外壳会接管
    onClose: () => {},
  },
  argTypes: {
    children: { control: false },
    footer: { control: false },
    onClose: { control: false },
  },
  render: (args) => <ModalDemo {...args} />,
} satisfies Meta<typeof Modal>
export default meta
type Story = StoryObj<typeof meta>

/** 标准模式：标题 + `closeLabel="关闭"` 的关闭按钮 + `description` + 正文输入框 + footer 操作行。 */
export const Default: Story = {}

/** 只有标题与正文，没有 `description`。 */
export const WithoutDescription: Story = { args: { description: undefined } }

/** `headless`：卡片里只有 `children`，头尾自己画；`title` 仍作为 `aria-label`，Escape / 遮罩仍然关闭。 */
export const Headless: Story = {
  args: {
    headless: true,
    title: '选择模型',
    children: (
      <div style={{ display: 'grid', gap: 12, padding: '20px 24px 0' }}>
        <strong>选择模型</strong>
        <p style={{ margin: 0 }}>headless 模式下没有默认头部与关闭按钮，这里的内容完全由调用方排版。</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="outline">deepseek-chat</Button>
          <Button variant="primary">deepseek-reasoner</Button>
        </div>
        <span>按 Escape 或点遮罩关闭。</span>
      </div>
    ),
  },
}

/** Escape / 遮罩关闭：两种方式都只是调 `onClose`，计数器每次 +1；关闭按钮同理。 */
export const DismissByEscapeOrMask: Story = {
  args: {
    title: '试试关闭方式',
    description: '按 Escape、点击卡片外的遮罩、或点右上角关闭按钮，都会触发 onClose。',
    children: undefined,
  },
}

/** 长内容滚动：正文放在一个 `max-height: 50vh; overflow-y: auto` 的容器里，标题与 footer 保持可见。 */
export const LongContent: Story = {
  args: {
    title: '服务条款',
    description: '请滚动阅读全部内容。',
    children: (
      <div style={{ display: 'grid', gap: 12, maxHeight: '50vh', overflowY: 'auto' }}>
        {LONG_PARAGRAPHS.map((p) => (
          <p key={p} style={{ margin: 0 }}>
            {p}
          </p>
        ))}
      </div>
    ),
  },
}

/** `backdropBlur={false}`：遮罩只变暗不模糊，给页面已经自己模糊了的场景。 */
export const NoBackdropBlur: Story = { args: { backdropBlur: false } }
