import { useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Input, writeClipboard } from '@seekbuddy/dsh-ui'
import * as icons from '@seekbuddy/dsh-ui/icons'
import type { IconProps, ReferenceIconKind } from '@seekbuddy/dsh-ui/icons'

/** `/icons` 入口：188 个 `Icon*`（94 个图形 × Regular / Medium 两档粗细）+ 权限 / 引用 / 插件图形，一页看全。 */
const meta = {
  title: '镜像层（上游同步）/Icons',
  // 一页多图标：props 表用 IconSearchOutlineRegular 代表——所有 Icon* 共用同一份 IconProps { size?, className? }
  component: icons.IconSearchOutlineRegular,
  parameters: {
    docs: {
      description: {
        component: `\`@seekbuddy/dsh-ui/icons\` 入口（dsh-v0.1.7-rc.2）：188 个 \`Icon*\` 产品图标、6 个 \`PermissionIcon*\` 权限图标、\`ReferenceIconRegular\` / \`ReferenceIconMedium\` 行内引用图标、5 个 \`PluginArtwork*\` 插件图形、2 个 \`GuideArtwork*\` 引导图形、以及 \`SHIELD_OUTLINE_PATH\` / \`ICON_REGULAR_STROKE\` / \`ICON_MEDIUM_STROKE\` 常量。随上游同步，源码不改。产品图标颜色跟随所在元素的 \`color\`（\`currentColor\`），切主题不需要额外处理；\`PluginArtwork*\` 是自带配色的插件卡片图形，例外。

**命名（0.1.7 起）**：\`Icon<图形><Outline|Fill>?<Regular|Medium>\`——后缀是**描边粗细**不是尺寸：\`Regular\` 1px（\`ICON_REGULAR_STROKE\`，即 0.1.5 及以前的外观），\`Medium\` 1.3px（\`ICON_MEDIUM_STROKE\`，强调位）。尺寸改走 \`size\` prop，默认是该图形的绘制尺寸（多数 16，箭头类 14，格子里标注的就是它）。0.1.5 的 \`IconCheckOutline14\` / \`IconCheckOutline16\` 合并为同一个 \`IconCheckOutlineRegular\`，原先 14 档要写 \`size={14}\`。

**什么时候用**：需要一个与 dsh 视觉一致的功能图标（导航、按钮前置、状态提示、树形缩进）。先按**语义**选图形（"搜索"就用 \`IconSearchOutlineRegular\`），默认用 \`Regular\`；按钮里的主操作或需要压住视觉重量时再换 \`Medium\`。
**什么时候不用**：不要因为某个图标"看起来接近"就拿错误语义复用（例如用 \`IconRightUpOutlineRegular\` 表示"上传"）；上游未提供的业务图标放插件自己的资源里，不要往本包加。
**可访问性**：\`Icon*\` 组件**不带**任何 aria 属性——图标默认是装饰性的，与文字并列时给它 \`aria-hidden\`；当图标是按钮 / 链接**唯一的操作提示**时，可访问名放在 \`button\` / \`a\` 上（\`aria-label\`），不熟悉的图标再配 \`Tooltip\`。\`ReferenceIcon*\` 自带 \`aria-hidden\`，旁边必须有可感知文字（字标 / 引用名）。
**相关 token**：图标本身不引用 token，颜色走 \`currentColor\`；本页网格只用了 \`--dsw-alias-bg-layer-1\`、\`--dsw-alias-border-l1\`、\`--dsw-alias-label-secondary\`、\`--dsw-alias-label-tertiary\`、\`--dsw-alias-state-success-primary\`、\`--dsw-alias-state-error-primary\` 做布局与反馈。

**IconProps**：\`{ size?: number; className?: string }\`——\`size\` 是正方形边长 px（默认为图形的绘制尺寸），\`className\` 只用于布局落位。点击下面任一格子即可复制它的导入语句。`,
      },
    },
  },
  args: { size: 24 },
  argTypes: { className: { control: 'text' } },
} satisfies Meta<typeof icons.IconSearchOutlineRegular>
export default meta
type Story = StoryObj<typeof meta>

// ---------- 图标清单（运行时从入口枚举，不手抄） ----------

type IconComponent = (props: IconProps) => ReactNode

/** 186 个 `Icon*` 导出（ESM 命名空间对象的键按字母序枚举）。 */
const ICON_ENTRIES: ReadonlyArray<readonly [string, IconComponent]> = Object.entries(icons).filter(
  (entry): entry is [string, IconComponent] => entry[0].startsWith('Icon') && typeof entry[1] === 'function',
)

