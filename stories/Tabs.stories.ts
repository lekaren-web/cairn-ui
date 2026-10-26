import type { Meta, StoryObj } from '@storybook/vue3'
import { CnTabs } from '../src'

const meta = {
  title: 'Components/Tabs',
  component: CnTabs,
  args: {
    label: 'Specialty details',
    tabs: [
      { id: 'rotations', label: 'Rotations', count: 10 },
      { id: 'summary', label: 'Summary' },
      { id: 'about', label: 'About the data' },
    ],
  },
  render: (args) => ({
    components: { CnTabs },
    setup: () => ({ args }),
    template: `
      <CnTabs v-bind="args">
        <template #rotations><p>10 rotations across 6 sites.</p></template>
        <template #summary><p>14 open seats.</p></template>
        <template #about><p>All data in this story is sample data.</p></template>
      </CnTabs>`,
  }),
} satisfies Meta<typeof CnTabs>

export default meta
type Story = StoryObj<typeof meta>

/** One Tab stop for the list; ←/→ move and activate, Home/End jump to the ends. */
export const Default: Story = {}
export const Preselected: Story = { args: { modelValue: 'summary' } }
