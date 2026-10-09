# 参与贡献

[English](CONTRIBUTING.md) | 中文

感谢你的帮助。请先看清你的改动落在哪一层：两层接受的改动类型不同。

## 改动落在哪一层

| 路径 | 接受的改动 |
| --- | --- |
| `src/` 中除 `src/seekbuddy/` 以外的部分（DSH 层） | 只接受打包相关的修复：入口拆分、SSR 安全、构建所需的类型修正。组件行为与样式以上游为准，相关问题请反馈到 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)。这一层的每项本地改动都登记在 [UPSTREAM.md](UPSTREAM.md) 中，每次同步时重新应用，所以请在同一个 PR 里在那里添加一条记录。 |
| `src/seekbuddy/`（扩展组件） | 修复和新组件，须遵守下面的规则。 |
| `build/`、`scripts/`、`tests/`、`fixtures/`、`storybook/` | 修复和改进。示例和演示都写进 `storybook/`。 |

## 环境准备

Node.js 20.11+。Storybook 使用 [Bun](https://bun.sh) 1.4。

```sh
npm install
npm run verify      # what CI runs
```

Storybook：

```sh
npm run build       # Storybook reads dist/tokens.css
cd storybook
bun install
bun run dev         # http://localhost:9109
bun run check       # typecheck, story coverage, API tables up to date
```

开发过程中只运行覆盖你改动的最小检查（`npm run typecheck`、`npm run test:unit`、`npm run build`、`npm run test:docs`）；提交 PR 前运行 `npm run verify` 和 Storybook 的 `check`。改了某个 prop 或它的 JSDoc 之后，用 `cd storybook && bun run docs:api` 重新生成 API 表。

## 扩展组件的规则

1. **通过公开入口导入 DSH 组件。** 写 `import { Button } from '@seekbuddy/dsh-ui'`，不要用相对路径引用 DSH 层。使用方可能会把这个入口别名到另一份 DSH 基础组件；扩展组件一旦打包进 DSH 源码，构建就会失败。DSH 层从不导入 `src/seekbuddy/`。
2. **不含界面文案。** 所有可见文字和读屏文字都是 prop，通常是一个带类型的 `labels` 对象。日期和数字格式化通过 `Intl` 加 `locale` prop 完成。
3. **只用 token。** 颜色取自 `--dsw-alias-*`，字体取自 `--dsw-font-*`，圆角取自 `--dsw-radius-*`（或 `999px` / `50%` 配 `corner-shape: round`）。不写颜色字面量，不用 `--dsw-static-*`，不写 `var(--token, #fallback)`。中性色边框和分割线是 `0.5px`；浮起的表面用 `border: 0` 加 `--dsw-elevation-*` 阴影。焦点环只声明 `outline-style: solid`（可加 `outline-offset`），宽度和颜色由主题提供。不写组件专用的滚动条样式，也不写 `[data-ds-dark-theme]` 这类主题选择器。
4. **SSR 安全。** 只在 effect 或事件处理函数里访问 `document`、`window`、`localStorage` 或 `matchMedia`，保证导入和服务端渲染组件时都不会抛错。
5. **入口。** 新组件从 `src/seekbuddy/index.ts`（Client Component 入口）导出；组件文件本身不加 `'use client'`。只有不含 Hook、不访问 DOM 的组件才为 Server Component 单独开子入口，这需要改 `package.json#exports`、`build/build.mjs` 的入口列表、`tsconfig.json` 的 paths、`storybook/.storybook/main.ts` 的 Storybook 别名，以及 `scripts/test-package.mjs` 里的断言。包体积不需要靠子入口解决：构建已经为每个组件生成独立的分片（chunk）。
6. **props 有类型、有文档。** 包装原生元素的组件继承对应的 `*HTMLAttributes`；可选 prop 写成 `prop?: T | undefined`；每个 prop 字段都有 JSDoc，它会成为 Storybook 的属性表。包装 DOM 元素的交互组件要转发 ref。
7. **story 和文档页随同一个 PR 提交。** story 放在 `storybook/stories/seekbuddy/` 下：`Default`，每个 variant、尺寸、状态各一个，disabled、loading、error、空态（有的话），再加一个并排对照的样张。文档页放在 `docs/components/` 下（并加进那里的索引）：用途、何时不该用、一个完整示例、行为与可访问性说明，然后是 `<!-- api:props Name -->` / `<!-- api:type Name -->` / `<!-- api:fn name -->` 区块，由 `cd storybook && bun run docs:api` 根据源码填充。公开导出缺少 story 或 API 区块、API 区块过期，或者某个 prop、字段缺少 JSDoc 时，Storybook 的 `check` 都会失败；`npm run test:docs` 会对每个 `tsx` 示例做类型检查，并检查双语配对（见下一条）。
8. **文档提供英文和中文两个版本。** 每个 README、本文件以及 `docs/` 下的每个页面，都在同一目录下有一个中文版 `foo.zh.md`，与上游 DSH 的做法一致。两个文件在一级标题之后互相链接（`English | [中文](foo.zh.md)` / `[English](foo.md) | 中文`）；两边的标题层级和顺序相同、表格相同，代码块和生成的 API 区域逐字节一致，中文页链接其他双语页面时使用 `.zh.md` 版本。请在同一个 PR 里同时更新两个文件；缺少对侧文件或两边结构不一致时，`npm run test:docs` 会失败。

新的扩展组件应当被不止一个产品界面需要，并且不含应用逻辑（路由、数据获取、权限）。如果它只服务于一个页面，就留在那个应用里。

## 提交与 PR

- 一个 PR 只做一件事；说明改了什么、怎么验证的。
- 用户可感知的改动要在 [CHANGELOG.md](CHANGELOG.md) 的 `## [Unreleased]` 下加一行（没有这一节就新建），放进对应的分组：**Breaking**、**Added**、**Changed**、**Fixed**。
- 代码注释写当前的行为与约束；历史和决策理由写在 PR 里。

## 维护者

### 同步 DSH 层

1. 选定 DSH 的 tag。用 `packages/client/ui-primitives/src` 覆盖 `src/`，用 `packages/client/ui-theme/src/styles` 覆盖 `src/styles/`，不动 `src/seekbuddy/`。用三方合并（旧 tag → 新 tag，应用到本仓库上）可以保留本地改动。
2. 删除 UPSTREAM.md 中列为不镜像的文件，包括 `BrandWordmark.tsx` 和 `FishLogo.tsx`。
3. 逐条核对 UPSTREAM.md 中的本地改动：重新应用，或者在上游已修复时删掉这条记录。
4. 更新 UPSTREAM.md 和 THIRD_PARTY_NOTICES.md 里的 tag 与 commit，把 `@deepseek-ai/dsh-util-code-language` 钉到同一个 tag，并添加一条 CHANGELOG 记录（图标改名和删除导出属于 **Breaking**）。
5. `npm run verify` 和 Storybook 的 `check` 必须通过；上游新增的导出需要补 story。

### 发版

1. 设置 `package.json` 里的 `version`。预发布版本用 `x.y.z-beta.n`，发布到 `next` dist-tag。
2. 把 CHANGELOG.md 里的 `## [Unreleased]` 改成 `## [x.y.z] - YYYY-MM-DD`，并在文末添加它的链接。
3. 合并到 `main`，然后推送 tag `vx.y.z`。Release 工作流会检查 tag 与 `package.json` 是否一致、CHANGELOG 是否有对应小节，运行 `npm run verify`，并带 npm provenance 发布。

工作流需要在 `npm` environment 里配置仓库 secret `NPM_TOKEN`（一个对 `@seekbuddy/dsh-ui` 有发布权限的 npm automation token 或 granular token）。
