import type { Meta, StoryObj } from '@storybook/vue3'
import { CnTabs } from '../src'

const meta = {
  title: 'Components/Tabs',
  component: CnTabs,
  args: {
    label: 'Procedure details',
    tabs: [
      { id: 'rates', label: 'Negotiated rates', count: 24 },
      { id: 'summary', label: 'Summary' },
      { id: 'about', label: 'About the data' },
    ],
  },
  render: (args) => ({
    components: { CnTabs },
    setup: () => ({ args }),
    template: `
      <CnTabs v-bind="args">
        <template #rates><p>24 negotiated rates across 6 hospitals.</p></template>
        <template #summary><p>Median rate: $1,452.</p></template>
        <template #about><p>All data in this story is sample data.</p></template>
      </CnTabs>`,
  }),
} satisfies Meta<typeof CnTabs>

export default meta
type Story = StoryObj<typeof meta>

/** One Tab stop for the list; ←/→ move and activate, Home/End jump to the ends. */
export const Default: Story = {}
export const Preselected: Story = { args: { modelValue: 'summary' } }
