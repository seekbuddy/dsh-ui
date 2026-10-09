import type { CSSProperties } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { MenuSurface } from '@seekbuddy/dsh-ui'

const meta = {
  title: '镜像层（上游同步）/MenuSurface',
  component: MenuSurface,
  parameters: {
    docs: {
      description: {
        component: `菜单类浮层共用的**材质容器**：半透明填充 \`--dsw-menu-surface-fill\` + 背景模糊 \`--dsw-menu-backdrop-filter\`，外圆角 \`--dsw-radius-lg\`（\`compact\` 为 \`--dsw-radius-md\`）。\`Menu\` 与它的子菜单在 \`dsh-v0.1.7-rc.2\` 起都套在它里面，源码不改。

**它解决什么**：模糊只作用在 \`.material\` 这一层绝对定位的背景上，容器本身不建 backdrop root，所以嵌套菜单和 \`position: fixed\` 的浮层不会被它截住；macOS 桌面壳（\`html[data-platform='darwin']\`）下 Chromium 无法透过原生毛玻璃窗口做模糊，它会额外 portal 一块不透明的 \`backing\` 到 body 上、用 CSS anchor 贴在自己下方，让页面内容有像素可模糊——纯 Web 里这块 backing 是 \`display: none\`，本页看不到。

**什么时候用**：自建一个不走 \`Menu\` 数据模型的锚定浮层（命令面板、选择器下拉、富内容弹出），想和上游菜单同一种材质；给它 \`role="menu"\` / \`role="listbox"\` 由调用方决定。
**什么时候不用**：模态对话框用 \`Modal\`；不需要模糊的普通卡片用 \`Card\` / \`--dsw-alias-bg-layer-2\`；没有 MenuSurface 那块 backing 的浮层如果只想要同色的填充，直接用 \`--dsw-specific-menu\`（上游为这类浮层保留的 token，mac 下自动近不透明）。
**可访问性**：纯视觉容器，不带任何 aria；它转发全部 div props 与 ref。
**相关 token**：\`--dsw-menu-surface-fill\`、\`--dsw-menu-backdrop-filter\`、\`--dsw-radius-lg\` / \`--dsw-radius-md\`、\`--dsw-alias-bg-base\`（mac backing）。`,
      },
    },
  },
  args: { compact: false },
} satisfies Meta<typeof MenuSurface>
export default meta
type Story = StoryObj<typeof meta>

/** 花底纹背景，让材质的模糊与半透明看得见。 */
const backdrop: CSSProperties = {
  position: 'relative',
  padding: 32,
  borderRadius: 12,
  background:
    'repeating-linear-gradient(45deg, var(--dsw-alias-state-business-primary) 0 12px, var(--dsw-alias-bg-layer-1) 12px 24px, var(--dsw-alias-state-success-primary) 24px 36px, var(--dsw-alias-bg-layer-1) 36px 48px)',
}

const surface: CSSProperties = {
  width: 220,
  padding: 8,
  boxShadow: 'var(--dsw-elevation-prominent)',
  color: 'var(--dsw-alias-label-primary)',
  font: 'var(--dsw-font-s-14)',
}

const row: CSSProperties = { padding: '6px 8px', borderRadius: 'var(--dsw-radius-sm)' }

/** 默认外圆角 `--dsw-radius-lg`；把它压在花纹上就能看到填充与模糊。 */
export const Default: Story = {
  render: (args) => (
    <div style={backdrop}>
      <MenuSurface {...args} role="menu" aria-label="示例菜单" style={surface}>
        <div role="menuitem" style={row}>
          重命名
        </div>
        <div role="menuitem" style={row}>
          复制链接
        </div>
        <div role="menuitem" style={row}>
          分享
        </div>
      </MenuSurface>
    </div>
  ),
}

/** `compact`：外圆角换 `--dsw-radius-md`，给行高更小的紧凑菜单。 */
export const Compact: Story = {
  args: { compact: true },
  render: Default.render,
}
