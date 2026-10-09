import { useEffect, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Button, ConnectionIndicator } from '@seekbuddy/dsh-ui'
import type { ConnectionIndicatorState } from '@seekbuddy/dsh-ui'

/** 六个 labels（字段名即组件 props 名），消费者照抄这份即可；组件自己不带任何文案。 */
const CONNECTION_LABELS = {
  /** 断线时的可见文字 */
  disconnectedLabel: '连接已中断',
  /** 悬停 / 聚焦时替换显示的动作文字 */
  reconnectLabel: '立即重连',
  /** 重连中的可见文字，后面跟三个逐个出现的点 */
  connectingLabel: '正在重连',
  /** 恢复后的可见文字（同时是 role=status 的可访问名） */
  recoveredLabel: '连接已恢复',
  /** 断线态按钮的可访问名 */
  reconnectActionLabel: '重新连接',
  /** 重连中再次点击（替换当前尝试）的可访问名 */
  restartActionLabel: '重新开始连接',
} as const

const STATE_CAPTIONS: Record<ConnectionIndicatorState, string> = {
  disconnected: 'disconnected · 悬停显示动作',
  connecting: 'connecting · 点了可重开一次',
  recovered: 'recovered · 只读状态',
}

const meta = {
  title: '镜像层（上游同步）/ConnectionIndicator',
  component: ConnectionIndicator,
  parameters: {
    docs: {
      description: {
        component: `行内连接反馈控件：\`disconnected\` / \`connecting\` 是一个琥珀色按钮（悬停 / 聚焦时文字换成 \`reconnectLabel\`，点击触发 \`onReconnect\`），\`recovered\` 是绿色只读状态，\`state\` 为 \`undefined\` 时返回 \`null\`。四段文字用隐藏副本撑出同一宽度，切换状态不抖动。上游同步件，源码不改。

**什么时候用**：顶栏 / 状态栏里的实时连接反馈——SSE 断了、正在重试、刚恢复；恢复态由调用方在一两秒后把 \`state\` 置回 \`undefined\` 收起。
**什么时候不用**：不是"连接"语义的进度或状态别借它的颜色——任务状态用 \`StateDot\`，通用加载用扩展层 \`Spinner\`，全局提示用 \`Toast\`。
**可访问性**：断线 / 重连中是 \`<button>\`，可访问名分别是 \`reconnectActionLabel\` / \`restartActionLabel\`（不是可见文字）；恢复态是 \`role="status"\`，可访问名 \`recoveredLabel\`，会被读屏播报。图标与撑宽用的副本都 \`aria-hidden\`；重连中的三个点 \`aria-hidden\` 且尊重 \`prefers-reduced-motion\`。
**相关 token**：\`--dsw-alias-state-warn-tertiary\` / \`--dsw-alias-state-warn-label\` / \`--dsw-alias-state-warn-primary\`（断线、重连中）、\`--dsw-alias-state-success-tertiary\` / \`--dsw-alias-state-success-primary\`（恢复）。

六个 labels 的中文样板见本文件顶部的 \`CONNECTION_LABELS\` 常量；\`onReconnect\` 已接到 **Actions** 面板。`,
      },
    },
  },
  // onReconnect 用 storybook/test 的 fn()：调用记录到 Actions 面板
  args: { state: 'disconnected', ...CONNECTION_LABELS, onReconnect: fn() },
  argTypes: {
    state: { control: 'select', options: ['disconnected', 'connecting', 'recovered'] },
  },
} satisfies Meta<typeof ConnectionIndicator>
export default meta
type Story = StoryObj<typeof meta>

/** `disconnected`：琥珀色按钮，悬停 / 聚焦时可见文字换成"立即重连"，点击触发 `onReconnect`。 */
export const Default: Story = {}

/** `connecting`：文字后三个点依次出现（1.5s 循环）；仍是按钮，再点一次表示"重新开始连接"。 */
export const Connecting: Story = { args: { state: 'connecting' } }

/** `recovered`：绿色 `role="status"`，不可点击；调用方通常一两秒后把 `state` 置回 `undefined` 收起。 */
export const Recovered: Story = { args: { state: 'recovered' } }

/** `state` 为 `undefined`：组件返回 `null`，什么都不渲染（画布空白是预期）。 */
export const Hidden: Story = { args: { state: undefined } }

/** 完整流程：点击重连 → 1.2s 后恢复 → 再 1.5s 后收起；"重置"回到断线态。 */
export const Flow: Story = {
  render: (args) => {
    const [state, setState] = useState<ConnectionIndicatorState | undefined>('disconnected')
    const timers = useRef<number[]>([])
    const clearTimers = () => {
      for (const id of timers.current) window.clearTimeout(id)
      timers.current = []
    }
    useEffect(() => clearTimers, [])
    const reconnect = () => {
      args.onReconnect()
      clearTimers()
      setState('connecting')
      timers.current.push(
        window.setTimeout(() => setState('recovered'), 1200),
        window.setTimeout(() => setState(undefined), 2700),
      )
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 32 }}>
        <ConnectionIndicator {...args} state={state} onReconnect={reconnect} />
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            clearTimers()
            setState('disconnected')
          }}
        >
          重置
        </Button>
      </div>
    )
  },
}

/** 并排样张：三态同宽（隐藏副本撑宽），切换时不抖动。 */
export const AllStates: Story = {
  render: (args) => (
    <ul style={{ display: 'grid', gap: 12, listStyle: 'none', margin: 0, padding: 0 }}>
      {(Object.keys(STATE_CAPTIONS) as ConnectionIndicatorState[]).map((state) => (
        <li key={state} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ConnectionIndicator {...args} state={state} />
          <span style={{ fontSize: 12 }}>{STATE_CAPTIONS[state]}</span>
        </li>
      ))}
    </ul>
  ),
}
