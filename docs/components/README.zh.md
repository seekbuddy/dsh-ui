# 扩展组件

[English](README.md) | 中文

DSH 没有提供、基于同一套 `--dsw-*` token 构建的组件。它们从 `@seekbuddy/dsh-ui/seekbuddy` 导入，这个入口是 Client Component（文件以 `'use client'` 开头）。DSH 组件（`Button`、`Menu`、`Modal`、Markdown、工具输出卡片等）的文档见[上游包的 README](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/client/ui-primitives)。

| 组件 | 用途 | Server Component 入口 |
| --- | --- | --- |
| [Card](card.zh.md) | 有边界的表面：底色、发丝描边、圆角、投影、内边距 | `/seekbuddy/card` |
| [Empty](empty.zh.md) | 页面或列表区域的加载中、空、出错占位 | `/seekbuddy/empty` |
| [Spinner](spinner.zh.md) | 加载圆环，行内或页面级 | `/seekbuddy/spinner` |
| [StatusBadge](status-badge.zh.md) | 带状态点的只读状态标 | — |
| [Mark](mark.zh.md) | 标题旁的行内状态标记，比如「官方」 | — |
| [Tabs](tabs.zh.md) | 下划线式标签页（WAI-ARIA tabs） | `/seekbuddy/tabs`（Client Component） |
| [Switch](switch.zh.md) | antd 风格属性的开关 | — |
| [DangerButton、SubtleButton](buttons.zh.md) | 破坏性操作按钮与低强调按钮 | — |
| [Pagination](pagination.zh.md) | 长列表的分页条 | — |
| [MessageProvider、useMessage](message.zh.md) | 堆叠的短时消息，antd `message` 风格 | — |
| [Upload](upload.zh.md) | 带状态列表的文件选择，传输由你实现 | — |
| [Timeline](timeline.zh.md) | 按日期分组的纵向运行记录 | `/seekbuddy/timeline` |
| [QrCode](qr-code.zh.md) | 把字符串画成二维码 | — |
| [日期与时间选择器](date-time.zh.md) | `Calendar`、`DatePicker`、`DateRangePicker`、`TimePicker` 及其输入框形态的触发器 | — |

## 所有组件共同的约定

- **文案由你提供。** 组件内不含任何界面文案。可见文字与读屏文字都通过 props 传入，通常是一个带类型的 `labels` 对象，你用自己的 i18n 库做本地化即可。
- **跟随主题。** 颜色、字体、圆角、阴影都取自 `@seekbuddy/dsh-ui/tokens.css` 里的 `--dsw-*` token，在应用入口导入一次即可；亮色与暗色都无需额外 CSS。
- **`className` 只用于布局。** 用它控制组件的尺寸和位置，不要选择组件内部生成的类名，这些类名每次构建都会变。
- **服务端渲染。** 每个组件在服务端渲染时都不访问 `document`。带状态或 effect 的组件仍需在 Client Component 中使用；上表中不含 Hook 的组件另有一个不带 `'use client'` 的入口，供 Next.js Server Component 使用。
- **按需引入。** 从 `/seekbuddy` 只导入一个组件不会带上其他组件：每个组件连同它的 CSS 各自构建成独立的分片（chunk）。

这些页面里的 API 表由 TypeScript 源码生成（`cd storybook && bun run docs:api`），正文与示例为手写。
