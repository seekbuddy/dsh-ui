# Contributing

English | [中文](CONTRIBUTING.zh.md)

Thanks for helping. Read which layer your change touches first: the two layers accept different kinds of changes.

## Which layer

| Path | Accepts |
| --- | --- |
| `src/` except `src/seekbuddy/` (DSH layer) | Packaging fixes only: entry splitting, SSR safety, type fixes needed to build. Component behaviour and styling follow upstream: report those to [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). Every local change to this layer is listed in [UPSTREAM.md](UPSTREAM.md) and re-applied on each sync, so add an entry there in the same pull request. |
| `src/seekbuddy/` (extra components) | Fixes and new components, under the rules below. |
| `build/`, `scripts/`, `tests/`, `fixtures/`, `storybook/` | Fixes and improvements. Examples and demos go into `storybook/`. |

## Setup

Node.js 20.11+. Storybook uses [Bun](https://bun.sh) 1.4.

```sh
npm install
npm run verify      # what CI runs
```

Storybook:

```sh
npm run build       # Storybook reads dist/tokens.css
cd storybook
bun install
bun run dev         # http://localhost:9109
bun run check       # typecheck, story coverage, API tables up to date
```

During development run the narrowest check that covers your change (`npm run typecheck`, `npm run test:unit`, `npm run build`, `npm run test:docs`); run `npm run verify` and the Storybook `check` before opening a pull request. After changing a prop or its JSDoc, regenerate the API tables with `cd storybook && bun run docs:api`.

## Rules for extra components

1. **Import DSH components through the public entry.** Write `import { Button } from '@seekbuddy/dsh-ui'`, never a relative path into the DSH layer. A consumer may alias that entry to another copy of the DSH primitives; the build fails if an extra component bundles DSH source. The DSH layer never imports `src/seekbuddy/`.
2. **No user-facing text.** Every visible or screen-reader string is a prop, usually a typed `labels` object. Date and number formatting goes through `Intl` with a `locale` prop.
3. **Tokens only.** Colours come from `--dsw-alias-*`, type from `--dsw-font-*`, radii from `--dsw-radius-*` (or `999px` / `50%` paired with `corner-shape: round`). No colour literals, no `--dsw-static-*`, no `var(--token, #fallback)`. Neutral borders and dividers are `0.5px`; raised surfaces use `border: 0` with a `--dsw-elevation-*` shadow. Focus rings declare only `outline-style: solid` (plus `outline-offset`); width and colour come from the theme. No component-specific scrollbar styles and no theme selectors such as `[data-ds-dark-theme]`.
4. **SSR safe.** Touch `document`, `window`, `localStorage` or `matchMedia` only inside effects or event handlers, so importing and server-rendering a component never throws.
5. **Entry points.** Export new components from `src/seekbuddy/index.ts` (a Client Component entry); component files do not add `'use client'` themselves. Only a hook-free component without DOM access gets its own sub-entry for Server Components, which needs `package.json#exports`, the entry list in `build/build.mjs`, `tsconfig.json` paths, the Storybook alias in `storybook/.storybook/main.ts` and the assertions in `scripts/test-package.mjs`. Bundle size needs no sub-entry: the build already gives every component its own chunk.
6. **Props are typed and documented.** Native-element components extend the matching `*HTMLAttributes`; optional props are written `prop?: T | undefined`; every prop field has JSDoc, which becomes the Storybook props table. Interactive components that wrap a DOM element forward their ref.
7. **A story and a docs page in the same pull request.** The story goes under `storybook/stories/seekbuddy/`: `Default`, each variant / size / state, disabled, loading / error / empty where they exist, and a side-by-side comparison. The docs page goes under `docs/components/` (add it to the index there): what it is for, when not to use it, a complete example, behaviour and accessibility notes, then `<!-- api:props Name -->` / `<!-- api:type Name -->` / `<!-- api:fn name -->` blocks that `cd storybook && bun run docs:api` fills from the source. The Storybook `check` fails if a public export has no story or no API block, if an API block is stale, or if a prop or field has no JSDoc; `npm run test:docs` typechecks every `tsx` example and checks the bilingual pairs (next rule).

8. **Documentation comes in English and Chinese.** Every README, this file and every page under `docs/` has a Chinese counterpart `foo.zh.md` in the same directory, as in upstream DSH. Each file links to the other right after its H1 (`English | [中文](foo.zh.md)` / `[English](foo.md) | 中文`); both have the same headings in the same order and the same tables, the fenced code blocks and generated API regions are byte-identical, and the Chinese side links to the `.zh.md` version of other paired pages. Update both files in the same pull request; `npm run test:docs` fails on a missing or structurally different counterpart.

A new extra component should be needed by more than one product surface and stay free of application logic (routing, data fetching, permissions). If it only serves one screen, keep it in that application.

## Commits and pull requests

- One topic per pull request; describe what changed and how you verified it.
- User-visible changes add a line under `## [Unreleased]` in [CHANGELOG.md](CHANGELOG.md) (create the section if it is missing), in the matching group: **Breaking**, **Added**, **Changed**, **Fixed**.
- Code comments state the current behaviour and constraints; history and rationale belong in the pull request.

## Maintainers

### Synchronizing the DSH layer

1. Pick the DSH tag. Copy `packages/client/ui-primitives/src` over `src/` and `packages/client/ui-theme/src/styles` over `src/styles/`, leaving `src/seekbuddy/` untouched. A three-way merge (previous tag → new tag, applied onto this repository) keeps the local changes.
2. Delete the files UPSTREAM.md lists as not mirrored, including `BrandWordmark.tsx` and `FishLogo.tsx`.
3. Walk through every local change in UPSTREAM.md: re-apply it, or drop the entry if upstream fixed the issue.
4. Update the tag and commit in UPSTREAM.md and THIRD_PARTY_NOTICES.md, pin `@deepseek-ai/dsh-util-code-language` to the same tag, and add a CHANGELOG entry (icon renames and removed exports are **Breaking**).
5. `npm run verify` and the Storybook `check` must pass; new upstream exports need a story.

### Releasing

1. Set `version` in `package.json`. Prereleases use `x.y.z-beta.n` and publish under the `next` dist-tag.
2. Rename `## [Unreleased]` in CHANGELOG.md to `## [x.y.z] - YYYY-MM-DD` and add its link at the bottom.
3. Merge to `main`, then push the tag `vx.y.z`. The Release workflow checks that the tag matches `package.json` and that the CHANGELOG has the section, runs `npm run verify`, and publishes with npm provenance.

The workflow needs the repository secret `NPM_TOKEN` (an npm automation or granular token with publish rights on `@seekbuddy/dsh-ui`) in the `npm` environment.
