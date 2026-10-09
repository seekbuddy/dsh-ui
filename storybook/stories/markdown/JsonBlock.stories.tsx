import type { Meta, StoryObj } from '@storybook/react-vite'
import { JsonBlock } from '@seekbuddy/dsh-ui/markdown'
import { jsonTruncatedLabel } from './labels.ts'

const NORMAL_PAYLOAD = {
  ok: true,
  data: { id: 1, name: 'SeekBuddy', items: [1, 2, 3], nested: { deep: { value: null } } },
  tags: ['ui', 'markdown'],
}

/** 1500 条记录，`JSON.stringify(…, null, 2)` 后远超 20 000 字符的上限。 */
const HUGE_PAYLOAD = {
  total: 1500,
  items: Array.from({ length: 1500 }, (_, i) => ({ id: i, name: `条目 ${i}`, tags: ['a', 'b'], enabled: i % 2 === 0 })),
}

const meta = {
  title: '镜像层（上游同步）/Markdown/JsonBlock',
  component: JsonBlock,
  parameters: {
    docs: {
      description: {
        component: `可折叠的 JSON 载荷块（会话侧用，与 RPC 面板的 PayloadJson 相互独立）：一个开关按钮 + \`<pre>\` 正文，展开时才 \`JSON.stringify(payload, null, 2)\`。上游同步件，源码不改。

**什么时候用**：工具调用的入参 / 返回体、事件载荷——默认折叠、不抢版面，点开才序列化。序列化结果超过 **20 000 字符**（源码常量 \`MAX_CHARS\`，未导出）时截断并在末尾追加 \`truncatedLabel(总长度)\`。
**什么时候不用**：需要逐层展开 / 复制单个节点用 \`/blocks\` 的 \`JsonTree\`；要语法高亮或复制整段用 \`CodeBlock lang="json"\`；不是 JSON 的文本别塞进来（会被 \`String()\` 兜底）。
**可访问性**：开关是原生 \`<button>\`，可见文案就是 \`label\`（前缀 ▸ / ▾ 表示折叠 / 展开）；正文是 \`<pre>\`，内容长时容器滚动。无法序列化的载荷（undefined / 函数 / 循环引用）退化为 \`String(payload)\`，不抛错。
**相关 token**：\`--dsw-alias-markdown-code-block\`、\`--dsw-alias-border-l1\`、\`--dsw-alias-interactive-bg-hover\`、\`--dsw-alias-label-primary\`、\`--dsw-alias-label-secondary\`。`,
      },
    },
  },
  args: {
    label: 'response',
    payload: NORMAL_PAYLOAD,
    defaultOpen: false,
    truncatedLabel: jsonTruncatedLabel,
  },
  argTypes: { payload: { control: 'object' }, truncatedLabel: { control: false } },
} satisfies Meta<typeof JsonBlock>
export default meta
type Story = StoryObj<typeof meta>

/** 默认折叠，点 label 展开。 */
export const Default: Story = {}

/** `defaultOpen`：初始即展开（demo 页的用法）。 */
export const DefaultOpen: Story = { args: { defaultOpen: true } }

/** 超过 20 000 字符：正文截断，末尾追加 `truncatedLabel(total)` 的中文提示（本样张 total 约 15 万）。 */
export const Truncated: Story = {
  args: { label: 'items（1500 条）', payload: HUGE_PAYLOAD, defaultOpen: true },
}

/** 空对象 / 空数组 / 原始值：照样序列化，不做特殊空态。 */
export const Primitives: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 8 }}>
      <JsonBlock {...args} label="空对象" payload={{}} defaultOpen />
      <JsonBlock {...args} label="空数组" payload={[]} defaultOpen />
      <JsonBlock {...args} label="字符串" payload="一段字符串" defaultOpen />
      <JsonBlock {...args} label="null" payload={null} defaultOpen />
    </div>
  ),
}

/** 无法 `JSON.stringify` 的载荷退化为 `String(payload)`：undefined、函数、循环引用都不抛错。 */
export const Unserializable: Story = {
  render: (args) => {
    const cyclic: { self?: unknown } = {}
    cyclic.self = cyclic
    return (
      <div style={{ display: 'grid', gap: 8 }}>
        <JsonBlock {...args} label="undefined" payload={undefined} defaultOpen />
        <JsonBlock {...args} label="函数" payload={() => 1} defaultOpen />
        <JsonBlock {...args} label="循环引用" payload={cyclic} defaultOpen />
      </div>
    )
  },
}
