export { DEFAULT_PREFERENCE, THEME_STORAGE_KEY } from './theme-core.ts'

/** Inline this before application content in the root layout to avoid a saved-theme flash. */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var k='dsh-ui-primitives.theme-preference',v=localStorage.getItem(k);if(v!=='light'&&v!=='dark'&&v!=='system')v='system';var d=v==='dark'||(v==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.style.colorScheme=d?'dark':'light';document.body.toggleAttribute('data-ds-dark-theme',d)}catch(e){var d=matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.style.colorScheme=d?'dark':'light';document.body.toggleAttribute('data-ds-dark-theme',d)}})();`
