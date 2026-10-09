import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@seekbuddy/dsh-ui'
import { IconPlusOutlineRegular } from '@seekbuddy/dsh-ui/icons'
import { Empty } from '@seekbuddy/dsh-ui/seekbuddy'

const meta = {
  title: 'SeekBuddy 扩展层/Empty',
  component: Empty,
  parameters: {
    docs: {
      description: {
        component: `页面或列表区域的**状态占位块**：一个 \`status\` 覆盖 Loading / Empty / Error 三态，固定"图标 / 标题 / 说明 / 操作区"四段。上游 primitives 没有 Empty / Result 类原语，各页面手写的形态容易分叉，所以收为扩展组件。

**什么时候用**：列表请求中 / 请求失败 / 无数据；筛选后无匹配；尚未开工的占位区块。**什么时候不用**：行内小提示（一句红字）直接写文字；按钮自身的 busy 态用 \`Button\` 的 icon 放 \`Spinner\`。

**只有一个回调**：\`onRetry\`，且只在 \`status="error"\` 时和 \`retryLabel\` 成对生效，渲染带刷新图标的 outline 按钮。空态的"新建"之类操作走 \`action\` 插槽，按钮与点击逻辑在调用方，组件不再包一层。**优先级由调用方判断**：目录页"已有数据时刷新只淡化列表、不整块 loading"这类逻辑本来就在调用方，组件不猜，只收一个 \`status\`。

**组件自决、不开放**：\`role\` / \`aria-live\` 按 status 固定（loading → \`role="status" aria-live="polite"\`，error → \`role="alert"\`，empty 不加）；错误态图标与标题固定 \`--dsw-alias-state-error-primary\`，说明仍是 tertiary 灰；图标 20px（loading 的 Spinner 也压到 20px）。**文案全部由调用方传入**（§4.3 i18n），组件不带任何默认字串。

**视觉与 token**：虚线框 \`--dsw-alias-border-l2\`，圆角 12px 与 Card 同值（styling.md §11），标题 \`--dsw-font-s-strong-14\` / \`--dsw-alias-label-primary\`，说明 \`--dsw-font-xs-13\` / \`--dsw-alias-label-tertiary\`（与上游设置页每行的说明文字同 token，上游是 12/18 字面量），默认图标同为 \`--dsw-alias-label-tertiary\`。\`minHeight\` 默认 240，让刷新 / 翻页切进状态时容器不跳（§4.2 布局稳定性）；\`bordered={false}\` 给全屏居中或已在框内的场景。

**入口**：server-safe（无 Hook），Next.js 服务端组件可从 \`@seekbuddy/dsh-ui/seekbuddy/empty\` 引入纯展示的 empty 态；\`onRetry\` 是函数，服务端组件传不进来，带刷新按钮的错误态只能在 Client Component 里用。`,
      },
    },
  },
  args: {
    status: 'empty',
    title: '还没有任务',
    description: '点右上角"新建"创建第一个定时任务。',
  },
  argTypes: {
    status: { control: 'inline-radio', options: ['loading', 'empty', 'error'] },
    icon: { control: false },
    action: { control: false },
    onRetry: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Empty>
export default meta
type Story = StoryObj<typeof meta>

/** 默认空态：搜索图标、标题、说明，虚线框 240px 高。切换明暗看虚线与灰阶。 */
export const Default: Story = {}

/** 三态并排：loading 是 `Spinner`（md / page）+ `role="status"`；error 是警告图标 + 红色标题 + `role="alert"`；empty 无角色。 */
export const Statuses: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      <Empty {...args} status="loading" title="正在加载任务…" description={undefined} minHeight={160} />
      <Empty {...args} status="empty" title="没有匹配结果" description="调整关键词或分类后再试。" minHeight={160} />
      <Empty {...args} status="error" title="加载失败" description="网络超时，请稍后再试。" minHeight={160} />
    </div>
  ),
}

/** 错误态 + `onRetry`：传了 `retryLabel` 与 `onRetry` 才出现刷新按钮，其余 status 下即使传了也不渲染。 */
export const WithRetry: Story = {
  args: {
    status: 'error',
    title: '连接器目录暂不可用',
    description: '控制面没有响应，稍后重试。',
    retryLabel: '重试',
    onRetry: () => undefined,
  },
}

/** 空态 + `action` 插槽：按钮与点击逻辑都在调用方；`action` 与刷新按钮同在操作区，先 action 后 retry。 */
export const WithAction: Story = {
  args: {
    action: (
      <Button variant="primary" size="sm" icon={<IconPlusOutlineRegular />}>
        新建任务
      </Button>
    ),
  },
}

/** `bordered={false}` + 自定 `minHeight`：全屏居中的会话检查、或已经在 Card 里的区域，不再画一层虚线。 */
export const Borderless: Story = {
  args: { status: 'loading', title: '正在检查会话…', description: undefined, bordered: false, minHeight: 320 },
}

/** `icon={null}` 去掉图标；也可传任意节点替换默认图标。 */
export const NoIcon: Story = {
  args: { icon: null, title: '运行记录尚未开放', description: undefined, minHeight: 120 },
}

/** 窄屏 / 长文案：标题与说明正常换行，说明限宽 36em；操作区可换行。 */
export const NarrowScreen: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    status: 'error',
    title: 'The catalog could not be loaded because the control plane did not answer in time',
    description: 'Check the instance connection and try again. If the problem persists, contact the workspace owner.',
    retryLabel: 'Retry loading the catalog',
    onRetry: () => undefined,
    action: (
      <Button variant="outline" size="sm">
        Open settings
      </Button>
    ),
  },
}
