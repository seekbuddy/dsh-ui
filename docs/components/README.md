# Extra components

English | [中文](README.zh.md)

Components that DSH does not provide, built on the same `--dsw-*` tokens. They are imported from `@seekbuddy/dsh-ui/seekbuddy`; that entry is a Client Component (it starts with `'use client'`). The DSH components (`Button`, `Menu`, `Modal`, Markdown, tool-output blocks, …) are documented in the [upstream package README](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/client/ui-primitives).

| Component | Use it for | Server Component entry |
| --- | --- | --- |
| [Card](card.md) | A bounded surface: background, hairline, radius, shadow, padding | `/seekbuddy/card` |
| [Empty](empty.md) | Loading / empty / error placeholder for a page or list region | `/seekbuddy/empty` |
| [Spinner](spinner.md) | The loading ring, inline or page-level | `/seekbuddy/spinner` |
| [StatusBadge](status-badge.md) | Read-only status chip with a state dot | — |
| [Mark](mark.md) | Inline status glyph next to a title, such as "official" | — |
| [Tabs](tabs.md) | Underline tab list (WAI-ARIA tabs) | `/seekbuddy/tabs` (Client Component) |
| [Switch](switch.md) | On / off toggle with antd's props | — |
| [DangerButton, SubtleButton](buttons.md) | Destructive and low-emphasis buttons | — |
| [Pagination](pagination.md) | Page strip for long lists | — |
| [MessageProvider, useMessage](message.md) | Stacked transient messages, antd `message` style | — |
| [Upload](upload.md) | File picker with a status list; you bring the transport | — |
| [Timeline](timeline.md) | Vertical run history grouped by date | `/seekbuddy/timeline` |
| [QrCode](qr-code.md) | Draw a QR code from a string | — |
| [Date and time pickers](date-time.md) | `Calendar`, `DatePicker`, `DateRangePicker`, `TimePicker` and their input-style fields | — |

## Conventions shared by every component

- **Text comes from you.** Components contain no user-facing strings. Visible and screen-reader text is passed as props, usually a typed `labels` object, so you localize it with whatever i18n library you use.
- **Theme-aware.** Colours, type, radii and shadows come from the `--dsw-*` tokens in `@seekbuddy/dsh-ui/tokens.css`, which you import once in your app entry. Light and dark both work without extra CSS.
- **`className` is for layout.** Use it to size and position a component. Do not target the generated class names inside it; they change between builds.
- **Server rendering.** Every component renders on the server without touching `document`. Components with state or effects must still be used from Client Components; the hook-free ones listed above also have an entry without `'use client'`, for Next.js Server Components.
- **Import cost.** Importing one component from `/seekbuddy` does not pull in the others: each component is built into its own chunk together with its CSS.

The API tables in these pages are generated from the TypeScript source (`cd storybook && bun run docs:api`); the prose and examples are written by hand.
