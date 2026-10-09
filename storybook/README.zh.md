# 组件文档站（Storybook）

[English](README.md) | 中文

给 `@seekbuddy/dsh-ui`（DSH 层与扩展组件）做的 Storybook 文档站，展示每个组件长什么样、怎么用、有哪些属性。它有自己的 `package.json`、`node_modules` 与 `bun.lock`，不是本包的 devDependency，也不会进入发布包（`files` 只含 `dist/`），只是开发期工具。

```sh
npm run build            # at the repository root first: produces dist/tokens.css
cd storybook
bun install              # first time
bun run dev              # http://localhost:9109
bun run build            # storybook-static/ for static hosting
bun run check            # tsc + scripts/check-coverage.mjs + scripts/api-docs.mjs --check
bun run docs:api         # regenerate the API tables in docs/components/
```

- story 直接读取 `../src` 的 TypeScript 源码（alias 见 `.storybook/main.ts`），props 表由 react-docgen-typescript 根据类型与 JSDoc 生成。组件源码在本目录之外，所以 docgen 的 `include` 显式列出了 `../src/**/*.tsx`。
- `tokens.css` 取自 `../dist/tokens.css`，与使用者拿到的是同一份文件。
- 工具栏的「主题」切换 `body[data-ds-dark-theme]`，与本包 `theme` 运行时用的是同一个开关。
- DSH 层组件的说明只写在 story 的 `parameters.docs.description.component` 里，因为其源码跟随上游；扩展组件的说明以 JSDoc 写在 props 接口上，由 docgen 生成属性表。

## 目录

| 目录 | 内容 | story 的 `title` 前缀 |
| --- | --- | --- |
| `stories/primitives/` | 根入口组件；Hooks 在 `hooks/` 下，工具函数在 `utils.mdx` | `镜像层（上游同步）/` |
| `stories/blocks/` | `/blocks` 入口 | `镜像层（上游同步）/Blocks/` |
| `stories/markdown/` | `/markdown` 入口 | `镜像层（上游同步）/Markdown/` |
| `stories/icons/` | `/icons` 入口，一页看全 | `镜像层（上游同步）/Icons` |
| `stories/theme/` | `/theme` 与 token 色板 | `镜像层（上游同步）/主题` |
| `stories/seekbuddy/` | 扩展组件 | `SeekBuddy 扩展层/` |

## 写 story 的规则

- 只从公开入口 import（`@seekbuddy/dsh-ui`、`/blocks`、`/markdown`、`/icons`、`/theme`、`/seekbuddy`），不写 `../src/...` 深路径。
- 每个组件：`Default`，每个 variant、尺寸、状态各一个，disabled、loading、error、空态（组件有的话），再加一个并排对照的组合样张。明暗不单开 story，用工具栏切换。
- 受控组件在 `render` 里用 `useState` 接住 `args`；Portal 组件（Modal、Toast、Menu、Tooltip、HoverCard、ImageLightbox）提供一个触发按钮和本地的 open 状态。
- 必填回调放进 `args`，写成 `storybook/test` 的 `fn()`。
- story 文件的每个具名导出都会被当成 story：labels 常量和辅助函数写成不导出的 `const`，或放进同目录的 `fixtures.ts` / `labels.ts`。
- story 文案用中文；内联样式只做布局（gap、grid、width），颜色一律取 `--dsw-alias-*` token。
- 组件说明按固定顺序：定位、何时用、何时不用、可访问性、相关 token。
