import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@seekbuddy/dsh-ui'
import { IconPaperclipOutlineRegular } from '@seekbuddy/dsh-ui/icons'
import { MessageProvider, useMessage, type MessageClose } from '@seekbuddy/dsh-ui/seekbuddy'

const meta = {
  title: 'SeekBuddy 扩展层/Message',
  component: MessageProvider,
  parameters: {
    docs: {
      description: {
        component: `顶部堆叠的**短时消息**，API 对齐 antd message 的 \`useMessage\` 形态。上游只有一个单条 \`Toast\` 展示件，要调用方自己挂载卸载、重复消息换 key；手写管理时用 \`Date.now()\` 当 key，同一毫秒两条会丢一条。这里把"堆栈 + 计时 + key 更新"收进 \`MessageProvider\`，页面用 \`useMessage()\` 拿到 \`success / info / warning / error / loading / open / destroy\`。

**不做全局单例** \`message.success()\`：插件各自内联一份聚合入口，全局 store 会在 console 与每个插件 bundle 里裂成多份互不可见。Provider 包在页面根，一页一个。

**行为**：\`duration\` 秒，默认 3，\`0\` 常驻直到返回的 \`close()\` 或 \`destroy(key)\`；\`loading\` 默认常驻。同 \`key\` 再次 \`open\` 原地更新（loading → success），不新增一条并重置计时。\`maxCount\`（默认 3）超出时最早的先关。淡出 1000ms 后移除并调 \`onClose\`。\`useMessage()\` 返回的对象引用稳定，可进 effect 依赖；Provider 外调用抛错。

**视觉复用上游 Toast**：\`--dsw-alias-button-contrast-fill\` 深色胶囊、\`--dsw-alias-label-primary-inverted\` 文字、圆角 14、\`--dsw-shadow-lv3\`、距顶 120px（\`top\` 可配）、z-index 1100、\`pointer-events: none\`、滑入 160ms + 淡出 1000ms，reduced-motion 只淡出。只加一个按类型着色的图标：success \`--dsw-alias-state-success-primary\`、error \`--dsw-alias-state-error-primary\`、warning \`--dsw-alias-state-warn-label\`、loading 放 \`Spinner\`；上游没有 info 图标，内联画了一个。error 条 \`role="alert"\`，其余 \`role="status"\`。组件无自然语言字，不需要 \`labels\`。

**不收** antd 的 \`message.config\`（\`getContainer\` / \`rtl\` / \`prefixCls\`）、\`contextHolder\` 写法、\`.then()\`、hover 暂停、关闭按钮。有 Hook 与 context，只从聚合入口取。`,
      },
    },
  },
  args: { top: 120, maxCount: 3, children: null },
  argTypes: { children: { control: false } },
} satisfies Meta<typeof MessageProvider>
export default meta
type Story = StoryObj<typeof meta>

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{children}</div>
}

function Types() {
  const message = useMessage()
  return (
    <Row>
      <Button variant="outline" onClick={() => message.success('技能已安装')}>
        success
      </Button>
      <Button variant="outline" onClick={() => message.info('已复制标识符')}>
        info
      </Button>
      <Button variant="outline" onClick={() => message.warning('第 3 个文件超过 10 MB，已跳过')}>
        warning
      </Button>
      <Button variant="outline" onClick={() => message.error('卸载失败：实例未响应')}>
        error
      </Button>
      <Button variant="outline" onClick={() => message.loading('正在同步到实例…', 2)}>
        loading（2 秒）
      </Button>
    </Row>
  )
}

/** 五种类型各一条，默认 3 秒后淡出。 */
export const Default: Story = {
  render: (args) => (
    <MessageProvider {...args}>
      <Types />
    </MessageProvider>
  ),
}

function ShowcaseDemo() {
  const message = useMessage()
  useEffect(() => {
    message.success('技能已安装', 0)
    message.info('已复制标识符', 0)
    message.warning('第 3 个文件超过 10 MB，已跳过', 0)
    message.error('卸载失败：实例未响应', 0)
    message.loading('正在同步到实例…')
    return () => message.destroy()
  }, [message])
  return null
}

/** 五种类型并排常驻（`duration: 0`，`maxCount=5`），看图标着色与堆叠间距；切换明暗对比胶囊。 */
export const Showcase: Story = {
  args: { maxCount: 5 },
  render: (args) => (
    <MessageProvider {...args}>
      <ShowcaseDemo />
    </MessageProvider>
  ),
}

function Burst() {
  const message = useMessage()
  const [count, setCount] = useState(0)
  return (
    <Row>
      <Button
        variant="primary"
        onClick={() => {
          setCount((n) => n + 1)
          message.info(`第 ${count + 1} 条`)
        }}
      >
        连点
      </Button>
      <Button variant="outline" onClick={() => message.destroy()}>
        destroy() 清空
      </Button>
    </Row>
  )
}

/** 连点堆叠：`maxCount=3`，第 4 条进来时最早的一条先淡出；`destroy()` 一次关掉全部。 */
export const Stack: Story = {
  render: (args) => (
    <MessageProvider {...args}>
      <Burst />
    </MessageProvider>
  ),
}

function Keyed() {
  const message = useMessage()
  return (
    <Button
      variant="primary"
      onClick={() => {
        message.open({ key: 'sync', type: 'loading', content: '正在发布 1.2.0…' })
        setTimeout(() => message.open({ key: 'sync', type: 'success', content: '1.2.0 已发布', duration: 2 }), 1500)
      }}
    >
      发布（loading → success）
    </Button>
  )
}

/** `key` 原地更新：同一个 key 先 loading 常驻，1.5 秒后换成 success 并开始 2 秒计时，不新增条。 */
export const KeyUpdate: Story = {
  render: (args) => (
    <MessageProvider {...args}>
      <Keyed />
    </MessageProvider>
  ),
}

function Sticky() {
  const message = useMessage()
  const close = useRef<MessageClose | null>(null)
  return (
    <Row>
      <Button
        variant="outline"
        onClick={() => {
          close.current?.()
          close.current = message.open({ type: 'warning', content: '实例离线，操作将在重连后生效', duration: 0 })
        }}
      >
        常驻 warning
      </Button>
      <Button variant="outline" onClick={() => close.current?.()}>
        用返回的 close() 关闭
      </Button>
    </Row>
  )
}

/** `duration: 0` 常驻，用 `open` 返回的 `close()` 手动关闭。 */
export const Persistent: Story = {
  render: (args) => (
    <MessageProvider {...args}>
      <Sticky />
    </MessageProvider>
  ),
}

function Custom() {
  const message = useMessage()
  return (
    <Button
      variant="outline"
      onClick={() =>
        message.open({ type: 'success', content: '已附加 3 个文件', icon: <IconPaperclipOutlineRegular /> })
      }
    >
      自定义图标
    </Button>
  )
}

/** `icon` 覆盖类型默认图标，颜色仍随类型。 */
export const CustomIcon: Story = {
  render: (args) => (
    <MessageProvider {...args}>
      <Custom />
    </MessageProvider>
  ),
}

/** Provider `top`：改成 24px 贴近顶栏，`maxCount=1` 只保留最新一条。 */
export const Placement: Story = {
  args: { top: 24, maxCount: 1 },
  render: (args) => (
    <MessageProvider {...args}>
      <Burst />
    </MessageProvider>
  ),
}
