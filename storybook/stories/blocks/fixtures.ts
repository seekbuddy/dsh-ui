/**
 * Blocks 波次共用样例：labels 常量 + 六种工具结果的样例数据。
 *
 * labels 常量是给消费者抄的样板——每个 `*Labels` 类型一份、字段全中文，
 * 与上游 demo 的写法一致。组件本身 locale 无关，文案一律由调用方经 props 传入。
 */
import type {
  DiffBlockLabels,
  DiffHunk,
  JsonTreeLabels,
  ReadBlockLabels,
  ReadBlockLine,
  SearchBlockLabels,
  SearchFileGroup,
  TerminalBlockLabels,
  WebBlockLabels,
  WebSourceView,
} from '@seekbuddy/dsh-ui/blocks'
import type { MarkdownLabels } from '@seekbuddy/dsh-ui/markdown'

// ---------------------------------------------------------------------------
// labels 常量（样板）
// ---------------------------------------------------------------------------

/** 折叠 / 复制的公共文案：Terminal / Read / Diff / Search 四个块都带这七个字段，抽出来复用。 */
const foldLabels = {
  copy: '复制',
  copied: '已复制',
  collapseAria: '收起中间内容',
  expandAria: (hidden: number) => `展开 ${hidden} 行隐藏内容`,
  collapse: '收起',
  expand: (hidden: number) => `展开 ${hidden} 行`,
}

/** JsonTree：复制菜单三项（值 / JSON / 路径，对象行换成格式化 / 紧凑 JSON）、复制反馈、展开器 aria 文案。 */
export const jsonTreeLabels: JsonTreeLabels = {
  copyValue: '复制值',
  copyJson: '复制 JSON',
  copyPath: '复制路径',
  copyPrettyJson: '复制格式化 JSON',
  copyCompactJson: '复制紧凑 JSON',
  copied: '已复制',
  copyFailed: '复制失败',
  collapseNode: '收起节点',
  expandNode: '展开节点',
  copyButtonTitle: (action: string) => `${action}（点击复制，右键或长按换方式）`,
}

/** ReadBlock / DiffBlock 共用的代码卡工具栏（0.1.7 起）：无语言时的标题、换行 / 不换行切换。 */
const codeToolbarLabels = {
  codeLabel: '代码',
  wrapLabel: '自动换行',
  unwrapLabel: '不换行',
}

/** TerminalBlock：状态 Pill（信号 / 退出码 / 无退出码）、三种运行态文字、无输出占位，加公共折叠 / 复制文案。 */
export const terminalLabels: TerminalBlockLabels = {
  ...foldLabels,
  signal: (signal: string) => `信号 ${signal}`,
  exitCode: (exitCode: number) => `退出码 ${exitCode}`,
  noExitCode: '无退出码',
  running: '运行中',
  failed: '失败',
  done: '完成',
  noOutput: '无输出',
}

/** ReadBlock：`window` 是"读的是文件的一个窗口"时的说明（返回行数 < 文件总行数才显示）。 */
export const readLabels: ReadBlockLabels = {
  ...foldLabels,
  ...codeToolbarLabels,
  window: (shown: number, total: number) => `显示 ${shown} / 共 ${total} 行`,
}

/** DiffBlock：0.1.7 起去掉了页脚文件计数，只剩公共折叠 / 复制文案与代码卡工具栏。 */
export const diffLabels: DiffBlockLabels = {
  ...foldLabels,
  ...codeToolbarLabels,
}

/** SearchBlock：截断时把"显示 X / 共 N"折进摘要，不把截断结果当完整结果展示。 */
export const searchLabels: SearchBlockLabels = {
  ...foldLabels,
  pathsSummary: (shown: number, total: number, truncated: boolean) =>
    truncated ? `显示 ${shown} / 共 ${total} 个路径` : `${total} 个路径`,
  matchesSummary: (shown: number, total: number, files: number, truncated: boolean) =>
    `${truncated ? `显示 ${shown} / 共 ${total}` : total} 处匹配 · ${files} 个文件`,
  noResults: '没有结果',
}

/** WebBlock 里的 `answer` 走 MarkdownText 渲染，所以要再带一份 MarkdownLabels（代码块复制 + 脚注标题）。 */
export const markdownLabels: MarkdownLabels = {
  code: { copyLabel: '复制', copiedLabel: '已复制' },
  footnotes: '脚注',
}

/** WebBlock：无结果占位、两种截断提示、HTTP 状态前缀，加嵌套的 markdown labels。 */
export const webLabels: WebBlockLabels = {
  noResults: '没有结果',
  sourcesTruncated: '来源列表已截断',
  http: 'HTTP',
  contentTruncated: '内容已截断',
  markdown: markdownLabels,
}

// ---------------------------------------------------------------------------
// JsonTree 样例数据
// ---------------------------------------------------------------------------

