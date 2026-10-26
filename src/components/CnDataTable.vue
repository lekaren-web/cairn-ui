<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { parseList } from '../utils/parse'
import type { BadgeTone } from './CnBadge.vue'

export interface TableColumn {
  key: string
  label: string
  type?: 'text' | 'number' | 'currency' | 'badge'
  sortable?: boolean
  /** For `badge` columns: maps a cell value to a badge tone. */
  tones?: Record<string, BadgeTone>
}
export type TableRow = Record<string, unknown>
export type SortDirection = 'ascending' | 'descending'

const props = withDefaults(
  defineProps<{
    /** Required: names the table for screen readers and the scroll region. */
    caption: string
    columns: TableColumn[] | string
    rows: TableRow[] | string
    rowKey?: string
    loading?: boolean
    error?: string
    emptyText?: string
    /** Adds a trailing action button per row, labelled e.g. "View details". */
    rowActionLabel?: string
  }>(),
  { rowKey: 'id', loading: false, error: '', emptyText: 'No results', rowActionLabel: '' },
)

const emit = defineEmits<{
  sort: [sort: { key: string; direction: SortDirection }]
  retry: []
  'row-action': [row: TableRow]
}>()

const uid = useId()
const captionId = `${uid}-caption`
const cols = computed(() => parseList<TableColumn>(props.columns, 'columns'))
const allRows = computed(() => parseList<TableRow>(props.rows, 'rows'))
const columnCount = computed(() => cols.value.length + (props.rowActionLabel ? 1 : 0))

const sortKey = ref<string | null>(null)
const sortDirection = ref<SortDirection>('ascending')

function toggleSort(key: string) {
  sortDirection.value = sortKey.value === key && sortDirection.value === 'ascending' ? 'descending' : 'ascending'
  sortKey.value = key
  emit('sort', { key, direction: sortDirection.value })
}

const rows = computed(() => {
  const key = sortKey.value
  if (!key) return allRows.value
  const factor = sortDirection.value === 'ascending' ? 1 : -1
  return [...allRows.value].sort((a, b) => {
    const x = a[key]
    const y = b[key]
    if (typeof x === 'number' && typeof y === 'number') return (x - y) * factor
    return String(x ?? '').localeCompare(String(y ?? '')) * factor
  })
})

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const number = new Intl.NumberFormat('en-US')

function format(value: unknown, column: TableColumn) {
  if (value == null || value === '') return '—'
  if (column.type === 'currency' && typeof value === 'number') return currency.format(value)
  if (column.type === 'number' && typeof value === 'number') return number.format(value)
  return String(value)
}

const isNumeric = (c: TableColumn) => c.type === 'currency' || c.type === 'number'
// Keep stale rows visible (dimmed) while refreshing, so the layout doesn't jump.
const showSkeleton = computed(() => props.loading && allRows.value.length === 0)
</script>

<template>
  <div class="cn-table">
    <div class="cn-table__scroll" role="region" :aria-labelledby="captionId" tabindex="0">
      <table :aria-busy="loading || undefined" :class="{ 'is-stale': loading && !showSkeleton }">
        <caption :id="captionId" class="cn-visually-hidden">{{ caption }}</caption>
        <thead>
          <tr>
            <th
              v-for="column in cols"
              :key="column.key"
              scope="col"
              :class="{ 'is-numeric': isNumeric(column) }"
              :aria-sort="sortKey === column.key ? sortDirection : undefined"
            >
              <button v-if="column.sortable" type="button" class="cn-table__sort" @click="toggleSort(column.key)">
                {{ column.label }}
                <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" :class="['cn-table__sort-icon', sortKey === column.key ? sortDirection : 'none']">
                  <path class="up" d="M3 5l3-3 3 3" fill="none" stroke="currentColor" stroke-width="1.5" />
                  <path class="down" d="M3 7l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.5" />
                </svg>
              </button>
              <template v-else>{{ column.label }}</template>
            </th>
            <th v-if="rowActionLabel" scope="col"><span class="cn-visually-hidden">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          <template v-if="showSkeleton">
            <tr v-for="n in 5" :key="`skeleton-${n}`" class="cn-table__skeleton" aria-hidden="true">
              <td v-for="column in columnCount" :key="column"><span></span></td>
            </tr>
          </template>
          <tr v-else-if="error" class="cn-table__message">
            <td :colspan="columnCount">
              <div role="alert" class="cn-table__error">
                <strong>Couldn’t load this data.</strong>
                <span>{{ error }}</span>
                <button type="button" class="cn-table__retry" @click="emit('retry')">Try again</button>
              </div>
            </td>
          </tr>
          <tr v-else-if="rows.length === 0" class="cn-table__message">
            <td :colspan="columnCount">{{ emptyText }}</td>
          </tr>
          <template v-else>
            <tr v-for="row in rows" :key="String(row[rowKey])">
              <td v-for="column in cols" :key="column.key" :class="{ 'is-numeric': isNumeric(column) }">
                <span
                  v-if="column.type === 'badge'"
                  class="cn-table__badge"
                  :class="`cn-table__badge--${column.tones?.[String(row[column.key])] ?? 'neutral'}`"
                >{{ format(row[column.key], column) }}</span>
                <template v-else>{{ format(row[column.key], column) }}</template>
              </td>
              <td v-if="rowActionLabel" class="cn-table__action">
                <button
                  type="button"
                  class="cn-table__action-button"
                  :aria-label="`${rowActionLabel}: ${cols.map((c) => format(row[c.key], c)).slice(0, 2).join(', ')}`"
                  @click="emit('row-action', row)"
                >{{ rowActionLabel }}</button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <div role="status" class="cn-visually-hidden">{{ loading ? 'Loading' : '' }}</div>
  </div>
