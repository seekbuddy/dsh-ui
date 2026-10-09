import { useEffect, useState } from 'react'
import { Button } from '@seekbuddy/dsh-ui'
import {
  DEFAULT_PREFERENCE,
  THEME_PREFERENCES,
  THEME_STORAGE_KEY,
  applyTheme,
  getIsDark,
  getThemePreference,
  isThemePreference,
  resolveDark,
  setThemePreference,
  useIsDark,
  useThemePreference,
} from '@seekbuddy/dsh-ui/theme'
import type { ThemePreference } from '@seekbuddy/dsh-ui/theme'

/** 三个偏好值的中文名，消费者按钮文案照抄。 */
export const PREFERENCE_LABELS: Record<ThemePreference, string> = {
  light: '浅色',
  dark: '深色',
  system: '跟随系统',
}

/** 直接观察 DOM 上的开关 `body[data-ds-dark-theme]`，与运行时的 `useIsDark()` 并排对照。 */
function useBodyDarkAttribute(): boolean {
  const [dark, setDark] = useState(() => document.body.hasAttribute('data-ds-dark-theme'))
  useEffect(() => {
    const observer = new MutationObserver(() => setDark(document.body.hasAttribute('data-ds-dark-theme')))
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] })
    return () => observer.disconnect()
  }, [])
  return dark
}

const termStyle = { margin: 0, color: 'var(--dsw-alias-label-secondary)' } as const
const valueStyle = { margin: 0, color: 'var(--dsw-alias-label-primary)' } as const

/** 现场演示：`useThemePreference` / `useIsDark` 的读数 + 三个 `setThemePreference` 按钮。 */
export function ThemeDemo() {
  const preference = useThemePreference()
  const isDark = useIsDark()
  const bodyDark = useBodyDarkAttribute()

  return (
    <div
      style={{
        display: 'grid',
        gap: 16,
        padding: 16,
        borderRadius: 12,
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'var(--dsw-alias-bg-layer-1)',
        color: 'var(--dsw-alias-label-primary)',
        font: 'var(--dsw-font-s-14)',
      }}
    >
      <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 16px', margin: 0 }}>
        <dt style={termStyle}>
          <code>useThemePreference()</code>
        </dt>
        <dd style={valueStyle}>
          <code>{preference}</code>（{PREFERENCE_LABELS[preference]}）
        </dd>
        <dt style={termStyle}>
          <code>useIsDark()</code>
        </dt>
        <dd style={valueStyle}>
          <code>{String(isDark)}</code>
        </dd>
        <dt style={termStyle}>
          <code>body[data-ds-dark-theme]</code>
        </dt>
        <dd style={valueStyle}>
          <code>{String(bodyDark)}</code>
        </dd>
      </dl>
      <div role="group" aria-label="切换主题偏好" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {THEME_PREFERENCES.map((item) => (
          <Button
            key={item}
            size="sm"
            variant={preference === item ? 'primary' : 'outline'}
            aria-pressed={preference === item}
            onClick={() => setThemePreference(item)}
          >
            {PREFERENCE_LABELS[item]}
          </Button>
        ))}
      </div>
    </div>
  )
}

const cellStyle = { padding: '4px 12px 4px 0', textAlign: 'left', verticalAlign: 'top' } as const

/**
 * 其余导出的现场求值：常量真值、两个纯函数的输入 / 输出、两个非 Hook 读取器的当前值，
 * 以及 `applyTheme`（只写 DOM、不存储、不通知——点完看 `useThemePreference()` 读数不变）。
 */
export function ThemeApiProbe() {
  const preference = useThemePreference()
  const [, force] = useState(0)
  const rows: ReadonlyArray<[string, string]> = [
    ['DEFAULT_PREFERENCE', JSON.stringify(DEFAULT_PREFERENCE)],
    ['THEME_STORAGE_KEY', JSON.stringify(THEME_STORAGE_KEY)],
    ["isThemePreference('dark')", String(isThemePreference('dark'))],
    ["isThemePreference('blue')", String(isThemePreference('blue'))],
    ["resolveDark('light')", String(resolveDark('light'))],
    ["resolveDark('dark')", String(resolveDark('dark'))],
    ["resolveDark('system')", String(resolveDark('system'))],
    ['getThemePreference()', JSON.stringify(getThemePreference())],
    ['getIsDark()', String(getIsDark())],
  ]
  return (
    <div style={{ display: 'grid', gap: 12, font: 'var(--dsw-font-s-14)', color: 'var(--dsw-alias-label-primary)' }}>
      <table style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={cellStyle}>调用</th>
            <th style={cellStyle}>当前返回值</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([call, value]) => (
            <tr key={call}>
              <td style={cellStyle}>
                <code>{call}</code>
              </td>
              <td style={cellStyle}>
                <code>{value}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div
        role="group"
        aria-label="applyTheme 演示"
        style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}
      >
        <span style={{ color: 'var(--dsw-alias-label-secondary)' }}>
          <code>applyTheme(...)</code> 只改 DOM，偏好仍是 <code>{preference}</code>：
        </span>
        {THEME_PREFERENCES.map((item) => (
          <Button
            key={item}
            size="sm"
            variant="outline"
            onClick={() => {
              applyTheme(item)
              force((n) => n + 1)
            }}
          >
            applyTheme('{item}')
          </Button>
        ))}
      </div>
    </div>
  )
}
