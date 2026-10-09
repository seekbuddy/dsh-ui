import type { CSSProperties, ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tooltip } from '@seekbuddy/dsh-ui'
import {
  IconCopyOutlineRegular,
  IconEditOutlineRegular,
  IconRefreshOutlineRegular,
  IconSearchOutlineRegular,
  IconShareOutlineRegular,
  IconTrashOutlineRegular,
} from '@seekbuddy/dsh-ui/icons'

/** 纯图标按钮的布局样式（颜色全走 token）。Tooltip 需要能挂 ref 的原生元素，所以这里用原生 button。 */
const ICON_BUTTON: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  padding: 0,
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  background: 'var(--dsw-alias-bg-layer-2)',
  color: 'var(--dsw-alias-label-secondary)',
}

const TEXT_BUTTON: CSSProperties = {
  height: 32,
  padding: '0 12px',
  border: '0.5px solid var(--dsw-alias-border-l3)',
  borderRadius: 16,
  cursor: 'pointer',
  background: 'var(--dsw-alias-bg-layer-1)',
  color: 'var(--dsw-alias-label-primary)',
}

/** 图标 + Tooltip 的标准搭配：可访问名放在 button 的 aria-label 上，Tooltip 文案与之一致。 */
function iconButton(label: string, icon: ReactNode) {
  return (
    <button type="button" aria-label={label} style={ICON_BUTTON}>
      {icon}
    </button>
  )
}

function textButton(text: string) {
  return (
    <button type="button" style={TEXT_BUTTON}>
      {text}
    </button>
  )
}

const meta = {
  title: '镜像层（上游同步）/Tooltip',
  component: Tooltip,
  parameters: {
    docs: {
      description: {
        component: `悬停 / 聚焦提示：克隆唯一的 \`children\` 锚点、往上挂 ref 与 mouse / focus 事件，气泡 fixed 定位所以不需要 portal 也能逃出祖先的 overflow 裁剪。\`side\`（\`right\` 默认 / \`top\` / \`bottom\`）、\`delayMs\`（只延迟 hover，键盘聚焦立即显示）、\`maxWidth\`（默认上限半个视口）、\`disabled\`（隐藏气泡但锚点不重挂载，不会打断锚点自己的过渡）；\`label\` 可以是字符串或只在显示时才求值的函数。**视口避让**：水平方向贴边时往回滑，垂直方向放不下就翻到对侧。上游同步件，源码不改。

**什么时候用**：纯图标按钮的名字、被截断文本的全文、快捷键提示——都是"看一眼就懂"的一句话。

**什么时候不用**：需要交互（复制、链接）的预览用 \`HoverCard\`；错误 / 状态说明放在可见文字里；长段说明用 \`Modal\` 或文档。禁用按钮不派发 hover / focus 事件，Tooltip 挂不上——上游的做法是用 \`aria-disabled\` 代替原生 \`disabled\`。

**可访问性**：气泡 \`role="tooltip"\`，hover 与键盘 focus 都能触发、两者都清除后才隐藏；**Tooltip 不提供可访问名**——图标按钮必须自己写 \`aria-label\`（本页图标一排就是标准写法）。锚点必须是能接 ref 的原生元素或 \`forwardRef\` 组件（本包的 \`Button\`、\`DangerButton\`、\`SubtleButton\` 都转发 ref），否则气泡不会出现。

**相关 token**：\`--dsw-alias-tooltip-bg\`（气泡底）、\`--dsw-static-neutral-bluish-00\`（气泡文字，固定浅色）、\`--ds-ease-in-out\`（150ms 淡入，reduced-motion 下关闭）。`,
      },
    },
  },
  args: {
    label: '新建会话',
    side: 'right',
    delayMs: 0,
    disabled: false,
    children: textButton('悬停或 Tab 聚焦'),
  },
  argTypes: { children: { control: false }, label: { control: 'text' } },
} satisfies Meta<typeof Tooltip>
export default meta
type Story = StoryObj<typeof meta>

/** 默认 `side="right"`：气泡在锚点右侧、垂直居中；键盘 Tab 到按钮也会显示。 */
export const Default: Story = {}

/** `side="top"`：气泡在锚点上方水平居中；上方放不下会翻到下方。 */
export const Top: Story = {
  args: { side: 'top', label: '顶部提示' },
  render: (args) => (
    <div style={{ paddingTop: 48 }}>
      <Tooltip {...args} />
    </div>
  ),
}

