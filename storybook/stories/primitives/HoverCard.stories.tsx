import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, HoverCard } from '@seekbuddy/dsh-ui'
import { IconLinkOutlineRegular } from '@seekbuddy/dsh-ui/icons'

/** 会话预览卡内容：卡片面是固定深色，文字继承卡片的白色，内容自己不要设颜色。 */
function SessionPreview({ title, meta }: { title: string; meta: string }) {
  return (
    <div style={{ display: 'grid', gap: 4 }}>
      <strong style={{ fontSize: 14, lineHeight: '20px' }}>{title}</strong>
      <span style={{ fontSize: 12, lineHeight: '18px', opacity: 0.7 }}>{meta}</span>
    </div>
  )
}

const meta = {
  title: '镜像层（上游同步）/HoverCard',
  component: HoverCard,
  parameters: {
    docs: {
      description: {
        component: `悬停预览卡：把 \`anchor\` 原地包一层 span，指针停留 \`openDelayMs\`（默认 500ms）后在锚点右侧 8px 处弹出 portal 到 body 的固定定位卡片（244 宽，贴底边自动上收）。上游同步件，源码不改。

**什么时候用**：列表行 / 引用 chip 的"悬停看详情"——会话预览、文件路径、链接目标；配 \`copyText\` 时卡片本身还是一个"复制主值"的按钮（点击或 Enter / 空格复制，卡片内文字被选中时点击不触发复制，1 秒后自动恢复）。
**什么时候不用**：一句话的短提示用 \`Tooltip\`；需要可点击的操作列表用 \`Menu\`；需要用户明确关闭的内容用 \`Modal\`——HoverCard 自身没有任何关闭控件，只靠指针离开关闭。
**可访问性**：纯预览时卡片没有角色，只是可读可选的浮层；给了 \`copyText\` 后卡片是 \`role="button"\`、可 Tab 聚焦，可访问名是 \`\`\`\${copyLabel}: \${copyText}\`\`\`，复制成功通过锚点旁的 \`role="status"\` 播报 \`copiedLabel\`。锚点内部按下（行点击、菜单触发）立即关卡；宿主把 \`disabled\` 翻 true（菜单打开、拖拽开始）也立即关。
**pointer grace**：指针离开锚点不会立刻关——有 200ms 宽限（\`POINTER_GRACE_MS\`），足够穿过锚点到卡片的 8px 间隙；停在卡片上或回到锚点都取消关闭，真正离开 200ms 后才收。
**相关 token**：\`--dsw-shadow-lv3\`（卡片投影）、\`--dsw-alias-state-business-primary\`（可复制卡片的焦点环）。卡片底色是组件级变量 \`--dsw-hovercard-bg\`（figma 定值，明暗两套相同）、文字固定白色，不随主题变。`,
      },
    },
  },
  args: {
    anchor: <Button variant="ghost">悬停看卡片</Button>,
    content: <SessionPreview title="支付重构" meta="12 条消息 · 3 分钟前" />,
    copyLabel: '复制',
    copiedLabel: '已复制',
    openDelayMs: 500,
    disabled: false,
  },
  argTypes: { anchor: { control: false }, content: { control: false } },
} satisfies Meta<typeof HoverCard>
export default meta
type Story = StoryObj<typeof meta>

/** 纯预览：不传 `copyText`，卡片只是可读、可选中文字的浮层，没有按钮语义。 */
export const Default: Story = {}

/** 带复制：`copyText` 是复制的主值，卡片变成 `role="button"`，点击 / Enter / 空格复制，1 秒内显示 `copiedLabel`。 */
export const WithCopy: Story = {
  args: {
    copyText: 'dsh-session:session-42',
    content: <SessionPreview title="支付重构" meta="点击卡片复制会话引用" />,
  },
}

/** pointer grace：把 `openDelayMs` 调到 100 方便试——弹出后把指针从锚点横移进卡片，中间 8px 间隙不会让它关掉；在卡片上停留、拖选文字都可以，离开 200ms 后才收。 */
export const PointerGrace: Story = {
  args: {
    openDelayMs: 100,
    copyText: 'https://example.com/docs/hover-card',
    anchor: (
      <Button variant="ghost" icon={<IconLinkOutlineRegular />}>
        把指针移进卡片试试
      </Button>
    ),
    content: <SessionPreview title="离开锚点不会立刻关" meta="穿过间隙进卡片，停留、选中文字都保持打开" />,
  },
}

/** `disabled`：悬停不再弹出；打开中翻成 true 会立即关闭（宿主在菜单打开、拖拽开始时用）。 */
export const Disabled: Story = { args: { disabled: true } }

/** 组合样张：外层 span 是 `display: block`，专门给整行列表项做锚点——三行分别是纯预览 / 带复制 / 禁用。 */
export const AllVariants: Story = {
  render: (args) => {
    const rowStyle = { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', cursor: 'default' } as const
    return (
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, width: 280, display: 'grid', gap: 2 }}>
        <li>
          <HoverCard
            {...args}
            anchor={<div style={rowStyle}>支付重构（纯预览）</div>}
            content={<SessionPreview title="支付重构" meta="12 条消息 · 3 分钟前" />}
          />
        </li>
        <li>
          <HoverCard
            {...args}
            copyText="dsh-session:session-43"
            copyLabel="复制"
            copiedLabel="已复制"
            anchor={<div style={rowStyle}>登录改造（可复制）</div>}
            content={<SessionPreview title="登录改造" meta="点击卡片复制会话引用" />}
          />
        </li>
        <li>
          <HoverCard
            {...args}
            disabled
            anchor={<div style={{ ...rowStyle, opacity: 0.5 }}>已归档会话（禁用，悬停无卡）</div>}
            content={<SessionPreview title="已归档会话" meta="不会显示" />}
          />
        </li>
      </ul>
    )
  },
}
