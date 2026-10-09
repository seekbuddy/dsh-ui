import { fileURLToPath } from 'node:url'
import type { StorybookConfig } from '@storybook/react-vite'

// 直接吃仓库根目录的 TS 源码（而不是 dist）：react-docgen-typescript 需要类型源才能出 props 表，
// Vite 顺手编译 .module.css。tokens.css 用构建聚合产物，与消费者拿到的一致。
const ui = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url))
const repoRoot = fileURLToPath(new URL('../..', import.meta.url))

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  core: { disableTelemetry: true },
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.tsx'],
  addons: ['@storybook/addon-docs'],
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      tsconfigPath: fileURLToPath(new URL('../tsconfig.json', import.meta.url)),
      // 组件源码在本目录之外，插件默认的 include（相对 cwd 的 **/**.tsx）匹不到，必须显式加进来
      include: ['**/**.tsx', '../src/**/*.tsx'],
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      // 只列组件自己声明的 props，把 ButtonHTMLAttributes 之类的几百个原生属性折掉
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  viteFinal: (cfg) => ({
    ...cfg,
    resolve: {
      ...cfg.resolve,
      dedupe: ['react', 'react-dom'],
      alias: [
        { find: /^@seekbuddy\/dsh-ui\/tokens\.css$/, replacement: ui('dist/tokens.css') },
        { find: /^@seekbuddy\/dsh-ui\/katex\.css$/, replacement: ui('dist/katex.css') },
        { find: /^@seekbuddy\/dsh-ui\/blocks$/, replacement: ui('src/blocks.ts') },
        { find: /^@seekbuddy\/dsh-ui\/markdown$/, replacement: ui('src/markdown.ts') },
        { find: /^@seekbuddy\/dsh-ui\/seekbuddy\/card$/, replacement: ui('src/seekbuddy/Card.tsx') },
        { find: /^@seekbuddy\/dsh-ui\/seekbuddy\/empty$/, replacement: ui('src/seekbuddy/Empty.tsx') },
        { find: /^@seekbuddy\/dsh-ui\/seekbuddy\/spinner$/, replacement: ui('src/seekbuddy/Spinner.tsx') },
        { find: /^@seekbuddy\/dsh-ui\/seekbuddy\/tabs$/, replacement: ui('src/seekbuddy/Tabs.tsx') },
        { find: /^@seekbuddy\/dsh-ui\/seekbuddy\/timeline$/, replacement: ui('src/seekbuddy/Timeline.tsx') },
        { find: /^@seekbuddy\/dsh-ui\/seekbuddy$/, replacement: ui('src/seekbuddy/index.ts') },
        { find: /^@seekbuddy\/dsh-ui\/icons$/, replacement: ui('src/icons.ts') },
        { find: /^@seekbuddy\/dsh-ui\/theme\/bootstrap$/, replacement: ui('src/theme-bootstrap.ts') },
        { find: /^@seekbuddy\/dsh-ui\/theme$/, replacement: ui('src/theme.ts') },
        { find: /^@seekbuddy\/dsh-ui$/, replacement: ui('src/index.ts') },
      ],
    },
    server: { ...cfg.server, fs: { ...cfg.server?.fs, allow: [repoRoot] } },
  }),
}
export default config
