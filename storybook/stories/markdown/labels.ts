// Markdown 入口各组件的 labels 样板（全中文）。本包 cordis-free，所有文案经 props 传入；
// 消费者可以整份照抄。MarkdownText 要求 labels 引用稳定（模块级常量正合适）。

import type { MarkdownCodeLabels, MarkdownLabels } from '@seekbuddy/dsh-ui/markdown'

/** 代码块复制按钮两态文案（CodeBlock 直接用，MarkdownText 通过 labels.code 转发给围栏代码块）。 */
export const markdownCodeLabels = {
  copyLabel: '复制',
  copiedLabel: '已复制',
} satisfies MarkdownCodeLabels

/** MarkdownText 的完整 labels：围栏代码块复制文案 + 脚注区（读屏专用）标题。 */
export const markdownLabels = {
  code: markdownCodeLabels,
  footnotes: '脚注',
} satisfies MarkdownLabels

/** JsonBlock 超过字符上限时追加在正文末尾的提示，参数是未截断的总长度。 */
export const jsonTruncatedLabel = (total: number): string => `…已截断，完整内容共 ${total.toLocaleString('zh-CN')} 字符`
