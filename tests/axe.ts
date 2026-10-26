import axe from 'axe-core'
import { expect } from 'vitest'

/** Runs axe against a mounted component. Color contrast is skipped: jsdom has no layout or computed colors. */
export async function expectNoAxeViolations(element: Element) {
  const results = await axe.run(element, {
    rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
  })
  expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
}
