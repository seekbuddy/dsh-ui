export { JsonTree } from './JsonTree.tsx'
export type { JsonTreeProps, JsonTreeLabels } from './JsonTree.tsx'
export { TerminalBlock, DEFAULT_TERMINAL_MAX_LINES } from './TerminalBlock.tsx'
export type { TerminalBlockProps, TerminalBlockLabels } from './TerminalBlock.tsx'
export { ReadBlock, DEFAULT_READ_MAX_LINES } from './ReadBlock.tsx'
export type { ReadBlockProps, ReadBlockLine, ReadBlockLabels } from './ReadBlock.tsx'
export { DiffBlock, DEFAULT_DIFF_MAX_LINES, diffTotals } from './DiffBlock.tsx'
export type { DiffBlockProps, DiffHunk, DiffBlockLabels } from './DiffBlock.tsx'
export { SearchBlock, DEFAULT_SEARCH_MAX_LINES } from './SearchBlock.tsx'
export type {
  SearchBlockProps,
  SearchMatchesBlockProps,
  SearchPathsBlockProps,
  SearchFileGroup,
  SearchBlockLineMatch,
  SearchBlockLabels,
} from './SearchBlock.tsx'
export { WebBlock } from './WebBlock.tsx'
export type {
  WebBlockProps,
  WebSearchBlockProps,
  WebFetchBlockProps,
  WebSourceView,
  WebBlockLabels,
} from './WebBlock.tsx'
// Upstream exports the file/link icon family from its root. It lives here so the root entry never
// reaches the ~57KB code-file artwork; WebBlock already imports it (UPSTREAM.md, assertLightweightRoot).
export { LinkIconMedium, LinkIconRegular, classifyLinkPath } from './LinkIcon.tsx'
export type { LinkIconKind, LinkIconProps } from './LinkIcon.tsx'
export { FileTypeIcon, classifyFileType, fileExtension } from './FileTypeIcon.tsx'
export type {
  CodeFileType,
  FileType,
  FileTypeIconProps,
  FileTypeKind,
  FileTypeProjectContext,
} from './FileTypeIcon.tsx'
// Upstream exports these from its root; they reach the Shiki highlighter (markdown/highlight.ts), which
// assertLightweightRoot keeps off the root entry. ReadBlock / DiffBlock are their in-package consumers.
export type { CodeToolbarLabels } from './CodeToolbar.tsx'
export { CODE_HIGHLIGHT_EXTENSIONS, languageForPath, useCodeHighlighter } from './code-highlighting.ts'
export type { CodeHighlighter, HighlightSpan } from './code-highlighting.ts'
