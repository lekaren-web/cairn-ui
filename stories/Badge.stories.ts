import type { Meta, StoryObj } from '@storybook/vue3'
import { CnBadge } from '../src'

const meta = {
  title: 'Components/Badge',
  component: CnBadge,
  args: { tone: 'neutral' },
  argTypes: { tone: { control: 'inline-radio', options: ['neutral', 'info', 'success', 'warning', 'danger'] } },
  render: (args) => ({
    components: { CnBadge },
    setup: () => ({ args }),
    template: '<CnBadge v-bind="args">Status</CnBadge>',
  }),
} satisfies Meta<typeof CnBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Neutral: Story = {}

/** Each tone pairs a background and text token chosen for AA contrast in both themes. */
export const AllTones: Story = {
  render: () => ({
    components: { CnBadge },
    template: `
      <div style="display:flex; gap:8px">
        <CnBadge>Full</CnBadge>
        <CnBadge tone="info">New</CnBadge>
        <CnBadge tone="success">Open</CnBadge>
        <CnBadge tone="warning">Waitlist</CnBadge>
        <CnBadge tone="danger">Closed</CnBadge>
      </div>`,
  }),
}
