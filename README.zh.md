# @seekbuddy/dsh-ui

[English](README.md) | 中文

基于 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）Web UI 设计系统的 React 组件库，用来搭建围绕 DSH 的产品页面：包含 DSH 的基础组件（`--dsw-*` 设计 token、明暗主题、基础控件、图标、Markdown 与工具输出渲染器），以及 DSH 没有提供、基于同一套 token 构建的组件，如卡片、标签页、分页、全局提示、上传、日期时间选择。打包成普通 React 18 / 19 与 Next.js 应用可以直接使用的形式。

**在线预览：**所有组件都可以在 [Storybook](https://seekbuddy.github.io/dsh-ui/) 里查看。

> **非官方项目。** 本项目与 DeepSeek 无关联，未获其认可或赞助，不包含 DeepSeek 的品牌素材（标志与字标）。详见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

## 为什么有这个包

DSH 的 UI 基础组件（`@deepseek-ai/dsh-client-ui-primitives`）覆盖的是 DSH Web 壳自己的需要：对话、工具输出、菜单、对话框。围绕 DSH 做产品，还会有控制台、设置页、管理后台，这些页面需要 DSH 没有的组件：卡片、标签页、分页、日期时间输入、上传、全局提示。每个应用各写一套，外观会和 DSH 越走越远；直接加进基础组件的副本里，每次同步上游都要处理合并冲突。

本包提供这些组件，同时让它们和 DSH 保持分离：

- **扩展组件**（`@seekbuddy/dsh-ui/seekbuddy`）补上缺口。样式只用 DSH 的 token，遵守 DSH 的样式规则，和 DSH 控件放在一起看不出差别；需要 DSH 控件时通过公开入口复用，不重新实现。详见 [docs/components](docs/components/README.zh.md)。
- **DSH 层**是上游基础组件的副本，只做打包相关的修复，每一项都登记在 [UPSTREAM.md](UPSTREAM.md)，因此可以跟随上游 tag 同步。

为了让 DSH 层能在普通应用里使用，本包还解决了官方包在打包上的三个问题：

| 官方包 | `@seekbuddy/dsh-ui` |
| --- | --- |
| 单一根入口全量导出，Shiki 与 KaTeX 进首屏 | 拆分入口；构建期断言根入口不触达 Markdown、Shiki、KaTeX 与代码文件图标素材 |
| 主题 token 与主题切换在 Cordis 插件里 | 提供 `tokens.css` 与独立的 `light / dark / system` 主题运行时，附防闪烁的首屏脚本 |
| KaTeX 输出依赖浏览器 `DOMParser` 转换 | 服务端渲染安全的 KaTeX；用 React 18 SSR 与 Next.js 16 构建测试覆盖 |

## 安装

```sh
npm install @seekbuddy/dsh-ui
```

peer 依赖：`react`、`react-dom` `^18.2.0 || ^19.0.0`。

## 快速开始

在应用入口导入一次全局 token 样式；只有渲染数学公式时才导入 `katex.css`。

```tsx
import '@seekbuddy/dsh-ui/tokens.css'
import '@seekbuddy/dsh-ui/katex.css'

import { Button, Pill } from '@seekbuddy/dsh-ui'
import { MarkdownText } from '@seekbuddy/dsh-ui/markdown'
import { IconCheckOutlineRegular } from '@seekbuddy/dsh-ui/icons'
import { setThemePreference } from '@seekbuddy/dsh-ui/theme'

const labels = {
  code: { copyLabel: 'Copy', copiedLabel: 'Copied' },
  footnotes: 'Footnotes',
}

export function Example() {
  return (
    <div>
      <Button variant="primary" onClick={() => setThemePreference('dark')}>
        <IconCheckOutlineRegular /> Dark theme
      </Button>
      <Pill active>Enabled</Pill>
      <MarkdownText text={'Formula: $x^2$'} labels={labels} />
    </div>
  )
}
```

组件样式是编译进 JS 的 CSS Modules，组件模块首次加载时注入 `<head>`，只注入一次。全局样式只有 `tokens.css` 与 `katex.css`。

组件内不含任何界面文案：所有可见文字与读屏文字都通过 props（通常是带类型的 `labels` 对象）传入，由应用自己做本地化。

## 公开入口

只从下列入口导入；`dist/` 下的其他文件都是内部实现。

| 入口 | 内容 |
| --- | --- |
| `@seekbuddy/dsh-ui` | 轻量控件与工具：`Button`、`Input`、`Pill`、`Tag`、`Switch`、`Checkbox`、`Menu`、`MenuSurface`、`Modal`、`Tooltip`、`Toast`、`HoverCard`、`SegmentedControl`、`SegmentedTabs`、定位与模态 Hooks，以及 `relativeTime`、`fileSizeText`、`rankByName` 等工具函数 |
| `@seekbuddy/dsh-ui/blocks` | 工具输出渲染器 `TerminalBlock`、`ReadBlock`、`DiffBlock`、`SearchBlock`、`WebBlock`、`JsonTree`；文件 / 链接图标 `FileTypeIcon`、`LinkIconRegular` / `LinkIconMedium`；代码高亮 `languageForPath`、`useCodeHighlighter`（会加载 Shiki） |
| `@seekbuddy/dsh-ui/markdown` | `MarkdownText`、`CodeBlock`、`JsonBlock`、`MarkdownDelegateProvider`、`extractMarkdownPlainText` |
| `@seekbuddy/dsh-ui/icons` | 188 个 `Icon*`（94 个图形 × `Regular` / `Medium` 两档描边）、`PermissionIcon*`、`ReferenceIcon*`、`PluginArtwork*`、`GuideArtwork*` |
| `@seekbuddy/dsh-ui/theme` | 主题状态、DOM 应用函数与 React Hooks |
| `@seekbuddy/dsh-ui/theme/bootstrap` | `THEME_BOOTSTRAP_SCRIPT`，不依赖 React 的首屏内联脚本 |
| `@seekbuddy/dsh-ui/seekbuddy` | 扩展组件（[文档](docs/components/README.zh.md)）；整个入口是 Client Component |
| `@seekbuddy/dsh-ui/seekbuddy/{card,empty,spinner,timeline}` | 不含 Hook 的扩展组件，Next.js Server Component 可以引用 |
| `@seekbuddy/dsh-ui/seekbuddy/tabs` | `Tabs`；与从 `/seekbuddy` 引用等价 |
| `@seekbuddy/dsh-ui/tokens.css` | 八份 DSH 主题样式，按级联顺序拼接 |
| `@seekbuddy/dsh-ui/katex.css` | 只保留 woff2 字体的 KaTeX 样式 |

## 两层结构

| 层 | 源码位置 | 内容 |
| --- | --- | --- |
| DSH 层 | `src/` 中除 `src/seekbuddy/` 以外的部分 | DSH Web UI 基础组件与主题样式的副本，随上游 tag 同步。本地改动逐条列在 [UPSTREAM.md](UPSTREAM.md)，其余与上游代码一致 |
| 扩展组件 | `src/seekbuddy/` | DSH 没有提供、为本包编写的组件，样式只用 `--dsw-*` token |

扩展组件：`Card`、`Empty`、`Mark`、`MessageProvider` + `useMessage`、`Pagination`（附纯函数 `pageItems`）、`QrCode`、`Spinner`、`StatusBadge`、`Switch`、`Tabs`、`Timeline`、`Upload`、`DangerButton`、`SubtleButton`，以及日期时间族 `Calendar`、`DatePicker`、`DateRangePicker`、`TimePicker`、`DateField`、`DateRangeField`、`TimeField`。**每个组件的用法、示例和完整 API 见 [docs/components](docs/components/README.zh.md)。**

扩展组件引用 DSH 组件时只走公开入口 `@seekbuddy/dsh-ui`，不用相对路径。因此打包器可以把这个入口别名到另一份 DSH 基础组件（例如 DSH Web 壳已经加载的那份），页面里每个控件只保留一份实现。从 `/seekbuddy` 只引一个组件不会带上其他组件：每个组件连同它的 CSS 各自构建成独立的 chunk。

## 主题

主题偏好是 `light | dark | system`，存在 `localStorage` 的 `dsh-ui-primitives.theme-preference` 键下（为兼容保留了本包旧名）。

```tsx
import { initializeTheme, setThemePreference, useIsDark, useThemePreference } from '@seekbuddy/dsh-ui/theme'

initializeTheme()
```

`initializeTheme()` 恢复合法的已存值，非法或缺失时回退到 `system`；`localStorage` 不可用时仍会应用主题。主题通过 `document.documentElement.style.colorScheme` 和 `body` 上的 `data-ds-dark-theme` 属性生效。

服务端渲染的应用要在页面内容之前执行首屏脚本，避免已保存深色主题的页面先亮后暗。Next.js 写法：

```tsx
import { THEME_BOOTSTRAP_SCRIPT } from '@seekbuddy/dsh-ui/theme/bootstrap'
import '@seekbuddy/dsh-ui/tokens.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
        {children}
      </body>
    </html>
  )
}
```

`THEME_BOOTSTRAP_SCRIPT` 是本包的常量，不得替换成来自用户输入或配置的字符串。

## 设计 Token

自己的组件用语义 token 写样式，不写颜色字面量：

| 前缀 | 用途 |
| --- | --- |
| `--dsw-alias-*` | 语义颜色：背景、文字、边框、交互与状态色；任何颜色首选 |
| `--dsw-font-*` | 完整的字体角色，写成 `font: var(--dsw-font-…)` |
| `--dsw-radius-*` | 圆角：`xs` 4、`sm` 8、`md` 12、`lg` 16、`xl` 20、`panel` 28 |
| `--dsw-elevation-*` | 浮起表面（菜单、面板、对话框）；阴影里已包含发丝描边 |
| `--dsw-static-*` | alias 背后的原始色板；组件里不要直接用 |

要加品牌主题，保留 `light / dark / system`，在 `body` 上另设一个属性，并在 `tokens.css` 之后加载覆盖样式，成对重映射亮色与暗色的 `--dsw-alias-*`。属性要放在 `body` 上而不是页面容器上：`Modal`、`Toast`、`ImageLightbox` 通过 Portal 渲染到 `body`。

## 从 `dsh-ui-primitives` 迁移

本包此前以 `dsh-ui-primitives` 为名开发。

1. 把导入前缀 `dsh-ui-primitives` 换成 `@seekbuddy/dsh-ui`，各入口路径不变。
2. 删除了 `BrandWordmark`、`FishLogo`、`FISH_LOGO_PATH`、`FISH_LOGO_VIEWBOX`：它们绘制的是 DeepSeek 的品牌标志，本包不再分发。

## 开发

需要 Node.js 20.11+。

```sh
npm install
npm run verify   # typecheck → unit tests → build → package contents → React 18 SSR → Next.js 16 build
```

`test:package` 打出真实的 npm tarball，校验全部导出、token 级联顺序与 KaTeX 字体 URL；`test:react18` 与 `test:next16` 把这个 tarball 装进测试应用。根入口触达 Markdown、Shiki 或 KaTeX，或扩展组件没走公开入口而打进了一份 DSH 组件时，构建直接失败。

`storybook/` 是组件文档站，也是组件演示（Storybook 10），依赖独立安装，不进发布包：

```sh
npm run build               # the site reads dist/tokens.css
cd storybook
bun install
bun run dev                 # http://localhost:9109
bun run check               # typecheck + every public runtime export has a story
```

## 许可证

[MIT](LICENSE)。DSH 层是 DeepSeek 以 MIT 授权的代码；上游归属与依赖许可证见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
