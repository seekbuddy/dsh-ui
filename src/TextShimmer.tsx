/** Text activity animation shared by a row and its nested text fragments. */
import * as React from 'react'
import { memo, useContext, type Context, type ReactNode } from 'react'
import clsx from 'clsx'
import css from './TextShimmer.module.css'

// SeekBuddy adaptation (UPSTREAM.md): React's `react-server` build has no createContext, and a Server
// Component evaluates this module through the root entry. TextShimmer only renders on the client, so
// the context is created only where React provides it (same guard as Tooltip's suppression context).
const DecorativeCopy = (
  typeof React.createContext === 'function' ? React.createContext<boolean | undefined>(undefined) : null
) as Context<boolean | undefined>

/** Text and activity supplied by the owning row. */
export interface TextShimmerProps {
  /** Text or presentational children with text in nested TextShimmer instances. No effects or element ids. */
  children: ReactNode
  /** Whether to animate; nested instances share the containing row's activity. */
  active?: boolean | undefined
  className?: string | undefined
  /** Layout class applied equally to the base and decorative content. */
  contentClassName?: string | undefined
}

function TextContent({ children, className }: Pick<TextShimmerProps, 'children' | 'className'>) {
  const decorative = useContext(DecorativeCopy)
  const generated = decorative === true && typeof children === 'string'
  return (
    <span className={clsx(css.text, className)} data-shimmer-text={generated ? children : undefined}>
      {generated ? null : children}
    </span>
  )
}

/**
 * Render text with one shared highlight while retaining selectable, accessible content.
 * Nested instances inherit the outer animation. Keep icons outside; mark decorative
 * separators with data-shimmer-decoration so their background follows the highlight.
 * Active children also render in an inert, clipped decoration; supply only presentation.
 * @param props - localized text, running state, and owner styling.
 * @returns retained text and its optional decorative highlight.
 */
export const TextShimmer = memo(function TextShimmer({
  children,
  active = false,
  className,
  contentClassName,
}: TextShimmerProps) {
  const decorative = useContext(DecorativeCopy)
  if (decorative !== undefined) return <TextContent className={className}>{children}</TextContent>
  const content = typeof children === 'string' ? <TextContent>{children}</TextContent> : children
  return (
    <span className={clsx(css.root, className)} data-shimmer={active || undefined}>
      <DecorativeCopy.Provider value={false}>
        <span className={clsx(css.content, contentClassName)}>{content}</span>
      </DecorativeCopy.Provider>
      {active && (
        // React 18 forwards inert as an empty string; a boolean is dropped.
        <span className={css.decoration} aria-hidden="true" {...{ inert: '' }}>
          <span className={css.sweep}>
            <DecorativeCopy.Provider value>
              <span className={clsx(css.content, css.highlight, contentClassName)}>{content}</span>
            </DecorativeCopy.Provider>
          </span>
        </span>
      )}
    </span>
  )
})
