/**
 * Array props arrive as real arrays from Vue, but as JSON strings when a Web Component
 * is configured from HTML attributes (e.g. a Django template). Accept both.
 */
export function parseList<T>(value: T[] | string | null | undefined, propName = 'value'): T[] {
  if (Array.isArray(value)) return value
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed
  } catch {
    // fall through to the warning below
  }
  console.warn(`[cairn] Expected "${propName}" to be an array or a JSON array string.`)
  return []
}

/** The focused element, looking through open shadow roots. */
export function deepActiveElement(): HTMLElement | null {
  let el = document.activeElement as HTMLElement | null
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement as HTMLElement
  return el
}
