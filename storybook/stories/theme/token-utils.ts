import { useEffect, useMemo, useState } from 'react'

/**
 * 收集当前文档里以 `prefix` 开头的自定义属性名（去重、排序）。
 * `getComputedStyle` 无法枚举自定义属性，只能遍历 `document.styleSheets` 的 cssRules 翻出声明过的名字；
 * `@media` / `@supports` 之类的分组规则递归进去，跨域样式表读不到 cssRules 直接跳过。
 */
export function collectCustomPropertyNames(prefix: string): string[] {
  const names = new Set<string>()
  const visit = (rules: CSSRuleList | undefined) => {
    if (!rules) return
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule) {
        for (const property of Array.from(rule.style)) {
          if (property.startsWith(prefix)) names.add(property)
        }
      }
      if (rule instanceof CSSGroupingRule) visit(rule.cssRules)
    }
  }
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      visit(sheet.cssRules)
    } catch {
      // 跨域样式表访问 cssRules 会抛 SecurityError，与 token 无关，跳过
    }
  }
  return Array.from(names).sort()
}

/** 每次 `body[data-ds-dark-theme]` 变化（工具栏切主题、`setThemePreference`）自增一次，用作重读 token 的依赖。 */
export function useBodyThemeVersion(): number {
  const [version, setVersion] = useState(0)
  useEffect(() => {
    const observer = new MutationObserver(() => setVersion((value) => value + 1))
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] })
    return () => observer.disconnect()
  }, [])
  return version
}

/** 以 `getComputedStyle(document.body)` 读一组 token 的当前值，主题切换后自动重读。 */
export function useTokenValues(names: readonly string[]): Record<string, string> {
  const version = useBodyThemeVersion()
  return useMemo(() => {
    const style = getComputedStyle(document.body)
    const values: Record<string, string> = {}
    for (const name of names) values[name] = style.getPropertyValue(name).trim()
    return values
    // version 只用来触发重读，本身不参与计算
  }, [names, version])
}
