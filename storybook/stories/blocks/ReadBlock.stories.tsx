import type { Meta, StoryObj } from '@storybook/react-vite'
import { DEFAULT_READ_MAX_LINES, ReadBlock } from '@seekbuddy/dsh-ui/blocks'
import { readLabels, readLong, readShort, readWindow } from './fixtures.ts'

const meta = {
  title: '镜像层（上游同步）/Blocks/ReadBlock',
  component: ReadBlock,
  parameters: {
    docs: {
      description: {
        component: `read 工具结果的文件视图：横幅（路径标签 + "显示 N / 共 M 行"窗口提示 + 语言 + 复制）、带行号的内容行，超过 \`maxLines\`（默认 \`DEFAULT_READ_MAX_LINES\` = ${DEFAULT_READ_MAX_LINES}，与 TerminalBlock 一致）时头尾各半折叠中间。\`lang\` 给出语言 id 时用 Shiki 懒加载语法高亮，grammar 加载完成会自动重渲染；进入视口才开始高亮。上游同步件，源码不改。

**什么时候用**：展示"读到了文件的哪一段"——每行自带文件里的真实行号，窗口读取（offset / limit）时行号不从 1 开始。
**什么时候不用**：命令输出用 \`TerminalBlock\`；对话正文里的代码片段用 \`/markdown\` 的 \`CodeBlock\`（没有行号概念）；改动前后对比用 \`DiffBlock\`。
**可访问性**：行号栏 \`aria-hidden\`，读屏只读内容；复制按钮复制的是不带行号的原文，空文件不出复制按钮（避免把剪贴板覆盖成空串）。折叠按钮带 \`aria-expanded\`，可访问名来自 \`labels.expandAria(hidden)\` / \`collapseAria\`。
**相关 token**：\`--dsw-alias-markdown-code-block\`（正文底）、\`--dsw-alias-markdown-code-block-banner\`（横幅底）、\`--dsw-alias-label-primary\` / \`secondary\` / \`tertiary\`、\`--dsw-font-markdown-code-block\`、\`--dsw-font-xs-13\`。`,
      },
    },
  },
  args: {
    label: 'src/Toolbar.tsx',
    lines: readShort,
    totalLines: readShort.length,
    lang: 'tsx',
    labels: readLabels,
  },
  argTypes: { labels: { control: false } },
} satisfies Meta<typeof ReadBlock>
export default meta
type Story = StoryObj<typeof meta>

/** 整个短文件：行号 1 起，返回行数等于 `totalLines`，横幅不出现窗口提示。 */
export const Default: Story = {}

/** 起始行号非 1：从第 120 行开始的 10 行窗口，`totalLines` 是 380，横幅显示 `labels.window(10, 380)`。 */
export const WindowFromOffset: Story = {
  args: { label: 'src/router.ts', lines: readWindow, totalLines: 380, lang: 'ts' },
}

/** 超过 16 行（40 行）：默认折叠成头 8 尾 8，中间藏 24 行；同时 `lang="ts"` 看 Shiki 高亮（首次加载 grammar 稍慢）。 */
export const LongFolded: Story = {
  args: { label: 'src/values.ts', lines: readLong, totalLines: readLong.length, lang: 'ts' },
}

/** 不给 `lang`：纯等宽文本，不加载任何 grammar。 */
export const PlainText: Story = {
  args: { label: 'NOTES.txt', lang: undefined },
}

/** 不给 `label`：横幅左侧留空（工具没有提供路径 / 替代标题的情况）。 */
export const WithoutLabel: Story = {
  args: { label: undefined },
}

/** 空文件：没有内容行，也不出现复制按钮。 */
export const EmptyFile: Story = {
  args: { label: 'src/.keep', lines: [], totalLines: 0, lang: undefined },
}

/** 自定义 `maxLines`：同一份 40 行内容，左侧默认值，右侧改为 6。 */
export const MaxLines: Story = {
  args: { label: 'src/values.ts', lines: readLong, totalLines: readLong.length, lang: 'ts' },
  render: (args) => (
    <div style={{ display: 'grid', gap: 8 }}>
      <p style={{ margin: 0 }}>
        <code>DEFAULT_READ_MAX_LINES = {DEFAULT_READ_MAX_LINES}</code>
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <ReadBlock {...args} maxLines={DEFAULT_READ_MAX_LINES} />
        <ReadBlock {...args} maxLines={6} />
      </div>
    </div>
  ),
}

/** 组合样张：短文件 / 窗口读取 / 长文件折叠 / 空文件。 */
export const AllVariants: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 720 }}>
      <ReadBlock {...args} />
      <ReadBlock {...args} label="src/router.ts" lines={readWindow} totalLines={380} lang="ts" />
      <ReadBlock {...args} label="src/values.ts" lines={readLong} totalLines={readLong.length} lang="ts" />
      <ReadBlock {...args} label="src/.keep" lines={[]} totalLines={0} lang={undefined} />
    </div>
  ),
}
