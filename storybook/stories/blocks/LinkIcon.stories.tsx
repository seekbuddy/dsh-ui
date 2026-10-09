import type { CSSProperties } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { LinkIconMedium, LinkIconRegular, classifyLinkPath } from '@seekbuddy/dsh-ui/blocks'
import type { LinkIconKind } from '@seekbuddy/dsh-ui/blocks'

/** 六种类别与各自覆盖的范围。 */
const KINDS: ReadonlyArray<readonly [LinkIconKind, string]> = [
  ['url', '网页地址'],
  ['folder', '文件夹'],
  ['code', '代码 / 网页 / 数据文件'],
  ['image', '图片'],
  ['document', '办公文档（PDF、Word、Excel、PPT…）'],
  ['other', '其他（含 Markdown、视频、无扩展名）'],
]

/** 分类样例取自上游单测（link-icon.client.spec.tsx）。 */
const SAMPLE_PATHS = [
  'src/markdown/render.tsx',
  'site/index.html',
  'data/export.CSV',
  'shots/hero.png',
  'report.pdf',
  'budget.xlsx',
  'deck.pptx',
  'C:\\work\\summary.docx',
  'notes.md',
  'clip.mp4',
  'Makefile',
  'notes.unknownext',
]

/** `href` 命中已知站点时换成站点标志（`simple-icons` 图形，0.1.7 起）；未知站点仍是地球。 */
const SITE_LINKS = [
  'https://github.com/deepseek-ai/deepseek-harness',
  'https://www.npmjs.com/package/dsh-ui-primitives',
  'https://stackoverflow.com/questions',
  'https://www.zhihu.com/question/1',
  'https://www.bilibili.com/video/1',
  'https://example.com/unknown-site',
]

const link: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  color: 'var(--dsw-alias-link)',
  font: 'var(--dsw-font-s-14)',
}

const meta = {
  title: '镜像层（上游同步）/Blocks/LinkIcon',
  component: LinkIconRegular,
  parameters: {
    docs: {
      description: {
        component: `可点击产物链接（Markdown 链接、文件提及、交付文件芯片）前的**类别小图标**。\`LinkIconRegular\`（1px 描边）/ \`LinkIconMedium\`（1.3px）两档粗细，0.1.7 起取代原 \`LinkIcon\`。按 \`kind\` 出六种图形，默认 14px（与行内链接文字同高），全部跟随 \`currentColor\`，**跟随链接自身的颜色**；\`kind="url"\` 再给 \`href\` 时，GitHub / npm / Stack Overflow / 知乎 / B 站等已知站点换成站点标志（\`simple-icons\`），未知站点仍是地球。\`classifyLinkPath(path)\` 按扩展名推出文件类别：代码、网页、数据文件共用 \`code\`，办公文档统一 \`document\`，Markdown / 视频 / 未知扩展名落到 \`other\`；它**永远不会返回** \`url\` / \`folder\`，这两种由调用方直接声明。上游同步件（\`dsh-v0.1.5-rc.2\` 新增，0.1.7 分出粗细并加站点标志），源码不改；与 [FileTypeIcon](?path=/docs/镜像层（上游同步）-blocks-filetypeicon--docs) 一样放在 \`/blocks\` 入口（原因见那一页）。

**什么时候用**：行内链接、文件路径提及前的类别提示。
**什么时候不用**：文件列表 / 卡片上的大图标用 \`FileTypeIcon\`（28px、全彩）；与链接无关的功能图标用 \`/icons\` 的 \`Icon*\`。
**可访问性**：纯装饰图形，可访问名来自链接文字本身；图标不单独承载信息。
**相关 token**：图标不引用 token，颜色走 \`currentColor\`；本页链接样式用 \`--dsw-alias-link\`（rc.2 新增的链接色）。`,
      },
    },
  },
  args: { kind: 'url' },
} satisfies Meta<typeof LinkIconRegular>
export default meta
type Story = StoryObj<typeof meta>

/** 默认 14px，颜色继承父元素。 */
export const Default: Story = {}

/** 六种类别，放在链接文字前的样子；左 Regular、右 Medium。 */
export const AllKinds: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      {KINDS.map(([kind, label]) => (
        <span key={kind} style={link}>
          <LinkIconRegular kind={kind} />
          <LinkIconMedium kind={kind} />
          <code>{kind}</code>
          <span>{label}</span>
        </span>
      ))}
    </div>
  ),
}

/** 站点标志：`kind="url"` + `href`，已知站点出品牌图形（仍跟随 `currentColor`），未知站点回落地球。 */
export const SiteMarks: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      {SITE_LINKS.map((href) => (
        <span key={href} style={link}>
          <LinkIconRegular kind="url" href={href} />
          <span>{new URL(href).hostname}</span>
        </span>
      ))}
    </div>
  ),
}

/** 路径分类：`classifyLinkPath` 的实际返回值（页面加载时现算）。 */
export const ClassifyPaths: Story = {
  render: () => (
    <table>
      <thead>
        <tr>
          <th>path</th>
          <th>classifyLinkPath</th>
          <th>链接样式</th>
        </tr>
      </thead>
      <tbody>
        {SAMPLE_PATHS.map((path) => (
          <tr key={path}>
            <td>
              <code>{path}</code>
            </td>
            <td>
              <code>{classifyLinkPath(path)}</code>
            </td>
            <td>
              <span style={link}>
                <LinkIconRegular kind={classifyLinkPath(path)} />
                {path.split(/[\\/]/).pop()}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
}
