import { useRef, useState, type CSSProperties } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, useAnchoredPosition } from '@seekbuddy/dsh-ui'
import type { AnchoredPositionOptions } from '@seekbuddy/dsh-ui'

/** 浮层外观：只做布局，颜色走 alias token。`position: fixed` 是 hook 契约的一部分——它返回的是视口坐标。 */
const surface: CSSProperties = {
  position: 'fixed',
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

interface AnchoredPositionDemoProps {
  /** 浮层挂在锚点的哪一边：`bottom`（默认）挂在下方，`top` 挂在上方。 */
  side: NonNullable<AnchoredPositionOptions['side']>
  /** 锚点边缘与浮层之间保留的距离（px）。 */
  gap: number
  /** 浮层与视口每条边之间保留的距离（px）。 */
  margin: number
  /** 锚点在容器里的水平位置：`end` 把锚点推到右边缘，用来看视口夹紧。 */
  align: 'start' | 'end'
  /** 浮层里放一个可拖高的 textarea：面板自身尺寸变化也会触发重新夹紧（ResizeObserver）。 */
  resizable: boolean
}

/** 演示组件：一个按钮锚点 + 受控浮层，把 hook 返回的 `{ left, top }` 直接铺到 fixed 面板上。 */
function AnchoredPositionDemo({ side, gap, margin, align, resizable }: AnchoredPositionDemoProps) {
  const anchorRef = useRef<HTMLSpanElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const position = useAnchoredPosition({ open, anchorRef, panelRef, side, gap, margin })
  return (
    <div style={{ display: 'grid', gap: 8, justifyItems: align === 'end' ? 'end' : 'start' }}>
      <span ref={anchorRef}>
        <Button size="sm" variant="outline" onClick={() => setOpen((value) => !value)}>
          {open ? '关闭浮层' : '打开浮层'}
        </Button>
      </span>
      <output style={status}>
        {position === null
          ? '已关闭（hook 返回 null）'
          : `left ${Math.round(Number(position.left))} / top ${Math.round(Number(position.top))}`}
      </output>
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="锚定浮层"
          style={{ ...surface, ...(position ?? { visibility: 'hidden' }) }}
        >
          <p style={{ margin: 0 }}>拖动窗口尺寸、滚动页面，浮层会持续贴着按钮，并夹在视口 margin 之内。</p>
          {resizable && (
            <textarea
              aria-label="拖高我看重新夹紧"
              defaultValue="拖右下角把我拉高，浮层靠近视口底边时会被推回 margin 之内。"
              style={{ display: 'block', boxSizing: 'border-box', width: '100%', marginTop: 8, resize: 'vertical' }}
            />
          )}
        </div>
      )}
    </div>
  )
}

const meta = {
  title: '镜像层（上游同步）/Hooks/useAnchoredPosition',
  component: AnchoredPositionDemo,
  parameters: {
    docs: {
      description: {
        component: `\`useAnchoredPosition(options)\`：让一个 \`position: fixed\` 的浮层跟住它的锚点。传入 \`open\`、锚点 ref、面板 ref、\`side\`、\`gap\`、\`margin\`，返回面板的 \`{ left, top }\`（首次测量前为 \`null\`）；打开期间监听滚动（capture，嵌套滚动容器也能捕获）、窗口 resize 和面板自身尺寸变化（ResizeObserver）并重新计算，结果夹在视口 \`margin\` 之内。上游同步件，源码不改。

**什么时候用**：调用方自己持有 open 状态、把面板 portal 到 body 的受控浮层（Menu 的 portal 模式、HoverCard、自定义弹出面板）——你负责渲染面板，它负责坐标。

**什么时候不用**：面板就在锚点旁边的普通文档流里（用 \`position: absolute\` 即可，不需要视口坐标）；只需要"自底向上生长的面板别撞视口顶边"的场景用 [useAnchoredMaxHeight](?path=/docs/镜像层（上游同步）-hooks-useanchoredmaxheight--docs)；现成的 Menu / Tooltip / HoverCard 已内置定位，不要再包一层。

**可访问性**：hook 只算坐标，不管语义。面板要自己给 \`role\`（dialog / menu / listbox）和可访问名，焦点管理与 Escape 关闭由调用方处理；\`null\` 期间把面板设 \`visibility: hidden\`，避免闪到 (0,0)。

**相关 token**：无（hook 不带样式）。演示里面板用了 \`--dsw-alias-bg-layer-2\`、\`--dsw-alias-border-l2\`、\`--dsw-shadow-lv2\`。`,
      },
    },
  },
  args: { side: 'bottom', gap: 6, margin: 12, align: 'start', resizable: false },
  argTypes: {
    side: { control: 'inline-radio', options: ['bottom', 'top'] },
    align: { control: 'inline-radio', options: ['start', 'end'] },
    gap: { control: { type: 'number', min: 0, max: 48 } },
    margin: { control: { type: 'number', min: 0, max: 64 } },
  },
} satisfies Meta<typeof AnchoredPositionDemo>
export default meta
type Story = StoryObj<typeof meta>

/** 默认：挂在按钮下方，`gap` 6 / `margin` 12（与上游 Menu portal 一致）。打开后拖动窗口尺寸看它重新定位。 */
export const Default: Story = {}

/** `side: 'top'`：挂在按钮上方；面板高度先测再定位，所以顶边不会被算错。 */
export const SideTop: Story = { args: { side: 'top' } }

/** 锚点推到右边缘：面板宽 260，`left` 被夹到 `innerWidth - width - margin`，不会溢出视口。 */
export const ClampedAtViewportEdge: Story = { args: { align: 'end' } }

/** 面板内含可拖高的 textarea：面板变高时 ResizeObserver 触发重算，靠近底边会被推回 margin 内。 */
export const PanelResize: Story = { args: { resizable: true } }

/** 锚点放在嵌套滚动容器里：滚动内层容器，浮层照样跟随（scroll 监听在 capture 阶段）。 */
export const InsideScroller: Story = {
  render: (args) => (
    <div
      style={{
        height: 200,
        width: 360,
        overflow: 'auto',
        padding: 12,
        boxSizing: 'border-box',
        border: '1px solid var(--dsw-alias-border-l1)',
        borderRadius: 8,
      }}
    >
      <p style={{ margin: '0 0 12px', ...status }}>↓ 先在这个容器里往下滚一点，再打开浮层，然后继续滚动。</p>
      <div style={{ height: 120 }} />
      <AnchoredPositionDemo {...args} />
      <div style={{ height: 320 }} />
    </div>
  ),
}