/** 图标总数，与 catalog.md 的清单一致（186）。辅助常量不 export，否则 CSF 会把它们当 story。 */
const ICON_COUNT = ICON_ENTRIES.length

/** 按图形聚合：`IconCheckOutline` → { Regular, Medium }。 */
const GLYPHS: ReadonlyArray<{ glyph: string; regular: IconComponent; medium: IconComponent }> = ICON_ENTRIES.flatMap(
  ([name, Icon]) => {
    if (!name.endsWith('Regular')) return []
    const glyph = name.slice(0, -'Regular'.length)
    const medium = ICON_ENTRIES.find(([other]) => other === `${glyph}Medium`)?.[1]
    return medium ? [{ glyph, regular: Icon, medium }] : []
  },
)

/** 复制到剪贴板的导入语句。 */
const importStatementOf = (name: string): string => `import { ${name} } from '@seekbuddy/dsh-ui/icons'`

// ---------- 布局样式（只做布局，颜色一律 --dsw-alias-*） ----------

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(168px, 1fr))',
  gap: 8,
}

const cellStyle: CSSProperties = {
  display: 'grid',
  justifyItems: 'center',
  gap: 6,
  padding: '14px 8px 10px',
  font: 'inherit',
  color: 'inherit',
  cursor: 'pointer',
  background: 'var(--dsw-alias-bg-layer-1)',
  border: '1px solid var(--dsw-alias-border-l1)',
  borderRadius: 8,
}

const glyphBoxStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
}

const nameStyle: CSSProperties = {
  fontSize: 11,
  lineHeight: 1.3,
  wordBreak: 'break-all',
  textAlign: 'center',
  color: 'var(--dsw-alias-label-secondary)',
}

const metaStyle: CSSProperties = { fontSize: 11, color: 'var(--dsw-alias-label-tertiary)' }

const rowStyle: CSSProperties = { display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }

const captionStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 12,
  color: 'var(--dsw-alias-label-secondary)',
}

// ---------- 网格 ----------

type CopyState = { name: string; ok: boolean } | null

/** 读出图标实际渲染的默认尺寸（名字里不再带尺寸，只能量）。 */
function useDrawnSize() {
  const ref = useRef<HTMLSpanElement>(null)
  const [size, setSize] = useState('?')
  useLayoutEffect(() => {
    const svg = ref.current?.querySelector('svg')
    if (svg) setSize(`${svg.getAttribute('width') ?? '?'}×${svg.getAttribute('height') ?? '?'}`)
  }, [])
  return { ref, size }
}

/** 单个图形格：Regular 与 Medium 并排，下方图形名与默认尺寸；点两个图标分别复制各自的导入语句。 */
function GlyphCell({
  glyph,
  regular: Regular,
  medium: Medium,
  copy,
  copied,
}: {
  glyph: string
  regular: IconComponent
  medium: IconComponent
  copy: (n: string) => void
  copied: CopyState
}) {
  const { ref, size } = useDrawnSize()
  const feedback =
    copied?.name.startsWith(glyph) && copied.name.slice(glyph.length).match(/^(Regular|Medium)$/) ? copied : null
  const weightButton = (weight: 'Regular' | 'Medium', Icon: IconComponent) => (
    <button
      type="button"
      style={weightStyle}
      onClick={() => copy(`${glyph}${weight}`)}
      aria-label={`复制 ${glyph}${weight} 的导入语句`}
      title={weight}
    >
      <Icon />
    </button>
  )
  return (
    <div style={cellStyle}>
      <span ref={ref} style={glyphBoxStyle} aria-hidden>
        {weightButton('Regular', Regular)}
        {weightButton('Medium', Medium)}
      </span>
      <span style={nameStyle}>{glyph}</span>
      <span
        style={{
          ...metaStyle,
          ...(feedback
            ? { color: feedback.ok ? 'var(--dsw-alias-state-success-primary)' : 'var(--dsw-alias-state-error-primary)' }
            : null),
        }}
      >
        {feedback ? (feedback.ok ? `已复制 ${feedback.name.slice(glyph.length)}` : '复制失败') : size}
      </span>
    </div>
  )
}

const weightStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  padding: 0,
  font: 'inherit',
  color: 'inherit',
  cursor: 'pointer',
  background: 'transparent',
  border: 0,
  borderRadius: 6,
}

