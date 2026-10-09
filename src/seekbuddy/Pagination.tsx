import clsx from 'clsx'
import { useState, type ReactNode } from 'react'
import { Button } from '@seekbuddy/dsh-ui'
import { IconChevronLeftOutlineRegular, IconChevronRightOutlineRegular } from '@seekbuddy/dsh-ui/icons'
import css from './Pagination.module.css'

/** All user-visible text, localized by the caller. */
export interface PaginationLabels {
  /** `aria-label` of the `<nav>`, e.g. "Pagination". */
  navigation: string
  /** `aria-label` of the previous-page button. */
  previous: string
  /** `aria-label` of the next-page button. */
  next: string
  /** `aria-label` of a page button, e.g. `(page) => \`Page ${page}\``. */
  page: (page: number) => string
  /** `aria-label` of the ellipsis that jumps back, e.g. "Previous 5 pages". */
  jumpPrevious: string
  /** `aria-label` of the ellipsis that jumps forward. */
  jumpNext: string
}

export interface PaginationProps {
  /** Controlled current page (1-based). Omit for uncontrolled with `defaultCurrent`. */
  current?: number | undefined
  /** Initial page when uncontrolled. Default 1. */
  defaultCurrent?: number | undefined
  /** Items per page; with `total` this yields the page count. */
  pageSize?: number | undefined
  /** Initial page size when `pageSize` is omitted. Default 10. */
  defaultPageSize?: number | undefined
  /** Total item count. */
  total: number
  /** Fired with the target page; `pageSize` rides along so a future size changer keeps the signature. */
  onChange?: ((page: number, pageSize: number) => void) | undefined
  /** Summary rendered at the start, e.g. `(total, [from, to]) => \`${from}–${to} of ${total}\``. */
  showTotal?: ((total: number, range: [number, number]) => ReactNode) | undefined
  /** Render nothing when everything fits on one page. Default `true` (antd defaults to `false`). */
  hideOnSinglePage?: boolean | undefined
  /** Previous / `current / pages` / next only. */
  simple?: boolean | undefined
  /** Middle window of 3 page buttons instead of 5, for narrow rows. */
  showLessItems?: boolean | undefined
  /** Disables every button in the strip. */
  disabled?: boolean | undefined
  /** All visible and screen-reader text; see `PaginationLabels`. */
  labels: PaginationLabels
  /** Extra class on the root `<nav>`, for layout. */
  className?: string | undefined
}

/** One slot of the page strip: a page button or an ellipsis that jumps by the window size. */
export type PaginationItem = { type: 'page'; page: number } | { type: 'jump-previous' | 'jump-next'; page: number }

/**
 * antd's page strip: with few pages list them all; otherwise keep page 1 and the last page, a
 * window of 5 (or 3) around `current`, and an ellipsis on each side that has a gap. Jumps move by
 * the window size, clamped. Pure, exported for tests.
 */
export function pageItems(current: number, pages: number, lessItems = false): PaginationItem[] {
  const window = lessItems ? 3 : 5
  if (pages <= window + 2) return Array.from({ length: pages }, (_, index) => ({ type: 'page', page: index + 1 }))
  const half = Math.floor(window / 2)
  let start = Math.max(2, current - half)
  let end = Math.min(pages - 1, current + half)
  // Near either end antd keeps a full window counted from that end (1…5 or last-4…last).
  if (current - half < 2) end = Math.min(pages - 1, window)
  if (current + half > pages - 1) start = Math.max(2, pages - window + 1)
  const items: PaginationItem[] = [{ type: 'page', page: 1 }]
  if (start > 2) items.push({ type: 'jump-previous', page: Math.max(1, current - window) })
  for (let page = start; page <= end; page += 1) items.push({ type: 'page', page })
  if (end < pages - 1) items.push({ type: 'jump-next', page: Math.min(pages, current + window) })
  items.push({ type: 'page', page: pages })
  return items
}

/**
 * Page navigation for catalog lists. Mirrors a subset of antd's Pagination:
 * controlled or uncontrolled `current`, `total` + `pageSize` → page count, first / last page
 * always visible with ellipsis jumps, `showTotal`, `simple`, `hideOnSinglePage`. Text comes from
 * `labels`; the component has no strings of its own. Client Component (state for the
 * uncontrolled mode), aggregate entry only.
 */
export function Pagination({
  current,
  defaultCurrent = 1,
  pageSize,
  defaultPageSize = 10,
  total,
  onChange,
  showTotal,
  hideOnSinglePage = true,
  simple = false,
  showLessItems = false,
  disabled = false,
  labels,
  className,
}: PaginationProps) {
  const [ownCurrent, setOwnCurrent] = useState(defaultCurrent)
  const size = Math.max(1, pageSize ?? defaultPageSize)
  const pages = Math.max(1, Math.ceil(Math.max(0, total) / size))
  const page = Math.min(pages, Math.max(1, current ?? ownCurrent))
  if (hideOnSinglePage && pages <= 1) return null

  const go = (target: number) => {
    const next = Math.min(pages, Math.max(1, target))
    if (next === page) return
    if (current === undefined) setOwnCurrent(next)
    onChange?.(next, size)
  }
  const from = total === 0 ? 0 : (page - 1) * size + 1
  const to = Math.min(total, page * size)

  return (
    <nav className={clsx(css.nav, className)} aria-label={labels.navigation}>
      {showTotal === undefined ? null : <span className={css.total}>{showTotal(total, [from, to])}</span>}
      <Button
        variant="ghost"
        size="sm"
        className={css.step}
        aria-label={labels.previous}
        disabled={disabled || page <= 1}
        icon={<IconChevronLeftOutlineRegular />}
        onClick={() => go(page - 1)}
      />
      {simple ? (
        <span className={css.simple} aria-current="page">
          {page} / {pages}
        </span>
      ) : (
        pageItems(page, pages, showLessItems).map((item) =>
          item.type === 'page' ? (
            <Button
              key={item.page}
              variant="ghost"
              size="sm"
              className={clsx(css.page, item.page === page && css.current)}
              aria-label={labels.page(item.page)}
              aria-current={item.page === page ? 'page' : undefined}
              disabled={disabled}
              onClick={() => go(item.page)}
            >
              {item.page}
            </Button>
          ) : (
            <Button
              key={item.type}
              variant="ghost"
              size="sm"
              className={clsx(css.page, css.jump)}
              aria-label={item.type === 'jump-previous' ? labels.jumpPrevious : labels.jumpNext}
              disabled={disabled}
              onClick={() => go(item.page)}
            >
              <span className={css.dots} aria-hidden="true">
                •••
              </span>
              <span className={css.arrows} aria-hidden="true">
                {item.type === 'jump-previous' ? '«' : '»'}
              </span>
            </Button>
          ),
        )
      )}
      <Button
        variant="ghost"
        size="sm"
        className={css.step}
        aria-label={labels.next}
        disabled={disabled || page >= pages}
        icon={<IconChevronRightOutlineRegular />}
        onClick={() => go(page + 1)}
      />
    </nav>
  )
}
