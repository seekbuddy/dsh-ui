import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const temporary = mkdtempSync(path.join(tmpdir(), 'seekbuddy-dsh-ui-pack-'))

function exportedPaths(value) {
  if (typeof value === 'string') return value.startsWith('./') ? [value.slice(2)] : []
  if (value === null || typeof value !== 'object') return []
  return Object.values(value).flatMap(exportedPaths)
}

try {
  const packed = JSON.parse(
    execFileSync('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', temporary], {
      cwd: root,
      encoding: 'utf8',
    }),
  )
  assert.equal(packed.length, 1)
  const manifest = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))
  const files = new Set(packed[0].files.map((file) => file.path))
  for (const exported of exportedPaths(manifest.exports)) {
    assert.ok(files.has(exported), `package export is missing: ${exported}`)
  }
  for (const required of [
    'dist/index.js',
    'dist/blocks.js',
    'dist/markdown.js',
    'dist/icons.js',
    'dist/theme.js',
    'dist/theme-bootstrap.js',
    'dist/seekbuddy.js',
    'dist/seekbuddy-card.js',
    'dist/seekbuddy-empty.js',
    'dist/seekbuddy-spinner.js',
    'dist/seekbuddy-tabs.js',
    'dist/seekbuddy-timeline.js',
    'dist/types/index.d.ts',
    'dist/types/blocks.d.ts',
    'dist/types/markdown.d.ts',
    'dist/types/icons.d.ts',
    'dist/types/theme.d.ts',
    'dist/types/seekbuddy/index.d.ts',
    'dist/types/seekbuddy/Card.d.ts',
    'dist/types/seekbuddy/Empty.d.ts',
    'dist/types/seekbuddy/Spinner.d.ts',
    'dist/types/seekbuddy/Tabs.d.ts',
    'dist/types/seekbuddy/Timeline.d.ts',
    'dist/tokens.css',
    'dist/katex.css',
  ])
    assert.ok(files.has(required), `package content is missing: ${required}`)

  assert.equal(
    [...files].some((file) => file.startsWith('storybook/')),
    false,
  )

  const archive = path.join(temporary, packed[0].filename)
  execFileSync('tar', ['-xzf', archive, '-C', temporary])

  const aggregateEntry = readFileSync(path.join(temporary, 'package', 'dist', 'seekbuddy.js'), 'utf8')
  const tabsEntry = readFileSync(path.join(temporary, 'package', 'dist', 'seekbuddy-tabs.js'), 'utf8')
  const spinnerEntry = readFileSync(path.join(temporary, 'package', 'dist', 'seekbuddy-spinner.js'), 'utf8')
  const timelineEntry = readFileSync(path.join(temporary, 'package', 'dist', 'seekbuddy-timeline.js'), 'utf8')
  const cardEntry = readFileSync(path.join(temporary, 'package', 'dist', 'seekbuddy-card.js'), 'utf8')
  const emptyEntry = readFileSync(path.join(temporary, 'package', 'dist', 'seekbuddy-empty.js'), 'utf8')
  assert.match(aggregateEntry, /^['"]use client['"];/, 'aggregate SeekBuddy entry must be a client boundary')
  // The aggregate only forwards. Component bodies and their <style> injection live in
  // per-component chunks (internal entries under dist/seekbuddy-internal/), so a consumer that
  // imports one symbol does not carry every component's CSS.
  assert.doesNotMatch(
    aggregateEntry,
    /createElement\("style"\)|\.module\.css/,
    'aggregate SeekBuddy entry must forward only; a component body leaked into dist/seekbuddy.js',
  )
  const internalEntries = [...files].filter(
    (file) => file.startsWith('dist/seekbuddy-internal/') && file.endsWith('.js'),
  )
  assert.ok(internalEntries.length > 0, 'internal per-component seekbuddy entries are missing')
  for (const internal of ['dist/seekbuddy-internal/date/Calendar.js', 'dist/seekbuddy-internal/date/TimePicker.js']) {
    assert.ok(files.has(internal), `internal seekbuddy entry is missing: ${internal}`)
  }
  // Component files carry no 'use client' of their own (only the aggregate index does, 2026-09-04);
  // the historical Tabs sub-entry therefore ships without a directive and must be imported from a
  // Client Component, like the aggregate entry.
  assert.doesNotMatch(
    tabsEntry,
    /^['"]use client['"];/,
    'component entries must not carry their own use client directive',
  )
  assert.doesNotMatch(spinnerEntry, /\buse(?:Id|Ref)\b/, 'Spinner entry must stay server-compatible')
  assert.doesNotMatch(timelineEntry, /\buse[A-Z]\w*\b/, 'Timeline entry must stay server-compatible')
  assert.doesNotMatch(cardEntry, /\buse[A-Z]\w*\b|^['"]use client['"];/, 'Card entry must stay server-compatible')
  assert.doesNotMatch(emptyEntry, /\buse[A-Z]\w*\b|^['"]use client['"];/, 'Empty entry must stay server-compatible')
  // The retry button and the default icons come from the upstream mirror through the public
  // entry, never bundled — a consumer alias must be able to point them at another copy.
  const emptyClosure = [...emptyEntry.matchAll(/from\s*['"](\.\/chunks\/[^'"]+)['"]/g)]
    .map((match) => readFileSync(path.join(temporary, 'package', 'dist', match[1]), 'utf8'))
    .join('\n')
  assert.match(emptyClosure, /from\s*['"]@seekbuddy\/dsh-ui['"]/, 'Empty must import Button through the public entry')
  assert.match(
    emptyClosure,
    /from\s*['"]@seekbuddy\/dsh-ui\/icons['"]/,
    'Empty must import icons through the public entry',
  )

  const tokensCss = readFileSync(path.join(temporary, 'package', 'dist', 'tokens.css'), 'utf8')
  for (const token of [
    '--dsw-corner-shape',
    '--dsw-elevation-stroke',
    '--dsw-elevation-panel',
    '--dsw-elevation-prominent',
    '--dsw-elevation-soft',
  ]) {
    assert.ok(tokensCss.includes(token), `tokens CSS is missing alpha.4 token: ${token}`)
  }
  assert.ok(
    tokensCss.indexOf('--dsw-corner-shape') < tokensCss.indexOf('--dsw-static-amber-100'),
    'corner-shape.css must precede design-platform.css',
  )
  assert.ok(
    tokensCss.indexOf('--dsh-scrollbar-width') < tokensCss.indexOf('--dsw-elevation-stroke-color'),
    'scrollbar.css must precede gradient-shadow-text.css',
  )

  const css = readFileSync(path.join(temporary, 'package', 'dist', 'katex.css'), 'utf8')
  const urls = [...css.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map((match) => match[1])
  assert.ok(urls.length > 0, 'KaTeX CSS has no font URLs')
  for (const url of urls) {
    assert.equal(url.startsWith('data:'), false, `KaTeX font must not be a data URI: ${url}`)
    const target = path.resolve(path.join(temporary, 'package', 'dist'), url)
    assert.ok(target.startsWith(path.join(temporary, 'package', 'dist')), `unsafe KaTeX URL: ${url}`)
    assert.ok(files.has(path.relative(path.join(temporary, 'package'), target)), `missing KaTeX font: ${url}`)
  }
  console.log(`[package] verified ${files.size} files, ${urls.length} KaTeX font URLs`)
} finally {
  rmSync(temporary, { recursive: true, force: true })
}
