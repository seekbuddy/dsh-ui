import { useRef, useState, type CSSProperties } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, useAnchoredMaxHeight } from '@seekbuddy/dsh-ui'

/** 自底向上生长的列表面板：底边钉在锚点上方，高度由 hook 返回的 max-height 收紧。 */
const surface: CSSProperties = {
  boxSizing: 'border-box',
  width: 240,
  padding: 6,
  overflow: 'auto',
  borderRadius: 8,
  background: 'var(--dsw-alias-bg-layer-2)',
  border: '1px solid var(--dsw-alias-border-l2)',
  boxShadow: 'var(--dsw-shadow-lv2)',
  color: 'var(--dsw-alias-label-primary)',
  font: 'var(--dsw-font-s-14)',
}

const status: CSSProperties = { font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-secondary)' }

const ITEMS = Array.from({ length: 30 }, (_, index) => `候选项 ${index + 1}`)

interface AnchoredMaxHeightDemoProps {
  /** 设计上限（px）：hook 的返回值永远不超过它。 */
  cap: number
  /** 锚点上方的占位高度（px）：越小锚点离视口顶边越近，面板可用高度越少。 */
  spaceAbove: number
  /** 锚点下方的占位高度（px）：把画布撑出滚动条，滚动时锚点上移、面板随之收缩。 */
  spaceBelow: number
  /** 锚点上方放一个可增行的输入框，模拟输入框长高把锚点往下推：行数变化通过 `signal` 触发重算。 */
  withComposer: boolean
}

/** 演示组件：面板底边钉在按钮上方向上生长，`useAnchoredMaxHeight(ref, cap, signal)` 把它的 max-height 夹到视口顶边之内。 */
function AnchoredMaxHeightDemo({ cap, spaceAbove, spaceBelow, withComposer }: AnchoredMaxHeightDemoProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState(2)
  // signal：把会移动锚点的渲染状态揉进去（打开状态 + 输入框行数），任何一项变了就重新测量
  const maxHeight = useAnchoredMaxHeight(panelRef, cap, `${open}:${rows}`)
  return (
    <div style={{ display: 'grid', gap: 8, justifyItems: 'start' }}>
      <div style={{ height: spaceAbove }} />
      {withComposer && (
        <div style={{ display: 'grid', gap: 6, justifyItems: 'start' }}>
          <textarea
            aria-label="模拟输入框"
            rows={rows}
            readOnly
            value={Array.from({ length: rows }, (_, index) => `第 ${index + 1} 行`).join('\n')}
            style={{ boxSizing: 'border-box', width: 240, resize: 'none' }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <Button size="sm" variant="ghost" onClick={() => setRows((value) => value + 1)}>
              加一行
            </Button>
            <Button size="sm" variant="ghost" disabled={rows <= 1} onClick={() => setRows((value) => value - 1)}>
              减一行
            </Button>
          </div>
        </div>
      )}
      <div style={{ position: 'relative' }}>
        {open && (
          <div style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: 6 }}>
            <div ref={panelRef} role="listbox" aria-label="候选项" style={{ ...surface, maxHeight }}>
              {ITEMS.map((item) => (
                <div key={item} role="option" aria-selected={false} style={{ padding: '4px 8px' }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}
        <Button size="sm" variant="outline" onClick={() => setOpen((value) => !value)}>
          {open ? '收起列表' : '展开列表'}
        </Button>
      </div>
      <output style={status}>
        max-height: {maxHeight}px（上限 {cap}px{maxHeight < cap ? '，已被视口顶边收紧' : '，空间充足'}）
      </output>
      <div style={{ height: spaceBelow }} />
    </div>
  )
}

const meta = {
  title: '镜像层（上游同步）/Hooks/useAnchoredMaxHeight',
  component: AnchoredMaxHeightDemo,
  parameters: {
    docs: {
      description: {
        component: `\`useAnchoredMaxHeight(ref, cap, signal)\`：给**自底向上生长**的浮层（slash 菜单、popupSelect）算一个贴合视口的 max-height。这类面板底边钉在锚点上方、高度不定，只有顶边会撞到视口，所以 hook 取 \`min(cap, 面板底边到视口顶边的距离 - 12px)\`；\`ref.current\` 为 null（面板关着）时跳过测量，挂载期间监听 resize 与 scroll（capture）重算。上游同步件，源码不改。

**什么时候用**：输入框上方弹出的候选列表——锚点离视口顶边越近（或窗口越矮），列表越要收紧并内部滚动，而不是被截掉顶部。\`signal\` 传会移动锚点的渲染状态（打开态、输入框行数），它变了就重新测量。

**什么时候不用**：向下生长的面板（那是底边撞视口，用 [useAnchoredPosition](?path=/docs/镜像层（上游同步）-hooks-useanchoredposition--docs) 的夹紧）；面板高度固定或本来就不会超出视口；已内置定位的 Menu。

**可访问性**：hook 只返回一个数字。面板自己要 \`overflow: auto\` 让被收紧的部分可滚动，并给列表正确的 \`role\`（listbox / menu）与可访问名；收紧后键盘导航到的选项应 \`scrollIntoView\`。

**相关 token**：无（hook 不带样式；12px 安全边距是常量，与 Menu portal margin 一致）。`,
      },
    },
  },
  args: { cap: 320, spaceAbove: 200, spaceBelow: 0, withComposer: false },
  argTypes: {
    cap: { control: { type: 'number', min: 80, max: 600, step: 10 } },
    spaceAbove: { control: { type: 'number', min: 0, max: 800, step: 20 } },
    spaceBelow: { control: { type: 'number', min: 0, max: 2000, step: 100 } },
  },
} satisfies Meta<typeof AnchoredMaxHeightDemo>
export default meta
type Story = StoryObj<typeof meta>

/** 默认：上限 320px，锚点上方只有 200px，列表被收紧到约 180px 并内部滚动。把 `spaceAbove` 拨大看它回到上限。 */
export const Default: Story = {}

/** 锚点几乎贴着视口顶边：可用高度只剩几十像素，列表收得很小但仍可滚动。 */
export const NearViewportTop: Story = { args: { spaceAbove: 60 } }

/** 空间充足：返回值就是 `cap`，面板按设计上限展示。 */
export const FullCap: Story = { args: { spaceAbove: 480, cap: 240 } }

/** 画布撑出滚动条：展开列表后往下滚，锚点向顶边靠近，max-height 随滚动实时收缩（scroll 监听在 capture 阶段）。 */
export const ScrollToShrink: Story = { args: { spaceAbove: 480, spaceBelow: 1200 } }

/** 带模拟输入框：点「加一行」把锚点往下推，行数进了 `signal`，hook 重新测量、列表随之放宽。 */
export const SignalOnComposerGrowth: Story = { args: { spaceAbove: 120, withComposer: true } }
