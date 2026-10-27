import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { CnButton } from '../src'
import { expectNoAxeViolations } from './axe'

describe('CnButton', () => {
  it('passes clicks through when idle', async () => {
    const onClick = vi.fn()
    const wrapper = mount(CnButton, { attrs: { onClick }, slots: { default: 'Save' } })
    await wrapper.trigger('click')
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('swallows clicks while loading but stays focusable and announces the state', async () => {
    const onClick = vi.fn()
    const wrapper = mount(CnButton, {
      props: { loading: true, loadingLabel: 'Saving' },
      attrs: { onClick },
      slots: { default: 'Save' },
    })
    await wrapper.trigger('click')
    expect(onClick).not.toHaveBeenCalled()
    expect(wrapper.attributes('disabled')).toBeUndefined()
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.text()).toContain('Saving')
  })

  it('has no axe violations, idle or loading', async () => {
    await expectNoAxeViolations(mount(CnButton, { slots: { default: 'Save' }, attachTo: document.body }).element)
    await expectNoAxeViolations(mount(CnButton, { props: { loading: true, loadingLabel: 'Saving' }, slots: { default: 'Save' }, attachTo: document.body }).element)
  })
})
