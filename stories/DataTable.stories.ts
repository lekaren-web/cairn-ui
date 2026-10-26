import type { Meta, StoryObj } from '@storybook/vue3'
import { CnDataTable } from '../src'
import type { TableColumn } from '../src'
import data from '../data/prices.json'

const columns: TableColumn[] = [
  { key: 'hospital', label: 'Hospital', sortable: true },
  { key: 'payer', label: 'Payer', sortable: true },
  { key: 'rate', label: 'Negotiated rate', type: 'currency', sortable: true },
  { key: 'cash', label: 'Cash price', type: 'currency', sortable: true },
  {
    key: 'position',
    label: 'vs. median',
    type: 'badge',
    tones: { 'Below median': 'success', 'Near median': 'neutral', 'Above median': 'warning' },
  },
]
const rows = data.rates['70553'].slice(0, 8)

const meta = {
  title: 'Components/DataTable',
  component: CnDataTable,
  args: { caption: 'Negotiated rates for MRI brain', columns, rows, loading: false, error: '', rowActionLabel: '' },
} satisfies Meta<typeof CnDataTable>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithRowAction: Story = { args: { rowActionLabel: 'Details' } }
/** First load: skeleton rows hold the layout while data arrives. */
export const Loading: Story = { args: { rows: [], loading: true } }
/** Refresh: existing rows stay in place, dimmed, so nothing jumps. */
export const Refreshing: Story = { args: { loading: true } }
export const Error: Story = { args: { rows: [], error: 'The rates service returned 503 (Service Unavailable).' } }
export const Empty: Story = { args: { rows: [], emptyText: 'No rates published for this procedure.' } }
