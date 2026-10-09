import { useEffect, useRef, type CSSProperties } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { MenuGroup, MenuSurface, observeStickyMenuGroups } from '@seekbuddy/dsh-ui'

const meta = {
  title: '镜像层（上游同步）/MenuGroup',
  component: MenuGroup,
  parameters: {
    docs: {
      description: {
        component: `菜单里的**具名分组**：\`<section role="group">\` 由自己的小标题命名（\`aria-labelledby\`），标题 \`position: sticky\` 吸在滚动容器顶部，长列表滚动时始终知道当前在哪一组。上游同步件（\`dsh-v0.2.0-rc.2\` 新增），源码不改。

配套的 \`observeStickyMenuGroups(viewport)\` 给**吸顶中的**标题加 \`data-stuck\`，此时标题才填上 \`--dsw-alias-menu-group-header-fill\` 的近不透明底（否则透明，不挡第一行）；它用 IntersectionObserver + ResizeObserver 判断，返回清理函数。分组成员在调用时快照，分组变了要先清理再重新观察。

**什么时候用**：条目多到要滚动、又天然分类的菜单（模型选择、命令面板、技能列表）。滚动容器必须是无 padding、无边框的元素，\`MenuGroup\` 是它的**直接子元素**。
**什么时候不用**：几行的短菜单用 \`Menu\` 的 \`type: 'label'\` 条目就够；不滚动的分组不需要 \`observeStickyMenuGroups\`。
**可访问性**：每组是 \`role="group"\`，可访问名来自标题；定位用的哨兵元素 \`aria-hidden\`。\`label\` 由调用方本地化。
**相关 token**：\`--dsw-alias-menu-group-header-fill\`（吸顶标题底）、\`--dsw-alias-label-tertiary\`（标题字色）、\`--dsw-radius-md\`（非 macOS 桌面壳下标题圆角）。`,
      },
    },
  },
  args: { label: '最近使用' },
  argTypes: { children: { control: false } },
} satisfies Meta<typeof MenuGroup>
export default meta
type Story = StoryObj<typeof meta>

const row: CSSProperties = {
  padding: '6px 8px',
  borderRadius: 'var(--dsw-radius-sm)',
  color: 'var(--dsw-alias-label-primary)',
  font: 'var(--dsw-font-s-14)',
}

const rows = (prefix: string, count: number) =>
  Array.from({ length: count }, (_, index) => (
    <div key={index} role="menuitem" style={row}>
      {prefix} {index + 1}
    </div>
  ))

/** 单个分组：标题 + 若干行。 */
export const Default: Story = {
  render: (args) => (
    <MenuSurface role="menu" aria-label="示例菜单" style={{ width: 240, padding: 4 }}>
      <MenuGroup {...args}>{rows('会话', 3)}</MenuGroup>
    </MenuSurface>
  ),
}

/** 可滚动的多分组：往下滚，当前组标题吸顶并填上底色（`observeStickyMenuGroups` 加的 `data-stuck`）。 */
export const StickyHeadings: Story = {
  render: () => {
    const viewport = useRef<HTMLDivElement>(null)
    useEffect(() => (viewport.current ? observeStickyMenuGroups(viewport.current) : undefined), [])
    return (
      <MenuSurface role="menu" aria-label="模型" style={{ width: 240, padding: 4 }}>
        <div ref={viewport} style={{ maxHeight: 220, overflowY: 'auto' }}>
          <MenuGroup label="推荐">{rows('模型', 4)}</MenuGroup>
          <MenuGroup label="企业自定义">{rows('自定义模型', 5)}</MenuGroup>
          <MenuGroup label="其他">{rows('其他模型', 6)}</MenuGroup>
        </div>
      </MenuSurface>
    )
  },
}
