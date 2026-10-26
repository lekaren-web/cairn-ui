import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { CnDialog } from '../src'
import { expectNoAxeViolations } from './axe'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('CnDialog', () => {
  it('is labelled by its title and described by its description', () => {
    const wrapper = mount(CnDialog, { props: { title: 'Rate details', description: 'Summit Health PPO' } })
    const dialog = wrapper.get('dialog')
    expect(wrapper.get(`#${dialog.attributes('aria-labelledby')}`).text()).toBe('Rate details')
    expect(wrapper.get(`#${dialog.attributes('aria-describedby')}`).text()).toBe('Summit Health PPO')
  })

  it('returns focus to the element that opened it', async () => {
    const trigger = document.createElement('button')
    document.body.append(trigger)
    trigger.focus()

    const wrapper = mount(CnDialog, { props: { title: 'Rate details' }, attachTo: document.body })
    await wrapper.setProps({ open: true })
    expect(wrapper.get('dialog').attributes('open')).toBeDefined()

    await wrapper.get('.cn-dialog__close').trigger('click')
    await nextTick()
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
    expect(document.activeElement).toBe(trigger)
  })

  it('has no axe violations when open', async () => {
    const wrapper = mount(CnDialog, {
      props: { title: 'Rate details', open: true },
      slots: { default: '<p>Negotiated rate: $1,310</p>' },
      attachTo: document.body,
    })
    await nextTick()
    await expectNoAxeViolations(wrapper.element)
  })
})
