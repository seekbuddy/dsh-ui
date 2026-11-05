import type { Meta, StoryObj } from '@storybook/react-vite'
import { DetailDocument, detailDocumentState, useDetailDocumentLabels } from '@seekbuddy/dsh-ui/markdown'
import type { DetailDocumentCopy, DetailDocumentRead } from '@seekbuddy/dsh-ui/markdown'

const copy: DetailDocumentCopy = {
  title: '插件说明',
  loading: '正在加载说明',
  retry: '重试',
  copy: '复制',
  copied: '已复制',
  codeBlock: '代码块',
  wrap: '自动换行',
  unwrap: '取消换行',
  footnotes: '脚注',
}

const MARKDOWN = `## 安装

运行下面的命令：

\`\`\`sh
dsh plugin add @seekbuddy/example
\`\`\`

安装后在**设置 → 插件**里启用。`

function Demo({ read }: { read: DetailDocumentRead }) {
  const labels = useDetailDocumentLabels(copy)
  return (
    <div style={{ width: 420, height: 260, display: 'flex' }}>
      <DetailDocument state={detailDocumentState(read)} labels={labels} onRetry={() => {}} />
    </div>
  )
}

const meta = {
  title: '镜像层（上游同步）/Markdown/DetailDocument',
  component: DetailDocument,
  parameters: {
    docs: {
      description: {
        component: `详情页里的一篇 Markdown 文档（插件说明、技能说明等），统一处理加载中、出错重试和「没有文档」三种状态。调用方把自己的读取结果交给 \`detailDocumentState\` 换算成要显示的状态；\`useDetailDocumentLabels\` 把一组扁平的文案拼成组件要的 \`labels\`（含 Markdown 代码块工具栏）。上游同步件（\`dsh-v0.2.2-rc.1\` 新增），源码不改。

**状态换算**：读取还没开始或进行中 → 加载中；读到文档 → 显示；读完但没有文档 → 不渲染；失败 → 显示错误信息和重试按钮。
**可访问性**：文档区域的读屏名称取 \`labels.title\`，组件本身不显示标题。`,
      },
    },
  },
  args: { state: { status: 'loading' }, labels: undefined as never, onRetry: () => {} },
  argTypes: { state: { control: false }, labels: { control: false }, onRetry: { control: false } },
} satisfies Meta<typeof DetailDocument>
export default meta
type Story = StoryObj<typeof meta>

/** 读到文档。 */
export const Found: Story = { render: () => <Demo read={{ status: 'ready', markdown: MARKDOWN }} /> }

/** 读取中（读取未开始时也是这个状态）。 */
export const Loading: Story = { render: () => <Demo read={{ status: 'loading' }} /> }

/** 读取失败：显示调用方给的错误信息和重试按钮。 */
export const Failed: Story = { render: () => <Demo read={{ status: 'error', message: '网络请求失败（502）' }} /> }
