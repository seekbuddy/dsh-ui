import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodeBlock } from '@seekbuddy/dsh-ui/markdown'
import { markdownCodeLabels } from './labels.ts'

const TS_SAMPLE = [
  "import { CodeBlock } from '@seekbuddy/dsh-ui/markdown'",
  '',
  'export interface Item {',
  '  id: number',
  '  name: string',
  '}',
  '',
  'export function total(items: readonly Item[]): number {',
  '  return items.reduce((sum, item) => sum + item.id, 0)',
  '}',
].join('\n')

const PY_SAMPLE = [
  'from dataclasses import dataclass',
  '',
  '@dataclass',
  'class Item:',
  '    id: int',
  '    name: str',
  '',
  'def total(items: list[Item]) -> int:',
  '    return sum(item.id for item in items)',
].join('\n')

const BASH_SAMPLE = [
  '#!/usr/bin/env bash',
  'set -euo pipefail',
  '',
  'npm run build',
  'bun run dev   # 端口 9109',
  'for f in stories/**/*.stories.tsx; do echo "$f"; done',
].join('\n')

const JSON_SAMPLE = JSON.stringify(
  { ok: true, data: { id: 1, items: [1, 2, 3], tags: ['ui', 'markdown'] }, error: null },
  null,
  2,
)

const meta = {
  title: '镜像层（上游同步）/Markdown/CodeBlock',
  component: CodeBlock,
  parameters: {
    docs: {
      description: {
        component: `带语言标签栏与复制按钮的代码块：Shiki（JS 正则引擎、CSS 变量主题）高亮，颜色全部走 \`--shiki-*\` token 随明暗切换。上游同步件，源码不改。

**什么时候用**：独立展示一段源码（工具入参、生成的脚本）；\`MarkdownText\` 的围栏代码内部也是它。\`streaming\` 用于还在增长的围栏——只对追加文本重新分词，调用方必须保持实例 key 稳定。
**什么时候不用**：JSON 载荷用 \`JsonBlock\`（可折叠 + 截断）；带行号的文件内容用 \`/blocks\` 的 \`ReadBlock\`；终端输出用 \`TerminalBlock\`（ANSI 颜色）。
**性能提示**：只有进入视口后才开始高亮（IntersectionObserver）；\`ts / bash / json\` 三个语法启动即载，\`python / rust / yaml …\` 等 23 个语法**首次出现时懒加载（~1.6 MB）**，加载完成前先显示等宽纯文本，完成后自动重渲染——所以本页首次打开 python 样张会先"素"一下再上色。未知语言 / 不传语言直接纯文本，不报错。
**可访问性**：\`<pre tabIndex=0>\` 可键盘聚焦并横向滚动；复制按钮是原生 \`<button>\`，文案 \`copyLabel\` → 复制成功后 1 秒切成 \`copiedLabel\`；语言标签只是视觉提示。
**相关 token**：\`--dsw-alias-markdown-code-block\`、\`--dsw-alias-markdown-code-block-banner\`、\`--dsw-alias-bg-base\`、\`--dsw-alias-label-primary\`、\`--dsw-font-markdown-code-block\`、\`--dsw-font-family\`，以及主题包的 \`--shiki-*\` 系列。`,
      },
    },
  },
  args: {
    code: TS_SAMPLE,
    lang: 'ts',
    copyLabel: markdownCodeLabels.copyLabel,
    copiedLabel: markdownCodeLabels.copiedLabel,
    streaming: false,
  },
  argTypes: { code: { control: 'text' }, className: { control: false } },
} satisfies Meta<typeof CodeBlock>
export default meta
type Story = StoryObj<typeof meta>

/** 默认：TypeScript（启动即载的语法），右上角复制按钮点一下看"已复制"反馈。 */
export const Default: Story = {}

/** Python 属于懒加载语法：第一次进入视口先显示纯文本，语法模块 import 完成后自动上色。 */
export const Python: Story = { args: { code: PY_SAMPLE, lang: 'python' } }

/** Shell（`bash` / `sh` / `zsh` 都映射到 shellscript 语法）。 */
export const Bash: Story = { args: { code: BASH_SAMPLE, lang: 'bash' } }

/** JSON：与 `JsonBlock` 的区别是这里不折叠、不截断、有高亮。 */
export const Json: Story = { args: { code: JSON_SAMPLE, lang: 'json' } }

/** 超长单行不折行，容器横向滚动；`<pre>` 可聚焦后用键盘滚。 */
export const LongLine: Story = {
  args: {
    lang: 'ts',
    code: [
      "export const LONG = 'https://example.com/api/v1/resources/0123456789abcdef/children?expand=all&fields=id,name,createdAt,updatedAt,owner,tags,permissions&sort=-updatedAt&limit=200'",
      'const short = 1',
    ].join('\n'),
  },
}

/** 不传 `lang`：标签栏留空，等宽纯文本，不会尝试高亮。 */
export const NoLanguage: Story = {
  args: { lang: undefined, code: '没有语言标记的文本\n第二行\n    缩进保留' },
}

/** 未知语言（`brainfuck`）：标签栏照样显示传入的字符串，正文按纯文本处理，不报错。 */
export const UnknownLanguage: Story = {
  args: { lang: 'brainfuck', code: '++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.' },
}

/** 复制反馈：点击后按钮文案切到 `copiedLabel` 一秒；复制的是 `<pre>` 的 textContent（高亮 span 不会混进去）。 */
export const CopyFeedback: Story = {
  args: { code: 'bun install\nbun run dev', lang: 'bash' },
}

/** 组合样张：四种启动 / 懒加载语法并排，切明暗看 `--shiki-*` token 变化。 */
export const AllLanguages: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 16 }}>
      <CodeBlock {...args} code={TS_SAMPLE} lang="ts" />
      <CodeBlock {...args} code={PY_SAMPLE} lang="python" />
      <CodeBlock {...args} code={BASH_SAMPLE} lang="bash" />
      <CodeBlock {...args} code={JSON_SAMPLE} lang="json" />
    </div>
  ),
}
