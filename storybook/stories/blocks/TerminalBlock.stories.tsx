import type { Meta, StoryObj } from '@storybook/react-vite'
import { DEFAULT_TERMINAL_MAX_LINES, TerminalBlock } from '@seekbuddy/dsh-ui/blocks'
import { ansiOutput, invisibleOutput, longOutput, terminalLabels } from './fixtures.ts'

const meta = {
  title: '镜像层（上游同步）/Blocks/TerminalBlock',
  component: TerminalBlock,
  parameters: {
    docs: {
      description: {
        component: `shell 命令的终端卡片：提示行（运行态点 + 工作目录 + 命令）、可选的状态 Pill（信号 / 非零退出码）、复制按钮，以及解析过 ANSI 转义的输出区。输出超过 \`maxLines\`（默认 \`DEFAULT_TERMINAL_MAX_LINES\` = ${DEFAULT_TERMINAL_MAX_LINES}）时按"头 ${Math.ceil(DEFAULT_TERMINAL_MAX_LINES / 2)} 行 + 尾 ${DEFAULT_TERMINAL_MAX_LINES - Math.ceil(DEFAULT_TERMINAL_MAX_LINES / 2)} 行"折叠中间。上游同步件，源码不改。

**什么时候用**：bash / 脚本类工具的结果——有一条命令、一个工作目录、一段可能带颜色的输出和退出状态。
**什么时候不用**：文件内容用 \`ReadBlock\`（带行号）；结构化 JSON 用 \`JsonTree\`；纯代码片段用 \`/markdown\` 的 \`CodeBlock\`。
**可访问性**：运行态圆点是 \`StateDot\`（自身 \`aria-hidden\`），旁边的 \`labels.running\` / \`done\` / \`failed\` 文字才是可感知状态。折叠按钮带 \`aria-expanded\`，可访问名来自 \`labels.expandAria(hidden)\` / \`collapseAria\`。复制按钮复制的是原始输出（含转义），不是提示行。基础 16 色映射到主题 token（如红 → \`--dsw-alias-state-error-primary\`），256 色 / 真彩色按字面 rgb 渲染，\`blink\` 不复现。
**相关 token**：\`--dsw-alias-markdown-code-block\`（卡片底）、\`--dsw-alias-border-l2\`（分隔线）、\`--dsw-alias-label-primary\` / \`secondary\` / \`tertiary\`、\`--dsw-alias-state-error-primary\`、\`--dsw-font-markdown-code-block\`、\`--dsw-font-xs-13\`。`,
      },
    },
  },
  args: {
    command: 'bun test',
    cwd: '/Users/dev/dsh-ui',
    home: '/Users/dev',
    output: ansiOutput,
    exitCode: 0,
    labels: terminalLabels,
  },
  argTypes: { labels: { control: false } },
} satisfies Meta<typeof TerminalBlock>
export default meta
type Story = StoryObj<typeof meta>

/** 含 ANSI 颜色的输出：绿 / 红 / 黄 / 蓝 / 粗体 / 暗淡 / 下划线（源码里是 `\x1b[32m` 之类的转义）。退出码 0 不显示状态 Pill。 */
export const Default: Story = {}

/** 超过 16 行（30 行）：默认折叠，中间隐藏 14 行，点"展开"看全部。 */
export const LongOutputFolded: Story = {
  args: { command: 'find src -name "*.tsx"', output: longOutput },
}

/** 空输出：没有任何可见字符时显示 `labels.noOutput`，并且不出现复制按钮。 */
export const EmptyOutput: Story = {
  args: { command: 'touch .keep', output: '' },
}

/** 只有转义序列的输出（重置码 + OSC 窗口标题）：解析后没有可见字符，同样判定为"无输出"。 */
export const InvisibleOutput: Story = {
  args: { command: 'printf "\\e[0m\\e]0;title\\a"', output: invisibleOutput },
}

/** 运行中：只画提示行与蓝色转圈点，不画输出区，也没有复制按钮。 */
export const Running: Story = {
  args: { command: 'bun run dev', output: undefined, exitCode: undefined, running: true },
}

/** 非零退出码：状态 Pill 显示 `labels.exitCode(2)`，运行态变红并显示 `labels.failed`。 */
export const ExitCode: Story = {
  args: {
    command: 'bun run lint',
    output: '\x1b[31merror\x1b[0m: src/Tabs.tsx:12:3 未使用的变量 `value`\n',
    exitCode: 2,
  },
}

/** 被信号终止：`signal` 优先于 `exitCode` 决定 Pill 文案。 */
export const Signal: Story = {
  args: { command: 'bun run start:api', output: '正在监听 :9101 …\n', exitCode: 137, signal: 'SIGKILL' },
}

/** 多行命令：每行一个提示行；只有第一行带工作目录标签，后续行是裸 `$`。`cwd` 等于 `home` 时显示 `~`。 */
export const MultiLineCommand: Story = {
  args: {
    command: 'npm run build\nls dist',
    cwd: '/Users/dev',
    output: 'index.js\nblocks.js\nmarkdown.js\ntokens.css\n',
  },
}

/** 没有 `cwd`：提示符退化为裸 `$`。 */
export const WithoutCwd: Story = {
  args: { cwd: undefined, home: undefined, output: 'ok\n' },
}

/**
 * 演示 `DEFAULT_TERMINAL_MAX_LINES`（当前值见卡片上方）：同一份 30 行输出，
 * 左侧用默认值，右侧把 `maxLines` 改成 6，可看到折叠位置随之改变；`Infinity` 则完全不折叠。
 */
export const MaxLines: Story = {
  args: { command: 'find src -name "*.tsx"', output: longOutput },
  render: (args) => (
    <div style={{ display: 'grid', gap: 8 }}>
      <p style={{ margin: 0 }}>
        <code>DEFAULT_TERMINAL_MAX_LINES = {DEFAULT_TERMINAL_MAX_LINES}</code>
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <TerminalBlock {...args} maxLines={DEFAULT_TERMINAL_MAX_LINES} />
        <TerminalBlock {...args} maxLines={6} />
      </div>
    </div>
  ),
}

/** 组合样张：完成 / 失败 / 信号 / 运行中 / 空输出并排。 */
export const AllStates: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 0, maxWidth: 720 }}>
      <TerminalBlock {...args} />
      <TerminalBlock {...args} command="bun run lint" output="error: 未使用的变量\n" exitCode={2} />
      <TerminalBlock {...args} command="bun run start:api" output="监听中 …\n" exitCode={137} signal="SIGKILL" />
      <TerminalBlock {...args} command="bun run dev" output={undefined} exitCode={undefined} running />
      <TerminalBlock {...args} command="touch .keep" output="" />
    </div>
  ),
}
