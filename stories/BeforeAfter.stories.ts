import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { CnCombobox } from '../src'
import data from '../data/rotations.json'

const meta = { title: 'Case studies/Specialty picker: before and after' } satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/**
 * **Before:** a one-off dropdown built from `<div>`s, the kind that shows up in feature code.
 * It works with a mouse and nothing else: no label association, no keyboard support, no roles,
 * nothing announced to screen readers, and the menu can't be filtered.
 *
 * **After:** `CnCombobox`, following the WAI-ARIA combobox pattern. Run the Accessibility
 * panel on each story to compare.
 */
export const Before: Story = {
  parameters: { a11y: { test: 'todo' } },
  render: () => ({
    setup: () => ({ open: ref(false), picked: ref('Choose a specialty'), options: data.specialties }),
    template: `
      <div style="max-width:420px; min-height:340px; font-family: var(--cn-font-sans); color: var(--cn-color-text)">
        <div style="font-size:14px; font-weight:600; margin-bottom:4px">Specialty</div>
        <div @click="open = !open" style="padding:10px 12px; border:1px solid #ddd; border-radius:6px; background: var(--cn-color-surface); cursor:pointer; font-size:14px">{{ picked }}</div>
        <div v-if="open" style="border:1px solid #ddd; border-radius:6px; margin-top:4px; background: var(--cn-color-surface)">
          <div v-for="o in options" :key="o.value" @click="picked = o.label; open = false" style="padding:8px 12px; font-size:14px; cursor:pointer; color:#999">{{ o.label }}</div>
        </div>
      </div>`,
  }),
}

export const After: Story = {
  render: () => ({
    components: { CnCombobox },
    setup: () => ({ value: ref(null), options: data.specialties }),
    template: `
      <div style="max-width:420px; min-height:340px">
        <CnCombobox v-model="value" label="Specialty" placeholder="Search specialties" :options="options" />
      </div>`,
  }),
}
