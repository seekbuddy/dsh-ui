// test:unit — the DOM-free source modules (theme state machine, calendar arithmetic) are
// transpiled one file at a time into .test-dist and handed to node:test through env URLs,
// so the tests exercise the real TypeScript sources without a bundler or a browser.
import { execFileSync } from 'node:child_process'
import { rmSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'esbuild'

const root = path.resolve(import.meta.dirname, '..')
const outputDir = path.join(root, '.test-dist')

/** env var → source module under src/ */
const modules = {
  THEME_CORE_URL: 'src/theme-core.ts',
  DATE_CORE_URL: 'src/seekbuddy/date/date.ts',
  QR_CORE_URL: 'src/seekbuddy/qr/qr.ts',
}
const tests = ['tests/theme.test.mjs', 'tests/date.test.mjs', 'tests/qr.test.mjs']

rmSync(outputDir, { recursive: true, force: true })
try {
  const env = { ...process.env }
  for (const [name, source] of Object.entries(modules)) {
    const outfile = path.join(outputDir, `${path.basename(source, '.ts')}.mjs`)
    await build({
      entryPoints: [path.join(root, source)],
      outfile,
      bundle: false,
      format: 'esm',
      platform: 'browser',
      target: 'es2020',
    })
    env[name] = pathToFileURL(outfile).href
  }
  execFileSync(process.execPath, ['--test', ...tests], { cwd: root, env, stdio: 'inherit' })
} finally {
  rmSync(outputDir, { recursive: true, force: true })
}
