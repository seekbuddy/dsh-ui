import '@seekbuddy/dsh-ui/katex.css'
import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@seekbuddy/dsh-ui'
import { MarkdownText } from '@seekbuddy/dsh-ui/markdown'
import type { MarkdownFileMentions } from '@seekbuddy/dsh-ui/markdown'
import { markdownLabels } from './labels.ts'

const meta = {
  title: '镜像层（上游同步）/Markdown/MarkdownText',
  component: MarkdownText,
  parameters: {
    docs: {
      description: {
        component: `把**不可信的助手输出** Markdown 渲染成语义化 React 元素：GFM（表格 / 任务列表 / 删除线 / 脚注）、TeX 数学（KaTeX）、围栏代码（Shiki 高亮 + 复制）、文件引用。上游同步件，源码不改。

**什么时候用**：助手消息正文、任何模型生成的 Markdown。\`streaming\` 打开时按块增量解析（尾部两块之外全部冻结缓存），数学在流式期间保持字面，settled 后才交给 KaTeX。
**什么时候不用**：用户自己敲的文字（直接字面渲染，Markdown 标记不解释；要装饰引用用根入口 \`projectUserText\`）；单独一段代码（直接 \`CodeBlock\`）；只要摘要文字（\`extractMarkdownPlainText\`）。外层**不要再套** \`dangerouslySetInnerHTML\`——本组件的安全策略就是"没有 HTML 进 DOM"。
**可访问性**：输出是标准语义标签（h1–h6 / p / ul / ol / table / blockquote / a / code）。外链带 \`target=_blank rel=noopener noreferrer\`；≥4 列宽表格容器 \`tabIndex=0\` 可键盘滚动；脚注区标题 \`labels.footnotes\` 为读屏专用（sr-only）；文件引用渲染成 \`<button aria-label={label} title={title}>\`；任务列表复选框 \`disabled\` 只读。
**安全策略**：原生 HTML 按字面文本显示（无 HTML 解析器）；链接协议白名单 \`http: / https: / mailto:\`，相对路径与 \`javascript:\` / \`data:\` 之类全部拆成纯文本；图片只放行绝对 HTTP(S)，其余显示 alt；KaTeX 不开 trusted 命令。
**labels 规则**：\`labels\` 必须是引用稳定的对象（模块常量或按 locale memo）——新引用会在流式中途丢掉渲染缓存。\`fileMentions\` 只在 settled 渲染生效，流式期间忽略。
**相关 token**：\`--dsw-alias-label-primary / -secondary / -tertiary / -caption\`、\`--dsw-alias-border-l2 / -l3\`、\`--dsw-alias-bg-base\`、\`--dsw-alias-markdown-inline-code\`、\`--dsw-alias-state-business-primary\`（链接）、\`--dsw-font-markdown-base / -h1…-h4 / -code / -table / -table-head\`。数学渲染另需 \`import '@seekbuddy/dsh-ui/katex.css'\`。`,
      },
    },
  },
  args: {
    text: [
      '# 你好，SeekBuddy',
      '',
      '这是一段 **助手输出** 的 Markdown：支持 *强调*、~~删除线~~、`inline code` 与 [链接](https://deepseek.com)。',
      '',
      '> 引用块：一切皆插件。',
      '',
      '- 无序列表一',
      '- 无序列表二',
      '',
      '1. 有序列表一',
      '2. 有序列表二',
    ].join('\n'),
    labels: markdownLabels,
    streaming: false,
  },
  argTypes: {
    text: { control: 'text' },
    labels: { control: false },
    fileMentions: { control: false },
  },
} satisfies Meta<typeof MarkdownText>
export default meta
type Story = StoryObj<typeof meta>

/** 默认：标题、强调、引用、列表、链接——最常见的助手回复形态。 */
export const Default: Story = {}

/** GFM：表格（3 列自适应宽度）、任务列表（复选框只读）、删除线、脚注（脚注区标题来自 `labels.footnotes`，读屏专用）。 */
export const Gfm: Story = {
  args: {
    text: [
      '## 组件状态',
      '',
      '| 组件 | 状态 | 备注 |',
      '| :--- | :---: | ---: |',
      '| Button | 已完成 | 四个 variant |',
      '| Modal | 已完成 | body portal |',
      '| Tabs | 进行中 | 扩展层 |',
      '',
      '## 任务列表',
      '',
      '- [x] 站体落地',
      '- [x] Button 样板',
      '- [ ] Markdown 波次',
      '',
      '删除线 ~~旧方案~~ 与脚注[^1]，再引一次同一脚注[^1]。',
      '',
      '[^1]: 脚注正文：只渲染编号上标，不做页内锚点（片段 URL 不在协议白名单内）。',
    ].join('\n'),
  },
}

