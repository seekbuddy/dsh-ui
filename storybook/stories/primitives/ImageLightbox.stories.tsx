import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, ImageLightbox } from '@seekbuddy/dsh-ui'

/** 内联 SVG 当样图，不依赖网络。 */
const SAMPLE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4176e6"/><stop offset="1" stop-color="#22c55e"/></linearGradient></defs><rect width="960" height="600" fill="url(#g)"/><text x="480" y="320" font-size="48" text-anchor="middle" fill="#fff" font-family="sans-serif">原图 960×600</text></svg>',
  )

const labels = { dialog: '图片预览', close: '关闭预览' }

const meta = {
  title: '镜像层（上游同步）/ImageLightbox',
  component: ImageLightbox,
  parameters: {
    docs: {
      description: {
        component: `点缩略图后的**全屏原图预览**：半透明蒙层 + 居中原图 + 关闭按钮，Escape、点蒙层、点关闭都会调 \`onClose\`；打开时焦点进关闭按钮并锁在里面，卸载时焦点还给打开它的元素。经 body portal 渲染，祖先有 \`transform\` / \`filter\` 也不会把 fixed 蒙层困在祖先框里。挂不挂由调用方决定（渲染即打开）。上游同步件（\`dsh-v0.1.7-rc.1\` 新增，Markdown 本地图片预览在用），源码不改。

**什么时候用**：缩略图 / 行内图片需要看原图。
**什么时候不用**：需要确认 / 表单的对话框用 \`Modal\`；多图浏览、缩放平移不在它的范围里。
**可访问性**：\`role="dialog"\` + \`aria-modal\` + \`aria-label\`（\`labels.dialog\`），关闭按钮 \`aria-label\`（\`labels.close\`）；\`alt\` **必填**。
**相关 token**：\`--dsw-alias-bg-mask-1\` + \`--dsw-mask-blur\`（蒙层）、\`--dsw-specific-input-major\` / \`--dsw-alias-border-l2-darkmode-thin\` / \`--dsw-elevation-prominent\`（关闭按钮）、\`--dsw-alias-label-primary\`、\`--dsw-alias-brand-primary\`（焦点环）。`,
      },
    },
  },
  args: { src: SAMPLE, alt: '渐变样图', labels, onClose: () => {} },
  argTypes: { onClose: { control: false }, src: { control: false } },
} satisfies Meta<typeof ImageLightbox>
export default meta
type Story = StoryObj<typeof meta>

/** 点缩略图打开，Escape / 点蒙层 / 关闭按钮收起，焦点回到缩略图。 */
export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          <img src={args.src} alt="" width={48} height={30} style={{ borderRadius: 4 }} />
          查看原图
        </Button>
        {open && <ImageLightbox {...args} onClose={() => setOpen(false)} />}
      </>
    )
  },
}
