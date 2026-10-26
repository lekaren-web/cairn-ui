<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { CnBadge, CnButton, CnCombobox, CnDataTable, CnDialog, CnTabs } from '../src'
import type { TableColumn, TableRow, TabItem } from '../src'
import { fetchRates, procedures } from './api'

const code = ref<string | null>('70553')
const rows = ref<TableRow[]>([])
const loading = ref(false)
const error = ref('')
const simulateError = ref(false)
const activeTab = ref('rates')
const selectedRow = ref<TableRow | null>(null)
const theme = ref<'light' | 'dark'>(
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
)

const columns: TableColumn[] = [
  { key: 'hospital', label: 'Hospital', sortable: true },
  { key: 'payer', label: 'Payer', sortable: true },
  { key: 'plan', label: 'Plan' },
  { key: 'rate', label: 'Negotiated rate', type: 'currency', sortable: true },
  { key: 'cash', label: 'Cash price', type: 'currency', sortable: true },
  {
    key: 'position',
    label: 'vs. median',
    type: 'badge',
    sortable: true,
    tones: { 'Below median': 'success', 'Near median': 'neutral', 'Above median': 'warning' },
  },
]

const procedure = computed(() => procedures.find((p) => p.value === code.value))

const tabs = computed<TabItem[]>(() => [
  { id: 'rates', label: 'Negotiated rates', count: loading.value || error.value ? undefined : rows.value.length },
  { id: 'summary', label: 'Summary' },
  { id: 'about', label: 'About the data' },
])

const stats = computed(() => {
  const rates = rows.value.map((r) => r.rate as number).sort((a, b) => a - b)
  if (!rates.length) return null
  const mid = Math.floor(rates.length / 2)
  const median = rates.length % 2 ? rates[mid] : Math.round((rates[mid - 1] + rates[mid]) / 2)
  return { min: rates[0], median, max: rates[rates.length - 1], spread: rates[rates.length - 1] / rates[0] }
})

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

async function load() {
  if (!code.value) {
    rows.value = []
    return
  }
  loading.value = true
  error.value = ''
  try {
    rows.value = await fetchRates(code.value, { fail: simulateError.value })
  } catch (e) {
    error.value = (e as Error).message
    rows.value = []
  } finally {
    loading.value = false
  }
}

watch(code, load)
onMounted(load)
watch(theme, (t) => document.documentElement.setAttribute('data-theme', t), { immediate: true })
</script>

