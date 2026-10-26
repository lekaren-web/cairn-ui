/**
 * Static version of the Django + HTMX demo, for hosting without a Python server.
 * Each specialty's partial is pre-rendered to its own HTML file, and HTMX fetches
 * those files exactly as it would fetch the Django view.
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const out = 'site-dist/web-components'
const data = JSON.parse(readFileSync('data/rotations.json', 'utf8'))
const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' })[c])

const columns = [
  { key: 'site', label: 'Site', sortable: true },
  { key: 'setting', label: 'Setting', sortable: true },
  { key: 'starts', label: 'Starts', type: 'date', sortable: true },
  { key: 'weeks', label: 'Weeks', type: 'number' },
  { key: 'seatsOpen', label: 'Open seats', type: 'number', sortable: true },
  { key: 'status', label: 'Status', type: 'badge', sortable: true, tones: { Open: 'success', Waitlist: 'warning', Full: 'neutral' } },
]

mkdirSync(`${out}/rotations`, { recursive: true })
copyFileSync('dist-wc/cairn-wc.js', `${out}/cairn-wc.js`)
copyFileSync('src/tokens/tokens.css', `${out}/tokens.css`)

for (const s of data.specialties) {
  writeFileSync(
    `${out}/rotations/${s.value}.html`,
    `<h2 class="specialty-title">${escape(s.label)} <span class="specialty-meta">${escape(s.description)}</span></h2>
<cn-data-table caption="${escape(s.label)} rotations" columns="${escape(JSON.stringify(columns))}" rows="${escape(JSON.stringify(data.rotations[s.value]))}" empty-text="No rotations scheduled for this specialty."></cn-data-table>
`,
  )
}

const page = readFileSync('django_demo/templates/index.html', 'utf8')
  .replace("{% load static %}", '')
  .replace("{% static 'tokens.css' %}", './tokens.css')
  .replace("{% static 'cairn-wc.js' %}", './cairn-wc.js')
  .replace('{{ options_json }}', escape(JSON.stringify(data.specialties)))
  .replace('{{ tabs_json }}', escape(JSON.stringify([{ id: 'rotations', label: 'Rotations' }, { id: 'about', label: 'About the data' }])))
  .replace('model-value="{{ code }}"', 'model-value="im"')
  .replace('hx-get="/rotations?specialty={{ code|urlencode }}"', 'hx-get="./rotations/im.html"')
  .replace('Cairn · Django + HTMX surface', 'Cairn · Web Components + HTMX surface')
  .replace('Picking a specialty fetches a server-rendered partial with HTMX.', 'Picking a specialty fetches a pre-rendered partial with HTMX.')
  .replace("htmx.ajax('GET', `/rotations?specialty=${encodeURIComponent(code)}`", "htmx.ajax('GET', `./rotations/${encodeURIComponent(code)}.html`")
  .replace("        history.replaceState(null, '', `?specialty=${encodeURIComponent(code)}`)\n", '')

if (/\{[{%]/.test(page)) throw new Error('Unreplaced Django template tag in static page')
writeFileSync(`${out}/index.html`, page)
console.log(`Static HTMX demo written to ${out}/ (${data.specialties.length} partials)`)
