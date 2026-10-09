import { useMemo, useState } from 'react'
import { collectCustomPropertyNames, useTokenValues } from './token-utils'

const ALIAS_PREFIX = '--dsw-alias-'

/** 色板分组：按 token 名的第二段分，`其他` 收剩余的 brand- / interactive- / markdown- / scrollbar- / toast- / tooltip-。 */
export const ALIAS_GROUPS = [
  { key: 'bg', label: '背景 bg-', prefix: `${ALIAS_PREFIX}bg-` },
  { key: 'label', label: '文字 label-', prefix: `${ALIAS_PREFIX}label-` },
  { key: 'border', label: '边框 border-', prefix: `${ALIAS_PREFIX}border-` },
  { key: 'state', label: '状态 state-', prefix: `${ALIAS_PREFIX}state-` },
  { key: 'button', label: '按钮 button-', prefix: `${ALIAS_PREFIX}button-` },
  { key: 'other', label: '其他', prefix: '' },
] as const

export type AliasGroupKey = (typeof ALIAS_GROUPS)[number]['key']

const groupOf = (name: string): AliasGroupKey =>
  ALIAS_GROUPS.find((group) => group.prefix !== '' && name.startsWith(group.prefix))?.key ?? 'other'

const captionStyle = {
  font: 'var(--dsw-font-xxs-12)',
  color: 'var(--dsw-alias-label-tertiary)',
  wordBreak: 'break-all',
} as const

const headingStyle = {
  margin: 0,
  font: 'var(--dsw-font-s-strong-14)',
  color: 'var(--dsw-alias-label-primary)',
} as const

function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <li style={{ display: 'grid', gap: 6, minWidth: 0 }}>
      <div
        aria-hidden
        style={{
          height: 48,
          borderRadius: 8,
          background: `var(${name})`,
          border: '1px solid var(--dsw-alias-border-l2)',
        }}
      />
      <code
        style={{
          font: 'var(--dsw-font-xxs-strong-12)',
          color: 'var(--dsw-alias-label-primary)',
          wordBreak: 'break-all',
        }}
      >
        {name.slice(ALIAS_PREFIX.length)}
      </code>
      <span style={captionStyle}>{value || '（未定义）'}</span>
    </li>
  )
}

export interface AliasPaletteProps {
  /** 验收基线：与同步上游时登记的数量比对，不一致时用警示色标出。 */
  expected?: number
  /** 只显示某一分组；不传显示全部分组。 */
  only?: AliasGroupKey
}