/** 复制反馈 1.5s 后自动清除；`writeClipboard` 返回 false（无权限 / iframe 策略）时显示"复制失败"。 */
function useCopyImport() {
  const [copied, setCopied] = useState<CopyState>(null)
  const copy = (name: string) => {
    void writeClipboard(importStatementOf(name)).then((ok) => {
      setCopied({ name, ok })
      setTimeout(() => setCopied((cur) => (cur?.name === name ? null : cur)), 1500)
    })
  }
  return { copied, copy }
}

/** 默认：全部图形网格（每格 Regular 左、Medium 右），顶部显示总数并可按名称筛选；点击图标复制对应导入语句。 */
export const Default: Story = {
  render: () => {
    const [query, setQuery] = useState('')
    const { copied, copy } = useCopyImport()
    const q = query.trim().toLowerCase()
    const glyphs = q ? GLYPHS.filter(({ glyph }) => glyph.toLowerCase().includes(q)) : GLYPHS
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ ...rowStyle, justifyContent: 'space-between' }}>
          <span style={captionStyle}>
            <code>Icon*</code> 共 {ICON_COUNT} 个 = {GLYPHS.length} 个图形 × 2 档粗细
            {q ? `，匹配 ${glyphs.length} 个图形` : ''}
          </span>
          <Input
            style={{ width: 240 }}
            icon={<icons.IconSearchOutlineRegular />}
            placeholder="按名称筛选"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <span role="status" style={{ ...metaStyle, minHeight: 14 }}>
          {copied
            ? copied.ok
              ? `已复制 ${importStatementOf(copied.name)}`
              : `复制 ${copied.name} 失败`
            : '点击图标复制导入语句（每格左 Regular、右 Medium）'}
        </span>
        {glyphs.length > 0 ? (
          <div style={gridStyle}>
            {glyphs.map(({ glyph, regular, medium }) => (
              <GlyphCell key={glyph} glyph={glyph} regular={regular} medium={medium} copy={copy} copied={copied} />
            ))}
          </div>
        ) : (
          <span style={metaStyle}>没有匹配的图标</span>
        )}
      </div>
    )
  },
}

/** Regular（1px）与 Medium（1.3px）同尺寸对照：粗细是唯一差别；16px 以下 Medium 更稳，大尺寸 Regular 更轻。 */
export const Weights: Story = {
  render: () => {
    const sample = [
      icons.IconSearchOutlineRegular,
      icons.IconSearchOutlineMedium,
      icons.IconSettingsOutlineRegular,
      icons.IconSettingsOutlineMedium,
      icons.IconCheckOutlineRegular,
      icons.IconCheckOutlineMedium,
    ] as const
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        {[14, 16, 20, 24].map((size) => (
          <div key={size} style={rowStyle}>
            <span style={{ ...metaStyle, width: 40 }}>{size}px</span>
            {sample.map((Icon, index) => (
              <span key={index} style={captionStyle}>
                <Icon size={size} />
                {index % 2 === 0 ? 'Regular' : 'Medium'}
              </span>
            ))}
          </div>
        ))}
        <span style={metaStyle}>
          ICON_REGULAR_STROKE = {icons.ICON_REGULAR_STROKE} · ICON_MEDIUM_STROKE = {icons.ICON_MEDIUM_STROKE}
        </span>
      </div>
    )
  },
}

/** `size` 缩放与 `currentColor`：同一图标按 args.size 渲染，颜色只由所在元素的 `color` 决定（这里用 state token 演示）。 */
export const Sizing: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={rowStyle}>
        {[12, 16, 20, 24, args.size ?? 32].map((size) => (
          <span key={size} style={captionStyle}>
            <icons.IconSparkleRegular size={size} />
            {size}px
          </span>
        ))}
      </div>
      <div style={rowStyle}>
        <span style={{ ...captionStyle, color: 'var(--dsw-alias-state-success-primary)' }}>
          <icons.IconCheckOutlineRegular /> 成功色
        </span>
        <span style={{ ...captionStyle, color: 'var(--dsw-alias-state-warn-primary)' }}>
          <icons.IconWarningOutlineRegular size={14} /> 警告色
        </span>
        <span style={{ ...captionStyle, color: 'var(--dsw-alias-state-error-primary)' }}>
          <icons.IconCloseFillRegular /> 错误色
        </span>
        <span style={{ ...captionStyle, color: 'var(--dsw-alias-brand-primary)' }}>
          <icons.IconSkillOutlineRegular /> 品牌色
        </span>
      </div>
    </div>
  ),
}

