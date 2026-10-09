import { useEffect } from 'react'
import type { Preview } from '@storybook/react-vite'
import '@seekbuddy/dsh-ui/tokens.css'
import './preview.css'

const preview: Preview = {
  tags: ['autodocs'],
  globalTypes: {
    theme: {
      description: '主题（切 body[data-ds-dark-theme]，与本包 theme 运行时同一开关）',
      toolbar: { title: '主题', icon: 'mirror', items: ['light', 'dark'], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: 'light' },
  parameters: {
    controls: { expanded: true },
    docs: { toc: true },
    backgrounds: { disable: true },
  },
  decorators: [
    (Story, { globals }) => {
      const dark = globals['theme'] === 'dark'
      useEffect(() => {
        document.body.toggleAttribute('data-ds-dark-theme', dark)
        document.documentElement.toggleAttribute('data-ds-dark-theme', dark)
      }, [dark])
      return <Story />
    },
  ],
}
export default preview
