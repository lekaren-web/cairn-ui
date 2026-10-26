import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { CnCombobox } from '../src'
import { expectNoAxeViolations } from './axe'

const options = [
  { value: '70553', label: 'MRI brain, with and without contrast', description: 'CPT 70553' },
  { value: '29881', label: 'Knee arthroscopy with meniscectomy', description: 'CPT 29881' },
  { value: '80053', label: 'Comprehensive metabolic panel', description: 'CPT 80053' },
]

function setup(props = {}) {
  return mount(CnCombobox, { props: { label: 'Procedure', options, ...props }, attachTo: document.body })
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('CnCombobox', () => {
  it('labels the input and wires it to the listbox', () => {
    const wrapper = setup()
    const input = wrapper.get('input')
    expect(input.attributes('role')).toBe('combobox')
    expect(wrapper.get('label').attributes('for')).toBe(input.attributes('id'))
    expect(input.attributes('aria-controls')).toBe(wrapper.get('[role="listbox"]').attributes('id'))
    expect(input.attributes('aria-expanded')).toBe('false')
  })

  it('opens with ArrowDown and tracks the active option with aria-activedescendant', async () => {
    const wrapper = setup()
    const input = wrapper.get('input')
    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(input.attributes('aria-expanded')).toBe('true')
    const first = wrapper.findAll('[role="option"]')[0]
    expect(input.attributes('aria-activedescendant')).toBe(first.attributes('id'))

    await input.trigger('keydown', { key: 'ArrowDown' })
    const second = wrapper.findAll('[role="option"]')[1]
    expect(input.attributes('aria-activedescendant')).toBe(second.attributes('id'))
  })

  it('filters by label or code and selects with Enter', async () => {
    const wrapper = setup()
    const input = wrapper.get('input')
    await input.setValue('80053')
    expect(wrapper.findAll('[role="option"]')).toHaveLength(1)
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['80053'])
    expect(wrapper.emitted('change')?.[0]).toEqual(['80053'])
    expect(input.attributes('aria-expanded')).toBe('false')
  })

  it('announces the number of results and the empty state', async () => {
    const wrapper = setup()
    const input = wrapper.get('input')
    await input.setValue('knee')
    expect(wrapper.get('[role="status"]').text()).toBe('1 result available')
    await input.setValue('zzz')
    expect(wrapper.get('[role="status"]').text()).toBe('No matches')
  })

  it('Escape closes and restores the selected label; a second Escape clears', async () => {
    const wrapper = setup({ modelValue: '29881' })
    const input = wrapper.get('input')
    await input.setValue('mri')
    await input.trigger('keydown', { key: 'Escape' })
    expect((input.element as HTMLInputElement).value).toBe('Knee arthroscopy with meniscectomy')
    await input.trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null])
  })

  it('accepts options as a JSON string (Web Component attribute)', () => {
    const wrapper = setup({ options: JSON.stringify(options) })
    expect(wrapper.findAll('[role="option"]')).toHaveLength(3)
  })

  it('has no axe violations when open', async () => {
    const wrapper = setup({ hint: 'Search by name or code' })
    await wrapper.get('input').trigger('keydown', { key: 'ArrowDown' })
    await expectNoAxeViolations(wrapper.element)
  })
})
