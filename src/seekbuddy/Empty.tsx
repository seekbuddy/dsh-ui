import clsx from 'clsx'
import type { HTMLAttributes, ReactNode } from 'react'
import { Button } from '@seekbuddy/dsh-ui'
import { IconRefreshOutlineRegular, IconSearchOutlineRegular, IconWarningOutlineRegular } from '@seekbuddy/dsh-ui/icons'
import { Spinner } from './Spinner.tsx'
import css from './Empty.module.css'

/** The three content states a data-driven view has to handle. */
export type EmptyStatus = 'loading' | 'empty' | 'error'

export interface EmptyProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Which state to show. Precedence between loading / error / empty is the caller's decision. */
  status: EmptyStatus
  /** Main line; localized by the caller. */
  title: string
  /** Secondary line under the title. */
  description?: ReactNode | undefined
  /**
   * Leading visual. `undefined` picks the default for the status (spinner / search / warning);
   * `null` renders no icon at all.
   */
  icon?: ReactNode | null | undefined
  /** Action row (e.g. a "create" button for the empty state). Rendered before the retry button. */
  action?: ReactNode | undefined
  /** Label of the retry button; rendered only for `status="error"` together with `onRetry`. */
  retryLabel?: string | undefined
  /** Retry handler; rendered only for `status="error"` together with `retryLabel`. */
  onRetry?: (() => void) | undefined
  /** Reserved height so a list that refreshes into a state does not jump. Default 240. */
  minHeight?: number | string | undefined
  /** Dashed frame; turn off for full-screen or already-framed placements. Default `true`. */
  bordered?: boolean | undefined
}

/**
 * Placeholder block for the loading / empty / error states of a page or a list region: icon,
 * title, description and an action row. Text and buttons come from the caller; the component only
 * fixes structure, tokens and the live-region semantics per state (`status` + polite for loading,
 * `alert` for error, nothing for empty). server-safe (no hooks); the retry button needs a handler
 * so it is only usable from Client Components.
 */
export function Empty({
  status,
  title,
  description,
  icon,
  action,
  retryLabel,
  onRetry,
  minHeight = 240,
  bordered = true,
  className,
  style,
  ...rest
}: EmptyProps) {
  const live =
    status === 'loading'
      ? ({ role: 'status', 'aria-live': 'polite' } as const)
      : status === 'error'
        ? ({ role: 'alert' } as const)
        : {}
  const visual = icon === undefined ? defaultIcon(status) : icon
  const retry =
    status === 'error' && onRetry !== undefined && retryLabel !== undefined ? (
      <Button size="sm" variant="outline" icon={<IconRefreshOutlineRegular />} onClick={onRetry}>
        {retryLabel}
      </Button>
    ) : null
  return (
    <div
      {...live}
      {...rest}
      className={clsx(css.empty, css[status], bordered && css.bordered, className)}
      style={{ minHeight, ...style }}
    >
      {visual === null ? null : (
        <span className={css.icon} aria-hidden="true">
          {visual}
        </span>
      )}
      <p className={css.title}>{title}</p>
      {description === undefined || description === null ? null : <div className={css.description}>{description}</div>}
      {action === undefined && retry === null ? null : (
        <div className={css.action}>
          {action}
          {retry}
        </div>
      )}
    </div>
  )
}

function defaultIcon(status: EmptyStatus): ReactNode {
  if (status === 'loading') return <Spinner size="md" tone="page" className={css.spinner} />
  if (status === 'error') return <IconWarningOutlineRegular size={20} />
  return <IconSearchOutlineRegular size={20} />
}
