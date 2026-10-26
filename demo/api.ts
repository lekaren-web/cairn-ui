import data from '../data/rotations.json'
import type { ComboboxOption, TableRow } from '../src'

export const specialties: ComboboxOption[] = data.specialties

/** Simulated API call, so the demo can show real loading and error states. */
export async function fetchRotations(specialty: string, { fail = false } = {}): Promise<TableRow[]> {
  await new Promise((resolve) => setTimeout(resolve, 700))
  if (fail) throw new Error('The scheduling service returned 503 (Service Unavailable).')
  return (data.rotations as Record<string, TableRow[]>)[specialty] ?? []
}
