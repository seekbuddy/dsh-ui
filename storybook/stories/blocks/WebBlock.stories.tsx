import type { Meta, StoryObj } from '@storybook/react-vite'
import { WebBlock } from '@seekbuddy/dsh-ui/blocks'
import { webAnswer, webLabels, webSources, webUnsafeSources } from './fixtures.ts'

const meta = {
  title: '镜像层（上游同步）/Blocks/WebBlock',
  component: WebBlock,
  parameters: {
    docs: {
      description: {
        component: `网络检索结果卡片，一个组件两种 \`kind\`：\`search\`（可选的 Markdown 答案 + 有序来源列表，来源多了在容器内滚动）与 \`fetch\`（最终 URL + HTTP 状态码）。\`answer\` 经 \`MarkdownText\` 渲染，所以 \`labels.markdown\` 也要传。上游同步件，源码不改。

**什么时候用**：web_search / web_fetch 类工具的结果。\`truncated\` 在 search 里指来源列表被砍（显示 \`labels.sourcesTruncated\`），在 fetch 里指抓取内容被砍（显示 \`labels.contentTruncated\`）。
**什么时候不用**：本地文件搜索用 \`SearchBlock\`；要展示抓回来的正文本身，另用 \`MarkdownText\` / \`ReadBlock\`——本卡片只是检索摘要。
**可访问性**：只有 http(s) 的 URL 才成为 \`<a target="_blank" rel="noopener noreferrer">\`，\`javascript:\` / \`data:\` / \`file:\` 或解析失败的 URL 一律退化为纯文本 span，不会进入 \`href\`。链接文字优先用 \`title\`，缺失时用 hostname，仍为空时用原 URL，保证永远有可见名。来源用 \`<ol>\` + \`<li value>\` 钉住引用序号，即使在滚动容器里也按真实序号读。
**相关 token**：\`--dsw-alias-state-business-primary\`（链接色）、\`--dsw-alias-markdown-code-block\`（fetch 卡底）、\`--dsw-alias-label-primary\` / \`secondary\` / \`tertiary\`、\`--dsw-font-xs-13\`。`,
      },
    },
  },
  args: { labels: webLabels, truncated: false },
  argTypes: { labels: { control: false } },
} satisfies Meta<typeof WebBlock>
export default meta
type Story = StoryObj<typeof meta>

/** `kind="search"`：Markdown 答案 + 三条来源（完整字段 / 只有 URL / 无摘要）。 */
export const Default: Story = {
  args: { kind: 'search', answer: webAnswer, sources: webSources },
}

/** 只有来源没有答案：省略 `answer`，直接列来源。 */
export const SearchSourcesOnly: Story = {
  args: { kind: 'search', sources: webSources },
}

/** 来源列表被截断：底部显示 `labels.sourcesTruncated`。 */
export const SearchTruncated: Story = {
  args: { kind: 'search', answer: webAnswer, sources: webSources, truncated: true },
}

/** 无结果：既无答案也无来源时显示 `labels.noResults`。 */
export const SearchEmpty: Story = {
  args: { kind: 'search', sources: [] },
}

/** 非 http(s) 协议的来源：不生成链接，只显示文本（安全退化）。 */
export const SearchUnsafeUrls: Story = {
  args: { kind: 'search', sources: webUnsafeSources },
}

/** `kind="fetch"`：最终 URL 成为外链，旁边是 `labels.http` + 状态码。 */
export const Fetch: Story = {
  args: { kind: 'fetch', url: 'https://github.com/deepseek-ai/deepseek-harness', statusCode: 200 },
}

/** 抓取内容被截断：状态码旁显示 `labels.contentTruncated`。 */
export const FetchTruncated: Story = {
  args: { kind: 'fetch', url: 'https://docs.example.com/very/long/page', statusCode: 200, truncated: true },
}

/** 失败状态：非 2xx 的状态码（组件不做颜色区分，状态码原样显示，由调用方决定是否另加提示）。 */
export const FetchFailed: Story = {
  args: { kind: 'fetch', url: 'https://example.com/missing', statusCode: 404 },
}

/** 服务端错误 + 非 http 协议：URL 退化为纯文本。 */
export const FetchUnsafeUrl: Story = {
  args: { kind: 'fetch', url: 'file:///etc/hosts', statusCode: 500 },
}

/** 组合样张：search（正常 / 截断 / 空）与 fetch（200 / 404 / 截断）并排。 */
export const AllVariants: Story = {
  args: { kind: 'search', answer: webAnswer, sources: webSources },
  render: () => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 720 }}>
      <WebBlock kind="search" answer={webAnswer} sources={webSources} truncated={false} labels={webLabels} />
      <WebBlock kind="search" sources={webSources} truncated labels={webLabels} />
      <WebBlock kind="search" sources={[]} truncated={false} labels={webLabels} />
      <WebBlock kind="fetch" url="https://deepseek.com/harness" statusCode={200} truncated={false} labels={webLabels} />
      <WebBlock kind="fetch" url="https://example.com/missing" statusCode={404} truncated={false} labels={webLabels} />
      <WebBlock kind="fetch" url="https://docs.example.com/long" statusCode={200} truncated labels={webLabels} />
    </div>
  ),
}
