import { useSyncExternalStore } from 'react'
import { getIsDark, getThemePreference, subscribeTheme } from './theme-core.ts'

export {
  DEFAULT_PREFERENCE,
  THEME_PREFERENCES,
  THEME_STORAGE_KEY,
  applyTheme,
  getIsDark,
  getThemePreference,
  initializeTheme,
  isThemePreference,
  resolveDark,
  setThemePreference,
} from './theme-core.ts'
export type { ThemePreference } from './theme-core.ts'

export function useThemePreference() {
  return useSyncExternalStore(subscribeTheme, getThemePreference, getThemePreference)
}

export function useIsDark() {
  return useSyncExternalStore(subscribeTheme, getIsDark, getIsDark)
}