<template>
  <div class="page">
    <header class="masthead">
      <div>
        <p class="eyebrow">Cairn · Vue 3 surface</p>
        <h1>Price Explorer</h1>
      </div>
      <div class="masthead__actions">
        <CnBadge tone="info">Sample data</CnBadge>
        <CnButton variant="ghost" size="sm" @click="theme = theme === 'light' ? 'dark' : 'light'">
          {{ theme === 'light' ? 'Dark' : 'Light' }} theme
        </CnButton>
      </div>
    </header>

    <section class="controls" aria-label="Search">
      <CnCombobox
        v-model="code"
        class="controls__combobox"
        label="Procedure"
        placeholder="Search by name or CPT code"
        hint="Try “MRI”, “knee” or “80053”."
        :options="procedures"
      />
      <div class="controls__actions">
        <label class="toggle">
          <input id="simulate-error" v-model="simulateError" type="checkbox" />
          Simulate API error
        </label>
        <CnButton variant="secondary" :loading="loading" loading-label="Refreshing rates" @click="load">
          Refresh
        </CnButton>
      </div>
    </section>

    <h2 class="procedure-title">
      {{ procedure?.label ?? 'Choose a procedure' }}
      <span v-if="procedure" class="procedure-code">{{ procedure.description }}</span>
    </h2>

    <CnTabs v-model="activeTab" label="Procedure details" :tabs="tabs">
      <template #rates>
        <CnDataTable
          :caption="`Negotiated rates for ${procedure?.label ?? 'the selected procedure'}`"
          :columns="columns"
          :rows="rows"
          :loading="loading"
          :error="error"
          :empty-text="code ? 'No rates published for this procedure.' : 'Choose a procedure to see rates.'"
          row-action-label="Details"
          @retry="load"
          @row-action="selectedRow = $event"
        />
      </template>
      <template #summary>
        <dl v-if="stats" class="stats">
          <div><dt>Lowest rate</dt><dd>{{ usd.format(stats.min) }}</dd></div>
          <div><dt>Median rate</dt><dd>{{ usd.format(stats.median) }}</dd></div>
          <div><dt>Highest rate</dt><dd>{{ usd.format(stats.max) }}</dd></div>
          <div><dt>Spread</dt><dd>{{ stats.spread.toFixed(1) }}×</dd></div>
        </dl>
        <p v-else class="muted">No summary available yet.</p>
      </template>
      <template #about>
        <p class="prose">
          Hospitals and payers in this demo are fictional and every price is generated sample data.
          The structure mirrors real price-transparency files: one negotiated rate per hospital, payer and
          plan, plus the hospital’s discounted cash price.
        </p>
      </template>
    </CnTabs>

    <CnDialog
      :open="selectedRow !== null"
      :title="String(selectedRow?.hospital ?? '')"
      :description="`${selectedRow?.payer} ${selectedRow?.plan} · ${procedure?.description}`"
      @close="selectedRow = null"
    >
      <dl v-if="selectedRow" class="detail">
        <div><dt>Negotiated rate</dt><dd>{{ usd.format(selectedRow.rate as number) }}</dd></div>
        <div><dt>Cash price</dt><dd>{{ usd.format(selectedRow.cash as number) }}</dd></div>
        <div><dt>Location</dt><dd>{{ selectedRow.city }}</dd></div>
        <div>
          <dt>vs. median</dt>
          <dd><CnBadge :tone="selectedRow.position === 'Below median' ? 'success' : selectedRow.position === 'Above median' ? 'warning' : 'neutral'">{{ selectedRow.position }}</CnBadge></dd>
        </div>
      </dl>
      <template #footer>
        <CnButton variant="secondary" @click="selectedRow = null">Close</CnButton>
      </template>
    </CnDialog>
  </div>
</template>

<style scoped>
.page { max-width: 68rem; margin: 0 auto; padding: var(--cn-space-8) var(--cn-space-4) 4rem; display: grid; gap: var(--cn-space-6); }
.masthead { display: flex; justify-content: space-between; align-items: flex-end; gap: var(--cn-space-4); flex-wrap: wrap; }
.masthead h1 { margin: 0; font-size: var(--cn-text-xl); letter-spacing: -0.01em; }
.masthead__actions { display: flex; align-items: center; gap: var(--cn-space-3); }
.eyebrow { margin: 0 0 var(--cn-space-1); font-size: var(--cn-text-xs); font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--cn-color-text-muted); }
.controls {
  display: flex; flex-wrap: wrap; align-items: flex-start; gap: var(--cn-space-4);
  padding: var(--cn-space-4); border: 1px solid var(--cn-color-border); border-radius: var(--cn-radius-lg);
  background: var(--cn-color-surface);
}
.controls__combobox { flex: 1 1 22rem; min-width: 0; }
.controls__actions { display: flex; align-items: center; gap: var(--cn-space-4); padding-top: 1.5rem; }
.toggle { display: inline-flex; align-items: center; gap: var(--cn-space-2); font-size: var(--cn-text-sm); color: var(--cn-color-text-muted); }
.procedure-title { margin: 0; font-size: var(--cn-text-lg); display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--cn-space-3); }
.procedure-code { font: 500 var(--cn-text-sm) var(--cn-font-mono); color: var(--cn-color-text-muted); }
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: var(--cn-space-4); margin: 0; }
.stats div { padding: var(--cn-space-4); border: 1px solid var(--cn-color-border); border-radius: var(--cn-radius-lg); background: var(--cn-color-surface); }
.stats dt, .detail dt { font-size: var(--cn-text-xs); color: var(--cn-color-text-muted); }
.stats dd { margin: var(--cn-space-1) 0 0; font-size: var(--cn-text-lg); font-weight: 700; font-variant-numeric: tabular-nums; }
.detail { display: grid; grid-template-columns: 1fr 1fr; gap: var(--cn-space-4); margin: 0; }
.detail dd { margin: var(--cn-space-1) 0 0; font-weight: 600; font-variant-numeric: tabular-nums; }
.prose { max-width: 65ch; line-height: 1.6; margin: 0; }
.muted { color: var(--cn-color-text-muted); }
</style>
