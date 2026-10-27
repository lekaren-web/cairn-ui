// The library's rules as code. AGENTS.md marks these "(enforced)": an agent or a person who adds a
// component without wiring it up, testing it or keeping it on the semantic token layer fails
// `npm run verify` here, with a message that says what's missing.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Vitest runs from the project root.
const root = process.cwd() + '/'
const read = (path: string) => readFileSync(root + path, 'utf8')
const kebab = (s: string) => s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()

const components = readdirSync(root + 'src/components')
  .filter((f) => f.endsWith('.vue'))
  .map((file) => {
    const name = file.replace(/\.vue$/, '') // CnDataTable
    const short = name.replace(/^Cn/, '') // DataTable
    return { file, name, short, tag: `cn-${kebab(short)}`, test: `tests/${kebab(short)}.test.ts`, story: `stories/${short}.stories.ts` }
  })

describe('every component is wired up, tested and documented', () => {
  const index = read('src/index.ts')
  const wc = read('src/wc.ts')

  it.each(components)('$name', (c) => {
    const missing: string[] = []
    if (!new RegExp(`export \\{[^}]*\\b${c.name}\\b`).test(index)) missing.push(`export from src/index.ts`)
    if (!wc.includes(`'${c.tag}': defineCustomElement(${c.name})`)) missing.push(`register '${c.tag}' in src/wc.ts`)
    if (!existsSync(root + c.story)) missing.push(`story at ${c.story}`)
    if (!existsSync(root + c.test)) missing.push(`test at ${c.test}`)
    else if (!read(c.test).includes('expectNoAxeViolations')) missing.push(`an axe check in ${c.test}`)
    expect(missing, `${c.name} is missing: ${missing.join(', ')}`).toEqual([])
  })
})

describe('component styles stay on the semantic token layer', () => {
  const rawColor = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g
  const primitive = /--cn-(gray|blue|teal|red)-\d+/g

  it.each(components)('$name', (c) => {
    const style = read(`src/components/${c.file}`).match(/<style[^>]*>([\s\S]*?)<\/style>/)?.[1] ?? ''
    const problems = [...(style.match(rawColor) ?? []), ...(style.match(primitive) ?? [])]
    expect(problems, `${c.name} uses raw colors or palette tokens: ${problems.join(', ')}. Use --cn-color-* instead.`).toEqual([])
  })
})
