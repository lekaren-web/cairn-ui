import data from '../data/prices.json'
import type { ComboboxOption, TableRow } from '../src'

export const procedures: ComboboxOption[] = data.procedures

/** Simulated API call, so the demo can show real loading and error states. */
export async function fetchRates(code: string, { fail = false } = {}): Promise<TableRow[]> {
  await new Promise((resolve) => setTimeout(resolve, 700))
  if (fail) throw new Error('The rates service returned 503 (Service Unavailable).')
  return (data.rates as Record<string, TableRow[]>)[code] ?? []
}
