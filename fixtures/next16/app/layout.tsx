import type { ReactNode } from 'react'
import { THEME_BOOTSTRAP_SCRIPT } from '@seekbuddy/dsh-ui/theme/bootstrap'
import '@seekbuddy/dsh-ui/tokens.css'
import '@seekbuddy/dsh-ui/katex.css'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
        {children}
      </body>
    </html>
  )
}
