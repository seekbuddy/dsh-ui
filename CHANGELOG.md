# Changelog

All notable changes to `@seekbuddy/dsh-ui` are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/). While the version is `0.x`, a minor bump may contain
breaking changes; they are listed under **Breaking**.

Upstream DSH synchronizations are recorded with the DSH tag they move to; the full list of local
changes to the DSH layer lives in [UPSTREAM.md](UPSTREAM.md).

## [0.2.0-beta.0] - 2026-10-09

First release under the name `@seekbuddy/dsh-ui`. DSH layer synchronized with `dsh-v0.2.0-rc.2`.

### Breaking

- The package is renamed from `dsh-ui-primitives` to `@seekbuddy/dsh-ui`. Entry paths are unchanged:
  replace the `dsh-ui-primitives` import prefix.
- `BrandWordmark`, `FishLogo`, `FISH_LOGO_PATH` and `FISH_LOGO_VIEWBOX` are removed. They draw
  DeepSeek's brand marks, which the MIT license does not cover.
- `Switch` from `/seekbuddy` now uses upstream's colours: the on track is `--dsw-alias-brand-primary`
  (black in light, near-white in dark) instead of business blue, and the thumb follows
  `--dsw-alias-label-primary-foreground` / `--dsw-alias-switch-thumb` instead of a fixed white.

### Added

- Documentation for every extra component in `docs/components/`: usage, examples, behaviour,
  accessibility and API tables generated from the TypeScript source. Every prop and field now has JSDoc.
- Chinese documentation next to the English pages (`README.zh.md`, `CONTRIBUTING.zh.md`,
  `docs/components/*.zh.md`), following upstream DSH's bilingual pairing; the former
  `README.zh-CN.md` is now `README.zh.md`.

### Fixed

- `diff` and `@deepseek-ai/dsh-util-code-language` are declared as dependencies. Both were imported
  but not declared, so installing the package outside the original monorepo failed to resolve them.
- `DangerButton` and `SubtleButton` forward their ref to the underlying `<button>`, so they work as
  `Tooltip` and `HoverCard` anchors.
- Divider lines in `DatePicker`, `DateRangePicker` and `TimePicker` are 0.5px hairlines, matching
  the DSH styling rules.
- `TimePicker` no longer overrides the theme's scrollbar width.

### Known issues

- `DateField`, `DateRangeField` and `TimeField` log React's `useLayoutEffect does nothing on the
  server` warning during React 18 server rendering. The markup is correct; the popover position is
  computed on the client.

[0.2.0-beta.0]: https://github.com/seekbuddy/dsh-ui/releases/tag/v0.2.0-beta.0
