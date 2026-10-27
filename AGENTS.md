# Working on Cairn

Context for AI coding agents (and people). Read this before changing anything. The rules marked
**(enforced)** are checked by `tests/contract.test.ts`, so breaking them fails `npm run verify`.

## What this is

A small, accessible component library for data-heavy product screens. Each component is a Vue 3 SFC
that ships two ways from the same source:

- **Vue library** (`src/index.ts`, built by `vite.config.ts`) for Vue apps
- **Web Components** (`src/wc.ts`, built by `vite.wc.config.ts` in custom-element mode) for
  server-rendered pages such as Django templates and HTMX partials

Anything you change has to work in **both** builds.

## Commands

| Command | Use it for |
| --- | --- |
| `npm run verify` | The gate. Type-check, unit + axe tests (including the contract test), and both builds. Run it before you say you're done. |
| `npm test` | Tests only, while iterating |
| `npm run storybook` | Visual check of every state |
| `npm run dev` | The Vue demo app |

## Definition of done

1. `npm run verify` passes.
2. New or changed behavior has a test in `tests/`, and every component test file runs
   `expectNoAxeViolations` on the mounted component.
3. New states have a story in `stories/`.
4. The README's component table still describes the component accurately.

## Rules

### Components
- **(enforced)** Every component in `src/components/` is exported from `src/index.ts`, registered in
  `src/wc.ts` as `cn-<kebab-name>`, has `stories/<Name>.stories.ts` and has `tests/<kebab-name>.test.ts`
  that calls `expectNoAxeViolations`.
- Follow the WAI-ARIA Authoring Practices pattern for the component's role (combobox, tabs, dialog…).
  Link the pattern in a comment at the top of the component.
- Keyboard first: every interaction must work without a mouse. Test the keys in `tests/`.

### Styling
- **(enforced)** Component styles use semantic tokens (`--cn-color-*`) and the spacing, radius,
  font and motion scales. No raw colors (`#hex`, `rgb()`, `hsl()`) and no palette primitives
  (`--cn-gray-*`, `--cn-blue-*`, `--cn-teal-*`, `--cn-red-*`). Themes only work if components never
  bypass the semantic layer.
- Respect `prefers-reduced-motion` through the `--cn-duration-*` tokens instead of hard-coded times.

### Web Component constraints (the ones that bite)
- ARIA ID references (`for`, `aria-controls`, `aria-activedescendant`, `aria-labelledby`) don't
  cross shadow roots. A component that needs a label renders its own `<label>`; don't rely on one
  outside it.
- Attributes are strings. Array and object props must accept JSON strings too: use `parseList`
  from `src/utils/parse.ts`.
- Emitted events become `CustomEvent`s with the payload in `event.detail[0]`. Keep payloads
  serializable and document them in the component's story.
- Named slots map to native `slot="…"`. Prefer slots over props that take HTML strings.

## Don't

- Don't add runtime dependencies without a strong reason; the Web Component build bundles Vue.
- Don't disable an axe rule in a test to make it pass. Fix the markup. (`color-contrast` and
  `region` are already off in `tests/axe.ts` because jsdom can't evaluate them.)
- Don't edit generated output (`dist/`, `dist-wc/`, `site-dist/`, `storybook-static/`).