/** 嵌套对象：字符串 / 数字 / 布尔 / null / 数组 / 子对象都出现一遍。 */
export const jsonNested = {
  name: '智能体工作台',
  version: '0.2.0',
  enabled: true,
  owner: null,
  tags: ['react', 'tokens', '主题'],
  limits: { maxLines: 16, timeoutMs: 30000, retry: { count: 3, backoff: 'exponential' } },
  instances: [
    { id: 'inst-01', region: '上海', status: 'running' },
    { id: 'inst-02', region: '深圳', status: 'stopped' },
  ],
}

/** 顶层是数组：行的 key 是索引，预览最多显示 5 项。 */
export const jsonArray = [
  { id: 1, title: '安装依赖', done: true },
  { id: 2, title: '构建 dist', done: true },
  { id: 3, title: '写 story', done: false },
  { id: 4, title: '跑门禁', done: false },
  { id: 5, title: '提 PR', done: false },
  { id: 6, title: '合并', done: false },
]

/** 长字符串：看行内截断 / 换行与"复制值"是否拿到完整内容。 */
export const jsonLongString = {
  summary:
    '这是一段很长的说明文字，用来验证 JSON 树在遇到超长字符串时的表现：行内会不会溢出、预览会不会截断、复制值能否拿到完整内容。' +
    '继续往后填充一些内容，以确保它超过常规的一行宽度——lorem ipsum 的中文版本就是这样一直写下去、一直写下去。',
  url: 'https://example.com/a/very/long/path/that/keeps/going/and/going/with?query=string&and=more&params=1234567890',
}

/** 空对象与空数组：既没有子节点也不该有展开器。 */
export const jsonEmpty = { emptyObject: {}, emptyArray: [] as unknown[], nothing: null }

// ---------------------------------------------------------------------------
// TerminalBlock 样例数据
// ---------------------------------------------------------------------------

/** 含 ANSI SGR 转义的输出：绿 / 红 / 黄 / 蓝 / 粗体 / 暗淡 / 下划线。基础 16 色会映射到主题 token。 */
export const ansiOutput = [
  '\x1b[1m$ bun test\x1b[0m',
  '\x1b[32m✓\x1b[0m theme › 切换暗色写入 body 属性',
  '\x1b[32m✓\x1b[0m theme › reduced-motion 下停转',
  '\x1b[31m✗\x1b[0m tabs › Home/End 环绕 \x1b[2m(12ms)\x1b[0m',
  '\x1b[33m⚠\x1b[0m 1 个用例被跳过',
  '\x1b[34mℹ\x1b[0m 详情见 \x1b[4mreports/index.html\x1b[0m',
  '',
  '\x1b[1m\x1b[32m2 passed\x1b[0m, \x1b[1m\x1b[31m1 failed\x1b[0m, 1 skipped',
].join('\n')

/** 超过 16 行的输出（30 行）：默认按 8 头 + 8 尾折叠，中间藏 14 行。 */
export const longOutput = Array.from(
  { length: 30 },
  (_, i) => `第 ${i + 1} 行：src/file-${i + 1}.tsx`,
).join('\n')

/** 一个只有转义序列没有可见字符的输出：组件会把它判定为"无输出"。 */
export const invisibleOutput = '\x1b[0m\x1b]0;窗口标题\x07'

// ---------------------------------------------------------------------------
// ReadBlock 样例数据
// ---------------------------------------------------------------------------

/** 一个短文件的全部内容：行号从 1 起，返回行数 == totalLines，不显示窗口提示。 */
export const readShort: readonly ReadBlockLine[] = [
  { number: 1, text: "import { Button } from '@seekbuddy/dsh-ui'" },
  { number: 2, text: '' },
  { number: 3, text: 'export function Toolbar() {' },
  { number: 4, text: '  return <Button size="sm">新建</Button>' },
  { number: 5, text: '}' },
]

/** 从第 120 行开始读的窗口：行号沿用文件自己的编号，`totalLines` 大于返回行数。 */
export const readWindow: readonly ReadBlockLine[] = Array.from({ length: 10 }, (_, i) => ({
  number: 120 + i,
  text: `  case ${120 + i}: return handle${120 + i}(input) // 第 ${120 + i} 行`,
}))

/** 40 行 TypeScript：超过 16 行触发折叠，同时给 `lang="ts"` 看高亮。 */
export const readLong: readonly ReadBlockLine[] = Array.from({ length: 40 }, (_, i) => ({
  number: i + 1,
  text: i % 4 === 0 ? `// 第 ${i + 1} 段` : `export const value${i + 1}: number = ${i + 1} * 2`,
}))

// ---------------------------------------------------------------------------
// DiffBlock 样例数据
// ---------------------------------------------------------------------------

/** 增删混合：同一文件先删旧行再加新行。 */
export const diffMixed: DiffHunk[] = [
  {
    path: 'src/theme.ts',
    oldText: "export const DEFAULT_PREFERENCE = 'system'\nexport type ThemePreference = 'light' | 'dark'\n",
    newText:
      "export const DEFAULT_PREFERENCE: ThemePreference = 'system'\nexport type ThemePreference = 'light' | 'dark' | 'system'\n",
  },
]

