import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { CnBadge } from '../src'
import { expectNoAxeViolations } from './axe'

describe('CnBadge', () => {
  it('defaults to the neutral tone', () => {
    const wrapper = mount(CnBadge, { slots: { default: 'Full' } })
    expect(wrapper.classes()).toContain('cn-badge--neutral')
    expect(wrapper.text()).toBe('Full')
  })

  it('applies the requested tone', () => {
    const wrapper = mount(CnBadge, { props: { tone: 'success' }, slots: { default: 'Open' } })
    expect(wrapper.classes()).toContain('cn-badge--success')
  })

  it('has no axe violations', async () => {
    await expectNoAxeViolations(mount(CnBadge, { props: { tone: 'warning' }, slots: { default: 'Waitlist' }, attachTo: document.body }).element)
  })
})
