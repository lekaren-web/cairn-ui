# Cairn

A small, accessible component library for data-dense product UI. Components are written once as
Vue 3 single-file components and shipped two ways:

- **Vue library** (`src/index.ts`) for Vue apps
- **Native Web Components** (`src/wc.ts` → `dist-wc/cairn-wc.js`) for server-rendered pages such as
  Django templates and HTMX partials

The repo includes two demo surfaces of the same "Rotation Finder" product (clinical rotation
scheduling with sample data), one in Vue and one in Django + HTMX, so you can see both builds side by side.

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
| `data/rotations.json` | Generated sample data (fictional sites and rotation blocks) |

## Run it

```bash
npm install
npm run dev              # Vue demo at http://localhost:5173
npm run storybook        # Storybook at http://localhost:6006
npm test                 # keyboard, ARIA and axe tests
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
| `CnCombobox` | [APG combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) (list autocomplete) | `aria-activedescendant`, filtering by label or description, match highlighting, result-count live region |
| `CnTabs` | [APG tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) | Roving tabindex, arrows/Home/End, automatic activation, optional counts |
| `CnDialog` | Native `<dialog>` | `showModal()` for inert background and Escape; focus restoration; backdrop dismiss |
| `CnDataTable` | Sortable table | `aria-sort`, skeleton first load, dimmed refresh, error with retry, empty state, keyboard-scrollable region |

## Using the Web Components

```html
<link rel="stylesheet" href="/static/tokens.css" />
<script type="module" src="/static/cairn-wc.js"></script>

<cn-combobox label="Specialty" options='[{"value":"im","label":"Internal Medicine"}]'></cn-combobox>
<script>
  document.querySelector('cn-combobox').addEventListener('change', (e) => console.log(e.detail[0]))
</script>
```

- camelCase props become kebab-case attributes (`modelValue` → `model-value`).
- Array props accept JSON strings as attributes, or real arrays as properties (`el.rows = [...]`).
- Events are `CustomEvent`s with the payload in `event.detail[0]`.
- Theme tokens are CSS custom properties, which inherit into each shadow root.

## Working on it with AI agents

The repo is set up so coding agents (Claude Code, Codex, Cursor) get the same context and the same
gate as a person:

- **Context:** [`AGENTS.md`](AGENTS.md) explains the architecture, the Web Component constraints that
  are easy to get wrong, and the definition of done. `CLAUDE.md` imports it.
- **Rules as code:** [`tests/contract.test.ts`](tests/contract.test.ts) enforces the rules marked
  *(enforced)* in AGENTS.md: every component is exported, registered as a custom element, documented
  in a story and covered by a test with an axe check, and its styles use semantic tokens only.
- **Gate:** `npm run verify` runs the type-check, all tests and both builds.
- **Agent hook:** [`.claude/settings.json`](.claude/settings.json) runs
  [`scripts/agent-verify.sh`](scripts/agent-verify.sh) when Claude Code tries to finish. If files changed
  and verify fails, the failure goes back to the agent to fix instead of ending the turn.
- **CI:** [`.github/workflows/verify.yml`](.github/workflows/verify.yml) runs the same gate, plus a
  Storybook build, on every push and pull request.
