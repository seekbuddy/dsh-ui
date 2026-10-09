export const THEME_PREFERENCES = ['light', 'dark', 'system'] as const
export type ThemePreference = (typeof THEME_PREFERENCES)[number]

export const DEFAULT_PREFERENCE: ThemePreference = 'system'
export const THEME_STORAGE_KEY = 'dsh-ui-primitives.theme-preference'

type ThemeListener = () => void

const listeners = new Set<ThemeListener>()
let current: ThemePreference = DEFAULT_PREFERENCE
let currentDark = false
let initialized = false
let mediaQuery: MediaQueryList | undefined
let mediaListenerAttached = false

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && (THEME_PREFERENCES as readonly string[]).includes(value)
}

function getMediaQuery(): MediaQueryList | undefined {
  if (mediaQuery !== undefined) return mediaQuery
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  return mediaQuery
}

export function resolveDark(preference: ThemePreference): boolean {
  return preference === 'dark' || (preference === 'system' && (getMediaQuery()?.matches ?? false))
}

export function applyTheme(preference: ThemePreference): void {
  currentDark = resolveDark(preference)
  if (typeof document === 'undefined') return
  document.documentElement.style.colorScheme = currentDark ? 'dark' : 'light'
  document.body?.toggleAttribute('data-ds-dark-theme', currentDark)
}

function notify(): void {
  for (const listener of listeners) listener()
}

function onSystemThemeChange(): void {
  if (current !== 'system') return
  applyTheme(current)
  notify()
}

function attachSystemListener(): void {
  if (mediaListenerAttached) return
  const query = getMediaQuery()
  if (query === undefined) return
  if (typeof query.addEventListener === 'function') query.addEventListener('change', onSystemThemeChange)
  else query.addListener?.(onSystemThemeChange)
  mediaListenerAttached = true
}

function readStoredPreference(): ThemePreference {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCE
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isThemePreference(stored) ? stored : DEFAULT_PREFERENCE
  } catch {
    return DEFAULT_PREFERENCE
  }
}

export function initializeTheme(): ThemePreference {
  if (initialized) {
    applyTheme(current)
    return current
  }
  initialized = true
  current = readStoredPreference()
  attachSystemListener()
  applyTheme(current)
  return current
}

export function setThemePreference(preference: ThemePreference): void {
  initialized = true
  current = preference
  attachSystemListener()
  applyTheme(preference)
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, preference)
    } catch {
      // Theme application remains functional when storage is blocked.
    }
  }
  notify()
}

export function getThemePreference(): ThemePreference {
  return current
}

export function getIsDark(): boolean {
  return currentDark
}

export function subscribeTheme(listener: ThemeListener): () => void {
  initializeTheme()
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
