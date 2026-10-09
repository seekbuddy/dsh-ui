import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { MarkdownDelegateProvider, MarkdownText } from '@seekbuddy/dsh-ui/markdown'
import { markdownLabels } from './labels.ts'

const TEXT = [
  '外链交给宿主打开：[deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)。',
  '',
  '本地文件跳到编辑器：[render.tsx 第 42 行](src/markdown/render.tsx#L42)，或者 [README](README.md)。',
].join('\n')

const meta = {
  title: '镜像层（上游同步）/Markdown/MarkdownDelegateProvider',
  component: MarkdownDelegateProvider,
  parameters: {
    docs: {
      description: {
        component: `给一棵子树里的 \`MarkdownText\` 统一接管**链接导航**，不用把回调一层层往渲染器里传：\`openExternalLink(href)\` 接管 http(s) 外链（不给就走原生 \`<a>\`），\`openFile(path, { line })\` 接管本地路径链接（不给就只显示纯文本，\`#L42\` 这类行号会解析进 \`line\`），\`fileImages\` 给本地图片路径解析出预览地址并弹 \`ImageLightbox\`。就近的 Provider 生效，嵌套时内层整体替换外层。上游同步件（\`dsh-v0.1.7-rc.1\` 新增），源码不改。

**什么时候用**：宿主要自己决定链接去哪（桌面壳用系统浏览器开外链、点文件路径在编辑器里打开）。
**什么时候不用**：普通网页里外链直接新窗口打开就够时不必包它；它不改渲染样式。
**可访问性**：链接仍是 \`<a>\`，键盘与读屏语义不变；只是激活后的行为交给宿主。
**相关 token**：无（不渲染自己的 UI）。`,
      },
    },
  },
  args: { children: null },
  argTypes: { children: { control: false } },
} satisfies Meta<typeof MarkdownDelegateProvider>
export default meta
type Story = StoryObj<typeof meta>

/** 点下面的链接：外链与本地文件都被 Provider 接管，结果写在下方，不会真的跳走。 */
export const Default: Story = {
  render: () => {
    const [log, setLog] = useState('—')
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <MarkdownDelegateProvider
          openExternalLink={(href) => setLog(`openExternalLink("${href}")`)}
          openFile={(path, options) => setLog(`openFile("${path}", ${JSON.stringify(options ?? {})})`)}
        >
          <MarkdownText text={TEXT} labels={markdownLabels} />
        </MarkdownDelegateProvider>
        <output style={{ font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-tertiary)' }}>
          最近一次：{log}
        </output>
      </div>
    )
  },
}