/** ≥4 列的表格视为对比矩阵：容器保持自然宽度、暴露 `md-table-wide` 钩子并 `tabIndex=0`，悬停 / 聚焦时露出横向滚动条。 */
export const WideTable: Story = {
  args: {
    text: [
      '| 入口 | 值导出 | 类型导出 | 依赖面 | 说明 |',
      '| --- | --- | --- | --- | --- |',
      '| `@seekbuddy/dsh-ui` | 14 组件 + 3 Hooks + 3 工具 | 各 props 类型 | 无重依赖 | 基础控件 |',
      '| `/markdown` | 4 组件 + 1 函数 | labels / mentions | KaTeX、Shiki、mdast | 本页 |',
      '| `/blocks` | 6 组件 + 常量 | labels / props | ANSI parser | 工具结果块 |',
      '| `/icons` | 74 图标 | `IconProps` | 无 | 语义图标 |',
    ].join('\n'),
  },
  parameters: { layout: 'padded' },
}

/** 行内 `$…$` 与块级 `$$…$$` 数学，经 KaTeX 渲染；本 story 文件顶部已 `import '@seekbuddy/dsh-ui/katex.css'`。```math 围栏 settled 后同样按块级公式渲染。 */
export const TexMath: Story = {
  args: {
    text: [
      '行内数学 $\\frac{1}{2} + \\frac{1}{3} = \\frac{5}{6}$ 与 $e^{i\\pi} + 1 = 0$。',
      '',
      '块级数学：',
      '',
      '$$',
      '\\int_0^\\infty e^{-x^2}\\,dx = \\frac{\\sqrt{\\pi}}{2}',
      '$$',
      '',
      '`math` 围栏：',
      '',
      '```math',
      '\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2}',
      '```',
    ].join('\n'),
  },
}

/** 围栏代码块交给 `CodeBlock`：语言标签 + 复制按钮（文案来自 `labels.code`），ts / bash / json 为启动即载的语法，其余语言首次出现时懒加载。 */
export const CodeFences: Story = {
  args: {
    text: [
      '安装后启动：',
      '',
      '```bash',
      'bun install',
      'bun run dev   # 端口 9109',
      '```',
      '',
      '在组件里使用：',
      '',
      '```ts',
      "import { MarkdownText } from '@seekbuddy/dsh-ui/markdown'",
      '',
      'export function Reply({ text }: { text: string }) {',
      '  return <MarkdownText text={text} labels={labels} />',
      '}',
      '```',
      '',
      '返回体：',
      '',
      '```json',
      '{ "ok": true, "items": [1, 2, 3] }',
      '```',
    ].join('\n'),
  },
}

/** 文件引用样例：只有 resolver 认识的行内代码才变成可点的文件按钮，其余行内代码保持惰性。 */
function FileMentionsDemo({ text }: { text: string }) {
  const [opened, setOpened] = useState<string | null>(null)
  const known = new Map<string, string>([
    ['package.json', '/workspace/dsh-ui/package.json'],
    ['src/markdown.ts', '/workspace/dsh-ui/src/markdown.ts'],
  ])
  const fileMentions: MarkdownFileMentions = {
    resolve(value) {
      const full = known.get(value)
      if (full === undefined) return undefined
      return {
        open: () => {
          setOpened(full)
        },
        label: `打开文件 ${value}`,
        title: full,
      }
    },
  }
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <MarkdownText text={text} labels={markdownLabels} fileMentions={fileMentions} />
      <p style={{ margin: 0, color: 'var(--dsw-alias-label-secondary)' }}>
        {opened === null ? '还没有点开任何文件' : `已打开：${opened}`}
      </p>
    </div>
  )
}

/** `fileMentions`：调用方用自己的真实文件词表做 resolver，渲染器从不猜测"像路径"的东西。`package.json` 与 `src/markdown.ts` 可点，`bun install` 与 `README.md` 保持普通行内代码。仅 settled 渲染生效。 */
export const FileMentions: Story = {
  args: {
    text: [
      '先看 `package.json` 里的 `exports`，入口文件是 `src/markdown.ts`；',
      '`README.md` 不在词表里所以是普通代码，命令 `bun install` 也一样。',
      '',
      '链接里的引用不可点（按钮不能嵌在 a 里）：[看 `package.json`](https://example.com)',
    ].join('\n'),
  },
  render: (args) => <FileMentionsDemo text={args.text} />,
}

