// Checks that every English document in scope has a Chinese counterpart `foo.zh.md` in the same
// directory, following upstream DSH's pairing rules:
//   - language switcher right after the H1: `English | [中文](foo.zh.md)` / `[English](foo.md) | 中文`;
//   - same heading depths in the same order, same table shapes, byte-identical fenced code blocks
//     and generated `<!-- api:… -->` regions;
//   - relative links to paired documents use the `.md` path on the English side and the `.zh.md`
//     path on the Chinese side.
// Prose is reviewed by people; this check only keeps the two files structurally in step.
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const docsDir = path.join(root, 'docs')

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)],
  )
}

const english = [
  'README.md',
  'CONTRIBUTING.md',
  'storybook/README.md',
  ...walk(docsDir)
    .filter((file) => file.endsWith('.md') && !file.endsWith('.zh.md'))
    .map((file) => path.relative(root, file)),
]
const paired = new Set(english)
const zhOf = (file) => file.replace(/\.md$/, '.zh.md')

/** Removes fenced code so headings, tables and links inside code are not read as structure. */
const withoutCode = (text) => text.replace(/```[\s\S]*?```/g, '')

function signature(text) {
  const prose = withoutCode(text)
  return {
    headings: [...prose.matchAll(/^(#{1,6}) /gm)].map((match) => match[1].length),
    code: [...text.matchAll(/```[\s\S]*?```/g)].map((match) => match[0]),
    regions: [...text.matchAll(/<!-- api:[\s\S]*?<!-- \/api -->/g)].map((match) => match[0]),
    tables: prose
      .split(/\n(?!\|)/)
      .filter((block) => block.startsWith('|'))
      .map((block) => {
        const rows = block.split('\n').filter((line) => line.startsWith('|'))
        return `${rows.length}x${rows[0].split(/(?<!\\)\|/).length - 2}`
      }),
  }
}

function switcherAfterTitle(text) {
  const lines = text.split('\n')
  const title = lines.findIndex((line) => line.startsWith('# '))
  return lines.slice(title + 1).find((line) => line.trim() !== '')
}

function relativeDocLinks(text, file) {
  // Inline code such as `[中文](foo.zh.md)` is an example, not a link.
  return [...withoutCode(text).replace(/`[^`\n]*`/g, '').matchAll(/\]\(([^)\s#]+\.md)(?:#[^)]*)?\)/g)]
    .map((match) => match[1])
    .filter((href) => !/^[a-z]+:/i.test(href))
    .map((href) => ({ href, target: path.normalize(path.join(path.dirname(file), href)) }))
}

const errors = []
for (const en of english) {
  const zh = zhOf(en)
  if (!existsSync(path.join(root, zh))) {
    errors.push(`${zh}: missing Chinese counterpart of ${en}`)
    continue
  }
  const enText = readFileSync(path.join(root, en), 'utf8')
  const zhText = readFileSync(path.join(root, zh), 'utf8')
  const base = path.basename(en)

  if (switcherAfterTitle(enText) !== `English | [中文](${zhOf(base)})`) errors.push(`${en}: language switcher missing after the H1`)
  if (switcherAfterTitle(zhText) !== `[English](${base}) | 中文`) errors.push(`${zh}: language switcher missing after the H1`)

  const a = signature(enText)
  const b = signature(zhText)
  if (a.headings.join() !== b.headings.join()) errors.push(`${zh}: heading depths differ from ${en} (${a.headings.join('')} vs ${b.headings.join('')})`)
  if (a.tables.join() !== b.tables.join()) errors.push(`${zh}: table shapes differ from ${en} (${a.tables.join(' ')} vs ${b.tables.join(' ')})`)
  if (a.code.length !== b.code.length || a.code.some((block, index) => block !== b.code[index]))
    errors.push(`${zh}: fenced code blocks are not byte-identical to ${en}`)
  if (a.regions.join('\n') !== b.regions.join('\n')) errors.push(`${zh}: generated API regions differ from ${en}`)

  for (const { href, target } of relativeDocLinks(enText, en)) {
    if (target.endsWith('.zh.md') && href !== zhOf(base)) errors.push(`${en}: links to Chinese page ${href}`)
  }
  for (const { href, target } of relativeDocLinks(zhText, zh)) {
    if (href === base) continue
    if (paired.has(target)) errors.push(`${zh}: links to ${href}; use its .zh.md counterpart`)
  }
}

for (const file of walk(root).filter((f) => f.endsWith('.zh.md') && !f.includes('node_modules'))) {
  const en = path.relative(root, file).replace(/\.zh\.md$/, '.md')
  if (!paired.has(en)) errors.push(`${path.relative(root, file)}: no English document in scope pairs with it`)
}

if (errors.length > 0) {
  console.error(`[doc-pairs] ${errors.length} problem(s):\n  ${errors.join('\n  ')}`)
  process.exitCode = 1
} else {
  console.log(`[doc-pairs] ${english.length} bilingual pairs in step`)
}
