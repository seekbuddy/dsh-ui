# Card

English | [中文](card.zh.md)

A card surface: background, hairline stroke, `--dsw-radius-lg` corners, panel shadow and padding. The content is entirely yours; there are no header, footer or title slots, because cards in real products rarely share an inner structure.

```tsx
import { Card } from '@seekbuddy/dsh-ui/seekbuddy'
// In a Next.js Server Component:
import { Card as ServerCard } from '@seekbuddy/dsh-ui/seekbuddy/card'
```

## When to use

- Catalog entries, task and template cards, settings groups: any "bounded block" on a page.
- In a list, render the card as the list item with `as="li"` instead of wrapping it.

Use `Empty` for loading / empty / error placeholders, and a `Modal` (DSH layer) for dialogs.

## Example

```tsx
import { Button } from '@seekbuddy/dsh-ui'
import { Card } from '@seekbuddy/dsh-ui/seekbuddy'

export function PluginList({ plugins }: { plugins: { id: string; name: string; summary: string }[] }) {
  return (
    <ul style={{ display: 'grid', gap: 12, padding: 0 }}>
      {plugins.map((plugin) => (
        <Card key={plugin.id} as="li" padding="sm">
          <h3>{plugin.name}</h3>
          <p>{plugin.summary}</p>
          <Button size="sm">Install</Button>
        </Card>
      ))}
    </ul>
  )
}
```

## Clickable cards

`interactive` only adds the hover fill and the pointer cursor. Wiring the click and the keyboard is your decision:

- put a real `<button>` or `<a>` inside the card for the action, or
- make the whole card the control with `onClick`, `role="button"`, `tabIndex={0}` and an Enter / Space handler. A focusable card shows the theme's focus ring.

## States

The card is only the surface. Loading, empty and error are states of its **content**: render a `Spinner`, a short message or an error line with a retry button inside it. To disable a clickable card, drop `interactive` and the click handler.

## API

Also accepts every native attribute of the rendered element (`id`, `onClick`, `aria-*`, …).

<!-- api:props Card -->
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `padding` | `"none" \| "sm" \| "md"` | `md` | Inner padding; see `CardPadding`. Default `md` (16px). |
| `interactive` | `boolean` | `false` | Hover feedback for cards the caller makes clickable: the translucent `--dsw-alias-interactive-bg-hover` fill upstream's plugin cards use, plus the pointer cursor. Styling only — clicking is wired by the caller (`onClick` here, or a `<button>` inside). |
| `as` | `"div" \| "section" \| "article" \| "li"` | `div` | Element to render; see `CardElement`. Default `div`. |
<!-- /api -->

### CardPadding

<!-- api:type CardPadding -->
Inner padding: `none` = 0 (self-laid-out content such as a cover image), `sm` = 14px (dense catalog cards), `md` = 16px (default).

```ts
type CardPadding = 'none' | 'sm' | 'md'
```
<!-- /api -->

### CardElement

<!-- api:type CardElement -->
Rendered element; pick `li` inside a list so the card needs no wrapper.

```ts
type CardElement = 'div' | 'section' | 'article' | 'li'
```
<!-- /api -->