/** 只增：`oldText: null` 表示新建文件（或整文件覆盖），删除侧什么都不画。 */
export const diffAddOnly: DiffHunk[] = [
  {
    path: 'README.md',
    oldText: null,
    newText: '# @seekbuddy/dsh-ui\n\n一包两层：镜像层随上游同步，扩展层在 src/seekbuddy/。\n',
  },
]

/** 只删：`newText: ''` 是零行，整段内容被移除。 */
export const diffDeleteOnly: DiffHunk[] = [
  {
    path: 'src/legacy.ts',
    oldText: 'export function legacyHelper() {\n  return null\n}\n',
    newText: '',
  },
]

/** 多文件 + 同文件第二个 hunk：第二段同路径会用 `⋯` 分隔而不是重复路径；页脚文件数按去重路径算（这里是 2）。 */
export const diffMultiFile: DiffHunk[] = [
  ...diffMixed,
  {
    path: 'src/theme.ts',
    oldText: 'const KEY = "theme"\n',
    newText: "const KEY = 'dsw-theme-preference'\n",
  },
  ...diffAddOnly,
]

/** 超过 16 行的 hunk：触发折叠。 */
export const diffLong: DiffHunk[] = [
  {
    path: 'src/icons.ts',
    oldText: Array.from({ length: 12 }, (_, i) => `export { IconOld${i + 1} } from './icons/old-${i + 1}.tsx'`).join(
      '\n',
    ),
    newText: Array.from({ length: 14 }, (_, i) => `export { IconNew${i + 1} } from './icons/new-${i + 1}.tsx'`).join(
      '\n',
    ),
  },
]

// ---------------------------------------------------------------------------
// SearchBlock 样例数据
// ---------------------------------------------------------------------------

/** grep 形态：按文件分组的匹配行。 */
export const searchMatches: SearchFileGroup[] = [
  {
    path: 'src/theme.ts',
    matches: [
      { lineNumber: 12, line: 'export function resolveDark(preference: ThemePreference) {' },
      { lineNumber: 20, line: "  document.body.toggleAttribute('data-ds-dark-theme', dark)" },
    ],
  },
  {
    path: 'src/seekbuddy/Tabs.tsx',
    matches: [{ lineNumber: 8, line: "import { useIsDark } from '../theme.ts'" }],
  },
  {
    path: 'app/layout.tsx',
    matches: [
      { lineNumber: 3, line: "import { THEME_BOOTSTRAP_SCRIPT } from '@seekbuddy/dsh-ui/theme/bootstrap'" },
      { lineNumber: 17, line: '      <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />' },
    ],
  },
]

/** 超过 16 行的分组：三个文件各 8 条匹配，含表头共 27 行，触发折叠；尾段若从某文件中间切开会补回该文件表头。 */
export const searchMatchesLong: SearchFileGroup[] = ['a', 'b', 'c'].map((name) => ({
  path: `plugins/${name}/src/index.ts`,
  matches: Array.from({ length: 8 }, (_, i) => ({ lineNumber: (i + 1) * 7, line: `ctx.logger.info('步骤 ${i + 1}')` })),
}))

/** glob 形态：扁平路径列表。 */
export const searchPaths = [
  'src/Button.tsx',
  'src/Input.tsx',
  'src/Pill.tsx',
  'src/Menu.tsx',
  'src/Modal.tsx',
  'src/seekbuddy/Tabs.tsx',
  'src/seekbuddy/Spinner.tsx',
]

/** 超过 16 行的路径列表（24 条）。 */
export const searchPathsLong = Array.from({ length: 24 }, (_, i) => `src/icons/icon-${i + 1}.tsx`)

// ---------------------------------------------------------------------------
// WebBlock 样例数据
// ---------------------------------------------------------------------------

/** `search` 形态的 answer：Markdown，会经 MarkdownText 渲染。 */
export const webAnswer =
  'DeepSeek Harness 是一个**插件化**的智能体运行时：一切皆插件，宿主只提供 Cordis 生命周期与 RPC。\n\n' +
  '- 插件以 npm 包交付\n- UI 通过 `@seekbuddy/dsh-ui` 共享设计系统'

/** 三条来源：完整字段 / 只有 URL（用 hostname 当标题）/ 无摘要。 */
export const webSources: WebSourceView[] = [
  {
    url: 'https://github.com/deepseek-ai/deepseek-harness',
    title: 'deepseek-harness · GitHub',
    snippet: 'Everything is a Plugin. 插件化智能体 harness。',
    publishedAt: '2026-08-12',
  },
  { url: 'https://deepseek.com/harness' },
  { url: 'https://docs.example.com/plugins/getting-started', title: '插件入门', publishedAt: '2026-07-30' },
]

/** 非 http(s) 的 URL：不会变成链接，只以纯文本显示。 */
export const webUnsafeSources: WebSourceView[] = [
  { url: 'javascript:alert(1)', title: '危险协议，不会成为链接' },
  { url: 'file:///etc/hosts', title: '本地文件协议，同样只显示文本' },
]
