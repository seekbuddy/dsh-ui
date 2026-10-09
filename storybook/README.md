# Component documentation site (Storybook)

English | [中文](README.zh.md)

A Storybook site that shows what each component of `@seekbuddy/dsh-ui` (DSH layer and extra components) looks like, how to use it and which props it takes. It has its own `package.json`, `node_modules` and `bun.lock`, is not a devDependency of the package and never enters the published package (`files` lists only `dist/`): it is a development tool only.

```sh
npm run build            # at the repository root first: produces dist/tokens.css
cd storybook
bun install              # first time
bun run dev              # http://localhost:9109
bun run build            # storybook-static/ for static hosting
bun run check            # tsc + scripts/check-coverage.mjs + scripts/api-docs.mjs --check
bun run docs:api         # regenerate the API tables in docs/components/
```

- Stories read the TypeScript source in `../src` directly (aliases in `.storybook/main.ts`); react-docgen-typescript builds the props tables from types and JSDoc. The component source lives outside this directory, so docgen's `include` lists `../src/**/*.tsx` explicitly.
- `tokens.css` comes from `../dist/tokens.css`, the same file consumers get.
- The "theme" toolbar item toggles `body[data-ds-dark-theme]`, the same switch the package's `theme` runtime uses.
- DSH-layer components are described only in a story's `parameters.docs.description.component`, because their source follows upstream; extra components carry their descriptions as JSDoc on the props interface, which docgen turns into the table.

## Layout

| Directory | Contents | Story `title` prefix |
| --- | --- | --- |
| `stories/primitives/` | Root-entry components; Hooks under `hooks/`, utility functions in `utils.mdx` | `镜像层（上游同步）/` |
| `stories/blocks/` | The `/blocks` entry | `镜像层（上游同步）/Blocks/` |
| `stories/markdown/` | The `/markdown` entry | `镜像层（上游同步）/Markdown/` |
| `stories/icons/` | The `/icons` entry on one page | `镜像层（上游同步）/Icons` |
| `stories/theme/` | `/theme` and the token palette | `镜像层（上游同步）/主题` |
| `stories/seekbuddy/` | Extra components | `SeekBuddy 扩展层/` |

## Writing stories

- Import only from public entries (`@seekbuddy/dsh-ui`, `/blocks`, `/markdown`, `/icons`, `/theme`, `/seekbuddy`), never from `../src/...`.
- Per component: `Default`, one story per variant / size / state, disabled, loading, error and empty where they exist, plus a side-by-side comparison. Light and dark are not separate stories; use the toolbar.
- Controlled components take `args` into `useState` inside `render`; portal components (Modal, Toast, Menu, Tooltip, HoverCard, ImageLightbox) get a trigger button and local open state.
- Required callbacks go into `args` as `fn()` from `storybook/test`.
- Every named export of a story file becomes a story: keep labels constants and helpers as non-exported `const`s, or move them to `fixtures.ts` / `labels.ts` in the same directory.
- Story copy is in Chinese; inline styles are for layout only (gap, grid, width), and colours always come from `--dsw-alias-*` tokens.
- Component descriptions follow a fixed order: purpose / when to use / when not to use / accessibility / related tokens.
