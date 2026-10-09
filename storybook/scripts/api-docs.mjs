/**
 * Fills the API tables in docs/components/*.md from the TypeScript source of src/seekbuddy/.
 *
 * Pages are hand-written; only the regions between a marker and the next `<!-- /api -->` are
 * generated:
 *   <!-- api:props Card -->    props table of a component (react-docgen-typescript: types, defaults, JSDoc)
 *   <!-- api:type UploadItem -->  fields of an exported interface, or the definition of a type alias
 *   <!-- api:fn pageItems -->  signature of an exported function or hook
 *
 * `node scripts/api-docs.mjs` rewrites the pages; `--check` fails when a page is stale or when a
 * runtime export of `@seekbuddy/dsh-ui/seekbuddy` has no `api:props` / `api:fn` block anywhere.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const docgen = require('react-docgen-typescript')

const repo = fileURLToPath(new URL('../..', import.meta.url))
const docsDir = path.join(repo, 'docs', 'components')
const entry = path.join(repo, 'src', 'seekbuddy', 'index.ts')
const check = process.argv.includes('--check')

const config = ts.getParsedCommandLineOfConfigFile(path.join(repo, 'tsconfig.json'), {}, {
  ...ts.sys,
  onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
    throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
  },
})
const program = ts.createProgram([entry], config.options)
const checker = program.getTypeChecker()
const exported = new Map(
  checker.getExportsOfModule(checker.getSymbolAtLocation(program.getSourceFile(entry))).map((symbol) => [
    symbol.name,
    symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol,
  ]),
)

function symbolOf(name) {
  const symbol = exported.get(name)
  if (symbol === undefined) throw new Error(`${name} is not exported from src/seekbuddy/index.ts`)
  return symbol
}

/** Template-literal types print expanded; show the exported alias names instead. */
const TYPE_ALIASES = [
  ['`${number}-${number}-${number}`', 'IsoDate'],
  ['`${number}-${number}`', 'IsoMonth'],
  ['`${number}:${number}`', 'IsoTime'],
]

function prettyType(text, keepAlias) {
  let out = text.replace(/\s+/g, ' ').trim()
  for (const [from, to] of TYPE_ALIASES) if (to !== keepAlias) out = out.split(from).join(to)
  return out.replace(/ \| undefined\b/g, '').replace(/^\((.*)\)$/, '$1')
}

const cell = (text) => text.replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ').trim()
/** `Name.member` entries rendered without a description; `--check` fails on any. */
const missing = []
const code = (text) => (text === '' ? '' : `\`${cell(text)}\``)
const docOf = (symbol) => ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim()

// ---------- component props (react-docgen-typescript, for defaults from destructuring) ----------

const runtimeExports = [...exported].filter(([, symbol]) => symbol.flags & (ts.SymbolFlags.Function | ts.SymbolFlags.Variable))
const componentFiles = [...new Set(runtimeExports.map(([, symbol]) => symbol.declarations[0].getSourceFile().fileName))]
const parser = docgen.withCompilerOptions(config.options, {
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  savePropValueAsString: true,
  // Native attributes inherited from React's DOM typings are summarized in prose, not listed.
  propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
})
const components = new Map(
  parser.parseWithProgramProvider(componentFiles, () => program).map((component) => [component.displayName, component]),
)

function propType(prop) {
  if (prop.type.name === 'enum' && Array.isArray(prop.type.value)) {
    return prettyType(prop.type.value.map((option) => option.value).join(' | '))
  }
  return prettyType(prop.type.name)
}

/**
 * DSH-layer components document their props as `@param props.<name> - text` on the component,
 * which react-docgen-typescript does not read; extra components that pass those props through
 * reuse that text instead of restating it.
 */
function upstreamParamDoc(prop) {
  // Props reached through `Omit<ComponentProps<typeof X>, …>` carry no `parent`, only `declarations`,
  // whose file names are not absolute; map them back through their `src/` suffix.
  for (const { fileName } of [prop.parent, ...(prop.declarations ?? [])].filter(Boolean)) {
    const index = fileName.lastIndexOf('src/')
    if (index === -1 || fileName.includes('src/seekbuddy/')) continue
    const source = readFileSync(path.join(repo, fileName.slice(index)), 'utf8')
    const match = source.match(new RegExp(`@param props\\.${prop.name} - ([^\\n]+)`))
    if (match) return match[1].trim()
  }
  return ''
}

