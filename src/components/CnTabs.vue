<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'
import { parseList } from '../utils/parse'

export interface TabItem {
  id: string
  label: string
  /** Optional count shown next to the label, e.g. number of results. */
  count?: number
}

const props = defineProps<{
  tabs: TabItem[] | string
  /** Accessible name for the tab list. */
  label: string
  modelValue?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [id: string]; change: [id: string] }>()

const uid = useId()
const items = computed(() => parseList<TabItem>(props.tabs, 'tabs'))
const selected = ref(props.modelValue)
watch(
  () => props.modelValue,
  (id) => {
    if (id) selected.value = id
  },
)
const activeId = computed(() =>
  items.value.some((t) => t.id === selected.value) ? selected.value : items.value[0]?.id,
)

const tabEls = ref<HTMLButtonElement[]>([])

function select(id: string, moveFocus = false) {
  if (id !== activeId.value) {
    selected.value = id
    emit('update:modelValue', id)
    emit('change', id)
  }
  if (moveFocus) {
    const index = items.value.findIndex((t) => t.id === id)
    nextTick(() => tabEls.value[index]?.focus())
  }
}

// Roving tabindex with automatic activation (WAI-ARIA APG tabs pattern):
// one Tab stop for the whole list, arrows move between tabs.
function onKeydown(event: KeyboardEvent, index: number) {
  const last = items.value.length - 1
  const target = {
    ArrowRight: index === last ? 0 : index + 1,
    ArrowLeft: index === 0 ? last : index - 1,
    Home: 0,
    End: last,
  }[event.key]
  if (target === undefined) return
  event.preventDefault()
  select(items.value[target].id, true)
}
</script>

<template>
  <div class="cn-tabs">
    <div role="tablist" :aria-label="label" class="cn-tabs__list">
      <button
        v-for="(tab, index) in items"
        :id="`${uid}-tab-${tab.id}`"
        :key="tab.id"
        ref="tabEls"
        type="button"
        role="tab"
        class="cn-tabs__tab"
        :aria-selected="tab.id === activeId"
        :aria-controls="`${uid}-panel-${tab.id}`"
        :tabindex="tab.id === activeId ? 0 : -1"
        @click="select(tab.id)"
        @keydown="onKeydown($event, index)"
      >
        {{ tab.label }}
        <span v-if="tab.count != null" class="cn-tabs__count">{{ tab.count }}</span>
      </button>
    </div>
    <div
      v-for="tab in items"
      :id="`${uid}-panel-${tab.id}`"
      :key="tab.id"
      role="tabpanel"
      class="cn-tabs__panel"
      :aria-labelledby="`${uid}-tab-${tab.id}`"
      :hidden="tab.id !== activeId"
      tabindex="0"
    >
      <slot :name="tab.id" />
    </div>
  </div>
</template>

<style>
:host { display: block; }
.cn-tabs { font-family: var(--cn-font-sans); color: var(--cn-color-text); }
.cn-tabs__list {
  display: flex; gap: var(--cn-space-1);
  border-bottom: 1px solid var(--cn-color-border);
  overflow-x: auto;
}
.cn-tabs__tab {
  position: relative;
  display: inline-flex; align-items: center; gap: var(--cn-space-2);
  padding: var(--cn-space-3) var(--cn-space-3);
  border: 0; background: transparent;
  color: var(--cn-color-text-muted);
  font: 500 var(--cn-text-sm) / 1 var(--cn-font-sans);
  white-space: nowrap; cursor: pointer;
}
.cn-tabs__tab:hover { color: var(--cn-color-text); }
.cn-tabs__tab[aria-selected="true"] { color: var(--cn-color-text); font-weight: 600; }
.cn-tabs__tab::after {
  content: ""; position: absolute; inset: auto var(--cn-space-2) -1px;
  height: 2px; border-radius: 2px; background: transparent;
  transition: background-color var(--cn-duration-fast) var(--cn-ease);
}
.cn-tabs__tab[aria-selected="true"]::after { background: var(--cn-color-accent); }
.cn-tabs__tab:focus-visible { outline: 2px solid var(--cn-color-focus); outline-offset: -2px; border-radius: var(--cn-radius-sm); }
.cn-tabs__count {
  min-width: 1.5em; padding: 0.125rem 0.375rem; border-radius: 999px;
  background: var(--cn-color-neutral-bg); color: var(--cn-color-neutral-fg);
  font-size: var(--cn-text-xs); font-variant-numeric: tabular-nums; text-align: center;
}
.cn-tabs__panel { padding-top: var(--cn-space-4); }
.cn-tabs__panel:focus-visible { outline: 2px solid var(--cn-color-focus); outline-offset: 4px; border-radius: var(--cn-radius-sm); }
</style>
