import clsx from 'clsx'
import type { ReactNode } from 'react'
import { Spinner } from './Spinner.tsx'
import css from './Timeline.module.css'

/** Run state shown by the left badge: grey spinner / green check / red cross / grey dash. */
export type TimelineStatus = 'running' | 'succeeded' | 'failed' | 'canceled'

export interface TimelineItem {
  /** Stable identity of the entry (React key). */
  key: string
  /** Run state shown by the left badge. */
  status: TimelineStatus
  /** Title line; may carry a `Pill` tag or other inline nodes. */
  title: ReactNode
  /** Grey metadata parts (trigger kind, time, duration); the component spaces them. */
  meta?: ReadonlyArray<ReactNode> | undefined
  /** Optional third line — rendered in the error color for `failed`, grey otherwise. */
  message?: ReactNode | undefined
  /** When given the whole entry becomes a button (keep `message` free of interactive nodes). */
  onSelect?: (() => void) | undefined
}

export interface TimelineGroup {
  /** Stable identity of the group (React key). */
  key: string
  /** Group heading such as a date bucket ("Today"); omit for a headless single group. */
  heading?: ReactNode | undefined
  /** Entries of the group, in display order. */
  items: ReadonlyArray<TimelineItem>
}

export interface TimelineProps {
  /** Accessible name of the whole timeline ("Run history"). */
  label: string
  /** Screen-reader text per status; badges themselves are aria-hidden. Copy comes from the caller's locale. */
  statusLabels: Readonly<Record<TimelineStatus, string>>
  /** Groups in display order; ordering and bucketing are the caller's. */
  groups: ReadonlyArray<TimelineGroup>
  /** Extra class on the root element, for layout. */
  className?: string | undefined
}

const BADGE_TONE: Readonly<Record<Exclude<TimelineStatus, 'running'>, string>> = {
  succeeded: css.succeeded,
  failed: css.failed,
  canceled: css.canceled,
}

function Badge({ status, label }: { status: TimelineStatus; label: string }) {
  if (status === 'running') return <Spinner className={css.running} label={label} />
  return (
    <>
      <svg className={clsx(css.badge, BADGE_TONE[status])} viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="8" fill="currentColor" />
        {status === 'succeeded' && <path className={css.glyph} d="M4.5 8.2l2.3 2.3 4.7-4.8" />}
        {status === 'failed' && <path className={css.glyph} d="M5.3 5.3l5.4 5.4M10.7 5.3l-5.4 5.4" />}
        {status === 'canceled' && <path className={css.glyph} d="M4.8 8h6.4" />}
      </svg>
      <span className={css.srOnly}>{label}</span>
    </>
  )
}

/**
 * Vertical run timeline: date-bucket groups,
 * each an ordered list of entries with a status badge, title, grey meta line, optional message
 * and a rail that runs continuously inside a group. Data-driven like antd's `items`; grouping,
 * sorting, copy and time formatting stay with the caller. Upstream ships no Timeline.
 */
export function Timeline({ label, statusLabels, groups, className }: TimelineProps) {
  return (
    <section className={clsx(css.timeline, className)} aria-label={label}>
      {groups.map((group) => (
        <div key={group.key}>
          {group.heading !== undefined && <h3 className={css.heading}>{group.heading}</h3>}
          <ol className={css.list}>
            {group.items.map((item) => {
              const body = (
                <>
                  <div className={css.title}>{item.title}</div>
                  {item.meta !== undefined && item.meta.length > 0 && (
                    <div className={css.meta}>
                      {item.meta.map((part, index) => (
                        <span key={index}>{part}</span>
                      ))}
                    </div>
                  )}
                  {item.message !== undefined && (
                    <div className={clsx(css.message, item.status === 'failed' && css.messageError)}>
                      {item.message}
                    </div>
                  )}
                </>
              )
              return (
                <li key={item.key} className={css.item} data-status={item.status}>
                  <span className={css.rail} aria-hidden="true" />
                  <span className={css.badgeCell}>
                    <Badge status={item.status} label={statusLabels[item.status]} />
                  </span>
                  {item.onSelect === undefined ? (
                    <div className={css.body}>{body}</div>
                  ) : (
                    <button type="button" className={clsx(css.body, css.select)} onClick={item.onSelect}>
                      {body}
                    </button>
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      ))}
    </section>
  )
}
