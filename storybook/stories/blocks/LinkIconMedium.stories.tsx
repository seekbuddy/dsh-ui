import type { Meta, StoryObj } from '@storybook/react-vite'
import { LinkIconMedium, LinkIconRegular } from '@seekbuddy/dsh-ui/blocks'
import type { LinkIconKind } from '@seekbuddy/dsh-ui/blocks'

const KINDS: readonly LinkIconKind[] = ['url', 'folder', 'code', 'image', 'document', 'other']

const meta = {
  title: '镜像层（上游同步）/Blocks/LinkIcon/Medium',
  component: LinkIconMedium,
  parameters: {
    docs: {
      description: {
        component: `\`LinkIconRegular\` 的 1.3px 描边版，接口完全相同（\`kind\` / \`href\` / \`size\` / \`className\`）。完整说明、分类规则、站点标志见 [LinkIcon](?path=/docs/镜像层（上游同步）-blocks-linkicon--docs)。上游同步件（\`dsh-v0.1.7-rc.1\` 新增），源码不改。

**什么时候用**：链接文字是加粗 / 强调样式、或图标落在 16px 以上时，与文字的笔画粗细对齐。
**什么时候不用**：普通正文里的行内链接用 \`LinkIconRegular\`。
**可访问性**：纯装饰图形，可访问名来自链接文字。
**相关 token**：不引用 token，颜色走 \`currentColor\`；本页链接色用 \`--dsw-alias-link\`。`,
      },
    },
  },
  args: { kind: 'url' },
} satisfies Meta<typeof LinkIconMedium>
export default meta
type Story = StoryObj<typeof meta>

/** 默认 14px。 */
export const Default: Story = {}

/** Regular（上）与 Medium（下）逐类对照。 */
export const CompareWeights: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8, color: 'var(--dsw-alias-link)', font: 'var(--dsw-font-s-14)' }}>
      {[LinkIconRegular, LinkIconMedium].map((Icon, row) => (
        <div key={row} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <code style={{ width: 64, color: 'var(--dsw-alias-label-tertiary)' }}>
            {row === 0 ? 'Regular' : 'Medium'}
          </code>
          {KINDS.map((kind) => (
            <Icon key={kind} kind={kind} size={16} />
          ))}
        </div>
      ))}
    </div>
  ),
}
