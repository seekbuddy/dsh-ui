import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { DisclosureRow, Pill, StateDot } from '@seekbuddy/dsh-ui'
import type { DisclosureRowProps } from '@seekbuddy/dsh-ui'
import { IconFolderOpenOutlineRegular, IconCodeOutlineRegular } from '@seekbuddy/dsh-ui/icons'

/** 展开内容：左侧缩进 22px（16px leading + 6px 间距）与标题对齐。 */
function Body({ lines }: { lines: string[] }) {
  return (
    <div style={{ display: 'grid', gap: 2, padding: '2px 0 6px 22px', fontSize: 13, lineHeight: '20px' }}>
      {lines.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </div>
  )
}

/** 组合样张里每一行自己持有 open，互不影响。 */
function StatefulRow(props: Omit<DisclosureRowProps, 'open' | 'onToggle'> & { initialOpen?: boolean }) {
  const { initialOpen = false, ...rest } = props
  const [open, setOpen] = useState(initialOpen)
  return <DisclosureRow {...rest} open={open} onToggle={() => setOpen((o) => !o)} />
}

const meta = {
  title: '镜像层（上游同步）/DisclosureRow',
  component: DisclosureRow,
  parameters: {
    docs: {
      description: {
        component: `24px 高的折叠信息行：左侧 16px leading（图标 / chevron）+ 标题 + 可选的行内内容，展开后在行下方渲染 \`children\`。受控组件——\`open\` 由调用方持有，\`onToggle\` 只是请求切换。上游同步件，源码不改。

**什么时候用**：对话流里的紧凑工具行（tool call、步骤、文件变更）——一行标题，点开看细节；配合 \`StateDot\` 做 \`icon\` 时圆点保持 figma 定尺寸，不跟随字号缩放。
**什么时候不用**：整块内容区的展开 / 收起（设置分组、FAQ）用页面级布局；需要视图切换用扩展层 \`Tabs\`；不可展开的纯信息行直接 \`expandable={false}\`，leading 退化成静态图标。
**可访问性**：默认只有 leading 是 \`<button aria-expanded>\`，标题本身不可点；\`expandOnRowClick\` 打开后整行变成 \`role="button" tabIndex=0\`，Enter / 空格切换（此时 leading 退回 span，避免嵌套按钮）。\`previewChevron\`（默认跟随 \`expandable\`）让悬停时图标淡出、chevron 淡入作为"可展开"提示。\`collapsedContent\` 默认只在收起时显示，\`keepContentWhenOpen\` 让它展开后也留在行内。
**相关 token**：\`--dsw-alias-label-secondary\`（标题）、\`--dsw-alias-label-tertiary\`（leading）；行高与字号走 \`--dsh-content-font-delta\` / \`--dsh-content-font-size-secondary\`（宿主"字号"偏好发布的轴，本站没有宿主，取默认 24px / 13px）。`,
      },
    },
  },
  args: {
    icon: <IconFolderOpenOutlineRegular />,
    title: 'tool.call.bash · 运行 bun test',
    open: false,
    expandable: true,
    expandOnRowClick: false,
    keepContentWhenOpen: false,
    // onToggle 用 storybook/test 的 fn()：每次切换记录到 Actions 面板
    onToggle: fn(),
    children: <Body lines={['$ bun test', '12 pass · 0 fail · 38 expect() calls', '耗时 1.2s']} />,
  },
  argTypes: { icon: { control: false }, children: { control: false }, collapsedContent: { control: false } },
  // 受控：把 args.open 接到本地 state，Controls 改 open 也会生效
  render: (args) => {
    const [open, setOpen] = useState(args.open)
    useEffect(() => {
      setOpen(args.open)
    }, [args.open])
    return (
      <DisclosureRow
        {...args}
        open={open}
        onToggle={() => {
          args.onToggle()
          setOpen((o) => !o)
        }}
      />
    )
  },
} satisfies Meta<typeof DisclosureRow>
export default meta
type Story = StoryObj<typeof meta>

/** 收起：点左侧 leading 按钮展开；悬停时图标换成 chevron 提示可展开。 */
export const Default: Story = {}

/** 展开：leading 固定为 chevron，`children` 渲染在行下方。 */
export const Expanded: Story = { args: { open: true } }

/** 整行可点：`expandOnRowClick` 让整行成为 `role="button"`，键盘 Enter / 空格也能切换。 */
export const RowClick: Story = { args: { expandOnRowClick: true, title: '读取 src/index.ts（整行可点）' } }

/** 带操作区：`collapsedContent` 放在标题右侧的行内；`keepContentWhenOpen` 让它展开后也保留。行高只有 24px，操作用 24px 高的 `Pill`。 */
export const WithActions: Story = {
  args: {
    title: 'tool.call.edit · 修改 3 个文件',
    keepContentWhenOpen: true,
    collapsedContent: (
      <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 6 }}>
        <Pill onClick={() => {}}>复制</Pill>
        <Pill onClick={() => {}}>重跑</Pill>
      </span>
    ),
  },
}

/** 多行内容：展开区是任意 ReactNode，这里是五行输出。 */
export const MultiLine: Story = {
  args: {
    open: true,
    icon: <IconCodeOutlineRegular />,
    title: 'tool.call.bash · bun run typecheck',
    children: (
      <Body
        lines={[
          '$ turbo run typecheck',
          '• lint: 通过',
          '• typecheck: 通过',
          '• build: 通过',
          '4 个任务成功，耗时 6.8s',
        ]}
      />
    ),
  },
}

/** 不可展开：`expandable={false}`，leading 是静态图标，没有 chevron 与按钮语义。 */
export const NotExpandable: Story = { args: { expandable: false, title: '已跳过 · 无输出' } }

/** 以 `StateDot` 做 leading：圆点保持定尺寸（CSS 特判 `svg[data-state]`），旁边的标题就是它的可感知文字。 */
export const WithStateDot: Story = {
  args: { icon: <StateDot state="ongoing" />, title: '正在运行测试…' },
}

/** 组合样张：一列流式工具行，各自持有 open。 */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', width: 420 }}>
      <StatefulRow
        icon={<StateDot state="done" />}
        title="tool.call.bash · 运行 bun test"
        expandable
        initialOpen
        collapsedContent={
          <span style={{ marginLeft: 'auto' }}>
            <Pill onClick={() => {}}>重跑</Pill>
          </span>
        }
      >
        <Body lines={['12 pass · 0 fail']} />
      </StatefulRow>
      <StatefulRow
        icon={<StateDot state="ongoing" />}
        title="tool.call.edit · 修改 src/App.tsx"
        expandable
        expandOnRowClick
      >
        <Body lines={['+ 12 行', '− 3 行']} />
      </StatefulRow>
      <StatefulRow icon={<StateDot state="warning" />} title="需要你确认：写入 .env" expandable>
        <Body lines={['文件已存在，是否覆盖？']} />
      </StatefulRow>
      <StatefulRow icon={<StateDot state="error" />} title="tool.call.bash · 退出码 1" expandable={false} />
    </div>
  ),
}