function propsTable(name) {
  const component = components.get(name)
  if (component === undefined) throw new Error(`react-docgen-typescript found no component named ${name}`)
  const props = Object.values(component.props)
  if (props.length === 0) return '_No props._'
  const rows = props.map((prop) => {
    const fallback = prop.required ? '**required**' : code(prop.defaultValue?.value ?? '')
    const description = prop.description || upstreamParamDoc(prop)
    if (description === '') missing.push(`${name}.${prop.name}`)
    return `| \`${prop.name}\` | ${code(propType(prop))} | ${fallback} | ${cell(description)} |`
  })
  return ['| Prop | Type | Default | Description |', '| --- | --- | --- | --- |', ...rows].join('\n')
}

// ---------- exported interfaces and type aliases ----------

function memberType(declaration) {
  if (ts.isMethodSignature(declaration)) {
    const params = declaration.parameters.map((parameter) => parameter.getText()).join(', ')
    return prettyType(`(${params}) => ${declaration.type?.getText() ?? 'void'}`)
  }
  if (declaration.type !== undefined) return prettyType(declaration.type.getText())
  return prettyType(checker.typeToString(checker.getTypeAtLocation(declaration)))
}

function typeBlock(name) {
  const symbol = symbolOf(name)
  const declaration = symbol.declarations[0]
  const description = docOf(symbol)
  if (ts.isTypeAliasDeclaration(declaration) && !ts.isTypeLiteralNode(declaration.type)) {
    const parameters = declaration.typeParameters ? `<${declaration.typeParameters.map((p) => p.getText()).join(', ')}>` : ''
    const definition = ['```ts', `type ${name}${parameters} = ${prettyType(declaration.type.getText(), name)}`, '```'].join('\n')
    return description ? `${description}\n\n${definition}` : definition
  }
  const members = checker.getPropertiesOfType(checker.getDeclaredTypeOfSymbol(symbol))
  const rows = members.map((member) => {
    const memberDeclaration = member.valueDeclaration ?? member.declarations[0]
    const optional = member.flags & ts.SymbolFlags.Optional ? '?' : ''
    const description = docOf(member)
    if (description === '') missing.push(`${name}.${member.name}`)
    return `| \`${member.name}${optional}\` | ${code(memberType(memberDeclaration))} | ${cell(description)} |`
  })
  return [description, ['| Field | Type | Description |', '| --- | --- | --- |', ...rows].join('\n')]
    .filter(Boolean)
    .join('\n\n')
}

// ---------- functions and hooks ----------

function fnBlock(name) {
  const symbol = symbolOf(name)
  const declaration = symbol.declarations[0]
  const signature = checker.getSignaturesOfType(checker.getTypeOfSymbolAtLocation(symbol, declaration), ts.SignatureKind.Call)[0]
  const text = prettyType(
    checker.signatureToString(signature, declaration, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.WriteArrowStyleSignature),
  )
  const params = signature.getJsDocTags().filter((tag) => tag.name === 'param' || tag.name === 'returns')
  const notes = params.map((tag) => `- ${tag.name === 'returns' ? 'Returns' : ''}${ts.displayPartsToString(tag.text)}`)
  return ['```ts', `function ${name}${text.replace(' =>', ':')}`, '```', '', docOf(symbol), notes.length ? `\n${notes.join('\n')}` : '']
    .join('\n')
    .trim()
}

// ---------- page rewriting ----------

const MARKER = /<!-- api:(props|type|fn) ([A-Za-z]+) -->\n[\s\S]*?<!-- \/api -->/g
const render = { props: propsTable, type: typeBlock, fn: fnBlock }
const documented = new Set()
const stale = []

for (const file of readdirSync(docsDir).filter((name) => name.endsWith('.md'))) {
  const absolute = path.join(docsDir, file)
  const before = readFileSync(absolute, 'utf8')
  const after = before.replace(MARKER, (_, kind, name) => {
    if (kind !== 'type') documented.add(name)
    return `<!-- api:${kind} ${name} -->\n${render[kind](name)}\n<!-- /api -->`
  })
  if (after === before) continue
  if (check) stale.push(file)
  else writeFileSync(absolute, after)
}

const undocumented = runtimeExports.map(([name]) => name).filter((name) => !documented.has(name))
if (undocumented.length > 0) {
  console.error(`[api-docs] runtime exports without an api:props / api:fn block: ${undocumented.join(', ')}`)
  process.exitCode = 1
}
const missingUnique = [...new Set(missing)]
if (missingUnique.length > 0) {
  console.error(`[api-docs] ${missingUnique.length} props / fields have no JSDoc:\n  ${missingUnique.join('\n  ')}`)
  if (check) process.exitCode = 1
}
if (stale.length > 0) {
  console.error(`[api-docs] stale pages (run \`bun run docs:api\`): ${stale.join(', ')}`)
  process.exitCode = 1
}
if (process.exitCode !== 1) {
  console.log(`[api-docs] ${check ? 'checked' : 'wrote'} ${documented.size} exports across docs/components/`)
}
