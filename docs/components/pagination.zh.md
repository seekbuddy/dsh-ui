# Pagination

[English](pagination.md) | 中文

长列表的分页条，实现了 antd `Pagination` 的常用子集：受控或非受控的页码、`total` 加 `pageSize`、首页与末页常驻并带省略号跳页、`showTotal`、`simple` 模式。按钮是 DSH 的幽灵 `Button`。

```tsx
import { Pagination, pageItems } from '@seekbuddy/dsh-ui/seekbuddy'
```

## 示例

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

## 行为

- **页码窗口：**不超过 7 页（`showLessItems` 时为 5 页）时列出全部页码。超过时保留第 1 页、最后一页，以及当前页周围 5 个（或 3 个）页码组成的窗口；哪一侧有空缺，就在哪一侧放一个省略号按钮。悬停时省略号变成跳页箭头，点击按窗口大小跳页。
- **`simple`：**上一页、`current / pages`、下一页。
- **`hideOnSinglePage`** 默认为 `true`（antd 为 `false`）：只有一页或没有数据时什么都不渲染。
- **`disabled`** 禁用所有按钮；到达两端时，上一页 / 下一页也会禁用。

## 可访问性

分页条是一个以 `labels.navigation` 命名的 `<nav>`。页码按钮以 `labels.page(n)` 命名，当前页带有 `aria-current="page"`。

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

页码窗口算法，作为纯函数导出，供自定义分页器和测试使用。

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