/** 运行时枚举 `--dsw-alias-*`，按分组出色板；切工具栏主题会重读当前值。 */
export function AliasPalette({ expected = 78, only }: AliasPaletteProps) {
  const [names] = useState(() => collectCustomPropertyNames(ALIAS_PREFIX))
  const values = useTokenValues(names)
  const grouped = useMemo(() => {
    const map = new Map<AliasGroupKey, string[]>(ALIAS_GROUPS.map((group) => [group.key, []]))
    for (const name of names) map.get(groupOf(name))?.push(name)
    return map
  }, [names])
  const matches = names.length === expected
  const visibleGroups = ALIAS_GROUPS.filter((group) => only === undefined || group.key === only)

  return (
    <div style={{ display: 'grid', gap: 24, color: 'var(--dsw-alias-label-primary)', font: 'var(--dsw-font-s-14)' }}>
      <p role="status" style={{ margin: 0, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'baseline' }}>
        <span>
          共 <strong>{names.length}</strong> 个 <code>--dsw-alias-*</code> token
        </span>
        <span
          style={{
            color: matches ? 'var(--dsw-alias-state-success-primary)' : 'var(--dsw-alias-state-warn-primary)',
          }}
        >
          {matches ? `与验收基线 ${expected} 一致` : `与验收基线 ${expected} 不一致，请复核 spec §7`}
        </span>
      </p>
      {visibleGroups.map((group) => {
        const items = grouped.get(group.key) ?? []
        const headingId = `alias-group-${group.key}`
        return (
          <section key={group.key} aria-labelledby={headingId} style={{ display: 'grid', gap: 12 }}>
            <h3 id={headingId} style={headingStyle}>
              {group.label}
              <span style={{ ...captionStyle, marginLeft: 8 }}>{items.length} 个</span>
            </h3>
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'grid',
                gap: 16,
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              }}
            >
              {items.map((name) => (
                <Swatch key={name} name={name} value={values[name] ?? ''} />
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

const FONT_PREFIX = '--dsw-font-'
const FONT_PART = /-(font-family|font-size|font-style|font-weight|line-height)$/
const SAMPLE_TEXT = 'SeekBuddy 智能体工作台 — Quick brown fox 0123456789'
const FAMILY_NAMES = [`${FONT_PREFIX}family`]

function isFontShorthand(name: string): boolean {
  return name !== `${FONT_PREFIX}family` && !FONT_PART.test(name)
}

const fontSize = (name: string): number => Number(/-(\d+)$/.exec(name)?.[1] ?? 0)

function FontRow({ name, value }: { name: string; value: string }) {
  return (
    <li style={{ display: 'grid', gap: 4, paddingBottom: 12, borderBottom: '1px solid var(--dsw-alias-border-l1)' }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'baseline' }}>
        <code style={{ font: 'var(--dsw-font-xxs-strong-12)', color: 'var(--dsw-alias-label-primary)' }}>{name}</code>
        <span
          style={{ ...captionStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}
        >
          {value}
        </span>
      </div>
      <p style={{ margin: 0, font: `var(${name})`, color: 'var(--dsw-alias-label-primary)' }}>{SAMPLE_TEXT}</p>
    </li>
  )
}

/** 字体阶：只列复合 shorthand（如 `--dsw-font-s-14`），每个用该 font 渲染一行示例文字。 */
export function FontScale() {
  const [names] = useState(() => collectCustomPropertyNames(FONT_PREFIX).filter(isFontShorthand))
  const values = useTokenValues(names)
  const scale = names
    .filter((name) => !name.startsWith(`${FONT_PREFIX}markdown-`))
    .sort((a, b) => fontSize(b) - fontSize(a) || a.localeCompare(b))
  const markdown = names.filter((name) => name.startsWith(`${FONT_PREFIX}markdown-`))
  const family = useTokenValues(FAMILY_NAMES)

  const list = (items: string[]) => (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 12 }}>
      {items.map((name) => (
        <FontRow key={name} name={name} value={values[name] ?? ''} />
      ))}
    </ul>
  )

  return (
    <div style={{ display: 'grid', gap: 24, color: 'var(--dsw-alias-label-primary)', font: 'var(--dsw-font-s-14)' }}>
      <p style={{ margin: 0 }}>
        共 <strong>{names.length}</strong> 个字体 shorthand；字体族 <code>--dsw-font-family</code> =
        <span style={captionStyle}> {family[`${FONT_PREFIX}family`]}</span>
      </p>
      <section aria-labelledby="font-scale" style={{ display: 'grid', gap: 12 }}>
        <h3 id="font-scale" style={headingStyle}>
          尺寸阶（{scale.length} 个）
        </h3>
        {list(scale)}
      </section>
      <section aria-labelledby="font-markdown" style={{ display: 'grid', gap: 12 }}>
        <h3 id="font-markdown" style={headingStyle}>
          Markdown 专用（{markdown.length} 个）
        </h3>
        {list(markdown)}
      </section>
    </div>
  )
}

const SHADOW_LEVEL = /^--dsw-shadow-lv\d$/

/** 阴影层级 `--dsw-shadow-lv1..3`，每级一张卡片。 */
export function ShadowLevels() {
  const [names] = useState(() => collectCustomPropertyNames('--dsw-shadow-').filter((name) => SHADOW_LEVEL.test(name)))
  const values = useTokenValues(names)
  return (
    <ul
      style={{
        listStyle: 'none',
        margin: 0,
        padding: 24,
        display: 'grid',
        gap: 24,
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        background: 'var(--dsw-alias-bg-base)',
        borderRadius: 12,
      }}
    >
      {names.map((name) => (
        <li
          key={name}
          style={{
            display: 'grid',
            gap: 8,
            padding: 16,
            borderRadius: 12,
            background: 'var(--dsw-alias-bg-layer-1)',
            border: '1px solid var(--dsw-alias-border-l1)',
            boxShadow: `var(${name})`,
            color: 'var(--dsw-alias-label-primary)',
          }}
        >
          <code style={{ font: 'var(--dsw-font-s-strong-14)' }}>{name}</code>
          <span style={captionStyle}>{values[name] ?? ''}</span>
        </li>
      ))}
    </ul>
  )
}
