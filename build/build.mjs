import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { transform } from 'lightningcss'

const require = createRequire(import.meta.url)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = path.join(root, 'src')
const distDir = path.join(root, 'dist')
const generatedDir = path.join(root, '.build')
const cssModuleDir = path.join(generatedDir, 'css')
const typesOutDir = path.join(distDir, 'types')
const typescriptPackagePath = require.resolve('typescript/package.json')
const typescriptBin = JSON.parse(readFileSync(typescriptPackagePath, 'utf8')).bin?.tsc
if (typeof typescriptBin !== 'string') throw new Error('TypeScript package does not expose the tsc binary')
const tscPath = path.resolve(path.dirname(typescriptPackagePath), typescriptBin)

function walk(dir, base = dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const absolute = path.join(dir, entry)
    if (statSync(absolute).isDirectory()) out.push(...walk(absolute, base))
    else out.push(path.relative(base, absolute))
  }
  return out
}

function emitCssModule(relativePath) {
  const absolute = path.join(srcDir, relativePath)
  const { code, exports: cssExports } = transform({
    filename: absolute,
    code: readFileSync(absolute),
    cssModules: { pattern: '[hash]_[local]' },
    minify: true,
  })
  const classMap = {}
  for (const [local, value] of Object.entries(cssExports ?? {})) classMap[local] = value.name
  const id = `@seekbuddy/dsh-ui/${relativePath}`
  const moduleText = [
    `const id=${JSON.stringify(id)};`,
    `if(typeof document!=="undefined"&&!document.querySelector('style[data-dsh-ui-primitives="'+id+'"]')){`,
    'const element=document.createElement("style");',
    'element.setAttribute("data-dsh-ui-primitives",id);',
    `element.textContent=${JSON.stringify(code.toString())};`,
    'document.head.appendChild(element);',
    '}',
    `export default ${JSON.stringify(classMap)};`,
  ].join('\n')
  const output = path.join(cssModuleDir, relativePath.replace(/\.css$/, '.mjs'))
  mkdirSync(path.dirname(output), { recursive: true })
  writeFileSync(output, moduleText)
}

function emitTokens() {
  const order = [
    'base.css',
    'corner-shape.css',
    'design-platform.css',
    'focus.css',
    'onboarding.css',
    'scrollbar.css',
    'gradient-shadow-text.css',
    'shiki.css',
  ]
  const css = order.map((file) => readFileSync(path.join(srcDir, 'styles', file), 'utf8')).join('\n')
  writeFileSync(path.join(distDir, 'tokens.css'), css)
  writeFileSync(path.join(distDir, 'tokens.css.d.ts'), 'declare const css: string\nexport default css\n')
}

function emitKatex() {
  const source = require.resolve('katex/dist/katex.min.css')
  const sourceFonts = path.join(path.dirname(source), 'fonts')
  let css = readFileSync(source, 'utf8')
  css = css
    .replace(/,url\(fonts\/[^)]+\.(?:woff|ttf)\) format\("(?:woff|truetype)"\)/g, '')
    .replace(/url\(fonts\/([^)]+\.woff2)\)/g, 'url("./katex/fonts/$1")')
  const fonts = [...css.matchAll(/url\("\.\/katex\/fonts\/([^"/]+\.woff2)"\)/g)].map((match) => match[1])
  if (fonts.length === 0 || /\.(?:woff|ttf)\)/.test(css)) throw new Error('KaTeX CSS was not reduced to woff2')
  const outputFonts = path.join(distDir, 'katex', 'fonts')
  mkdirSync(outputFonts, { recursive: true })
  for (const font of new Set(fonts)) copyFileSync(path.join(sourceFonts, font), path.join(outputFonts, font))
  writeFileSync(path.join(distDir, 'katex.css'), css)
  writeFileSync(path.join(distDir, 'katex.css.d.ts'), 'declare const css: string\nexport default css\n')
}

function closureInputs(metafile, rootOutput) {
  const visited = new Set()
  const inputs = new Set()
  const visit = (output) => {
    if (visited.has(output)) return
    visited.add(output)
    const details = metafile.outputs[output]
    if (details === undefined) throw new Error(`Missing metafile output: ${output}`)
    for (const input of Object.keys(details.inputs)) inputs.add(input)
    for (const dependency of details.imports) {
      if (dependency.external) continue
      const direct = path.posix.normalize(dependency.path)
      const relative = path.posix.normalize(path.posix.join(path.posix.dirname(output), dependency.path))
      visit(metafile.outputs[direct] === undefined ? relative : direct)
    }
  }
  visit(rootOutput)
  return inputs
}

