import type { Meta, StoryObj } from '@storybook/react-vite'
import { DEFAULT_SEARCH_MAX_LINES, SearchBlock } from '@seekbuddy/dsh-ui/blocks'
import { searchLabels, searchMatches, searchMatchesLong, searchPaths, searchPathsLong } from './fixtures.ts'

const meta = {
  title: '镜像层（上游同步）/Blocks/SearchBlock',
  component: SearchBlock,
  parameters: {
    docs: {
      description: {
        component: `搜索结果卡片，一个组件两种 \`kind\`：\`matches\`（grep 形态，按文件分组的匹配行，文件头可点击收起该组）与 \`paths\`（glob 形态，扁平路径列表）。头部摘要由 \`labels.pathsSummary\` / \`matchesSummary\` 生成，\`truncated\` 为真时摘要会带上"显示 X / 共 N"，不把被工具截断的结果当完整结果展示。超过 \`maxLines\`（默认 \`DEFAULT_SEARCH_MAX_LINES\` = ${DEFAULT_SEARCH_MAX_LINES}，文件头也算一行）时头尾各半折叠；尾段若从某个文件的匹配行中间切开，会把该文件的表头补回尾段顶部。上游同步件，源码不改。

**什么时候用**：grep / glob 类工具的结果。\`truncated\` + \`total\` 是工具层的截断（结果条数被砍），\`maxLines\` 是视图层的高度折叠，两者独立。
**什么时候不用**：文件内容用 \`ReadBlock\`；网络检索结果用 \`WebBlock\`。
**可访问性**：文件头是 \`<button aria-expanded>\`，点击收起 / 展开该文件的匹配行；折叠按钮带 \`aria-expanded\`，可访问名来自 \`labels.expandAria(hidden)\` / \`collapseAria\`。复制按钮复制的是完整结构化结果（不受折叠 / 收起影响），无结果时不出复制按钮。
**相关 token**：\`--dsw-alias-markdown-code-block\`（正文底）、\`--dsw-alias-markdown-code-block-banner\`（头部底）、\`--dsw-alias-label-primary\` / \`secondary\` / \`tertiary\`、\`--dsw-font-markdown-code-block\`、\`--dsw-font-xs-13\`。`,
      },
    },
  },
  args: { labels: searchLabels, truncated: false, total: 5 },
  argTypes: { labels: { control: false } },
} satisfies Meta<typeof SearchBlock>
export default meta
type Story = StoryObj<typeof meta>

/** `kind="matches"`：三个文件分组，共 5 处匹配；点文件头可收起该组。 */
export const Default: Story = {
  args: { kind: 'matches', files: searchMatches, total: 5 },
}

/** `kind="paths"`：7 条路径的扁平列表，摘要是 `labels.pathsSummary(7, 7, false)`。 */
export const Paths: Story = {
  args: { kind: 'paths', paths: searchPaths, total: 7 },
}

/** 工具截断：`truncated` 为真、`total` 是截断前的 42，摘要显示"显示 5 / 共 42 处匹配"。 */
export const TruncatedMatches: Story = {
  args: { kind: 'matches', files: searchMatches, truncated: true, total: 42 },
}

/** 路径列表截断：摘要显示"显示 7 / 共 120 个路径"。 */
export const TruncatedPaths: Story = {
  args: { kind: 'paths', paths: searchPaths, truncated: true, total: 120 },
}

/** 超过 16 行的分组（3 文件 × 8 匹配 + 3 表头 = 27 行）：默认折叠；尾段第一行若是匹配行会补回所属文件的表头。 */
export const LongMatchesFolded: Story = {
  args: { kind: 'matches', files: searchMatchesLong, total: 24 },
}

/** 超过 16 行的路径列表（24 条）：默认折叠成头 8 尾 8。 */
export const LongPathsFolded: Story = {
  args: { kind: 'paths', paths: searchPathsLong, total: 24 },
}

/** 无结果（matches）：显示 `labels.noResults`，没有复制按钮。 */
export const NoResultsMatches: Story = {
  args: { kind: 'matches', files: [], total: 0 },
}

/** 无结果（paths）：同上。 */
export const NoResultsPaths: Story = {
  args: { kind: 'paths', paths: [], total: 0 },
}

/** 自定义 `maxLines`：同一份长分组，左侧默认值，右侧改为 6。 */
export const MaxLines: Story = {
  args: { kind: 'matches', files: searchMatchesLong, total: 24 },
  render: (args) => (
    <div style={{ display: 'grid', gap: 8 }}>
      <p style={{ margin: 0 }}>
        <code>DEFAULT_SEARCH_MAX_LINES = {DEFAULT_SEARCH_MAX_LINES}</code>
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <SearchBlock {...args} maxLines={DEFAULT_SEARCH_MAX_LINES} />
        <SearchBlock {...args} maxLines={6} />
      </div>
    </div>
  ),
}

/** 组合样张：分组 / 路径 / 截断 / 无结果并排。 */
export const AllVariants: Story = {
  args: { kind: 'matches', files: searchMatches, total: 5 },
  render: () => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 720 }}>
      <SearchBlock kind="matches" files={searchMatches} total={5} truncated={false} labels={searchLabels} />
      <SearchBlock kind="paths" paths={searchPaths} total={7} truncated={false} labels={searchLabels} />
      <SearchBlock kind="matches" files={searchMatches} total={42} truncated labels={searchLabels} />
      <SearchBlock kind="paths" paths={[]} total={0} truncated={false} labels={searchLabels} />
    </div>
  ),
}
