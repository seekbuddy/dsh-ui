import { useRef, useState, type CSSProperties } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Button,
  Input,
  closeTopModal,
  focusWithoutRing,
  isBehindModal,
  modalSelector,
  observeComposition,
  useModalLayer,
} from '@seekbuddy/dsh-ui'

const dialogStyle: CSSProperties = {
  boxSizing: 'border-box',
  width: 320,
  padding: 16,
  borderRadius: 'var(--dsw-radius-lg)',
  background: 'var(--dsw-alias-bg-layer-2)',
  border: '1px solid var(--dsw-alias-border-l2)',
  boxShadow: 'var(--dsw-shadow-lv2)',
  color: 'var(--dsw-alias-label-primary)',
  font: 'var(--dsw-font-s-14)',
  display: 'grid',
  gap: 12,
}

const status: CSSProperties = { font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-secondary)' }

interface ModalLayerDemoProps {
  /** 首焦点给谁：`autofocus` 用 `data-modal-autofocus` 标记输入框；`first` 不标记，落到第一个可聚焦控件。 */
  initialFocus: 'autofocus' | 'first'
}

/** 演示组件：一块 `role="dialog"` 面板挂上 `useModalLayer(ref, open, onClose)`，Escape 关闭、Tab 在面板内循环、关闭后焦点回到打开它的按钮。 */
function ModalLayerDemo({ initialFocus }: ModalLayerDemoProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const anchorRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [log, setLog] = useState<string[]>([])
  const note = (line: string) => setLog((all) => [line, ...all].slice(0, 4))
  useModalLayer(dialogRef, open, () => {
    note('onClose：Escape 或程序关闭')
    setOpen(false)
  })

  return (
    <div style={{ display: 'grid', gap: 8, justifyItems: 'start' }}>
      <Button ref={anchorRef} size="sm" variant="outline" onClick={() => setOpen(true)}>
        打开面板
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          note(`isBehindModal(锚点) = ${String(isBehindModal(anchorRef.current))}`)
        }}
      >
        这个按钮在模态后面吗？
      </Button>
      {open && (
        <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="示例面板" tabIndex={-1} style={dialogStyle}>
          <p style={{ margin: 0 }}>Escape 关闭；Tab / Shift+Tab 在面板内循环；关闭后焦点回到"打开面板"。</p>
          <Input
            aria-label="名称"
            placeholder={
              initialFocus === 'autofocus' ? '带 data-modal-autofocus，首焦点在这里' : '首焦点在第一个可聚焦控件'
            }
            {...(initialFocus === 'autofocus' ? { 'data-modal-autofocus': '' } : {})}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button size="sm" variant="ghost" onClick={() => closeTopModal(document)}>
              closeTopModal(document)
            </Button>
            <Button size="sm" variant="primary" onClick={() => setOpen(false)}>
              完成
            </Button>
          </div>
        </div>
      )}
      <div style={status}>
        <div>
          modalSelector = <code>{modalSelector}</code>
        </div>
        {log.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>
    </div>
  )
}

const meta = {
  title: '镜像层（上游同步）/hooks/useModalLayer',
  component: ModalLayerDemo,
  parameters: {
    docs: {
      description: {
        component: `模态层的**键盘所有权与焦点生命周期**：\`useModalLayer(dialogRef, open, onClose)\` 在 \`open\` 期间把面板登记进文档级的模态栈，只有栈顶那一层响应 Escape（调 \`onClose\`）和 Tab 循环，打开时把焦点送进面板（优先 \`[data-modal-autofocus]\`，否则第一个可聚焦控件，再否则面板本身），关闭时把焦点送回打开前的元素。\`Modal\` 在 \`dsh-v0.1.7-rc.2\` 起内部就用它，源码不改。

同一模块还导出三个配套工具：\`closeTopModal(document)\` 让应用级的关闭命令只关栈顶；\`isBehindModal(anchor)\` 让局部快捷键在被模态盖住时让路；\`modalSelector\` 是判定"谁在前台"的 DOM 选择器（\`[role="dialog"][aria-modal="true"], [role="menu"]\`）。进出焦点用 \`focusWithoutRing\`（见工具函数页），不画焦点环、直到用户按 Tab / 方向键才恢复；输入法组字期间的 Escape 由 \`observeComposition\` 挡掉，不会把面板关了。

**什么时候用**：自建一个不走 \`Modal\` 外观的模态面板（全屏接管、侧滑抽屉、命令面板），又想和上游对话框一样的键盘与焦点行为。
**什么时候不用**：普通对话框直接用 \`Modal\`；非模态的锚定浮层用 \`useDismissOnOutsidePointer\`。
**可访问性**：面板本身要有 \`role="dialog"\`、\`aria-modal="true"\`、可访问名与 \`tabIndex={-1}\`，hook 不代劳；首焦点控件用 \`data-modal-autofocus\` 标记而不是 React 的 \`autoFocus\`——后者抢在 hook 之前触发，会丢掉"回到哪里"的信息。`,
      },
    },
  },
  args: { initialFocus: 'autofocus' },
  argTypes: { initialFocus: { control: 'inline-radio', options: ['autofocus', 'first'] } },
} satisfies Meta<typeof ModalLayerDemo>
export default meta
type Story = StoryObj<typeof meta>

/** 打开、按 Escape、按 Tab 绕圈、关闭后看焦点回到按钮。 */
export const Default: Story = {}

/** 不标记 `data-modal-autofocus`：首焦点落到第一个可聚焦控件。 */
export const FirstFocusable: Story = { args: { initialFocus: 'first' } }

/** `focusWithoutRing` 单独看：程序把焦点送到按钮上不画环，按一下 Tab / 方向键环就回来。 */
export const FocusWithoutRing: Story = {
  render: () => {
    const targetRef = useRef<HTMLButtonElement>(null)
    const [composing, setComposing] = useState<string>('未观察')
    return (
      <div style={{ display: 'grid', gap: 8, justifyItems: 'start' }}>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            if (targetRef.current) focusWithoutRing(targetRef.current)
          }}
        >
          把焦点送到右边的按钮（无环）
        </Button>
        <Button ref={targetRef} size="sm" variant="ghost">
          目标：拿到焦点但没有环，按 Tab 或方向键恢复
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            const observer = observeComposition(document)
            const probe = new KeyboardEvent('keydown', { key: 'Escape' })
            setComposing(
              `observeComposition(document).guards(Escape) = ${String(observer.guards(probe))}（当前没有组字，应为 false）`,
            )
            observer.dispose()
          }}
        >
          observeComposition 探针
        </Button>
        <div style={status}>{composing}</div>
      </div>
    )
  },
}
