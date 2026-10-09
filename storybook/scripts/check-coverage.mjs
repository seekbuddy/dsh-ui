/**
 * story 覆盖门禁：本包每一个公开运行时导出都必须被某个 story / MDX 从公开入口 import 过。
 *
 * 真相源 = 仓库根目录 package.json#exports（各入口的 types 指向 dist/types/<x>.d.ts，映射回
 * src/<x>.ts 读 `export` 列表；`export *` 递归展开）。正文提到名字不算，必须真的用上：
 * - 组件（PascalCase）：某个 *.stories.tsx 的 `component: X` 指向它（别的 story 把它当辅助控件
 *   import 不算——那不是它自己的页）；或某个 .mdx 从该入口 import 了它；
 * - hooks（use*）：有同名的 `<name>.stories.tsx`（别的 story 借它定位不算）；或某个 .mdx 从该入口 import 了它；
 * - 函数 / 常量：任一 story / MDX / 辅助文件从该入口 import 了它；
 * - 对入口做了命名空间导入 `import * as … from '…/icons'` 的（图标网格页按名枚举渲染）视为整入口覆盖。
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const uiRoot = resolve(here, '../..')
const storiesRoot = resolve(here, '../stories')
const pkg = JSON.parse(readFileSync(join(uiRoot, 'package.json'), 'utf8'))

/** 入口 → 源码文件：dist/types/<x>.d.ts ⇒ src/<x>.ts（seekbuddy 是目录 index）。 */
function entrySource(types) {
  const rel = types.replace(/^\.\/dist\/types\//, '').replace(/\.d\.ts$/, '')
  // 聚合入口是 .ts，组件精确子入口（seekbuddy/spinner 等）直接指向 .tsx 源文件
  const ts = join(uiRoot, 'src', `${rel}.ts`)
  return existsSync(ts) ? ts : join(uiRoot, 'src', `${rel}.tsx`)
}

const EXPORT_LIST = /export\s+(type\s+)?\{([^}]*)\}\s*(?:from\s+['"]([^'"]+)['"])?/g
const EXPORT_DECL = /^export\s+(?:async\s+)?(?:function\*?|const|let|var|class)\s+([A-Za-z_$][\w$]*)/gm
const EXPORT_STAR = /^export\s+\*\s+from\s+['"]([^'"]+)['"]/gm

/** 读一个源码文件的运行时导出名（`export *` 递归展开）。 */
function collectExports(file, seen = new Set()) {
  if (seen.has(file)) return []
  seen.add(file)
  const text = readFileSync(file, 'utf8')
  const names = []
  for (const m of text.matchAll(EXPORT_LIST)) {
    if (m[1]) continue // export type { … }
    for (const raw of m[2].split(',')) {
      const item = raw.trim()
      if (!item || item.startsWith('type ')) continue
      const name = item
        .split(/\s+as\s+/)
        .pop()
        .trim()
      if (name) names.push({ name })
    }
  }
  for (const m of text.matchAll(EXPORT_DECL)) names.push({ name: m[1] })
  for (const m of text.matchAll(EXPORT_STAR)) {
    const target = resolve(dirname(file), m[1])
    names.push(...collectExports(target, seen))
  }
  return names
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.(stories\.tsx|mdx|tsx|ts)$/.test(name)) out.push(p)
  }
  return out
}

/** 收集 stories/** 里从公开入口的具名导入（按入口分桶）与命名空间导入。 */
const IMPORT = /import\s+(type\s+)?(\*\s+as\s+\w+|\{[^}]*\})\s+from\s+['"]([^'"]+)['"]/g
const COMPONENT_META = /\bcomponent:\s*(?:\w+\.)?([A-Z]\w*)/g
const named = new Map() // specifier → Set<name>：任意文件的具名导入
const mdxNamed = new Map() // specifier → Set<name>：只算 .mdx 的具名导入
const namespaced = new Set() // specifier
const metaComponents = new Set() // *.stories.tsx 里 `component: X` 的 X
const storyBasenames = new Set() // `<name>.stories.tsx` 的 <name>
const storyFiles = walk(storiesRoot)
for (const file of storyFiles) {
  const text = readFileSync(file, 'utf8')
  if (file.endsWith('.stories.tsx')) storyBasenames.add(basename(file, '.stories.tsx'))
  if (file.endsWith('.stories.tsx')) for (const m of text.matchAll(COMPONENT_META)) metaComponents.add(m[1])
  const isMdx = file.endsWith('.mdx')
  for (const m of text.matchAll(IMPORT)) {
    if (m[1]) continue // import type
    const spec = m[3]
    if (spec !== pkg.name && !spec.startsWith(`${pkg.name}/`)) continue
    if (m[2].startsWith('*')) {
      namespaced.add(spec)
      continue
    }
    const bucket = named.get(spec) ?? new Set()
    const mdxBucket = mdxNamed.get(spec) ?? new Set()
    for (const raw of m[2].slice(1, -1).split(',')) {
      const item = raw.trim()
      if (!item || item.startsWith('type ')) continue
      const name = item.split(/\s+as\s+/)[0].trim()
      bucket.add(name)
      if (isMdx) mdxBucket.add(name)
    }
    named.set(spec, bucket)
    mdxNamed.set(spec, mdxBucket)
  }
}

let total = 0
let missingTotal = 0
for (const [sub, target] of Object.entries(pkg.exports)) {
  if (typeof target !== 'object' || !target.types || !target.types.endsWith('.d.ts')) continue
  if (target.types.endsWith('.css.d.ts')) continue
  const specifier = sub === '.' ? pkg.name : `${pkg.name}/${sub.slice(2)}`
  const file = entrySource(target.types)
  const exportsList = collectExports(file)
  const imported = named.get(specifier) ?? new Set()
  const mdxImported = mdxNamed.get(specifier) ?? new Set()
  const isComponent = (name) => /^[A-Z][a-z]/.test(name)
  const isHook = (name) => /^use[A-Z]/.test(name)
  const covered = (name) => {
    if (namespaced.has(specifier) || mdxImported.has(name)) return true
    if (isComponent(name)) return metaComponents.has(name)
    if (isHook(name)) return storyBasenames.has(name)
    return imported.has(name)
  }
  const missing = exportsList.filter((e) => !covered(e.name)).map((e) => e.name)
  total += exportsList.length
  missingTotal += missing.length
  const status = missing.length === 0 ? '✓' : '✗'
  console.log(
    `${status} ${specifier}  ${exportsList.length - missing.length}/${exportsList.length}  (${relative(uiRoot, file)})`,
  )
  for (const name of missing)
    console.log(
      isComponent(name)
        ? `    缺 story：${name}（没有 story 的 component 指向它，也没有 MDX 从 '${specifier}' 导入它）`
        : isHook(name)
          ? `    缺 story：${name}（没有 ${name}.stories.tsx，也没有 MDX 从 '${specifier}' 导入它）`
          : `    缺 story：${name}（没有任何 story / MDX 从 '${specifier}' 导入它）`,
    )
}
console.log(`\n扫描 ${storyFiles.length} 个文件，公开运行时导出 ${total} 个，缺 ${missingTotal} 个`)
if (missingTotal > 0) process.exit(1)
