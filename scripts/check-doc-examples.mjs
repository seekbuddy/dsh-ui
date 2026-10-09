// Typechecks every ```tsx block in README.md and docs/components/*.md against the source, through
// the same `@seekbuddy/dsh-ui/*` paths a consumer imports. Each block must be a complete module
// (imports included). Chinese `.zh.md` pages are skipped: check-doc-pairs.mjs requires their code
// blocks to be byte-identical to the English page's.
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

const require = createRequire(import.meta.url)
const root = path.resolve(import.meta.dirname, '..')
const workDir = path.join(root, '.doc-examples')
const typescriptPackagePath = require.resolve('typescript/package.json')
const tscPath = path.resolve(path.dirname(typescriptPackagePath), JSON.parse(readFileSync(typescriptPackagePath, 'utf8')).bin.tsc)

const docsDir = path.join(root, 'docs', 'components')
const pages = [
  'README.md',
  ...readdirSync(docsDir)
    .filter((file) => file.endsWith('.md') && !file.endsWith('.zh.md'))
    .map((file) => path.join('docs', 'components', file)),
]

rmSync(workDir, { recursive: true, force: true })
mkdirSync(workDir)
let count = 0
try {
  for (const page of pages) {
    const blocks = [...readFileSync(path.join(root, page), 'utf8').matchAll(/```tsx\n([\s\S]*?)```/g)]
    blocks.forEach(([, code], index) => {
      const name = `${page.replace(/[/.]/g, '_')}_${index}.tsx`
      // A block without exports is still a module, so its top-level names do not collide.
      writeFileSync(path.join(workDir, name), /\bexport\b/.test(code) ? code : `${code}\nexport {}\n`)
      count += 1
    })
  }
  writeFileSync(
    path.join(workDir, 'tsconfig.json'),
    JSON.stringify({ extends: '../tsconfig.json', include: ['./*.tsx', '../src/css-modules.d.ts'] }),
  )
  execFileSync(process.execPath, [tscPath, '-p', path.join(workDir, 'tsconfig.json')], { cwd: root, stdio: 'inherit' })
  console.log(`[docs] ${count} tsx examples typecheck`)
} finally {
  rmSync(workDir, { recursive: true, force: true })
}