/** 可访问性两种写法：与文字并列时图标 `aria-hidden`；图标是唯一操作提示时 `aria-label` 放在 button 上。 */
export const Accessibility: Story = {
  render: () => (
    <div style={rowStyle}>
      <Button variant="outline" icon={<icons.IconPlusOutlineRegular aria-hidden />}>
        新建会话
      </Button>
      <Button variant="ghost" aria-label="刷新" icon={<icons.IconRefreshOutlineRegular />} />
      <Button variant="ghost" aria-label="更多操作" icon={<icons.IconEllipsisOutlineRegular />} />
      <Button variant="toolbar" size="sm" aria-label="复制" icon={<icons.IconCopyOutlineRegular />} />
    </div>
  ),
}

const REFERENCE_KINDS: ReadonlyArray<{ kind: ReferenceIconKind; label: string }> = [
  { kind: 'session', label: '会话引用' },
  { kind: 'file', label: '文件引用' },
  { kind: 'folder', label: '目录引用' },
]

/** `ReferenceIconRegular` / `ReferenceIconMedium` 三种 `kind`：`session` 用新建会话图形、`file` 复用浏览图形、`folder` 复用合上的文件夹；自带 `aria-hidden`，旁边要有引用名。 */
export const ReferenceIcon: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {(['Regular', 'Medium'] as const).map((weight) => {
        const Icon = weight === 'Regular' ? icons.ReferenceIconRegular : icons.ReferenceIconMedium
        return (
          <div key={weight} style={rowStyle}>
            <span style={{ ...metaStyle, width: 56 }}>{weight}</span>
            {REFERENCE_KINDS.map(({ kind, label }) => (
              <span key={kind} style={captionStyle}>
                <Icon kind={kind} />
                {label}
                <code style={metaStyle}>kind=&quot;{kind}&quot;</code>
              </span>
            ))}
          </div>
        )
      })}
    </div>
  ),
}

/** 权限模式图标：只读 / 工作区可写 / 完全访问，各有 Regular / Medium；与 dsh 权限预设选择器同一套图形，`size` 默认 16。 */
export const PermissionIcons: Story = {
  render: () => {
    const rows = [
      ['只读', icons.PermissionIconReadOnlyRegular, icons.PermissionIconReadOnlyMedium],
      ['工作区可写', icons.PermissionIconWorkspaceWriteRegular, icons.PermissionIconWorkspaceWriteMedium],
      ['完全访问', icons.PermissionIconFullAccessRegular, icons.PermissionIconFullAccessMedium],
    ] as const
    return (
      <div style={{ display: 'grid', gap: 10 }}>
        {rows.map(([label, Regular, Medium]) => (
          <div key={label} style={rowStyle}>
            <span style={captionStyle}>
              <Regular /> <Medium /> {label}
            </span>
          </div>
        ))}
        <span style={metaStyle}>
          SHIELD_OUTLINE_PATH 长 {icons.SHIELD_OUTLINE_PATH.length} 字符（组合盾形图标共用的外轮廓）
        </span>
      </div>
    )
  },
}

/** 插件图形：dsh 插件清单卡片上的 36×36 彩色图形，**不**跟随 `currentColor`；没有自己图形的插件用 `PluginArtworkDefault`。 */
export const PluginArtwork: Story = {
  render: () => {
    const artworks = [
      ['PluginArtworkTerminal', icons.PluginArtworkTerminal],
      ['PluginArtworkLoop', icons.PluginArtworkLoop],
      ['PluginArtworkSubagent', icons.PluginArtworkSubagent],
      ['PluginArtworkSearch', icons.PluginArtworkSearch],
      ['PluginArtworkDefault', icons.PluginArtworkDefault],
    ] as const
    return (
      <div style={rowStyle}>
        {artworks.map(([name, Artwork]) => (
          <span key={name} style={{ ...captionStyle, flexDirection: 'column' }}>
            <Artwork />
            <code style={metaStyle}>{name}</code>
          </span>
        ))}
      </div>
    )
  },
}

/** 引导图形：侧栏"新手引导"条目上的 36×36 固定配色图形（浏览器 / 文件两种），**不**跟随 `currentColor`，`aria-hidden`。`dsh-v0.1.7-rc.2` 新增。 */
export const GuideArtwork: Story = {
  render: () => {
    const artworks = [
      ['GuideArtworkBrowser', icons.GuideArtworkBrowser],
      ['GuideArtworkFiles', icons.GuideArtworkFiles],
    ] as const
    return (
      <div style={rowStyle}>
        {artworks.map(([name, Artwork]) => (
          <span key={name} style={{ ...captionStyle, flexDirection: 'column' }}>
            <Artwork />
            <code style={metaStyle}>{name}</code>
          </span>
        ))}
      </div>
    )
  },
}
