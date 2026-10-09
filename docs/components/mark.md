# Mark

English | [中文](mark.zh.md)

An inline status mark that sits on the text baseline next to a title, such as the "official" check on a catalog card. Each `kind` has one fixed meaning, glyph and colour; it is not a generic icon badge, so there are no icon or colour props.

```tsx
import { Mark } from '@seekbuddy/dsh-ui/seekbuddy'
```

## When to use

Marking a title with a status that has a fixed meaning across your product. Kinds available today: `official` (published or verified by the platform).

To show a state with text, use `StatusBadge`. To add a new kind, add it to `MarkKind` in the source with its glyph and colour; see [CONTRIBUTING](../../CONTRIBUTING.md).

## Example

```tsx
import { Mark } from '@seekbuddy/dsh-ui/seekbuddy'

export function SkillTitle({ name, official }: { name: string; official: boolean }) {
  return (
    <h3 style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {name}
      {official && <Mark kind="official" label="Official" size={16} />}
    </h3>
  )
}
```

Use sizes 14 or 16 next to card titles and 20 or 24 next to page headings.

## Accessibility

The mark renders as `<span role="img" aria-label={label} tabIndex={0}>`, so screen readers read `label` and keyboard users can focus it to see the tooltip. Pass `tooltip={false}` when the meaning is already written next to the mark.

## API

<!-- api:props Mark -->
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `kind` | `"official"` | **required** | Which mark to draw; each kind has a fixed glyph and colour. |
| `label` | `string` | **required** | Screen-reader name and tooltip text, e.g. "Official"; localized by the caller. |
| `size` | `14 \| 16 \| 18 \| 20 \| 24` | `16` | Default 16. |
| `tooltip` | `boolean` | `true` | Wrap in a hover / focus tooltip showing `label`. Default `true`; pass `false` when the meaning is already spelled out next to the mark. |
| `className` | `string` |  | Extra class on the root element, for layout. |
<!-- /api -->

### MarkKind

<!-- api:type MarkKind -->
Closed set of marks the extension layer knows how to draw. Each kind is one fixed meaning with
its own glyph and colour token; adding a kind means adding an entry to `GLYPHS`, a colour class
in `Mark.module.css` and a story — callers only ever pick a kind.

```ts
type MarkKind = 'official'
```
<!-- /api -->

### MarkSize

<!-- api:type MarkSize -->
Pixel edge of the glyph. 14 / 16 next to card titles, 20 / 24 next to detail-page headings.

```ts
type MarkSize = 14 | 16 | 18 | 20 | 24
```
<!-- /api -->
