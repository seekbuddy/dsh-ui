import assert from 'node:assert/strict'
import test from 'node:test'

let importSequence = 0

function createEnvironment({ stored = null, dark = false, storageError = false } = {}) {
  const attributes = new Set()
  const listeners = new Set()
  const writes = []
  let addCount = 0
  const media = {
    matches: dark,
    addEventListener(type, listener) {
      assert.equal(type, 'change')
      addCount += 1
      listeners.add(listener)
    },
    emit(matches) {
      this.matches = matches
      for (const listener of listeners) listener({ matches })
    },
  }
  const localStorage = {
    getItem() {
      if (storageError) throw new Error('storage blocked')
      return stored
    },
    setItem(key, value) {
      if (storageError) throw new Error('storage blocked')
      writes.push([key, value])
      stored = value
    },
  }
  globalThis.document = {
    documentElement: { style: { colorScheme: '' } },
    body: {
      toggleAttribute(name, enabled) {
        if (enabled) attributes.add(name)
        else attributes.delete(name)
      },
      hasAttribute(name) {
        return attributes.has(name)
      },
    },
  }
  globalThis.window = { localStorage, matchMedia: () => media }
  return {
    media,
    writes,
    get addCount() {
      return addCount
    },
  }
}

async function loadTheme(options) {
  const environment = createEnvironment(options)
  const module = await import(`${process.env.THEME_CORE_URL}?case=${importSequence++}`)
  return { environment, module }
}

test.afterEach(() => {
  delete globalThis.window
  delete globalThis.document
})

test('first initialization applies the system preference', async () => {
  const { environment, module } = await loadTheme({ dark: true })
  assert.equal(module.initializeTheme(), 'system')
  assert.equal(module.getIsDark(), true)
  assert.equal(document.documentElement.style.colorScheme, 'dark')
  assert.equal(document.body.hasAttribute('data-ds-dark-theme'), true)
  assert.equal(environment.addCount, 1)
  module.initializeTheme()
  assert.equal(environment.addCount, 1)
})

test('light and dark preferences update DOM and storage', async () => {
  const { environment, module } = await loadTheme()
  module.setThemePreference('light')
  assert.equal(document.documentElement.style.colorScheme, 'light')
  assert.equal(document.body.hasAttribute('data-ds-dark-theme'), false)
  module.setThemePreference('dark')
  assert.equal(document.documentElement.style.colorScheme, 'dark')
  assert.equal(document.body.hasAttribute('data-ds-dark-theme'), true)
  assert.deepEqual(environment.writes, [
    [module.THEME_STORAGE_KEY, 'light'],
    [module.THEME_STORAGE_KEY, 'dark'],
  ])
})

test('setting the initial system value still applies and persists it', async () => {
  const { environment, module } = await loadTheme({ dark: true })
  module.setThemePreference('system')
  assert.equal(document.documentElement.style.colorScheme, 'dark')
  assert.deepEqual(environment.writes, [[module.THEME_STORAGE_KEY, 'system']])
})

test('restores a valid stored preference', async () => {
  const { module } = await loadTheme({ stored: 'dark' })
  assert.equal(module.initializeTheme(), 'dark')
  assert.equal(document.body.hasAttribute('data-ds-dark-theme'), true)
})

test('invalid storage falls back to system', async () => {
  const { module } = await loadTheme({ stored: 'sepia', dark: true })
  assert.equal(module.initializeTheme(), 'system')
  assert.equal(module.getIsDark(), true)
})

test('storage failures do not prevent theme application', async () => {
  const { module } = await loadTheme({ dark: false, storageError: true })
  assert.doesNotThrow(() => module.initializeTheme())
  assert.doesNotThrow(() => module.setThemePreference('dark'))
  assert.equal(document.documentElement.style.colorScheme, 'dark')
})

test('system changes update DOM and subscribers only in system mode', async () => {
  const { environment, module } = await loadTheme({ dark: false })
  module.initializeTheme()
  let notifications = 0
  const unsubscribe = module.subscribeTheme(() => {
    notifications += 1
  })
  environment.media.emit(true)
  assert.equal(module.getIsDark(), true)
  assert.equal(document.body.hasAttribute('data-ds-dark-theme'), true)
  assert.equal(notifications, 1)
  module.setThemePreference('light')
  environment.media.emit(false)
  assert.equal(document.documentElement.style.colorScheme, 'light')
  assert.equal(notifications, 2)
  unsubscribe()
})
