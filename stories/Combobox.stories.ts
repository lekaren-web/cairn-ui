import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { CnCombobox } from '../src'
import data from '../data/rotations.json'

const meta = {
  title: 'Components/Combobox',
  component: CnCombobox,
  args: {
    label: 'Specialty',
    options: data.specialties,
    placeholder: 'Search specialties',
    hint: '',
    disabled: false,
  },
  render: (args) => ({
    components: { CnCombobox },
    setup: () => ({ args, value: ref(args.modelValue ?? null) }),
    template: `
      <div style="max-width: 420px; min-height: 360px">
        <CnCombobox v-bind="args" v-model="value" />
        <p style="font-size: 13px; color: var(--cn-color-text-muted)">Selected value: <code>{{ value ?? 'none' }}</code></p>
      </div>`,
  }),
} satisfies Meta<typeof CnCombobox>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Keyboard: ↓/↑ open and move, Enter selects, Escape closes (or clears when closed), Tab leaves.
 * Matching text is underlined, the secondary line is searchable too, and a live region announces the result count.
 */
export const Default: Story = {}
export const WithSelection: Story = { args: { modelValue: 'peds' } }
export const WithHint: Story = { args: { hint: 'Try “surgery”, “peds” or “psych”.' } }
export const Disabled: Story = { args: { disabled: true, modelValue: 'im' } }
