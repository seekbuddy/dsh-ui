# @seekbuddy/dsh-ui

English | [中文](README.zh.md)

React components in the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH) web UI design system, for building product pages around DSH: the DSH primitives (`--dsw-*` design tokens, light / dark themes, controls, icons, Markdown and tool-output renderers) plus the components DSH does not provide, such as cards, tabs, pagination, messages, upload and date / time pickers, built on the same tokens. Packaged for ordinary React 18 / 19 and Next.js apps.

**Live preview:** every component in [Storybook](https://seekbuddy.github.io/dsh-ui/).

> **Unofficial.** This project is not affiliated with, endorsed by, or sponsored by DeepSeek. It ships no DeepSeek brand assets (logo or wordmark). See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Why this package

The DSH UI primitives (`@deepseek-ai/dsh-client-ui-primitives`) cover what the DSH web shell needs: chat, tool output, menus, dialogs. A product built around DSH also has consoles, settings and admin pages, and those need components DSH does not have: cards, tabs, pagination, date and time input, upload, global messages. Writing them separately in each app drifts away from the DSH look; patching them into a copy of the primitives turns every upstream sync into a merge.

This package provides those components and keeps them apart from DSH:

- **Extension components** (`@seekbuddy/dsh-ui/seekbuddy`) fill the gaps. They are styled only with the DSH tokens and follow DSH's styling rules, so they sit next to DSH controls without looking different, and they reuse DSH controls through the public entry instead of re-implementing them. See [docs/components](docs/components/README.md).
- **The DSH layer** is a copy of the upstream primitives with packaging fixes only, each recorded in [UPSTREAM.md](UPSTREAM.md), so it follows upstream tags.

To make the DSH layer usable in an ordinary app, it also fixes three packaging problems of the official package:

| Official package | `@seekbuddy/dsh-ui` |
| --- | --- |
| One root entry re-exports everything, so Shiki and KaTeX land in the first page load | Split entries; the root entry is guarded at build time against reaching Markdown, Shiki, KaTeX or the code-file artwork |
| Theme tokens and theme switching live in a Cordis plugin | `tokens.css` and a standalone `light / dark / system` theme runtime with a no-flash bootstrap script |
| KaTeX output is converted with the browser-only `DOMParser` | SSR-safe KaTeX rendering; tested with React 18 SSR and a Next.js 16 build |

## Install

```sh
npm install @seekbuddy/dsh-ui
```

Peer dependencies: `react` and `react-dom` `^18.2.0 || ^19.0.0`.

## Quick start

Import the global token sheet once, in your app entry. Import `katex.css` only if you render math.

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

Component styles are CSS Modules compiled into the JavaScript and injected into `<head>` once, the first time a component module loads. `tokens.css` and `katex.css` are the only global stylesheets.

Components contain no user-facing text: every visible or screen-reader label is a prop (usually a typed `labels` object), so you localize them in your app.

## Entry points

Import only from these entries; anything else under `dist/` is internal.

| Entry | Contents |
| --- | --- |
| `@seekbuddy/dsh-ui` | Lightweight controls and utilities: `Button`, `Input`, `Pill`, `Tag`, `Switch`, `Checkbox`, `Menu`, `MenuSurface`, `Modal`, `Tooltip`, `Toast`, `HoverCard`, `SegmentedControl`, `SegmentedTabs`, positioning / modal hooks, and helpers such as `relativeTime`, `fileSizeText`, `rankByName` |
| `@seekbuddy/dsh-ui/blocks` | Tool-output renderers `TerminalBlock`, `ReadBlock`, `DiffBlock`, `SearchBlock`, `WebBlock`, `JsonTree`; file / link icons `FileTypeIcon`, `LinkIconRegular` / `LinkIconMedium`; code highlighting `languageForPath`, `useCodeHighlighter` (loads Shiki) |
| `@seekbuddy/dsh-ui/markdown` | `MarkdownText`, `CodeBlock`, `JsonBlock`, `MarkdownDelegateProvider`, `extractMarkdownPlainText` |
| `@seekbuddy/dsh-ui/icons` | 188 `Icon*` components (94 glyphs × `Regular` / `Medium` stroke), `PermissionIcon*`, `ReferenceIcon*`, `PluginArtwork*`, `GuideArtwork*` |
| `@seekbuddy/dsh-ui/theme` | Theme state, DOM application and React hooks |
| `@seekbuddy/dsh-ui/theme/bootstrap` | `THEME_BOOTSTRAP_SCRIPT`, an inline script with no React dependency |
| `@seekbuddy/dsh-ui/seekbuddy` | Extra components ([docs](docs/components/README.md)); the whole entry is a Client Component |
| `@seekbuddy/dsh-ui/seekbuddy/{card,empty,spinner,timeline}` | Hook-free extra components that a Next.js Server Component may import |
| `@seekbuddy/dsh-ui/seekbuddy/tabs` | `Tabs`; same as importing it from `/seekbuddy` |
| `@seekbuddy/dsh-ui/tokens.css` | The eight DSH theme sheets, concatenated in their cascade order |
| `@seekbuddy/dsh-ui/katex.css` | KaTeX CSS reduced to woff2 fonts |

## Two layers

| Layer | Source | Contents |
| --- | --- | --- |
| DSH layer | `src/` except `src/seekbuddy/` | A copy of the DSH web UI primitives and theme sheets, kept in sync with upstream tags. Local changes are listed in [UPSTREAM.md](UPSTREAM.md); everything else is unchanged upstream code. |
| Extra components | `src/seekbuddy/` | Components DSH does not provide, written for this package and styled only with `--dsw-*` tokens |

Extra components: `Card`, `Empty`, `Mark`, `MessageProvider` + `useMessage`, `Pagination` (+ `pageItems`), `QrCode`, `Spinner`, `StatusBadge`, `Switch`, `Tabs`, `Timeline`, `Upload`, `DangerButton`, `SubtleButton`, and the date / time family `Calendar`, `DatePicker`, `DateRangePicker`, `TimePicker`, `DateField`, `DateRangeField`, `TimeField`. **Each one is documented — usage, examples and the full API — in [docs/components](docs/components/README.md).**

The extra components import DSH components through the public `@seekbuddy/dsh-ui` entry, never by relative path. A bundler can therefore alias that entry to another copy of the DSH primitives (for example the one a DSH web shell already loads), and the page keeps a single implementation of each control. Importing one component from `/seekbuddy` does not pull in the others: every component is built into its own chunk, together with its CSS.

## Theme

The theme preference is `light | dark | system`. It is stored in `localStorage` under `dsh-ui-primitives.theme-preference` (the key keeps the package's former name for compatibility).

```tsx
import { initializeTheme, setThemePreference, useIsDark, useThemePreference } from '@seekbuddy/dsh-ui/theme'

initializeTheme()
```

`initializeTheme()` restores a valid stored value and falls back to `system`; it still applies the theme when `localStorage` is unavailable. The theme is applied through `document.documentElement.style.colorScheme` and the `data-ds-dark-theme` attribute on `body`.

For server-rendered apps, run the bootstrap script before the page content, so a stored dark preference does not flash light on first load. Next.js:

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

`THEME_BOOTSTRAP_SCRIPT` is a constant from this package; never replace it with a string from user input or configuration.

## Design tokens

Style your own components with the semantic tokens, not color literals:

| Prefix | Use |
| --- | --- |
| `--dsw-alias-*` | Semantic colors: backgrounds, labels, borders, interaction and status states. First choice for any color |
| `--dsw-font-*` | Complete type roles; use them as `font: var(--dsw-font-…)` |
| `--dsw-radius-*` | Corner radii: `xs` 4, `sm` 8, `md` 12, `lg` 16, `xl` 20, `panel` 28 |
| `--dsw-elevation-*` | Raised surfaces (menus, panels, dialogs); the shadow already draws the hairline border |
| `--dsw-static-*` | The raw palette behind the aliases; do not use it in components |

To add a brand theme, keep `light / dark / system` and set a separate attribute on `body`, then load an override sheet after `tokens.css` that remaps `--dsw-alias-*` for both light and dark. Put it on `body`, not on a page container: `Modal`, `Toast` and `ImageLightbox` render into `body` through portals.

## Migrating from `dsh-ui-primitives`

This package was previously developed as `dsh-ui-primitives`.

1. Replace the `dsh-ui-primitives` import prefix with `@seekbuddy/dsh-ui`; the entry paths are unchanged.
2. `BrandWordmark`, `FishLogo`, `FISH_LOGO_PATH` and `FISH_LOGO_VIEWBOX` are removed. They draw DeepSeek's brand marks and are not redistributed.

## Development

Requires Node.js 20.11+.

```sh
npm install
npm run verify   # typecheck → unit tests → build → package contents → React 18 SSR → Next.js 16 build
```

`test:package` packs the real npm tarball and checks every export, the token cascade order and the KaTeX font URLs; `test:react18` and `test:next16` install that tarball into fixture apps. The build fails if the root entry reaches Markdown, Shiki or KaTeX, or if an extra component bundles a copy of a DSH component instead of importing it through the public entry.

`storybook/` is the component documentation and demo site (Storybook 10). It has its own dependencies and is not part of the published package:

```sh
npm run build               # the site reads dist/tokens.css
cd storybook
bun install
bun run dev                 # http://localhost:9109
bun run check               # typecheck + every public runtime export has a story
```

## License

[MIT](LICENSE). The DSH layer is MIT-licensed code by DeepSeek; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for upstream attribution and dependency licenses.
