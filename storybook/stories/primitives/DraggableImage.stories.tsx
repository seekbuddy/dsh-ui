import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DraggableImage } from '@seekbuddy/dsh-ui'
import type { FileDragActions } from '@seekbuddy/dsh-ui'

const SRC =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160"><rect width="240" height="160" rx="16" fill="#e5e7eb"/><text x="120" y="88" font-size="16" text-anchor="middle" fill="#374151">拖我到桌面</text></svg>',
  )

const meta = {
  title: '镜像层（上游同步）/DraggableImage',
  component: DraggableImage,
  parameters: {
    docs: {
      description: {
        component: `可以拖出页面的图片：拖动时通过 \`fileDrag\` 把图片作为文件交给浏览器（或桌面端），可以直接拖到桌面或其他应用。真正怎么准备文件由插件实现 \`FileDragActions\`（\`prepare\` 准备传输，\`reportFailure\` 显示失败提示），组件只负责展示和拖动手势。上游同步件（\`dsh-v0.2.2-rc.1\` 新增），源码不改。

**什么时候用**：生成的图片、附件缩略图等需要让用户「拖出去另存」的地方。
**什么时候不用**：纯装饰图片，用普通 \`<img>\`。
**下面的示例**：\`prepare\` 用浏览器原生的 \`DownloadURL\` 拖动格式，只在 Chromium 内核浏览器里能拖出文件；失败会记在下方。`,
      },
    },
  },
  args: { src: SRC, name: '示例图片.svg', alt: '示例图片', fileDrag: undefined as unknown as FileDragActions },
  argTypes: { fileDrag: { control: false } },
} satisfies Meta<typeof DraggableImage>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const [log, setLog] = useState<string[]>([])
    const fileDrag: FileDragActions = {
      prepare: async (source) => ({
        start: (transfer) => {
          const url = source.kind === 'url' ? source.url : URL.createObjectURL(source.blob)
          transfer.setData('DownloadURL', `${source.mediaType}:${source.name ?? 'image'}:${url}`)
          setLog((l) => [...l, `开始拖动：${source.name ?? '未命名'}`])
          return true
        },
        release: () => {},
      }),
      reportFailure: () => setLog((l) => [...l, '拖动失败']),
    }
    return (
      <div style={{ display: 'grid', gap: 8, font: 'var(--dsw-font-s-14)' }}>
        <DraggableImage {...args} fileDrag={fileDrag} width={240} height={160} />
        <div style={{ color: 'var(--dsw-alias-label-secondary)' }}>{log.join(' · ') || '还没有拖动'}</div>
      </div>
    )
  },
}