</template>

<style>
:host { display: block; }
.cn-visually-hidden {
  position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
.cn-table { font-family: var(--cn-font-sans); color: var(--cn-color-text); }
.cn-table__scroll {
  overflow: auto; max-height: 32rem;
  border: 1px solid var(--cn-color-border); border-radius: var(--cn-radius-lg);
  background: var(--cn-color-surface);
}
.cn-table__scroll:focus-visible { outline: 2px solid var(--cn-color-focus); outline-offset: 2px; }
.cn-table table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: var(--cn-text-sm); }
.cn-table table.is-stale tbody { opacity: 0.5; transition: opacity var(--cn-duration-medium) var(--cn-ease); }
.cn-table th, .cn-table td {
  padding: var(--cn-space-2) var(--cn-space-3);
  border-bottom: 1px solid var(--cn-color-border);
  text-align: left; white-space: nowrap;
}
.cn-table tbody tr:last-child td { border-bottom: 0; }
.cn-table th {
  position: sticky; top: 0; z-index: 1;
  background: var(--cn-color-surface-sunken);
  color: var(--cn-color-text-muted);
  font-size: var(--cn-text-xs); font-weight: 600; letter-spacing: 0.02em; text-transform: uppercase;
}
.cn-table .is-numeric { text-align: right; font-variant-numeric: tabular-nums; }
.cn-table tbody tr:not(.cn-table__message, .cn-table__skeleton):hover td { background: var(--cn-color-surface-sunken); }
.cn-table__sort {
  display: inline-flex; align-items: center; gap: var(--cn-space-1);
  margin: -0.25rem -0.375rem; padding: 0.25rem 0.375rem;
  border: 0; border-radius: var(--cn-radius-sm);
  background: transparent; color: inherit; font: inherit; letter-spacing: inherit; text-transform: inherit;
  cursor: pointer;
}
.cn-table__sort:hover { color: var(--cn-color-text); }
.cn-table__sort:focus-visible { outline: 2px solid var(--cn-color-focus); outline-offset: 0; }
.cn-table__sort-icon path { opacity: 0.35; }
.cn-table__sort-icon.ascending .up, .cn-table__sort-icon.descending .down { opacity: 1; }
.cn-table__message td { padding: var(--cn-space-8) var(--cn-space-4); text-align: center; color: var(--cn-color-text-muted); white-space: normal; }
.cn-table__error { display: grid; justify-items: center; gap: var(--cn-space-2); color: var(--cn-color-text); }
.cn-table__retry, .cn-table__action-button {
  padding: 0.375rem var(--cn-space-3);
  border: 1px solid var(--cn-color-border-strong); border-radius: var(--cn-radius-md);
  background: var(--cn-color-surface); color: var(--cn-color-text);
  font: 600 var(--cn-text-xs) var(--cn-font-sans); cursor: pointer;
}
.cn-table__retry:hover, .cn-table__action-button:hover { background: var(--cn-color-surface-sunken); }
.cn-table__retry:focus-visible, .cn-table__action-button:focus-visible { outline: 2px solid var(--cn-color-focus); outline-offset: 2px; }
.cn-table__action { text-align: right; }
.cn-table__skeleton span {
  display: block; height: 0.75rem; border-radius: var(--cn-radius-sm);
  background: linear-gradient(90deg, var(--cn-color-surface-sunken), var(--cn-color-border), var(--cn-color-surface-sunken));
  background-size: 200% 100%;
  animation: cn-shimmer 1.4s ease-in-out infinite;
}
@keyframes cn-shimmer { from { background-position: 100% 0; } to { background-position: -100% 0; } }
@media (prefers-reduced-motion: reduce) { .cn-table__skeleton span { animation: none; } }
.cn-table__badge {
  display: inline-block; padding: 0.125rem var(--cn-space-2); border-radius: 999px;
  font-size: var(--cn-text-xs); font-weight: 600;
}
.cn-table__badge--neutral { background: var(--cn-color-neutral-bg); color: var(--cn-color-neutral-fg); }
.cn-table__badge--info { background: var(--cn-color-info-bg); color: var(--cn-color-info-fg); }
.cn-table__badge--success { background: var(--cn-color-success-bg); color: var(--cn-color-success-fg); }
.cn-table__badge--warning { background: var(--cn-color-warning-bg); color: var(--cn-color-warning-fg); }
.cn-table__badge--danger { background: var(--cn-color-danger-bg); color: var(--cn-color-danger-fg); }
</style>
