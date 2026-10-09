import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Pagination, type PaginationLabels } from '@seekbuddy/dsh-ui/seekbuddy'

const labels: PaginationLabels = {
  navigation: '分页',
  previous: '上一页',
  next: '下一页',
  page: (page) => `第 ${page} 页`,
  jumpPrevious: '向前 5 页',
  jumpNext: '向后 5 页',
}

const meta = {
  title: 'SeekBuddy 扩展层/Pagination',
  component: Pagination,
  parameters: {
    docs: {
      description: {
        component: `目录列表的**分页条**，props 对齐 antd Pagination 的常用子集。

**接口**：\`current\` / \`defaultCurrent\` 受控或非受控；\`total\` + \`pageSize\`（或 \`defaultPageSize\`，默认 10）算出总页数；\`onChange(page, pageSize)\`，pageSize 一并带出，将来加每页条数切换时签名不变；\`showTotal(total, [from, to])\` 返回左侧总数文案；\`hideOnSinglePage\` **默认 true**（antd 默认 false，仓库两处现状都是隐藏）；\`simple\` 只出上一页 / \`current / pages\` / 下一页；\`showLessItems\` 中间窗口从 5 格收到 3 格；\`disabled\` 整体禁用。**不收** antd 的每页条数切换、快速跳页、\`itemRender\`、\`size\` / \`align\` 等外观项。

**页码算法照 antd**：总页数 ≤ 7（\`showLessItems\` 时 ≤ 5）全列；否则首页、尾页常驻，中间以当前页为中心取 5 格（3 格），靠近两端时窗口从该端数满；窗口与首 / 尾之间有空隙就放省略号按钮，悬停变成 « »，点击跳 ±5 页（±3）。上一页 / 下一页在边界禁用；\`current\` 越界时钳制显示、不回调。

**文案全部来自 \`labels\`**（导航 aria、上一页、下一页、第 N 页、向前 / 向后 N 页），组件无自然语言字。当前页 \`aria-current="page"\`；按钮全部是上游 \`Button\`（ghost / sm），焦点环与键盘顺序随之；\`pageItems()\` 纯函数单独导出。

**token**：当前页底色 \`--dsw-alias-interactive-bg-active\`，总数文案与省略号 \`--dsw-alias-label-tertiary\`，simple 计数 \`--dsw-alias-label-secondary\`，字号 \`--dsw-font-xs-13\`。有 Hook（非受控态），只从聚合入口取。`,
      },
    },
  },
  args: { total: 85, pageSize: 20, defaultCurrent: 1, labels },
  argTypes: {
    labels: { control: false },
    onChange: { control: false },
    showTotal: { control: false },
  },
} satisfies Meta<typeof Pagination>
export default meta
type Story = StoryObj<typeof meta>

/** 你给的例子：85 条、每页 20，共 5 页，全列，无省略号。非受控，直接点着翻。 */
export const Default: Story = {}

/** 50 页，受控：中段两侧都有省略号，悬停省略号变 « »，点一下跳 5 页。 */
export const ManyPages: Story = {
  render: (args) => {
    const [current, setCurrent] = useState(25)
    return <Pagination {...args} total={1000} pageSize={20} current={current} onChange={setCurrent} />
  },
}

/** 靠近两端：窗口从该端数满（1…5 ••• 50 / 1 ••• 46…50），只剩一侧省略号。 */
export const Edges: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      <Pagination {...args} total={1000} pageSize={20} current={2} />
      <Pagination {...args} total={1000} pageSize={20} current={49} />
    </div>
  ),
}

/** `showTotal`：左侧总数文案，range 是当前页的 [起, 止] 条序号。 */
export const WithTotal: Story = {
  args: {
    total: 85,
    pageSize: 20,
    defaultCurrent: 2,
    showTotal: (total, [from, to]) => `第 ${from}-${to} 条，共 ${total} 条`,
  },
}

/** `showLessItems`：中间 3 格，窄屏或紧凑行用；跳页步长随之变 ±3。 */
export const LessItems: Story = {
  args: { total: 1000, pageSize: 20, defaultCurrent: 25, showLessItems: true },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
}

/** `simple`：上一页 / `3 / 5` / 下一页，console 目录页现在的形态。 */
export const Simple: Story = {
  args: { simple: true, defaultCurrent: 3 },
}

/** `disabled`：列表刷新中整体禁用，防连点。 */
export const Disabled: Story = {
  args: { disabled: true, defaultCurrent: 3 },
}

/** 单页：`hideOnSinglePage` 默认 true 不渲染；传 false 时出一个禁用的 1 页条。 */
export const SinglePage: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ color: 'var(--dsw-alias-label-tertiary)', font: 'var(--dsw-font-xs-13)' }}>
        hideOnSinglePage（默认）→ 下面什么都没有
      </div>
      <Pagination {...args} total={12} pageSize={20} />
      <div style={{ color: 'var(--dsw-alias-label-tertiary)', font: 'var(--dsw-font-xs-13)' }}>
        hideOnSinglePage=false
      </div>
      <Pagination {...args} total={12} pageSize={20} hideOnSinglePage={false} />
    </div>
  ),
}
