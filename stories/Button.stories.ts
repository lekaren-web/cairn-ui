import type { Meta, StoryObj } from '@storybook/vue3'
import { CnButton } from '../src'

const meta = {
  title: 'Components/Button',
  component: CnButton,
  args: { variant: 'primary', size: 'md', loading: false, disabled: false },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
  render: (args) => ({
    components: { CnButton },
    setup: () => ({ args }),
    template: '<CnButton v-bind="args">Save changes</CnButton>',
  }),
} satisfies Meta<typeof CnButton>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}
export const Secondary: Story = { args: { variant: 'secondary' } }
export const Ghost: Story = { args: { variant: 'ghost' } }
export const Danger: Story = { args: { variant: 'danger' } }

/** Stays focusable and announces "Saving" instead of becoming disabled, so keyboard focus isn't lost mid-action. */
export const Loading: Story = { args: { loading: true, loadingLabel: 'Saving' } }
export const Disabled: Story = { args: { disabled: true } }

export const AllVariants: Story = {
  render: () => ({
    components: { CnButton },
    template: `
      <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:center">
        <CnButton>Primary</CnButton>
        <CnButton variant="secondary">Secondary</CnButton>
        <CnButton variant="ghost">Ghost</CnButton>
        <CnButton variant="danger">Delete</CnButton>
        <CnButton size="sm">Small</CnButton>
        <CnButton loading>Loading</CnButton>
      </div>`,
  }),
}