/** 受控协议链接：`http:` / `https:` / `mailto:` 放行（外链自动加 `target=_blank rel=noopener noreferrer`），`javascript:` / `data:` / 相对路径 / 片段锚点全部拆成纯文本；行内代码若整体是绝对 HTTP(S) URL 也会变成链接。 */
export const Links: Story = {
  args: {
    text: [
      '- 放行：[https 链接](https://deepseek.com)、[http 链接](http://example.com)、[邮件](mailto:hi@example.com)',
      '- 行内代码 URL：`https://example.com/docs?q=1`（保留 code 外观并可点）',
      '- 拒绝（变成纯文本）：[javascript 协议](javascript:alert(1))、[data 协议](data:text/html;base64,PGI+aGk8L2I+)',
      '- 拒绝：[相对路径](./docs/readme.md)、[页内锚点](#section)、[裸 host](example.com)',
      '- 图片只放行绝对 HTTP(S)，否则显示 alt 文本：![本地图片的 alt](./local.png)',
    ].join('\n'),
  },
}

/** 原生 HTML 不解析：`<script>`、`<div>`、`<img onerror>` 都按字面文本显示，没有任何 HTML 进入 DOM。 */
export const RawHtmlRejected: Story = {
  args: {
    text: [
      '下面这些都是字面文本，不会执行也不会变成元素：',
      '',
      '<script>alert("xss")</script>',
      '',
      '<div class="card"><b>加粗</b> 与 <a href="https://example.com">链接</a></div>',
      '',
      '<img src="x" onerror="alert(1)">',
      '',
      '行内 <span class="x">HTML</span> 同样是字面文本，但 **Markdown 强调** 仍然生效。',
    ].join('\n'),
  },
}

/** 流式演示样例：把一段样张按 12 字符一块推进，尾部两块之外冻结缓存。 */
function StreamingDemo({ text }: { text: string }) {
  const [shown, setShown] = useState(0)
  const [round, setRound] = useState(0)
  useEffect(() => {
    setShown(0)
    const timer = window.setInterval(() => {
      setShown((n) => {
        if (n >= text.length) {
          window.clearInterval(timer)
          return n
        }
        return n + 12
      })
    }, 60)
    return () => {
      window.clearInterval(timer)
    }
  }, [text, round])
  const done = shown >= text.length
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setRound((r) => r + 1)
          }}
        >
          重放
        </Button>
        <span style={{ color: 'var(--dsw-alias-label-secondary)' }}>
          {done ? '已结束（settled：数学此时才渲染）' : `流式中 ${Math.min(shown, text.length)}/${text.length}`}
        </span>
      </div>
      <MarkdownText text={text.slice(0, shown)} streaming={!done} labels={markdownLabels} />
    </div>
  )
}

/** `streaming`：文本逐块增长时按增量解析，围栏代码只对追加的文本重新分词；`$$` 数学在流式期间保持字面，settled 后才交给 KaTeX。点"重放"重看。 */
export const Streaming: Story = {
  args: {
    text: [
      '## 流式回复',
      '',
      '这段文字会一块一块出现，**强调**、`code` 与 [链接](https://deepseek.com) 在各自闭合后立刻生效。',
      '',
      '```ts',
      'const total = items.reduce((sum, item) => sum + item.price, 0)',
      'console.log(`合计 ${total}`)',
      '```',
      '',
      '数学 $a^2 + b^2 = c^2$ 在结束前是字面文本：',
      '',
      '$$',
      '\\lim_{n \\to \\infty} \\left(1 + \\frac{1}{n}\\right)^n = e',
      '$$',
    ].join('\n'),
  },
  render: (args) => <StreamingDemo text={args.text} />,
}

/** 组合样张：一篇助手回复同时用到标题、GFM 表格、任务列表、数学、代码、引用、脚注与链接。 */
export const Composite: Story = {
  args: {
    text: [
      '# 发布说明 0.2.0',
      '',
      '本次同步了上游 `dsh-v0.1.5-rc.2`[^src]，主要变化：',
      '',
      '| 模块 | 变化 | 影响 |',
      '| --- | --- | --- |',
      '| Markdown | 直接 mdast→React 渲染 | 流式缓存冻结块 |',
      '| CodeBlock | Shiki 增量分词 | 长围栏不再整体重算 |',
      '',
      '## 待办',
      '',
      '- [x] 更新 `catalog.md`',
      '- [ ] 补 Storybook 四段说明',
      '',
      '> 注意：外层**不要**再套 `dangerouslySetInnerHTML`。',
      '',
      '性能模型：每块开销 $O(\\text{tail})$ 而非 $O(n)$，',
      '',
      '$$',
      'T(n) = \\sum_{i=1}^{n} c \\cdot |\\text{tail}_i|',
      '$$',
      '',
      '```bash',
      'npm run build && npm run demo',
      '```',
      '',
      '详见 [文档站](https://deepseek.com)。',
      '',
      '[^src]: 版本号以 `UPSTREAM.md` 为准。',
    ].join('\n'),
  },
}
