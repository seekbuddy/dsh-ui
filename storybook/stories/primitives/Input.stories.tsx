import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input } from '@seekbuddy/dsh-ui'
import { IconSearchOutlineRegular } from '@seekbuddy/dsh-ui/icons'
import css from './Input.stories.module.css'

const meta = {
  title: '镜像层（上游同步）/Input',
  component: Input,
  parameters: {
    docs: {
      description: {
        component: `单行文本输入（搜索框、行内表单）：\`icon\` 是前置 16px 图标槽，其余原生 \`input\` 属性（\`value\` / \`onChange\` / \`placeholder\` / \`disabled\` / \`aria-label\`…）透传给内部 \`<input>\`。**注意 \`className\` 落在外层 wrapper \`<span>\` 上，不是 input**——控制宽度、对齐要给 wrapper 写类；而 \`style\` 走透传，会落到 input 上。上游同步件，源码不改。

**什么时候用**：搜索、重命名、表单里的短文本；需要前置图标的输入。

**什么时候不用**：对话输入（多行、自动增高）不是这个原子——它归会话包；数值 / 日期等复杂控件请用原生元素自行样式化；选项切换用 \`Pill\` / \`Tabs\`。

**可访问性**：组件不带 label，可访问名必须由调用方提供：外部 \`<label htmlFor>\` 或 \`aria-label\`（会透传到 input）。焦点态用 \`:focus-within\` 把 wrapper 描边换成品牌色；\`disabled\` 透传给 input，wrapper 本身没有禁用样式。

**相关 token**：\`--dsw-alias-border-l4\`（默认描边）、\`--dsw-alias-brand-primary\`（焦点描边）、\`--dsw-alias-bg-layer-1\`（底色）、\`--dsw-alias-label-primary\`（文字）、\`--dsw-alias-label-dimmed\`（placeholder）、\`--dsw-alias-label-tertiary\`（图标）。`,
      },
    },
  },
  args: { placeholder: '搜索会话…' },
  argTypes: { icon: { control: false } },
} satisfies Meta<typeof Input>
export default meta
type Story = StoryObj<typeof meta>

/** 默认：只有 placeholder，点进去看焦点描边变品牌色。 */
export const Default: Story = {}

/** `icon` 前置图标：搜索框的标准形态。 */
export const WithIcon: Story = {
  args: { icon: <IconSearchOutlineRegular />, 'aria-label': '搜索会话' },
}

/** placeholder 用 `--dsw-alias-label-dimmed`，与已输入文字的 primary 拉开层级。 */
export const Placeholder: Story = {
  args: { placeholder: '输入会话名称，例如「周报整理」' },
}

/** 原生 `disabled` 透传给 input；wrapper 没有禁用样式，禁用原因请写在旁边。 */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: '不可编辑的值' },
}

/** 受控输入：`value` + `onChange` 透传给 input，下方实时显示当前值；用 `<label htmlFor>` 提供可访问名。 */
export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState('')
    return (
      <div style={{ display: 'grid', gap: 8, justifyItems: 'start' }}>
        <label htmlFor="sb-input-controlled">会话名称</label>
        <Input {...args} id="sb-input-controlled" value={value} onChange={(e) => setValue(e.target.value)} />
        <span>当前值：{value === '' ? '（空）' : value}</span>
      </div>
    )
  },
}

/** `className` 落在外层 wrapper：同一个容器里，`.wide { width: 100% }` 把整个输入框撑满，`.narrow { width: 160px }` 收窄——两者都是 wrapper 在变，图标与 input 跟着 wrapper 走。 */
export const WrapperClassName: Story = {
  args: { icon: <IconSearchOutlineRegular /> },
  render: (args) => (
    <div style={{ display: 'grid', gap: 12, width: 480, maxWidth: '100%' }}>
      <Input {...args} className={css.wide} placeholder="className=wide：wrapper 100% 宽" aria-label="宽输入框" />
      <Input {...args} className={css.narrow} placeholder="narrow：160px" aria-label="窄输入框" />
      <Input {...args} placeholder="不传 className：内容宽" aria-label="默认宽度输入框" />
    </div>
  ),
}

/** 组合样张：默认 / 带图标 / 有值 / 禁用并排，切主题看暗色。 */
export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      <Input placeholder="默认" aria-label="默认" />
      <Input icon={<IconSearchOutlineRegular />} placeholder="带图标" aria-label="带图标" />
      <Input defaultValue="已有内容" aria-label="已有内容" />
      <Input disabled defaultValue="禁用" aria-label="禁用" />
    </div>
  ),
}
