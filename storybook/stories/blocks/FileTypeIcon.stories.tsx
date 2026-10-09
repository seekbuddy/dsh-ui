import type { CSSProperties } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FileTypeIcon, classifyFileType, fileExtension } from '@seekbuddy/dsh-ui/blocks'
import type { FileTypeKind } from '@seekbuddy/dsh-ui/blocks'

/** 传统文件类别：彩色纸张 + 类别标记（文件夹是单独的图形）。 */
const DOCUMENT_KINDS: readonly FileTypeKind[] = [
  'folder',
  'code',
  'html',
  'markdown',
  'image',
  'pdf',
  'word',
  'excel',
  'ppt',
  'video',
  'other',
]

/** 代码 / 配置类别取样：每一种都是独立的全彩方形图标。 */
const CODE_KINDS: readonly FileTypeKind[] = [
  'typescript',
  'react',
  'javascript',
  'python',
  'go',
  'rust',
  'java',
  'json',
  'yaml',
  'docker',
  'node',
  'git',
  'shell',
  'env',
  'makefile',
]

/** 分类样例取自上游单测（file-type-icon / code-file-icon spec），不是手编的。 */
const SAMPLE_PATHS = [
  'src/index.TSX',
  'site/index.html',
  'data/export.CSV',
  'shots/hero.png',
  'notes/README.MDX',
  'report.xlsm',
  'deck.key',
  'letter.docx',
  'report.pdf',
  'clip.webm',
  'Makefile',
  'README',
  '.env',
  'package.json',
  'docker-compose.yaml',
  'feature.component.ts',
  'notes.unknownext',
  'extensionless',
]

const grid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 12 }
const cell: CSSProperties = {
  display: 'grid',
  justifyItems: 'center',
  gap: 6,
  font: 'var(--dsw-font-xs-13)',
  color: 'var(--dsw-alias-label-secondary)',
}

const meta: Meta<typeof FileTypeIcon> = {
  title: '镜像层（上游同步）/Blocks/FileTypeIcon',
  component: FileTypeIcon,
  parameters: {
    docs: {
      description: {
        component: `文件类型图标，默认 28px。两种用法：传 \`path\` 由组件自己分类（等同 \`classifyFileType(path)\`），或传已经分好的 \`kind\`。代码 / 配置文件（TypeScript、Python、Dockerfile、package.json…）是**全彩方形图标**，其余是**彩色纸张 + 类别标记**，文件夹单独一个图形。\`context\` 可传项目文件快照，给需要看上下文的判断用（如 Flutter 工程）。上游同步件（\`dsh-v0.1.5-rc.2\` 新增），源码不改。

**⚠️ 入口与上游不同**：上游从根入口导出；本包放在 \`@seekbuddy/dsh-ui/blocks\`——它内嵌约 57KB 的代码图标素材，根入口不应背这份重量（构建期 \`assertLightweightRoot\` 拦截）。\`WebBlock\` 与 Markdown 渲染本来就引用它，所以 blocks / markdown 入口没有额外体积。

**什么时候用**：文件列表、附件卡片、交付文件卡片前的类型图标。
**什么时候不用**：行内链接前的小图标用 [LinkIcon](?path=/docs/镜像层（上游同步）-blocks-linkicon--docs)（14px、跟随链接颜色）；功能图标（搜索、设置）用 \`/icons\` 的 \`Icon*\`。
**可访问性**：SVG 带 \`aria-hidden\`，纯装饰；文件名文字必须同时出现在旁边，由它承担可访问名。
**相关 token**：用**静态色板**（不随明暗主题切换）：\`--dsw-static-red-600\`、\`--dsw-static-deepseek-450\` / \`-500\`、\`--dsw-static-green-500\`、\`--dsw-static-amber-400\` / \`-500\`、\`--dsw-static-neutral-bluish-300\`。`,
      },
    },
  },
  args: { path: 'src/index.tsx' },
}
export default meta
// 联合 props（path | kind）下 StoryObj<typeof meta> 会要求每个 story 都写 args，按组件取类型即可
type Story = StoryObj<typeof FileTypeIcon>

/** 传 `path`：组件自己分类，`.tsx` 落到 `react`。 */
export const Default: Story = {}

/** 传统文件类别一览（`kind` 直接指定）。 */
export const DocumentKinds: Story = {
  render: () => (
    <div style={grid}>
      {DOCUMENT_KINDS.map((kind) => (
        <div key={kind} style={cell}>
          <FileTypeIcon kind={kind} />
          <code>{kind}</code>
        </div>
      ))}
    </div>
  ),
}

/** 代码 / 配置类别取样：全彩方形图标。 */
export const CodeKinds: Story = {
  render: () => (
    <div style={grid}>
      {CODE_KINDS.map((kind) => (
        <div key={kind} style={cell}>
          <FileTypeIcon kind={kind} />
          <code>{kind}</code>
        </div>
      ))}
    </div>
  ),
}

/** 路径分类：`fileExtension` 与 `classifyFileType` 的实际返回值（页面加载时现算，不是手抄）。 */
export const ClassifyPaths: Story = {
  render: () => (
    <table>
      <thead>
        <tr>
          <th>path</th>
          <th>fileExtension</th>
          <th>classifyFileType</th>
          <th>图标</th>
        </tr>
      </thead>
      <tbody>
        {SAMPLE_PATHS.map((path) => (
          <tr key={path}>
            <td>
              <code>{path}</code>
            </td>
            <td>
              <code>{JSON.stringify(fileExtension(path))}</code>
            </td>
            <td>
              <code>{classifyFileType(path)}</code>
            </td>
            <td>
              <FileTypeIcon path={path} size={20} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
}

/** 尺寸：`size` 是正方形边长（默认 28）。 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'end' }}>
      {[16, 20, 28, 40].map((size) => (
        <FileTypeIcon key={size} kind="pdf" size={size} />
      ))}
    </div>
  ),
}
