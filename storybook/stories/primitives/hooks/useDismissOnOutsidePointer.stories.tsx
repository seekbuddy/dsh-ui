import { useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, useAnchoredPosition, useDismissOnOutsidePointer } from '@seekbuddy/dsh-ui'

const surface: CSSProperties = {
  boxSizing: 'border-box',
  width: 260,
  padding: 12,
  borderRadius: 8,
  background: 'var(--dsw-alias-bg-layer-2)',
  border: '1px solid var(--dsw-alias-border-l2)',
  boxShadow: 'var(--dsw-shadow-lv2)',
  color: 'var(--dsw-alias-label-primary)',
  font: 'var(--dsw-font-s-14)',
}

const status: CSSProperties = { font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-secondary)' }

interface DismissOnOutsidePointerDemoProps {
  /** 面板渲染位置：`inline` 就在触发器旁的容器里；`portal` 用 createPortal 挂到 body（配合 useAnchoredPosition 定位）。 */
  panel: 'inline' | 'portal'
  /** 面板 portal 到 body 时，是否把面板 ref 作为第四个参数传给 hook，让点击面板内部不算"外部"。 */
  countPortalAsInside: boolean
}

/** 演示组件：root 容器包住触发器；`useDismissOnOutsidePointer(root, open, setOpen, portal?)` 在打开期间监听 root 之外的 pointerdown。 */
function DismissOnOutsidePointerDemo({ panel, countPortalAsInside }: DismissOnOutsidePointerDemoProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const anchorRef = useRef<HTMLSpanElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(0)
  const isPortal = panel === 'portal'
  useDismissOnOutsidePointer(rootRef, open, setOpen, isPortal && countPortalAsInside ? portalRef : undefined)
  const position = useAnchoredPosition({ open: isPortal && open, anchorRef, panelRef: portalRef, gap: 6, margin: 12 })

  const body = (
    <>
      <p style={{ margin: '0 0 8px' }}>
        {isPortal ? '这块面板 portal 在 body 上，不在 root 容器里。' : '这块面板就在 root 容器里。'}
        点面板内部不应关闭，点面板外任何地方关闭。
      </p>
      <Button size="sm" variant="ghost" onClick={() => setCount((value) => value + 1)}>
        面板内按钮（点了 {count} 次）
      </Button>
    </>
  )

  return (
    <div style={{ display: 'grid', gap: 8, justifyItems: 'start' }}>
      <div ref={rootRef} style={{ display: 'grid', gap: 8, justifyItems: 'start' }}>
        <span ref={anchorRef}>
          <Button size="sm" variant="outline" onClick={() => setOpen((value) => !value)}>
            {open ? '关闭面板' : '打开面板'}
          </Button>
        </span>
        {open && !isPortal && (
          <div role="dialog" aria-label="内联面板" style={surface}>
            {body}
          </div>
        )}
      </div>
      <output style={status}>{open ? '已打开 · 正在监听 root 之外的 pointerdown' : '已关闭 · 监听已卸下'}</output>
      {open &&
        isPortal &&
        createPortal(
          <div
            ref={portalRef}
            role="dialog"
            aria-label="portal 面板"
            style={{ ...surface, position: 'fixed', ...(position ?? { visibility: 'hidden' }) }}
          >
            {body}
          </div>,
          document.body,
        )}
    </div>
  )
}

const meta = {
  title: '镜像层（上游同步）/Hooks/useDismissOnOutsidePointer',
  component: DismissOnOutsidePointerDemo,
  parameters: {
    docs: {
      description: {
        component: `\`useDismissOnOutsidePointer(root, open, setOpen, portal?)\`：触发器自有的弹出面板，打开期间在 document 上监听 \`pointerdown\`，落点不在 \`root\` 里就调用 \`setOpen(false)\`；\`open\` 为 false 时不挂监听。第四个参数 \`portal\` 是可选的第二个"内部区域"——面板被 createPortal 到 body 时，DOM 上它不在 root 里，传入它的 ref 才不会一点面板就关。上游同步件，源码不改。

**什么时候用**：由一个触发按钮拥有、点空白处即关的轻量弹层（任务列表、面板开关、自定义下拉）。root 传包住触发器（和内联面板）的容器；面板 portal 出去了就再把面板 ref 传第四个参数。

**什么时候不用**：Modal 这类需要遮罩、焦点陷阱和 Escape 的模态层（用 Modal）；Menu / Tooltip / HoverCard 已内置关闭逻辑；需要区分"点在另一个触发器上"等复杂关闭策略时自己写监听。

**可访问性**：只处理指针，不处理键盘——Escape 关闭、关闭后焦点回到触发器由调用方补上；面板自己给 \`role\` 与可访问名。

**相关 token**：无（hook 不带样式）。`,
      },
    },
  },
  args: { panel: 'inline', countPortalAsInside: true },
  argTypes: {
    panel: { control: 'inline-radio', options: ['inline', 'portal'] },
  },
} satisfies Meta<typeof DismissOnOutsidePointerDemo>
export default meta
type Story = StoryObj<typeof meta>

/** 默认：面板与触发器同在 root 容器里。打开后点面板内不关，点画布空白处关闭。 */
export const Default: Story = {}

/** 面板 portal 到 body，并把面板 ref 作为第四个参数传入：点 portal 面板内部计为内部，不会关闭。 */
export const PortalCountedAsInside: Story = { args: { panel: 'portal', countPortalAsInside: true } }

/** 反例：面板 portal 到 body 但不传第四个参数——面板在 DOM 上不属于 root，点它内部也会被当作外部而关闭。 */
export const PortalWithoutFourthRef: Story = { args: { panel: 'portal', countPortalAsInside: false } }
