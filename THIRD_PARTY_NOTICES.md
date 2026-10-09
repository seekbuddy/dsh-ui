# Third-Party Notices

`@seekbuddy/dsh-ui` is an unofficial project. It is not affiliated with, endorsed by, or sponsored by
DeepSeek. "DeepSeek" and "DeepSeek Harness" are trademarks of their respective owner; this package uses
the names only to describe compatibility, and ships none of DeepSeek's brand assets (logo, wordmark).

## DeepSeek Harness UI primitives and theme

Everything under `src/` except `src/seekbuddy/` is a copy of the DeepSeek Harness web UI primitives and
theme sheets, with the local adaptations listed in `UPSTREAM.md`.

- Upstream repository: https://github.com/deepseek-ai/deepseek-harness
- Tag: `dsh-v0.2.0-rc.2`, commit `639ed015397290b3745d163aafe02ffee4aa3f84`
- `packages/client/ui-primitives/src` → `src/` (components, CSS Modules, icons, Markdown renderer)
- `packages/client/ui-theme/src/styles` → `src/styles/` (`base.css`, `corner-shape.css`,
  `design-platform.css`, `focus.css`, `onboarding.css`, `scrollbar.css`, `gradient-shadow-text.css`,
  `shiki.css`)
- Not included: `BrandWordmark`, `FishLogo` (DeepSeek brand assets), `PathLabel`, `settings-form/`,
  `brand-font.css` and its Montserrat fonts.

License: MIT, Copyright (c) 2026 DeepSeek. The full text is reproduced in this package's `LICENSE`.

## Bundled assets

- **KaTeX CSS and fonts** (`dist/katex.css`, `dist/katex/fonts/*.woff2`, copied from the `katex`
  package at build time): MIT, Copyright (c) 2013-2020 Khan Academy and other contributors
  (https://github.com/KaTeX/KaTeX/blob/main/LICENSE; fonts: https://github.com/KaTeX/katex-fonts).

## Runtime dependencies

Installed from npm, not bundled into `dist/` (except the KaTeX CSS and fonts above):

| Package | License |
| --- | --- |
| `katex` | MIT |
| `shiki`, `@shikijs/langs` | MIT |
| `mdast-util-*`, `micromark*`, `@types/mdast` | MIT |
| `anser` | MIT |
| `diff` | BSD-3-Clause |
| `@deepseek-ai/dsh-util-code-language` | MIT |
| `clsx` | MIT |
| `simple-icons` | CC0-1.0 (the drawn marks remain trademarks of their respective sites; `LinkIcon*` uses them only to identify the linked site) |