/**
 * Public precise sub-entries of the extension layer (server-safe components only: no hooks,
 * no DOM access, so a Next.js Server Component may import them). Every other component file under src/seekbuddy/ becomes an
 * *internal* entry (`seekbuddyInternalEntries`): not exported, not documented, never imported
 * by consumers — its only job is to give each component its own esbuild chunk boundary, so the
 * aggregate `dist/seekbuddy.js` is pure forwarding and a bundle using Switch does not carry the
 * date family's CSS. Chunk layout is therefore decoupled from the public API surface.
 */
const SEEKBUDDY_PUBLIC_ENTRIES = {
  'seekbuddy-card': 'src/seekbuddy/Card.tsx',
  'seekbuddy-empty': 'src/seekbuddy/Empty.tsx',
  'seekbuddy-spinner': 'src/seekbuddy/Spinner.tsx',
  'seekbuddy-tabs': 'src/seekbuddy/Tabs.tsx',
  'seekbuddy-timeline': 'src/seekbuddy/Timeline.tsx',
}
const SEEKBUDDY_INTERNAL_PREFIX = 'seekbuddy-internal/'

function seekbuddyInternalEntries() {
  const publicSources = new Set(Object.values(SEEKBUDDY_PUBLIC_ENTRIES))
  const entries = {}
  for (const file of walk(path.join(srcDir, 'seekbuddy'))) {
    if (!file.endsWith('.tsx')) continue
    const posixFile = file.split(path.sep).join('/')
    const source = `src/seekbuddy/${posixFile}`
    if (publicSources.has(source)) continue
    entries[`${SEEKBUDDY_INTERNAL_PREFIX}${posixFile.replace(/\.tsx$/, '')}`] = source
  }
  return entries
}

/**
 * The SeekBuddy layer must not bundle a second copy of the upstream mirror: a consumer may alias
 * the public entry to another copy of the DSH primitives (such as a DSH web shell's), so anything
 * outside src/seekbuddy/ (or its compiled CSS modules) reaching a seekbuddy output means a relative
 * import bypassed the public `@seekbuddy/dsh-ui` entry.
 */
function assertExtensionLayerIsolated(metafile) {
  const outputs = Object.keys(metafile.outputs).filter((output) => /^dist\/seekbuddy(?:\.js$|-)/.test(output))
  if (outputs.length < 2 + Object.keys(SEEKBUDDY_PUBLIC_ENTRIES).length) {
    throw new Error(`Unexpected seekbuddy output set:\n${outputs.join('\n')}`)
  }
  const allowed = /^(?:src|\.build\/css)\/seekbuddy\//
  for (const output of outputs) {
    const violations = [...closureInputs(metafile, output)].filter((input) => !allowed.test(input))
    if (violations.length > 0) {
      throw new Error(`${output} bundles upstream or third-party sources:\n${violations.join('\n')}`)
    }
  }

  const spinnerInputs = closureInputs(metafile, 'dist/seekbuddy-spinner.js')
  const clientOnly = [...spinnerInputs].filter((input) => /\/Tabs(?:\.|\/)/.test(input))
  if (clientOnly.length > 0) {
    throw new Error(`Server-compatible Spinner entry reaches client-only Tabs:\n${clientOnly.join('\n')}`)
  }

  // Server-safe sub-entries must stay self-contained: their closure is the component file plus its
  // own CSS module, never another (possibly hook-carrying) component.
  const serverSafe = {
    'dist/seekbuddy-card.js': 'Card',
    'dist/seekbuddy-empty.js': 'Empty',
    'dist/seekbuddy-timeline.js': 'Timeline',
  }
  for (const [output, name] of Object.entries(serverSafe)) {
    const foreign = [...closureInputs(metafile, output)].filter(
      (input) => !new RegExp(`/(?:${name}|Spinner)\\.(?:tsx|module\\.mjs)$`).test(input),
    )
    if (foreign.length > 0) {
      throw new Error(`Server-safe ${name} entry reaches other components:\n${foreign.join('\n')}`)
    }
  }
}

/**
 * The aggregate entry may own nothing but its own re-export list: every component body and
 * its `<style>` injection must live in a per-component chunk, otherwise a consumer importing
 * one symbol drags every component's CSS along. Internal entries guarantee this; the
 * assertion keeps it true when files are added or renamed.
 */
function assertAggregateForwardsOnly(metafile) {
  const owned = Object.keys(metafile.outputs['dist/seekbuddy.js'].inputs).filter(
    (input) => input !== 'src/seekbuddy/index.ts',
  )
  if (owned.length > 0) {
    throw new Error(
      `dist/seekbuddy.js must only forward; these inputs need their own entry (is the file .tsx under src/seekbuddy/?):\n${owned.join('\n')}`,
    )
  }
}

