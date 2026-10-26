import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { CnTabs } from '../src'
import { expectNoAxeViolations } from './axe'

const tabs = [
  { id: 'rates', label: 'Rates', count: 24 },
  { id: 'summary', label: 'Summary' },
  { id: 'about', label: 'About' },
]

function setup() {
  return mount(CnTabs, {
    props: { tabs, label: 'Details' },
    slots: { rates: '<p>Rates panel</p>', summary: '<p>Summary panel</p>', about: '<p>About panel</p>' },
    attachTo: document.body,
  })
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('CnTabs', () => {
  it('uses a roving tabindex with one tab in the Tab order', () => {
    const wrapper = setup()
    const tabindexes = wrapper.findAll('[role="tab"]').map((t) => t.attributes('tabindex'))
    expect(tabindexes).toEqual(['0', '-1', '-1'])
  })

  it('arrow keys move focus and selection, wrapping at the ends', async () => {
    const wrapper = setup()
    const [first, , last] = wrapper.findAll('[role="tab"]')
    await first.trigger('keydown', { key: 'ArrowLeft' })
    await nextTick()
    expect(last.attributes('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(last.element)
    expect(wrapper.emitted('change')?.[0]).toEqual(['about'])

    await last.trigger('keydown', { key: 'Home' })
    await nextTick()
    expect(first.attributes('aria-selected')).toBe('true')
  })

  it('shows only the active panel, labelled by its tab', async () => {
    const wrapper = setup()
    const panels = wrapper.findAll('[role="tabpanel"]')
    expect(panels.map((p) => p.attributes('hidden') !== undefined)).toEqual([false, true, true])
    const firstTab = wrapper.findAll('[role="tab"]')[0]
    expect(panels[0].attributes('aria-labelledby')).toBe(firstTab.attributes('id'))
  })

  it('has no axe violations', async () => {
    await expectNoAxeViolations(setup().element)
  })
})
