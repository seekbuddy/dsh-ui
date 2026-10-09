import type { Meta, StoryObj } from '@storybook/react-vite'
import { AliasPalette, FontScale, ShadowLevels } from './TokenPalette'

const meta = {
  title: '镜像层（上游同步）/主题/Token 色板',
  component: AliasPalette,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `\`@seekbuddy/dsh-ui/tokens.css\` 里的 \`--dsw-*\` 设计 token 一览：语义色 \`--dsw-alias-*\`（唯一合法消费层，共 107 个）、字体阶 \`--dsw-font-*\`、阴影 \`--dsw-shadow-lv1..3\`。上游同步件，值随 \`dsh-v0.2.0-rc.2\` 走，本仓库不改；色板在运行时从样式表枚举，不手抄，切右上角主题即见明暗两套值。

**什么时候用**：写组件 CSS / 内联样式选颜色、字号、阴影时来这里查名字；同步上游后核对总数是否仍为 107。
**什么时候不用**：不要消费 \`--dsw-static-*\` 底层色，不要把这里显示的当前值（\`#rrggbb\` / \`rgba\`）抄成字面量——它们只在当前主题下成立；插件内亦禁止复制 token 定义到自己的 CSS。
**可访问性**：色块本身 \`aria-hidden\`，名称与当前值是文字；总数行是 \`role="status"\`，与基线不一致时除颜色外还有文字提示；字体阶每行用该 token 真实渲染示例文字。
**相关 token**：全部 \`--dsw-alias-*\`（分 bg- / label- / border- / state- / button- / 其他六组）、\`--dsw-font-*\` 复合 shorthand 与 \`--dsw-font-family\`、\`--dsw-shadow-lv1\` / \`lv2\` / \`lv3\`；页面自身只用 \`--dsw-alias-label-*\`、\`--dsw-alias-border-l1/l2\`、\`--dsw-alias-bg-base/layer-1\`、\`--dsw-alias-state-success-primary\` / \`state-warn-primary\` 排版。`,
      },
    },
  },
  args: { expected: 107 },
} satisfies Meta<typeof AliasPalette>
export default meta
type Story = StoryObj<typeof meta>

/** 全部 `--dsw-alias-*` 按六组出色板，顶部显示总数与验收基线比对；Controls 的 `only` 可只看一组。 */
export const Default: Story = {}

/** 字体阶：`--dsw-font-<size>-<n>` 及 strong 变体按字号降序，Markdown 专用字体单独一节；每行用该 shorthand 渲染。 */
export const Fonts: Story = {
  render: () => <FontScale />,
}

/** 阴影 `--dsw-shadow-lv1..3`：每级一张 `bg-layer-1` 卡片放在 `bg-base` 底上，切暗色看阴影是否仍可辨。 */
export const Shadows: Story = {
  render: () => <ShadowLevels />,
}
