import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { CnDataTable } from '../src'
import type { TableColumn } from '../src'
import { expectNoAxeViolations } from './axe'

const columns: TableColumn[] = [
  { key: 'hospital', label: 'Hospital', sortable: true },
  { key: 'rate', label: 'Rate', type: 'currency', sortable: true },
]
const rows = [
  { id: 'a', hospital: 'Northside', rate: 1310 },
  { id: 'b', hospital: 'Harbor', rate: 2029 },
  { id: 'c', hospital: 'Lakeview', rate: 1082 },
]

function setup(props = {}) {
  return mount(CnDataTable, { props: { caption: 'Rates', columns, rows, ...props }, attachTo: document.body })
}
const firstColumn = (wrapper: ReturnType<typeof setup>) =>
  wrapper.findAll('tbody tr').map((tr) => tr.findAll('td')[0].text())

afterEach(() => {
  document.body.innerHTML = ''
})

describe('CnDataTable', () => {
  it('formats dates as readable text', () => {
    const wrapper = mount(CnDataTable, {
      props: { caption: 'Rotations', columns: [{ key: 'starts', label: 'Starts', type: 'date' }], rows: [{ id: 1, starts: '2027-01-04' }] },
    })
    expect(wrapper.get('tbody td').text()).toBe('Jan 4, 2027')
  })

  it('formats currency and right-aligns numeric columns', () => {
    const cell = setup().findAll('tbody td')[1]
    expect(cell.text()).toBe('$1,310')
    expect(cell.classes()).toContain('is-numeric')
  })

  it('sorts on header click and reflects it with aria-sort', async () => {
    const wrapper = setup()
    const th = wrapper.findAll('th')[1]
    await th.get('button').trigger('click')
    expect(th.attributes('aria-sort')).toBe('ascending')
    expect(firstColumn(wrapper)).toEqual(['Lakeview', 'Northside', 'Harbor'])
    await th.get('button').trigger('click')
    expect(th.attributes('aria-sort')).toBe('descending')
    expect(wrapper.emitted('sort')?.[1]).toEqual([{ key: 'rate', direction: 'descending' }])
  })

  it('shows skeleton rows on first load and keeps rows while refreshing', () => {
    expect(setup({ rows: [], loading: true }).findAll('.cn-table__skeleton')).toHaveLength(5)
    const refreshing = setup({ loading: true })
    expect(refreshing.findAll('.cn-table__skeleton')).toHaveLength(0)
    expect(refreshing.get('table').attributes('aria-busy')).toBe('true')
  })

  it('renders an alert with a retry action on error', async () => {
    const wrapper = setup({ rows: [], error: 'Service unavailable' })
    expect(wrapper.get('[role="alert"]').text()).toContain('Service unavailable')
    await wrapper.get('.cn-table__retry').trigger('click')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it('gives row actions a unique accessible name', () => {
    const labels = setup({ rowActionLabel: 'Details' })
      .findAll('.cn-table__action-button')
      .map((b) => b.attributes('aria-label'))
    expect(labels[0]).toBe('Details: Northside, $1,310')
    expect(new Set(labels).size).toBe(rows.length)
  })

  it('has no axe violations', async () => {
    await expectNoAxeViolations(setup({ rowActionLabel: 'Details' }).element)
  })
})
