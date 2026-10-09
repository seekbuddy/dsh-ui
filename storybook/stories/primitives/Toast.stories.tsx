import { useCallback, useState } from 'react'
import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Toast } from '@seekbuddy/dsh-ui'
import { IconCheckOutlineRegular, IconWarningOutlineRegular } from '@seekbuddy/dsh-ui/icons'

type ToastProps = ComponentProps<typeof Toast>

/**
 * 受控外壳：触发按钮 + 本地 `{ seq }`；每次触发用新的 seq 作 `key` 重挂载 Toast，
 * `onDone` 时置空回收并计数。
 */
function ToastDemo({ text, icon, holdMs, anchor: _anchor, onDone: _onDone }: ToastProps) {
  const [toast, setToast] = useState<{ seq: number } | null>(null)
  const [done, setDone] = useState(0)
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
      <Button variant="outline" onClick={() => setToast({ seq: Date.now() })}>
        显示 Toast
      </Button>
      <span>
        当前：{toast === null ? '已回收（null）' : '显示中'} · onDone 已回收 {done} 次
      </span>
      {toast !== null && (
        <Toast
          key={toast.seq}
          text={text}
          icon={icon}
          holdMs={holdMs}
          onDone={() => {
            setToast(null)
            setDone((n) => n + 1)
          }}
        />
      )}
    </div>
  )
}

/** 连续触发换 key：左边每次点击 seq+1 作 key（重新滑入、重新计时），右边固定 key（错误示范：只换文字，不重播）。 */
function RekeyDemo({ holdMs }: ToastProps) {
  const [good, setGood] = useState<{ seq: number } | null>(null)
  const [bad, setBad] = useState<{ n: number } | null>(null)
  const doneGood = useCallback(() => setGood(null), [])
  const doneBad = useCallback(() => setBad(null), [])
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="primary" onClick={() => setGood((cur) => ({ seq: (cur?.seq ?? 0) + 1 }))}>
          换 key 触发（正确）
        </Button>
        <Button variant="outline" onClick={() => setBad((cur) => ({ n: (cur?.n ?? 0) + 1 }))}>
          不换 key 只改文字（错误示范）
        </Button>
      </div>
      <span>快速连点：左边每次都重新滑入并重新计时；右边文字变了但淡出不会重播，会在原时间点消失。</span>
      {good !== null && (
        <Toast key={good.seq} text={`第 ${String(good.seq)} 次触发`} holdMs={holdMs} onDone={doneGood} />
      )}
      {bad !== null && (
        <Toast key="fixed" text={`同一个 key，第 ${String(bad.n)} 次`} holdMs={holdMs} onDone={doneBad} />
      )}
    </div>
  )
}

/** `anchor`：banner 跟随某个元素的水平中心（例如对话列），而不是整个视口。 */
function AnchoredDemo({ text, holdMs }: ToastProps) {
  const [card, setCard] = useState<HTMLElement | null>(null)
  const [toast, setToast] = useState<{ seq: number } | null>(null)
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
      <div
        ref={setCard}
        style={{
          display: 'grid',
          gap: 12,
          justifyItems: 'start',
          width: 320,
          padding: 16,
          border: '1px dashed var(--dsw-alias-border-l3)',
          borderRadius: 12,
        }}
      >
        <span>这张卡片靠右，Toast 会居中在它上方而不是页面中央。</span>
        <Button variant="outline" onClick={() => setToast({ seq: Date.now() })}>
          在卡片上方显示
        </Button>
        {toast !== null && (
          <Toast key={toast.seq} text={text} anchor={card} holdMs={holdMs} onDone={() => setToast(null)} />
        )}
      </div>
    </div>
  )
}

const meta = {
  title: '镜像层（上游同步）/Toast',
  component: Toast,
  parameters: {
    docs: {
      description: {
        component: `短时状态反馈：顶部居中的 banner，**portal 到 body**（祖先有 transform / filter 也困不住 fixed 定位），滑入 → 停留 \`holdMs\`（默认 3000ms）→ 1000ms 淡出 → 调 \`onDone\`。**组件自己不会消失**：\`onDone\` 里由调用方卸载它；**重复显示同一条消息必须换 React \`key\`**（按每次触发的序号），否则只是改文字、不会重新滑入和重新计时。\`icon\` 是前置图标槽，\`anchor\` 让 banner 跟随某个元素的水平中心。停留时长由调用方按文案长度决定：一句话用默认，报错说明要给长一点。上游同步件，源码不改。

**什么时候用**：操作完成 / 失败的一句话反馈（已复制、已保存、发送失败）。

**什么时候不用**：需要用户回应的问题用 \`Modal\` / \`RiskConfirmation\`；持续性的连接状态用 \`ConnectionIndicator\`；行内校验错误直接写在表单旁边。

**可访问性**：\`role="alert"\`，挂载即被读屏播报；\`pointer-events: none\`，永不挡点击；图标槽 \`aria-hidden\`，语义全在 \`text\` 里。reduced-motion 下去掉滑入、保留淡出，定时卸载不受影响。

**注意**：图标槽的颜色被上游固定为 \`--dsw-alias-state-warn-label\`——不论传成功还是失败图标都是同一色，成功 / 失败靠图标形状与文字区分。

**相关 token**：\`--dsw-alias-button-contrast-fill\`（底色）、\`--dsw-alias-label-primary-inverted\`（文字）、\`--dsw-alias-state-warn-label\`（图标）、\`--dsw-shadow-lv3\`。`,
      },
    },
  },
  // onDone 占位：render 里的受控外壳会接管
  args: { text: '已复制到剪贴板', holdMs: 3000, onDone: () => {} },
  argTypes: { icon: { control: false }, anchor: { control: false }, onDone: { control: false } },
  render: (args) => <ToastDemo {...args} />,
} satisfies Meta<typeof Toast>
export default meta
type Story = StoryObj<typeof meta>

/** 默认：点按钮显示，3 秒停留 + 1 秒淡出后 `onDone` 回收，状态行看 null 与计数。 */
export const Default: Story = {}

/** 成功：`icon` 传对勾。 */
export const SuccessIcon: Story = { args: { text: '会话已保存', icon: <IconCheckOutlineRegular /> } }

/** 失败：`icon` 传警告，文案说清楚什么坏了，并把 `holdMs` 拉长到 6 秒让人读完。 */
export const FailureIcon: Story = {
  args: { text: '发送失败：网关 502，请稍后重试', icon: <IconWarningOutlineRegular size={14} />, holdMs: 6000 },
}

/** `holdMs={800}`：短停留，看淡出与 `onDone` 的时序。 */
export const ShortHold: Story = { args: { text: '很快就走', holdMs: 800 } }

/** 连续触发换 key：正确写法 vs 错误示范并排，快速连点看区别。 */
export const Rekey: Story = { render: (args) => <RekeyDemo {...args} /> }

/** `anchor`：banner 居中在指定元素上方（对话列 / 卡片），不是视口中央。 */
export const Anchored: Story = { args: { text: '居中在卡片上方' }, render: (args) => <AnchoredDemo {...args} /> }

/** 组合样张：普通 / 成功 / 失败三种一排触发。 */
export const AllKinds: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <ToastDemo {...args} text="已复制到剪贴板" />
      <ToastDemo {...args} text="会话已保存" icon={<IconCheckOutlineRegular />} />
      <ToastDemo {...args} text="发送失败：网关 502" icon={<IconWarningOutlineRegular size={14} />} holdMs={6000} />
    </div>
  ),
}
