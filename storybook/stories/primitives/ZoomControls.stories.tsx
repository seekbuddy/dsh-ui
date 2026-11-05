import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DOCUMENT_ZOOM, ZoomControls } from '@seekbuddy/dsh-ui'
import type { DocumentZoomLabels } from '@seekbuddy/dsh-ui'

const labels: DocumentZoomLabels = {
  controls: '缩放控制',
  menu: '缩放比例',
  out: '缩小',
  into: '放大',
  value: (percent) => `${percent}%`,
}

const meta = {
  title: '镜像层（上游同步）/ZoomControls',
  component: ZoomControls,
  parameters: {
    docs: {
      description: {
        component: `文档预览的缩放工具条：缩小、放大，以及一个比例菜单（预设取自 \`DOCUMENT_ZOOM.presets\`，可加「适应宽度」项）。受控 \`zoom\`；\`visible\` 决定是否显示，指针悬停、获得焦点或菜单打开时通过 \`onActiveChange\` 通知调用方保持显示。上游同步件（\`dsh-v0.2.2-rc.1\` 新增），源码不改。

**什么时候用**：图片、PDF、Markdown 等文档预览的右下角工具条。
**范围**：\`DOCUMENT_ZOOM\` 给出最小 ${DOCUMENT_ZOOM.minimum}、最大 ${DOCUMENT_ZOOM.maximum}、步长 ${DOCUMENT_ZOOM.step}。
**可访问性**：容器是 \`role="toolbar"\`，名称取 \`labels.controls\`；所有按钮文字都来自 \`labels\`，要本地化。`,
      },
    },
  },
  args: { zoom: 1, labels, visible: true, onZoom: () => {}, onActiveChange: () => {} },
  argTypes: { onZoom: { control: false }, onActiveChange: { control: false }, labels: { control: false } },
} satisfies Meta<typeof ZoomControls>
export default meta
type Story = StoryObj<typeof meta>

/** 受控缩放，带「适应宽度」项。 */
export const Default: Story = {
  render: (args) => {
    const [zoom, setZoom] = useState(1)
    const [fit, setFit] = useState(false)
    return (
      <div style={{ display: 'grid', gap: 12, font: 'var(--dsw-font-s-14)' }}>
        <div>当前：{fit ? '适应宽度' : `${Math.round(zoom * 100)}%`}</div>
        <ZoomControls
          {...args}
          zoom={zoom}
          fit={{ label: '适应宽度', selected: fit, onSelect: () => setFit(true) }}
          onZoom={(value) => {
            setFit(false)
            setZoom(value)
          }}
        />
      </div>
    )
  },
}
