import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card, Spinner } from '@seekbuddy/dsh-ui/seekbuddy'

const meta = {
  title: 'SeekBuddy 扩展层/Card',
  component: Card,
  parameters: {
    docs: {
      description: {
        component: `卡片**面**：底色、发丝描边、\`--dsw-radius-lg\` 圆角、投影、内边距，仅此而已，内容完全交给 \`children\`。上游 primitives 没有 Card / Panel，各处手写的卡片配方容易分叉（圆角、阴影各不相同），所以收为扩展组件。**不做** header / footer / title 插槽——业务卡片的内部结构统一不了，也不该由组件库统一。

**什么时候用**：目录页的条目卡片、任务卡与模板卡、任何"一块有边界的面"。列表里用 \`as="li"\` 少包一层。

**什么时候不用**：需要标题栏 / 底栏结构的，自己在 children 里排；浮层与菜单用上游 \`Menu\` / \`HoverCard\`（它们用 \`elevation-prominent\`）；整块可点且要键盘可达的，在 children 里放 \`<button>\` 或自己加 \`role="button"\` 与键盘处理——Card 不设 role / tabIndex，不替调用方做半吊子的可点容器。

**可访问性**：纯展示容器，语义由 \`as\` 决定（\`section\` / \`article\` 自带地标或文章语义，记得配标题或 \`aria-label\`）。server-safe：无 Hook、无 DOM 访问，Next.js 服务端组件可从精确子入口 \`@seekbuddy/dsh-ui/seekbuddy/card\` 引入，零 JS 下发。

**各状态怎么落**：Card 只是面，Loading / Empty / Error 是**内容**的状态，由调用方在 children 里渲染（见 ContentStates story：加载中放 \`Spinner\` + 文案，空态放一句说明，错误放 \`--dsw-alias-state-error-primary\` 文案 + 重试按钮），Card 保证面在三种内容下都成立；Disabled 对容器不适用，可点卡片禁用时调用方去掉 \`interactive\` 与点击；键盘聚焦由调用方决定是否 \`tabIndex\`，一旦可聚焦，Card 自带与其它控件相同的 business-primary 焦点环；窄屏 / 200% 缩放靠不设固定宽高、内边距不随视口缩放；无动效，Reduced Motion 天然满足。

**相关 token 与三项裁决（2026-09-04，2026-09-25 随 dsh 0.1.7-rc.2 复核）**：① 圆角走上游刻度 **\`--dsw-radius-lg\`**（16px；上游卡片类同档，此前写死 12px）；② 阴影用上游语义 token **\`--dsw-elevation-panel\`**，\`border: 0\`——描边由 token 内的 0.5px 发丝线承担，再画 border 会成双线；描边色重绑到 **\`--dsw-alias-border-l3\`**，即上游插件管理页给 48px 插件图标和面板用的那条边（默认 l4 在亮色下几乎看不见）；悬停（\`interactive\`）整块填 **\`--dsw-alias-interactive-bg-hover\`**，与上游插件卡片 / 清单行的 hover 同一层半透明色，描边与投影不动；③ **开 server-safe 子入口**。底色 \`--dsw-alias-bg-layer-1\`、文字 \`--dsw-alias-label-primary\`。`,
      },
    },
  },
  args: {
    padding: 'md',
    interactive: false,
    as: 'div',
    children: (
      <>
        <strong style={{ display: 'block', marginBottom: 6 }}>每日 AI 新闻简报</strong>
        <span style={{ color: 'var(--dsw-alias-label-tertiary)' }}>每天 08:00 · 上次运行 2m 45s</span>
      </>
    ),
  },
  argTypes: {
    padding: { control: 'inline-radio', options: ['none', 'sm', 'md'] },
    as: { control: 'inline-radio', options: ['div', 'section', 'article', 'li'] },
    children: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>
export default meta
type Story = StoryObj<typeof meta>

/** 默认：`padding="md"`（16px），静止态 `elevation-panel` + `border-l3` 描边。切换明暗看描边与柔光。 */
export const Default: Story = {}

/** 三档内边距并排：`none` 给自己排版的内容（如整幅封面图），`sm` 14px 给紧凑目录卡，`md` 16px 默认。 */
export const Padding: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      <Card {...args} padding="none">
        <div style={{ padding: 12, background: 'var(--dsw-alias-bg-layer-2)', borderRadius: '12px 12px 0 0' }}>
          封面区（自己排版）
        </div>
        <div style={{ padding: '10px 12px' }}>padding=&quot;none&quot;</div>
      </Card>
      <Card {...args} padding="sm">
        padding=&quot;sm&quot;（14px）
      </Card>
      <Card {...args} padding="md">
        padding=&quot;md&quot;（16px）
      </Card>
    </div>
  ),
}

/** `interactive`：悬停时整块填 `--dsw-alias-interactive-bg-hover`（上游插件卡片同款）、指针变手。点击行为由调用方接 `onClick`。 */
export const Interactive: Story = {
  args: { interactive: true, onClick: () => undefined, role: 'button', tabIndex: 0 },
}

/** `as="li"`：列表里直接当列表项，`list-style` 已清，不用再包一层。 */
export const AsListItem: Story = {
  render: (args) => (
    <ul style={{ display: 'grid', gap: 12, margin: 0, padding: 0 }}>
      {['股价监控与预警', '每日 AI 新闻简报', '周报汇总'].map((title) => (
        <Card {...args} as="li" key={title}>
          {title}
        </Card>
      ))}
    </ul>
  ),
}

/** 空 children：照常渲染空面，可作占位骨架的底。 */
export const Empty: Story = {
  args: { children: undefined, style: { minHeight: 96 } },
}

/** 内容三态示范：Card 只给面，加载中 / 空 / 错误都是 children 的事；错误文案用 `--dsw-alias-state-error-primary`。 */
export const ContentStates: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      <Card {...args} aria-busy>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--dsw-alias-label-tertiary)' }}>
          <Spinner label="加载中" />
          正在加载任务…
        </div>
      </Card>
      <Card {...args}>
        <div style={{ color: 'var(--dsw-alias-label-tertiary)', textAlign: 'center' }}>
          还没有任务，点右上角"新建"开始
        </div>
      </Card>
      <Card {...args} role="alert">
        <div style={{ color: 'var(--dsw-alias-state-error-primary)' }}>加载失败：网络超时</div>
        <button
          type="button"
          style={{
            marginTop: 8,
            font: 'inherit',
            color: 'var(--dsw-alias-state-business-primary)',
            background: 'none',
            border: 0,
            padding: 0,
            cursor: 'pointer',
          }}
        >
          重试
        </button>
      </Card>
    </div>
  ),
}
