import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const fixtureName = process.argv[2]
assert.ok(fixtureName === 'react18' || fixtureName === 'next16', 'fixture must be react18 or next16')
const root = path.resolve(import.meta.dirname, '..')
const temporary = mkdtempSync(path.join(tmpdir(), `seekbuddy-dsh-ui-${fixtureName}-`))
const app = path.join(temporary, 'app')

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const absolute = path.join(directory, entry)
    return statSync(absolute).isDirectory() ? walk(absolute) : [absolute]
  })
}

try {
  const packed = JSON.parse(
    execFileSync('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', temporary], {
      cwd: root,
      encoding: 'utf8',
    }),
  )[0]
  const archive = path.join(temporary, packed.filename)
  cpSync(path.join(root, 'fixtures', fixtureName), app, { recursive: true })
  const packagePath = path.join(app, 'package.json')
  const manifest = JSON.parse(readFileSync(packagePath, 'utf8'))
  manifest.dependencies['@seekbuddy/dsh-ui'] = `file:${archive}`
  writeFileSync(packagePath, `${JSON.stringify(manifest, null, 2)}\n`)
  execFileSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], {
    cwd: app,
    stdio: 'inherit',
  })
  execFileSync('npm', ['run', 'check'], {
    cwd: app,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
    stdio: 'inherit',
  })
  const reactPaths = execFileSync('npm', ['ls', 'react', '--parseable'], { cwd: app, encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter((line) => line.endsWith(`${path.sep}node_modules${path.sep}react`))
  assert.equal(reactPaths.length, 1, `expected one React installation, found ${reactPaths.length}`)
  if (fixtureName === 'next16') {
    const fonts = walk(path.join(app, '.next')).filter((file) => file.endsWith('.woff2'))
    assert.ok(fonts.length > 0, 'Next output does not contain a KaTeX woff2 asset')
  }
  console.log(`[fixture] ${fixtureName} passed with one React installation`)
} finally {
  rmSync(temporary, { recursive: true, force: true })
}
