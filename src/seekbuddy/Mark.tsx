import clsx from 'clsx'
import type { ReactNode } from 'react'
import { Tooltip } from '@seekbuddy/dsh-ui'
import css from './Mark.module.css'

/**
 * Closed set of marks the extension layer knows how to draw. Each kind is one fixed meaning with
 * its own glyph and colour token; adding a kind means adding an entry to `GLYPHS`, a colour class
 * in `Mark.module.css` and a story — callers only ever pick a kind.
 */
export type MarkKind = 'official'

/** Pixel edge of the glyph. 14 / 16 next to card titles, 20 / 24 next to detail-page headings. */
export type MarkSize = 14 | 16 | 18 | 20 | 24

export interface MarkProps {
  /** Which mark to draw; each kind has a fixed glyph and colour. */
  kind: MarkKind
  /** Screen-reader name and tooltip text, e.g. "Official"; localized by the caller. */
  label: string
  /** Default 16. */
  size?: MarkSize | undefined
  /** Wrap in a hover / focus tooltip showing `label`. Default `true`; pass `false` when the meaning is already spelled out next to the mark. */
  tooltip?: boolean | undefined
  /** Extra class on the root element, for layout. */
  className?: string | undefined
}

/**
 * Inline status mark: a fixed glyph with one meaning per `kind`, sized to sit on the text
 * baseline without growing the line. Not a generic badge — no free icon or colour props.
 * `<span role="img" aria-label tabIndex={0}>` so keyboard users can reach the tooltip; the SVG is
 * decorative. Uses the upstream `Tooltip`, so it lives in the Client Component aggregate entry only.
 */
export function Mark({ kind, label, size = 16, tooltip = true, className }: MarkProps) {
  const mark = (
    <span
      className={clsx(css.mark, css[kind], !tooltip && css.plain, className)}
      role="img"
      aria-label={label}
      tabIndex={0}
      data-kind={kind}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        {GLYPHS[kind]}
      </svg>
    </span>
  )
  if (!tooltip) return mark
  return (
    <Tooltip label={label} side="top">
      {mark}
    </Tooltip>
  )
}

/** Glyph paths per kind, all on a 24 × 24 outline grid (2 px stroke, `currentColor`). */
const GLYPHS: Record<MarkKind, ReactNode> = {
  // Twelve-point seal (outer r 9.5 / inner r 8.1, generated, centred on 12,12) with a check: "issued by the platform".
  official: (
    <>
      <path d="M12 2.5 14.1 4.18 16.75 3.77 17.73 6.27 20.23 7.25 19.82 9.9 21.5 12 19.82 14.1 20.23 16.75 17.73 17.73 16.75 20.23 14.1 19.82 12 21.5 9.9 19.82 7.25 20.23 6.27 17.73 3.77 16.75 4.18 14.1 2.5 12 4.18 9.9 3.77 7.25 6.27 6.27 7.25 3.77 9.9 4.18Z" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
}
