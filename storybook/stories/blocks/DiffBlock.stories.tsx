import type { Meta, StoryObj } from '@storybook/react-vite'
import { DEFAULT_DIFF_MAX_LINES, DiffBlock, diffTotals } from '@seekbuddy/dsh-ui/blocks'
import type { DiffHunk } from '@seekbuddy/dsh-ui/blocks'
import { diffAddOnly, diffDeleteOnly, diffLabels, diffLong, diffMixed, diffMultiFile } from './fixtures.ts'

const meta = {
  title: '镜像层（上游同步）/Blocks/DiffBlock',
  component: DiffBlock,
  parameters: {
    docs: {
      description: {
        component: `文件改动的行内 diff 卡片：每个 \`DiffHunk\` 是"一个路径 + 旧文本 + 新文本"，组件把旧侧逐行画成删除行、新侧逐行画成新增行（不做行级对齐 / 最小编辑距离）；同一文件的第二个 hunk 用 \`⋯\` 分隔而不重复路径；页脚是 \`+added -removed · N 个文件\`（文件数按去重路径）。超过 \`maxLines\`（默认 \`DEFAULT_DIFF_MAX_LINES\` = ${DEFAULT_DIFF_MAX_LINES}）时头尾各半折叠。\`diffs\` 为空时渲染 \`null\`。上游同步件，源码不改。

**\`diffTotals(diffs)\`**：与页脚相同的 +/- 统计，导出给"摘要行"用——列表页只想显示 \`+12 -3\` 而不渲染整个正文时调它，不用自己重新数行。规则：\`oldText\` 每行计入 \`removed\`、\`newText\` 每行计入 \`added\`；空串是 0 行，单个结尾换行是终止符不算额外空行，中间的真空行保留。见下方 **Totals** 样张。

**什么时候用**：write / edit 类工具的结果——用户要看"改了什么"。
**什么时候不用**：只看文件当前内容用 \`ReadBlock\`；命令输出用 \`TerminalBlock\`。
**可访问性**：增删只靠颜色区分（绿 / 红），但复制出的文本带 \`+ \` / \`- \` 前缀，读屏用户可通过复制内容获知行的性质。折叠按钮带 \`aria-expanded\`，可访问名来自 \`labels.expandAria(hidden)\` / \`collapseAria\`。
**相关 token**：\`--dsw-alias-state-success-primary\`（新增行）、\`--dsw-alias-state-error-primary\`（删除行）、\`--dsw-alias-markdown-code-block\`（卡片底）、\`--dsw-alias-label-primary\` / \`secondary\` / \`tertiary\`、\`--dsw-font-markdown-code-block\`、\`--dsw-font-xs-13\`。`,
      },
    },
  },
  args: { diffs: diffMixed, labels: diffLabels },
  argTypes: { labels: { control: false } },
} satisfies Meta<typeof DiffBlock>
export default meta
type Story = StoryObj<typeof meta>

/** 增删混合：同一文件先画旧文本（删除行），再画新文本（新增行）。页脚 `+2 -2 · 1 个文件`。 */
export const Default: Story = {}

/** 只增：`oldText: null` 是新建文件（或整文件覆盖），没有删除行。 */
export const AddOnly: Story = {
  args: { diffs: diffAddOnly },
}

/** 只删：`newText: ''` 是零行，整段内容被移除，没有新增行。 */
export const DeleteOnly: Story = {
  args: { diffs: diffDeleteOnly },
}

/** 多文件 + 同文件第二个 hunk：第二段同路径用 `⋯` 分隔；页脚文件数是去重后的 2。 */
export const MultiFile: Story = {
  args: { diffs: diffMultiFile },
}

/** 超过 16 行（12 删 + 14 增 + 路径行 = 27 行）：默认折叠，中间藏 11 行。 */
export const LongFolded: Story = {
  args: { diffs: diffLong },
}

/** `diffs` 为空：组件渲染 `null`，画布上什么都没有（这是预期行为）。 */
export const Empty: Story = {
  args: { diffs: [] },
}

/** 自定义 `maxLines`：同一份长 hunk，左侧默认值，右侧改为 6。 */
export const MaxLines: Story = {
  args: { diffs: diffLong },
  render: (args) => (
    <div style={{ display: 'grid', gap: 8 }}>
      <p style={{ margin: 0 }}>
        <code>DEFAULT_DIFF_MAX_LINES = {DEFAULT_DIFF_MAX_LINES}</code>
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <DiffBlock {...args} maxLines={DEFAULT_DIFF_MAX_LINES} />
        <DiffBlock {...args} maxLines={6} />
      </div>
    </div>
  ),
}

/**
 * 统计行：在正文之外调用 `diffTotals(diffs)` 得到 `{ added, removed }`，与卡片页脚的数字一致。
 * 列表页只显示摘要、不渲染正文时就用它。
 */
export const Totals: Story = {
  args: { diffs: diffMultiFile },
  render: (args) => {
    const totals = diffTotals(args.diffs)
    return (
      <div style={{ display: 'grid', gap: 8 }}>
        <p style={{ margin: 0 }}>
          摘要行（<code>diffTotals</code> 计算）：
          <span style={{ color: 'var(--dsw-alias-state-success-primary)' }}> +{totals.added}</span>
          <span style={{ color: 'var(--dsw-alias-state-error-primary)' }}> -{totals.removed}</span>
        </p>
        <DiffBlock {...args} />
      </div>
    )
  },
}

/** 组合样张：混合 / 只增 / 只删 / 多文件并排，每个上方标注 `diffTotals` 的结果。 */
export const AllVariants: Story = {
  render: (args) => {
    const samples: readonly (readonly [string, DiffHunk[]])[] = [
      ['增删混合', diffMixed],
      ['只增', diffAddOnly],
      ['只删', diffDeleteOnly],
      ['多文件', diffMultiFile],
    ]
    return (
      <div style={{ display: 'grid', gap: 16, maxWidth: 720 }}>
        {samples.map(([name, hunks]) => {
          const totals = diffTotals(hunks)
          return (
            <div key={name}>
              <p style={{ margin: 0 }}>
                {name}：+{totals.added} -{totals.removed}
              </p>
              <DiffBlock {...args} diffs={hunks} />
            </div>
          )
        })}
      </div>
    )
  },
}
