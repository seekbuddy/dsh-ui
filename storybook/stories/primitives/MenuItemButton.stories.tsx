import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Menu, MenuItemButton } from '@seekbuddy/dsh-ui'
import { IconCopyOutlineRegular, IconEditOutlineRegular, IconTrashOutlineRegular } from '@seekbuddy/dsh-ui/icons'

const meta = {
  title: '镜像层（上游同步）/Menu/MenuItemButton',
  component: MenuItemButton,
  parameters: {
    docs: {
      description: {
        component: `\`Menu\` 的**子元素写法**里的一行：0.1.7 起 \`Menu\` 的 \`items\` 变成可选，可以直接放 \`children\`，每行是一个 \`MenuItemButton\`（\`icon\` / \`disabled\` / \`danger\` / \`separatorBefore\` / \`onSelect\`）。适合行为各不相同、不方便压成 \`MenuEntry[]\` 数据的菜单；样式与 \`items\` 写法的行完全一致。上游同步件，源码不改。

**什么时候用**：动作菜单（重命名 / 复制 / 删除），每行各调各的回调。
**什么时候不用**：需要 \`selectedId\` 打勾、子菜单、标题行时用 \`items\` 数据写法（见 [Menu](?path=/docs/镜像层（上游同步）-menu--docs)）；不在 \`Menu\` 里单独用。
**可访问性**：\`<button role="menuitem">\`，文字即可访问名；\`danger\` 只改颜色，破坏性动作的二次确认仍由调用方负责。
**相关 token**：同 \`Menu\`——\`--dsw-alias-interactive-bg-hover\` / \`-hover-danger\`、\`--dsw-alias-state-error-primary\`（danger）、\`--dsw-alias-label-primary\` / \`-tertiary\`、\`--dsw-alias-border-l1\`（分隔线）。`,
      },
    },
  },
  args: { children: '重命名', onSelect: () => {} },
  argTypes: { onSelect: { control: false } },
} satisfies Meta<typeof MenuItemButton>
export default meta
type Story = StoryObj<typeof meta>

/** 子元素写法的动作菜单：最后一行 `danger` + `separatorBefore`。 */
export const InMenu: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    const [last, setLast] = useState('—')
    const pick = (action: string) => () => {
      setLast(action)
      setOpen(false)
    }
    return (
      <div style={{ display: 'grid', gap: 8, justifyItems: 'start', minHeight: 180 }}>
        <Menu
          open={open}
          onClose={() => setOpen(false)}
          anchor={
            <Button variant="outline" onClick={() => setOpen((value) => !value)}>
              更多操作
            </Button>
          }
        >
          <MenuItemButton icon={<IconEditOutlineRegular />} onSelect={pick('重命名')}>
            重命名
          </MenuItemButton>
          <MenuItemButton icon={<IconCopyOutlineRegular />} onSelect={pick('复制链接')}>
            复制链接
          </MenuItemButton>
          <MenuItemButton icon={<IconCopyOutlineRegular />} disabled onSelect={pick('导出')}>
            导出（不可用）
          </MenuItemButton>
          <MenuItemButton icon={<IconTrashOutlineRegular />} danger separatorBefore onSelect={pick('删除')}>
            删除
          </MenuItemButton>
        </Menu>
        <span style={{ font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-tertiary)' }}>
          上次选择：{last}
        </span>
      </div>
    )
  },
}
