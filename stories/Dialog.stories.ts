import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { CnButton, CnDialog } from '../src'

const meta = {
  title: 'Components/Dialog',
  component: CnDialog,
  args: {
    title: 'Remove saved search?',
    description: 'You can save it again later from the search page.',
    size: 'sm',
  },
  render: (args) => ({
    components: { CnButton, CnDialog },
    setup: () => ({ args, open: ref(false) }),
    template: `
      <CnButton variant="secondary" @click="open = true">Remove saved search</CnButton>
      <CnDialog v-bind="args" v-model:open="open">
        <p style="margin:0">“Pediatrics · Columbus, OH” will no longer appear in your saved searches.</p>
        <template #footer>
          <CnButton variant="secondary" @click="open = false">Cancel</CnButton>
          <CnButton variant="danger" @click="open = false">Remove</CnButton>
        </template>
      </CnDialog>`,
  }),
} satisfies Meta<typeof CnDialog>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Built on the native `<dialog>` element with `showModal()`: the browser makes the rest
 * of the page inert, handles Escape and renders in the top layer. The component adds
 * labelling, backdrop dismissal and returns focus to whatever opened it.
 */
export const Confirm: Story = {}
