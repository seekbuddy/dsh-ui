# Pagination

English | [中文](pagination.zh.md)

A page strip for long lists, with the commonly used subset of antd's `Pagination`: controlled or uncontrolled page, `total` + `pageSize`, first and last page always visible with ellipsis jumps, `showTotal`, `simple` mode. The buttons are DSH ghost `Button`s.

```tsx
import { Pagination, pageItems } from '@seekbuddy/dsh-ui/seekbuddy'
```

## Example

```tsx
import { useState } from 'react'
import { Pagination, type PaginationLabels } from '@seekbuddy/dsh-ui/seekbuddy'

const labels: PaginationLabels = {
  navigation: 'Pagination',
  previous: 'Previous page',
  next: 'Next page',
  page: (page) => `Page ${page}`,
  jumpPrevious: 'Previous 5 pages',
  jumpNext: 'Next 5 pages',
}

export function RunsPager({ total }: { total: number }) {
  const [page, setPage] = useState(1)
  return (
    <Pagination
      current={page}
      pageSize={20}
      total={total}
      onChange={setPage}
      showTotal={(count, [from, to]) => `${from}–${to} of ${count}`}
      labels={labels}
    />
  )
}
```

## Behaviour

- **Page window:** with up to 7 pages (5 with `showLessItems`) every page is listed. Beyond that the strip keeps page 1, the last page and a window of 5 (or 3) around the current page, with an ellipsis button on each side that has a gap. Hovering an ellipsis turns it into a jump arrow; clicking it moves by the window size.
- **`simple`:** previous, `current / pages`, next.
- **`hideOnSinglePage`** defaults to `true` (antd: `false`): with one page or none, nothing renders.
- **`disabled`** disables every button; previous / next are also disabled at the ends.

## Accessibility

The strip is a `<nav>` named by `labels.navigation`. Page buttons are named by `labels.page(n)` and the current one has `aria-current="page"`.

## API

<!-- api:props Pagination -->
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `current` | `number` |  | Controlled current page (1-based). Omit for uncontrolled with `defaultCurrent`. |
| `defaultCurrent` | `number` | `1` | Initial page when uncontrolled. Default 1. |
| `pageSize` | `number` |  | Items per page; with `total` this yields the page count. |
| `defaultPageSize` | `number` | `10` | Initial page size when `pageSize` is omitted. Default 10. |
| `total` | `number` | **required** | Total item count. |
| `onChange` | `(page: number, pageSize: number) => void` |  | Fired with the target page; `pageSize` rides along so a future size changer keeps the signature. |
| `showTotal` | `(total: number, range: [number, number]) => ReactNode` |  | Summary rendered at the start, e.g. `(total, [from, to]) => \`${from}–${to} of ${total}\``. |
| `hideOnSinglePage` | `boolean` | `true` | Render nothing when everything fits on one page. Default `true` (antd defaults to `false`). |
| `simple` | `boolean` | `false` | Previous / `current / pages` / next only. |
| `showLessItems` | `boolean` | `false` | Middle window of 3 page buttons instead of 5, for narrow rows. |
| `disabled` | `boolean` | `false` | Disables every button in the strip. |
| `labels` | `PaginationLabels` | **required** | All visible and screen-reader text; see `PaginationLabels`. |
| `className` | `string` |  | Extra class on the root `<nav>`, for layout. |
<!-- /api -->

### PaginationLabels

<!-- api:type PaginationLabels -->
All user-visible text, localized by the caller.

| Field | Type | Description |
| --- | --- | --- |
| `navigation` | `string` | `aria-label` of the `<nav>`, e.g. "Pagination". |
| `previous` | `string` | `aria-label` of the previous-page button. |
| `next` | `string` | `aria-label` of the next-page button. |
| `page` | `(page: number) => string` | `aria-label` of a page button, e.g. `(page) => \`Page ${page}\``. |
| `jumpPrevious` | `string` | `aria-label` of the ellipsis that jumps back, e.g. "Previous 5 pages". |
| `jumpNext` | `string` | `aria-label` of the ellipsis that jumps forward. |
<!-- /api -->

### pageItems

The page-window algorithm, exported as a pure function for custom pagers and tests.

<!-- api:fn pageItems -->
```ts
function pageItems(current: number, pages: number, lessItems?: boolean): PaginationItem[]
```

antd's page strip: with few pages list them all; otherwise keep page 1 and the last page, a
window of 5 (or 3) around `current`, and an ellipsis on each side that has a gap. Jumps move by
the window size, clamped. Pure, exported for tests.
<!-- /api -->

### PaginationItem

<!-- api:type PaginationItem -->
One slot of the page strip: a page button or an ellipsis that jumps by the window size.

```ts
type PaginationItem = { type: 'page'; page: number } | { type: 'jump-previous' | 'jump-next'; page: number }
```
<!-- /api -->
