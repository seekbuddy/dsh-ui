import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tabs } from '@seekbuddy/dsh-ui/seekbuddy/tabs'
import type { TabsProps } from '@seekbuddy/dsh-ui/seekbuddy/tabs'

type Id = 'installed' | 'uploaded' | 'archived'

const meta = {
  title: 'SeekBuddy 扩展层/Tabs',
  component: Tabs,
  parameters: {
    docs: {
      description: {
        component: `下划线视图切换（WAI-ARIA tabs，自动激活）。受控组件（antd 同名 \`items\` / \`activeKey\` / \`onChange\`）：\`activeKey\` 由调用方持有（可以是 URL 状态，也可以是 \`useState\`）。上游 primitives 没有 Tabs——它的视图切换是一排 \`Pill\`——所以这是 SeekBuddy 扩展组件。

**什么时候用**：同一页面内几个平级视图之间切换（技能页的"已安装 / 我上传的"、资源目录的"目录 / 已安装"），选中态需要持久（URL 或状态）。

**什么时候不用**：筛选条件的多选 / 标签（用 \`Pill\`）；跨页面导航（用真实链接）；只有一个视图时不要为了样式套 Tabs。

**可访问性**：容器 \`role="tablist"\` 带 \`aria-label\`（\`label\` 必填）；每项 \`role="tab"\` + \`aria-selected\`；roving tabindex（只有选中项在 Tab 序里），←/→/↑/↓ 切换并移焦，Home / End 到首尾，首尾环绕，禁用项跳过。传 \`panelId\` 后每个 tab 带 \`aria-controls\`，面板用 \`aria-labelledby="<panelId>-tab-<key>"\` 回指；给 \`items[].children\` 则由组件自己渲染 \`role="tabpanel"\` 并接好 aria。

**相关 token**：\`--dsw-alias-border-l1\`（底线）、\`--dsw-alias-label-tertiary\` / \`--dsw-alias-label-primary\`（未选 / 选中文字）、\`--dsw-alias-state-business-primary\`（下划线与焦点环）、\`--dsw-alias-label-secondary\` + \`--dsw-alias-interactive-bg-active\`（计数徽标；原 caption + bg-overlay 亮色太淡、暗色灰字压灰底，2026-09-04 改）、\`--dsw-font-xxs-12\` / \`--dsw-font-xxxs-11\`。`,
      },
    },
  },
  args: {
    label: '技能视图',
    items: [
      { key: 'installed', label: '已安装', count: 12 },
      { key: 'uploaded', label: '我上传的', count: 3 },
      { key: 'archived', label: '已归档', disabled: true },
    ],
    activeKey: 'installed',
    onChange: () => undefined,
  },
  argTypes: {
    onChange: { control: false },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    bold: { control: 'boolean' },
  },
  // 受控：把 args.activeKey 接到本地 state，Controls 改 activeKey 也会生效
  render: (args) => {
    const [value, setValue] = useState<Id>(args.activeKey as Id)
    return <Tabs {...(args as TabsProps<Id>)} activeKey={value} onChange={setValue} />
  },
} satisfies Meta<typeof Tabs>
export default meta
type Story = StoryObj<typeof meta>

/** 默认：两个可用项 + 一个禁用项，用键盘 ←/→ 试试。 */
export const Default: Story = {}

/** 不带计数徽标。 */
export const WithoutCount: Story = {
  args: {
    items: [
      { key: 'installed', label: '目录' },
      { key: 'uploaded', label: '已安装' },
      { key: 'archived', label: '我上传的' },
    ],
  },
}

/** 全部可用且带计数：徽标随 `count` 出现，`count` 为 undefined 时不渲染。 */
export const AllEnabled: Story = {
  args: {
    items: [
      { key: 'installed', label: '已安装', count: 12 },
      { key: 'uploaded', label: '我上传的', count: 3 },
      { key: 'archived', label: '已归档', count: 0 },
    ],
  },
}

/** 挂上 `panelId`：每个 tab 带 `aria-controls`，面板用 `<panelId>-tab-<key>` 回指。 */
export const WithPanel: Story = {
  args: { panelId: 'skills-panel' },
  render: (args) => {
    const [value, setValue] = useState<Id>('installed')
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <Tabs {...(args as TabsProps<Id>)} activeKey={value} onChange={setValue} />
        <p id="skills-panel" role="tabpanel" aria-labelledby={`skills-panel-tab-${value}`} style={{ margin: 0 }}>
          当前视图：{value}
        </p>
      </div>
    )
  },
}

/** 项目多到超出容器宽度时横向滚动（`overflow-x: auto`），窄容器演示。 */
export const Overflow: Story = {
  render: () => {
    type Many = 'a' | 'b' | 'c' | 'd' | 'e' | 'f'
    const [value, setValue] = useState<Many>('a')
    return (
      <div style={{ width: 260 }}>
        <Tabs<Many>
          label="很多视图"
          activeKey={value}
          onChange={setValue}
          items={[
            { key: 'a', label: '全部资源', count: 128 },
            { key: 'b', label: '已安装', count: 12 },
            { key: 'c', label: '我上传的', count: 3 },
            { key: 'd', label: '待审核' },
            { key: 'e', label: '已归档' },
            { key: 'f', label: '回收站' },
          ]}
        />
      </div>
    )
  },
}

/** `items[].children`：面板交给组件渲染（antd 写法），aria-controls / aria-labelledby 自动接好。 */
export const WithChildren: Story = {
  render: () => {
    const [key, setKey] = useState<Id>('installed')
    return (
      <Tabs<Id>
        label="技能视图"
        activeKey={key}
        onChange={setKey}
        items={[
          {
            key: 'installed',
            label: '已安装',
            count: 12,
            children: <p style={{ margin: 0 }}>已安装的 12 个技能列表</p>,
          },
          { key: 'uploaded', label: '我上传的', count: 3, children: <p style={{ margin: 0 }}>我上传的 3 个技能</p> },
          { key: 'archived', label: '已归档', disabled: true, children: null },
        ]}
      />
    )
  },
}

/** `size="md"`：14px 标签，卡片 / 抽屉内的分组切换。 */
export const Medium: Story = {
  args: { size: 'md' },
}

/** 页面级主视图切换用 `size="lg"`（16px 标签）。 */
export const Large: Story = {
  args: { size: 'lg' },
}

/** `bold`：整组标签换 `-strong-` token；页面级主视图切换常用 `size="lg" bold`。 */
export const Bold: Story = {
  args: { size: 'lg', bold: true },
}