/** `side="bottom"`：气泡在锚点下方（工具栏图标的常用方向）。 */
export const Bottom: Story = { args: { side: 'bottom', label: '底部提示' } }

/** `delayMs={500}`：鼠标停留半秒才出现，避免扫过一排图标时闪烁；键盘聚焦仍然立即显示。 */
export const WithDelay: Story = { args: { delayMs: 500, label: '停留 500ms 后出现' } }

/** `maxWidth={220}`：长文案在 220px 处换行；默认上限是半个视口宽。 */
export const MaxWidth: Story = {
  args: {
    side: 'bottom',
    maxWidth: 220,
    label: '这是一段很长的提示文案，用来演示 maxWidth 把气泡宽度限制在 220 像素以内并自动换行，而不是撑成一整条。',
  },
}

/** `disabled`：气泡被压制，锚点照常渲染（不重挂载）。切 Controls 里的 disabled 试试。 */
export const Disabled: Story = { args: { disabled: true, label: '你不该看到我' } }

/** `label` 传函数：只在气泡显示的那一刻求值，适合"复制 / 已复制"这类随状态变化的文案。 */
export const LazyLabel: Story = {
  args: { label: () => `现在是 ${new Date().toLocaleTimeString('zh-CN')}`, side: 'bottom' },
}

/** 视口边缘避让：左右两端的锚点气泡会往回滑进视口，底部锚点的 bottom 气泡放不下时翻到上方。 */
export const EdgeAvoidance: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        minHeight: '60vh',
        padding: 8,
      }}
    >
      <Tooltip label="贴着左边缘的很长很长的提示文案，气泡会向右滑回视口内" side="bottom">
        {textButton('左下角')}
      </Tooltip>
      <Tooltip label="底部锚点：下方放不下就翻到上方" side="bottom">
        {textButton('底部中央')}
      </Tooltip>
      <Tooltip label="贴着右边缘的很长很长的提示文案，气泡会向左滑回视口内" side="bottom">
        {textButton('右下角')}
      </Tooltip>
    </div>
  ),
}

/** 组合样张：一排图标按钮 + Tooltip 的标准搭配——`aria-label` 提供可访问名，Tooltip 只是视觉提示。 */
export const IconButtonRow: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 4 }}>
      <Tooltip label="搜索" side="bottom" delayMs={300}>
        {iconButton('搜索', <IconSearchOutlineRegular />)}
      </Tooltip>
      <Tooltip label="重命名" side="bottom" delayMs={300}>
        {iconButton('重命名', <IconEditOutlineRegular />)}
      </Tooltip>
      <Tooltip label="复制链接" side="bottom" delayMs={300}>
        {iconButton('复制链接', <IconCopyOutlineRegular />)}
      </Tooltip>
      <Tooltip label="分享" side="bottom" delayMs={300}>
        {iconButton('分享', <IconShareOutlineRegular />)}
      </Tooltip>
      <Tooltip label="刷新" side="bottom" delayMs={300}>
        {iconButton('刷新', <IconRefreshOutlineRegular />)}
      </Tooltip>
      <Tooltip label="删除" side="bottom" delayMs={300}>
        {iconButton('删除', <IconTrashOutlineRegular />)}
      </Tooltip>
    </div>
  ),
}

/** `shortcutKeys`：文字右侧摆出键帽（`ShortcutKeys` 的 tooltip 形态），键名同时拼进 `aria-label`；`dsh-v0.1.7-rc.2` 新增。 */
export const WithShortcut: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <Tooltip label="新建会话" shortcutKeys={['⌘', 'N']}>
        {iconButton('新建会话', <IconEditOutlineRegular />)}
      </Tooltip>
      <Tooltip label="搜索" shortcutKeys={['Ctrl', '+', 'K']}>
        {iconButton('搜索', <IconSearchOutlineRegular />)}
      </Tooltip>
    </div>
  ),
}

/** `openOnClick`（0.2.0 新增）：点击锚点把气泡**钉住**，气泡可以被指针进入（`data-pinned`），点外面或再按 Escape 收起；`focusDelayMs` 单独控制键盘聚焦的延迟。给内容需要停留阅读或复制的提示用。 */
export const OpenOnClick: Story = {
  args: { openOnClick: true, focusDelayMs: 300, side: 'bottom', label: '点击后钉住，点外面收起' },
}
