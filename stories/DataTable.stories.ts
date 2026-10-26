import type { Meta, StoryObj } from '@storybook/vue3'
import { CnDataTable } from '../src'
import type { TableColumn } from '../src'
import data from '../data/rotations.json'

const columns: TableColumn[] = [
  { key: 'site', label: 'Site', sortable: true },
  { key: 'setting', label: 'Setting', sortable: true },
  { key: 'starts', label: 'Starts', type: 'date', sortable: true },
  { key: 'seatsOpen', label: 'Open seats', type: 'number', sortable: true },
  { key: 'status', label: 'Status', type: 'badge', tones: { Open: 'success', Waitlist: 'warning', Full: 'neutral' } },
]
const rows = data.rotations.im

const meta = {
  title: 'Components/DataTable',
  component: CnDataTable,
  args: { caption: 'Internal Medicine rotations', columns, rows, loading: false, error: '', rowActionLabel: '' },
} satisfies Meta<typeof CnDataTable>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithRowAction: Story = { args: { rowActionLabel: 'Details' } }
/** First load: skeleton rows hold the layout while data arrives. */
export const Loading: Story = { args: { rows: [], loading: true } }
/** Refresh: existing rows stay in place, dimmed, so nothing jumps. */
export const Refreshing: Story = { args: { loading: true } }
export const Error: Story = { args: { rows: [], error: 'The scheduling service returned 503 (Service Unavailable).' } }
export const Empty: Story = { args: { rows: [], emptyText: 'No rotations scheduled for this specialty.' } }
