/**
 * TeX-to-React via KaTeX, replicating the rehype-katex pipeline this renderer
 * replaced: the same three-arm error chain (strict render, `strict: 'ignore'`
 * retry, error span). KaTeX emits a static span/MathML/SVG vocabulary with no
 * raw user HTML, the same trusted innerHTML path shiki uses in CodeBlock. The
 * stable wrapper keeps server rendering and hydration identical without a
 * browser-only DOMParser dependency.
 */

import type { ReactNode } from 'react'
import katex from 'katex'

/**
 * Render TeX source to React elements through KaTeX.
 * @param value - The TeX source (math node value; fenced `math` blocks append
 * their trailing newline to match the replaced pipeline's text extraction).
 * @param displayMode - Display (block) versus inline rendering.
 * @returns KaTeX's element tree, or the error span when the source does not
 * parse (colored with KaTeX's stock `errorColor`, matching rehype-katex).
 */
export function renderTexToReact(value: string, displayMode: boolean): ReactNode {
  let html: string
  try {
    html = katex.renderToString(value, { displayMode, throwOnError: true })
  } catch (error) {
    try {
      html = katex.renderToString(value, { displayMode, strict: 'ignore', throwOnError: false })
    } catch {
      // KaTeX renders ParseErrors itself under throwOnError: false; only its
      // internal errors reach here, so mirror rehype-katex's manual span.
      /* v8 ignore next 8 */
      return (
        <span className="katex-error" style={{ color: '#cc0000' }} title={String(error)}>
          {value}
        </span>
      )
    }
  }
  return <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />
}