function assertLightweightRoot(metafile) {
  const inputs = closureInputs(metafile, 'dist/index.js')
  const forbidden = [
    /(^|\/)src\/markdown\//,
    /(^|\/)node_modules\/(?:katex|shiki|@shikijs|mdast-util-|micromark)/,
    // FileTypeIcon's ~57KB code-file artwork: exported from /blocks, never from the root (UPSTREAM.md).
    /(^|\/)src\/code-file-icon-artwork\.ts$/,
  ]
  const violations = [...inputs].filter((input) => forbidden.some((pattern) => pattern.test(input)))
  if (violations.length > 0)
    throw new Error(`Root entry reaches heavy inputs (Markdown / code-file artwork):\n${violations.join('\n')}`)
  writeFileSync(
    path.join(distDir, 'root-inputs.json'),
    `${JSON.stringify(
      [...inputs].sort((left, right) => left.localeCompare(right)),
      null,
      2,
    )}\n`,
  )
}

rmSync(distDir, { recursive: true, force: true })
rmSync(generatedDir, { recursive: true, force: true })
mkdirSync(distDir, { recursive: true })
mkdirSync(cssModuleDir, { recursive: true })

try {
  for (const file of walk(srcDir).filter((file) => file.endsWith('.module.css'))) emitCssModule(file)
  emitTokens()
  emitKatex()

  const result = await build({
    absWorkingDir: root,
    entryPoints: {
      index: 'src/index.ts',
      blocks: 'src/blocks.ts',
      markdown: 'src/markdown.ts',
      icons: 'src/icons.ts',
      theme: 'src/theme.ts',
      'theme-bootstrap': 'src/theme-bootstrap.ts',
      seekbuddy: 'src/seekbuddy/index.ts',
      ...SEEKBUDDY_PUBLIC_ENTRIES,
      ...seekbuddyInternalEntries(),
    },
    bundle: true,
    splitting: true,
    format: 'esm',
    target: 'es2020',
    platform: 'browser',
    outdir: 'dist',
    entryNames: '[dir]/[name]',
    chunkNames: 'chunks/[name]-[hash]',
    jsx: 'automatic',
    metafile: true,
    external: [
      // The extension layer imports upstream primitives through the public entry so
      // plugin bundles can alias it to the shell copy; keep the self-reference external.
      '@seekbuddy/dsh-ui',
      '@seekbuddy/dsh-ui/*',
      'react',
      'react/*',
      'react-dom',
      'react-dom/*',
      'clsx',
      'anser',
      'diff',
      '@deepseek-ai/dsh-util-code-language',
      'katex',
      'shiki',
      'shiki/*',
      '@shikijs/*',
      '@types/mdast',
      'mdast-util-*',
      'micromark',
      'micromark-*',
    ],
    plugins: [
      {
        name: 'dsh-ui-primitives-css-modules',
        setup(esbuild) {
          esbuild.onResolve({ filter: /\.module\.css$/ }, (args) => {
            const absolute = path.resolve(args.resolveDir, args.path)
            const relative = path.relative(srcDir, absolute)
            return { path: path.join(cssModuleDir, relative.replace(/\.css$/, '.mjs')) }
          })
        },
      },
    ],
  })
  assertLightweightRoot(result.metafile)
  assertExtensionLayerIsolated(result.metafile)
  assertAggregateForwardsOnly(result.metafile)
  writeFileSync(path.join(distDir, 'meta.json'), `${JSON.stringify(result.metafile, null, 2)}\n`)

  execFileSync(process.execPath, [tscPath, '-p', 'tsconfig.build.json'], {
    cwd: root,
    stdio: 'inherit',
  })
  for (const relative of walk(typesOutDir).filter((file) => file.endsWith('.d.ts'))) {
    const absolute = path.join(typesOutDir, relative)
    const source = readFileSync(absolute, 'utf8')
    const rewritten = source.replace(/(from ['"])([^'"]+)\.tsx?(['"])/g, '$1$2.js$3')
    if (rewritten !== source) writeFileSync(absolute, rewritten)
  }
  copyFileSync(path.join(srcDir, 'css-modules.d.ts'), path.join(typesOutDir, 'css-modules.d.ts'))
} finally {
  rmSync(generatedDir, { recursive: true, force: true })
}

console.log('[build] emitted multi-entry ESM (incl. seekbuddy layer), declarations, tokens, and KaTeX woff2 assets')
