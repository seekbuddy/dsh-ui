import type { Meta, StoryObj } from '@storybook/react-vite'
import { JsonTree } from '@seekbuddy/dsh-ui/blocks'
import { jsonArray, jsonEmpty, jsonLongString, jsonNested, jsonTreeLabels } from './fixtures.ts'

const meta = {
  title: '镜像层（上游同步）/Blocks/JsonTree',
  component: JsonTree,
  parameters: {
    docs: {
      description: {
        component: `可展开、可复制的只读 JSON 树：把已解析的对象 / 数组渲染成检查器式的树，收起的节点显示行内预览（对象最多 4 个键、数组最多 5 项、最深 2 层），悬停行出现复制按钮。上游同步件，源码不改。

**什么时候用**：工具调用的入参 / 出参、结构化的诊断数据、任何需要逐层看字段的 JSON。
**什么时候不用**：只想看一段带高亮的 JSON 文本而不需要交互，用 \`/markdown\` 的 \`JsonBlock\`（带超长截断提示）；数据不是 JSON（日志、命令输出）用 \`TerminalBlock\`。
**可访问性**：根节点 \`role="tree"\`，可访问名来自必填的 \`label\`；每行 \`role="treeitem"\`，展开器是 \`role="button"\` 且带 \`aria-expanded\` / \`aria-controls\`，展开 / 收起的可访问名来自 \`labels.expandNode\` / \`labels.collapseNode\`。roving tabindex：↑/↓ 在行间移焦，→ 展开、← 收起。复制按钮标题来自 \`labels.copyButtonTitle\`，复制结果用 \`labels.copied\` / \`labels.copyFailed\` 反馈。
**相关 token**：\`--dsw-alias-bg-layer-1\`、\`--dsw-alias-interactive-bg-hover\`、\`--dsw-alias-label-primary\`、\`--dsw-alias-label-secondary\`、\`--dsw-alias-label-tertiary\`、\`--dsw-alias-state-business-primary\`（焦点环）、\`--dsw-alias-state-error-primary\`（复制失败）。`,
      },
    },
  },
  args: {
    label: '实例配置',
    data: jsonNested,
    labels: jsonTreeLabels,
    copyable: true,
    expandTopLevel: true,
  },
  argTypes: { labels: { control: false } },
} satisfies Meta<typeof JsonTree>
export default meta
type Story = StoryObj<typeof meta>

/** 嵌套对象：字符串 / 数字 / 布尔 / null / 数组 / 子对象各一遍。顶层默认固定展开，子节点收起时显示行内预览。 */
export const Default: Story = {}

/** 顶层是数组：每行的 key 是索引，收起的预览最多显示 5 项。 */
export const ArrayRoot: Story = {
  args: { label: '任务列表', data: jsonArray },
}

/** 长字符串：行内溢出的处理，以及"复制值"能否拿到完整内容（不是预览截断后的）。 */
export const LongString: Story = {
  args: { label: '摘要', data: jsonLongString },
}

/** 空对象 / 空数组：没有子节点，不出现展开器，预览就是 `{}` / `[]`。 */
export const EmptyContainers: Story = {
  args: { label: '空容器', data: jsonEmpty },
}

/** `expandTopLevel={false}`：顶层也收起，整棵树只剩一行预览，点击展开器（或按 →）展开。 */
export const CollapsedTopLevel: Story = {
  args: { expandTopLevel: false },
}

/** `copyable={false}`：纯只读，不再出现复制按钮与复制菜单。 */
export const NotCopyable: Story = {
  args: { copyable: false },
}

/** 组合样张：四种数据并排，切右上角主题看暗色。 */
export const AllVariants: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 720 }}>
      <JsonTree {...args} label="嵌套对象" data={jsonNested} />
      <JsonTree {...args} label="数组根" data={jsonArray} />
      <JsonTree {...args} label="长字符串" data={jsonLongString} />
      <JsonTree {...args} label="空容器" data={jsonEmpty} />
    </div>
  ),
}
