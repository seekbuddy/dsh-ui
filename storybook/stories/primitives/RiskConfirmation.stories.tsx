import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Button, RiskConfirmation } from '@seekbuddy/dsh-ui'

const meta = {
  title: '镜像层（上游同步）/RiskConfirmation',
  component: RiskConfirmation,
  parameters: {
    docs: {
      description: {
        component: `高风险操作确认对话框：基于 \`Modal\` 的标准模式（标题、关闭按钮、遮罩、Escape），正文是一条红色警告图标 + \`description\`，下面一个必须勾选的确认框；主按钮 \`confirmLabel\` 在 \`acknowledged\` 为 true 之前一直禁用。上游同步件，源码不改。

**什么时候用**：不可撤销、影响范围大的动作——删除远程会话、清空数据、断开连接器——需要用户"先读后勾再确认"。
**什么时候不用**：普通的二次确认（"确定离开吗？"）直接用 \`Modal\` 配两个按钮，别让用户多勾一次；危险菜单项本身用 \`Menu\` 的 \`danger\` 条目，确认层再落到这里。
**可访问性**：\`Modal\` 提供 \`role="dialog" aria-modal\`，可访问名来自 \`title\`；\`closeLabel\` 是右上角关闭按钮的可访问名；确认框 \`autoFocus\`，打开即聚焦到勾选项；Escape / 遮罩 / 关闭按钮 / 取消按钮都走 \`onCancel\`。全部受控：\`open\`、\`acknowledged\` 由调用方持有，打开前记得把 \`acknowledged\` 重置为 false。\`disabled\` 同时冻结勾选框与确认按钮（提交中）。
**相关 token**：\`--dsw-alias-state-error-primary\`（警告图标）、\`--dsw-alias-label-secondary\`（正文）、\`--dsw-alias-label-primary\`（勾选文字）、\`--dsw-alias-button-primary-fill\`（checkbox accent）、\`--dsw-alias-border-l4\`（checkbox 焦点环）。

三个回调（\`onConfirm\` / \`onCancel\` / \`onAcknowledgedChange\`）已接到 **Actions** 面板，点按钮看调用记录。`,
      },
    },
  },
  args: {
    open: false,
    title: '删除远程会话',
    description: '该操作会永久移除远程会话及其未同步的运行记录。',
    acknowledgeLabel: '我已了解此操作不可撤销',
    cancelLabel: '取消',
    closeLabel: '关闭',
    confirmLabel: '确认删除',
    acknowledged: false,
    disabled: false,
    // 回调用 storybook/test 的 fn()：调用会记录到 Actions 面板，也让 StoryObj 的必填 props 校验通过
    onConfirm: fn(),
    onCancel: fn(),
    onAcknowledgedChange: fn(),
  },
  // 受控：open / acknowledged 接到本地 state，Controls 改它们也会生效；触发按钮打开时重置勾选
  render: (args) => {
    const [open, setOpen] = useState(args.open)
    const [acknowledged, setAcknowledged] = useState(args.acknowledged)
    useEffect(() => {
      setOpen(args.open)
    }, [args.open])
    useEffect(() => {
      setAcknowledged(args.acknowledged)
    }, [args.acknowledged])
    return (
      <>
        <Button
          variant="outline"
          onClick={() => {
            setAcknowledged(args.acknowledged)
            setOpen(true)
          }}
        >
          {args.title}…
        </Button>
        <RiskConfirmation
          {...args}
          open={open}
          acknowledged={acknowledged}
          onAcknowledgedChange={(next) => {
            args.onAcknowledgedChange(next)
            setAcknowledged(next)
          }}
          onCancel={() => {
            args.onCancel()
            setOpen(false)
          }}
          onConfirm={() => {
            args.onConfirm()
            setOpen(false)
          }}
        />
      </>
    )
  },
} satisfies Meta<typeof RiskConfirmation>
export default meta
type Story = StoryObj<typeof meta>

/** 默认：点按钮打开，勾选后主按钮才可用；确认 / 取消 / 勾选变化都记录在 Actions 面板。 */
export const Default: Story = {}

/** 长文案：`description` 是一段长说明，卡片宽 440、内容区可滚动，标题与页脚固定。 */
export const LongText: Story = {
  args: {
    title: '清空工作区并重置所有实例',
    description:
      '这会停止当前工作区下的全部实例，删除实例磁盘上的工作目录、缓存与未提交的改动，并撤销为这些实例签发的 AI key。已同步到远端仓库的提交不受影响，但本地分支、stash 与未推送的提交会一并丢失。操作完成后你需要重新创建实例并重新连接连接器；订阅、余额与用量记录保留在工作区上不会变化。此操作不可撤销，请确认你已经备份了需要的内容。',
    acknowledgeLabel: '我已备份需要的内容，并了解此操作不可撤销',
    confirmLabel: '清空并重置',
  },
}

/** 预先勾选：`acknowledged` 初始为 true 时主按钮立即可用（调用方从上次状态恢复时会遇到，通常应重置为 false）。 */
export const PreAcknowledged: Story = { args: { acknowledged: true } }

/** `disabled`：提交中冻结勾选框与确认按钮，取消仍可用。 */
export const Disabled: Story = { args: { disabled: true, acknowledged: true, confirmLabel: '删除中…' } }
