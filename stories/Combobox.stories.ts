import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { CnCombobox } from '../src'
import data from '../data/prices.json'

const meta = {
  title: 'Components/Combobox',
  component: CnCombobox,
  args: {
    label: 'Procedure',
    options: data.procedures,
    placeholder: 'Search by name or CPT code',
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
 * Matching text is underlined, and a live region announces the result count.
 */
export const Default: Story = {}
export const WithSelection: Story = { args: { modelValue: '29881' } }
export const WithHint: Story = { args: { hint: 'Try “MRI”, “knee” or “80053”.' } }
export const Disabled: Story = { args: { disabled: true, modelValue: '70553' } }
