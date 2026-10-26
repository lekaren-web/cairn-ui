<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { CnBadge, CnButton, CnCombobox, CnDataTable, CnDialog, CnTabs } from '../src'
import type { BadgeTone, TableColumn, TableRow, TabItem } from '../src'
import { fetchRotations, specialties } from './api'

const specialty = ref<string | null>('im')
const rows = ref<TableRow[]>([])
const loading = ref(false)
const error = ref('')
const simulateError = ref(false)
const activeTab = ref('rotations')
const selectedRow = ref<TableRow | null>(null)
const theme = ref<'light' | 'dark'>(
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
)

const statusTones: Record<string, BadgeTone> = { Open: 'success', Waitlist: 'warning', Full: 'neutral' }

const columns: TableColumn[] = [
  { key: 'site', label: 'Site', sortable: true },
  { key: 'setting', label: 'Setting', sortable: true },
  { key: 'starts', label: 'Starts', type: 'date', sortable: true },
  { key: 'weeks', label: 'Weeks', type: 'number' },
  { key: 'seatsOpen', label: 'Open seats', type: 'number', sortable: true },
  { key: 'status', label: 'Status', type: 'badge', sortable: true, tones: statusTones },
]

const current = computed(() => specialties.find((s) => s.value === specialty.value))

const tabs = computed<TabItem[]>(() => [
  { id: 'rotations', label: 'Rotations', count: loading.value || error.value ? undefined : rows.value.length },
  { id: 'summary', label: 'Summary' },
  { id: 'about', label: 'About the data' },
])

const stats = computed(() => {
  if (!rows.value.length) return null
  const open = rows.value.filter((r) => r.status === 'Open')
  return {
    rotations: rows.value.length,
    openRotations: open.length,
    openSeats: rows.value.reduce((sum, r) => sum + (r.seatsOpen as number), 0),
    sites: new Set(rows.value.map((r) => r.site)).size,
  }
})

const longDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' })
const formatDate = (iso: unknown) => longDate.format(new Date(`${iso}T00:00:00Z`))

async function load() {
  if (!specialty.value) {
    rows.value = []
    return
  }
  loading.value = true
  error.value = ''
  try {
    rows.value = await fetchRotations(specialty.value, { fail: simulateError.value })
  } catch (e) {
    error.value = (e as Error).message
    rows.value = []
  } finally {
    loading.value = false
  }
}

watch(specialty, load)
onMounted(load)
watch(theme, (t) => document.documentElement.setAttribute('data-theme', t), { immediate: true })
</script>

<template>
  <div class="page">
    <header class="masthead">
      <div>
        <p class="eyebrow">Cairn · Vue 3 surface</p>
        <h1>Rotation Finder</h1>
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
        v-model="specialty"
        class="controls__combobox"
        label="Specialty"
        placeholder="Search specialties"
        hint="Try “surgery”, “peds” or “psych”."
        :options="specialties"
      />
      <div class="controls__actions">
        <label class="toggle">
          <input id="simulate-error" v-model="simulateError" type="checkbox" />
          Simulate API error
        </label>
        <CnButton variant="secondary" :loading="loading" loading-label="Refreshing rotations" @click="load">
          Refresh
        </CnButton>
      </div>
    </section>

    <h2 class="specialty-title">
      {{ current?.label ?? 'Choose a specialty' }}
      <span v-if="current" class="specialty-meta">{{ current.description }}</span>
    </h2>

    <CnTabs v-model="activeTab" label="Specialty details" :tabs="tabs">
      <template #rotations>
        <CnDataTable
          :caption="`${current?.label ?? 'Selected specialty'} rotations`"
          :columns="columns"
          :rows="rows"
          :loading="loading"
          :error="error"
          :empty-text="specialty ? 'No rotations scheduled for this specialty.' : 'Choose a specialty to see rotations.'"
          row-action-label="Details"
          @retry="load"
          @row-action="selectedRow = $event"
        />
      </template>
      <template #summary>
        <dl v-if="stats" class="stats">
          <div><dt>Rotations</dt><dd>{{ stats.rotations }}</dd></div>
          <div><dt>Open for sign-up</dt><dd>{{ stats.openRotations }}</dd></div>
          <div><dt>Open seats</dt><dd>{{ stats.openSeats }}</dd></div>
          <div><dt>Sites</dt><dd>{{ stats.sites }}</dd></div>
        </dl>
        <p v-else class="muted">No summary available yet.</p>
      </template>
      <template #about>
        <p class="prose">
          Every site and rotation here is generated sample data. The shape mirrors a clinical rotation schedule:
          each row is one block at one site, with its start date, length and remaining seats.
        </p>
      </template>
    </CnTabs>

    <CnDialog
      :open="selectedRow !== null"
      :title="String(selectedRow?.site ?? '')"
      :description="`${current?.label} · ${selectedRow?.setting}`"
      @close="selectedRow = null"
    >
      <dl v-if="selectedRow" class="detail">
        <div><dt>Starts</dt><dd>{{ formatDate(selectedRow.starts) }}</dd></div>
        <div><dt>Length</dt><dd>{{ selectedRow.weeks }} weeks</dd></div>
        <div><dt>Seats</dt><dd>{{ selectedRow.seatsOpen }} of {{ selectedRow.seatsTotal }} open</dd></div>
        <div><dt>Location</dt><dd>{{ selectedRow.location }}</dd></div>
        <div>
          <dt>Status</dt>
          <dd><CnBadge :tone="statusTones[String(selectedRow.status)]">{{ selectedRow.status }}</CnBadge></dd>
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
.specialty-title { margin: 0; font-size: var(--cn-text-lg); display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--cn-space-3); }
.specialty-meta { font-size: var(--cn-text-sm); font-weight: 500; color: var(--cn-color-text-muted); }
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: var(--cn-space-4); margin: 0; }
.stats div { padding: var(--cn-space-4); border: 1px solid var(--cn-color-border); border-radius: var(--cn-radius-lg); background: var(--cn-color-surface); }
.stats dt, .detail dt { font-size: var(--cn-text-xs); color: var(--cn-color-text-muted); }
.stats dd { margin: var(--cn-space-1) 0 0; font-size: var(--cn-text-lg); font-weight: 700; font-variant-numeric: tabular-nums; }
.detail { display: grid; grid-template-columns: 1fr 1fr; gap: var(--cn-space-4); margin: 0; }
.detail dd { margin: var(--cn-space-1) 0 0; font-weight: 600; font-variant-numeric: tabular-nums; }
.prose { max-width: 65ch; line-height: 1.6; margin: 0; }
.muted { color: var(--cn-color-text-muted); }
@media (max-width: 640px) {
  .controls__actions { padding-top: 0; width: 100%; justify-content: space-between; }
}
</style>
