# Cairn

A small, accessible component library for data-dense product UI. Components are written once as
Vue 3 single-file components and shipped two ways:

- **Vue library** (`src/index.ts`) for Vue apps
- **Native Web Components** (`src/wc.ts` → `dist-wc/cairn-wc.js`) for server-rendered pages such as
  Django templates and HTMX partials

The repo includes two demo surfaces of the same "Price Explorer" product, one in Vue and one in
Django + HTMX, so you can see both builds side by side.

## What's inside

| Path | What it is |
| --- | --- |
| `src/tokens/tokens.css` | Design tokens: primitives, semantic tokens, light and dark themes, reduced motion |
| `src/components/` | `CnButton`, `CnBadge`, `CnCombobox`, `CnTabs`, `CnDialog`, `CnDataTable` |
| `src/wc.ts` | Registers every component as a custom element (`<cn-combobox>`, …) |
| `demo/` | Vue 3 demo app (`npm run dev`) |
| `django_demo/` | Single-file Django app using the Web Component build with HTMX |
| `stories/` | Storybook stories, including a before/after case study |
| `tests/` | Vitest keyboard, ARIA and axe tests for each component |
| `data/prices.json` | Generated sample data (fictional hospitals and payers) |

## Run it

```bash
npm install
npm run dev              # Vue demo at http://localhost:5173
npm run storybook        # Storybook at http://localhost:6006
npm test                 # 22 tests: keyboard, ARIA, axe
npm run build            # type-check, Vue library build, Web Component build
```

Django + HTMX demo:

```bash
python3 -m venv .venv && .venv/bin/pip install -r django_demo/requirements.txt
npm run build:wc
.venv/bin/python django_demo/app.py runserver 8001   # http://localhost:8001
```

## Components

| Component | Pattern | Highlights |
| --- | --- | --- |
| `CnButton` | Button | Variants and sizes; `loading` keeps focus and announces state instead of disabling |
| `CnBadge` | Status | Tone tokens with AA-contrast pairs in both themes |
| `CnCombobox` | [APG combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) (list autocomplete) | `aria-activedescendant`, filtering by label or code, match highlighting, result-count live region |
| `CnTabs` | [APG tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) | Roving tabindex, arrows/Home/End, automatic activation, optional counts |
| `CnDialog` | Native `<dialog>` | `showModal()` for inert background and Escape; focus restoration; backdrop dismiss |
| `CnDataTable` | Sortable table | `aria-sort`, skeleton first load, dimmed refresh, error with retry, empty state, keyboard-scrollable region |

## Using the Web Components

```html
<link rel="stylesheet" href="/static/tokens.css" />
<script type="module" src="/static/cairn-wc.js"></script>

<cn-combobox label="Procedure" options='[{"value":"70553","label":"MRI brain"}]'></cn-combobox>
<script>
  document.querySelector('cn-combobox').addEventListener('change', (e) => console.log(e.detail[0]))
</script>
```

- camelCase props become kebab-case attributes (`modelValue` → `model-value`).
- Array props accept JSON strings as attributes, or real arrays as properties (`el.rows = [...]`).
- Events are `CustomEvent`s with the payload in `event.detail[0]`.
- Theme tokens are CSS custom properties, which inherit into each shadow root.
