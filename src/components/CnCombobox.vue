<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'
import { parseList } from '../utils/parse'

export interface ComboboxOption {
  value: string
  label: string
  /** Secondary text, also searchable (e.g. a billing code). */
  description?: string
}

const props = withDefaults(
  defineProps<{
    /** Visible label. Rendered inside the component so the ARIA references stay in one scope. */
    label: string
    options: ComboboxOption[] | string
    modelValue?: string | null
    placeholder?: string
    hint?: string
    disabled?: boolean
    emptyText?: string
  }>(),
  { modelValue: null, placeholder: '', hint: '', disabled: false, emptyText: 'No matches' },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  change: [value: string | null]
}>()

const uid = useId()
const ids = { input: `${uid}-input`, list: `${uid}-list`, hint: `${uid}-hint` }

const options = computed(() => parseList<ComboboxOption>(props.options, 'options'))
const selectedOption = computed(() => options.value.find((o) => o.value === props.modelValue) ?? null)

const query = ref(selectedOption.value?.label ?? '')
const isOpen = ref(false)
// Only filter once the user has typed; reopening after a selection shows every option.
const isFiltering = ref(false)
const activeIndex = ref(-1)
const optionEls = ref<HTMLElement[]>([])

watch(selectedOption, (option) => {
  query.value = option?.label ?? ''
  isFiltering.value = false
})

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!isFiltering.value || !q) return options.value
  return options.value.filter(
    (o) => o.label.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q),
  )
})

const activeId = computed(() =>
  isOpen.value && activeIndex.value >= 0 ? `${uid}-opt-${activeIndex.value}` : undefined,
)

const statusMessage = computed(() => {
  if (!isOpen.value) return ''
  const n = filtered.value.length
  return n === 0 ? props.emptyText : `${n} ${n === 1 ? 'result' : 'results'} available`
})

function open(index?: number) {
  isOpen.value = true
  const selectedIndex = filtered.value.findIndex((o) => o.value === props.modelValue)
  setActive(index ?? (selectedIndex >= 0 ? selectedIndex : 0))
}

function close(revert = true) {
  isOpen.value = false
  activeIndex.value = -1
  if (revert) {
    query.value = selectedOption.value?.label ?? ''
    isFiltering.value = false
  }
}

function setActive(index: number) {
  const count = filtered.value.length
  activeIndex.value = count === 0 ? -1 : (index + count) % count
  nextTick(() => optionEls.value[activeIndex.value]?.scrollIntoView?.({ block: 'nearest' }))
}

function commit(option: ComboboxOption | null) {
  const value = option?.value ?? null
  query.value = option?.label ?? ''
  isFiltering.value = false
  close(false)
  if (value !== props.modelValue) {
    emit('update:modelValue', value)
    emit('change', value)
  }
}

function onInput(event: Event) {
  query.value = (event.target as HTMLInputElement).value
  isFiltering.value = true
  isOpen.value = true
  setActive(0)
}

function onKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (!isOpen.value) open()
      else if (!event.altKey) setActive(activeIndex.value + 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      if (!isOpen.value) open(filtered.value.length - 1)
      else setActive(activeIndex.value - 1)
      break
    case 'Enter':
      if (isOpen.value && activeIndex.value >= 0) {
        event.preventDefault()
        commit(filtered.value[activeIndex.value])
      }
      break
    case 'Escape':
      if (isOpen.value) {
        event.preventDefault()
        close()
      } else if (query.value) {
        event.preventDefault()
        commit(null)
      }
      break
    case 'Tab':
      if (isOpen.value) close()
      break
  }
}

function toggle() {
  if (isOpen.value) close()
  else open()
}

function highlight(label: string) {
  const q = query.value.trim()
  const at = isFiltering.value && q ? label.toLowerCase().indexOf(q.toLowerCase()) : -1
  return at < 0
    ? { before: label, match: '', after: '' }
    : { before: label.slice(0, at), match: label.slice(at, at + q.length), after: label.slice(at + q.length) }
}
</script>

<template>
  <div class="cn-combobox" :class="{ 'is-open': isOpen, 'is-disabled': disabled }">
    <label :for="ids.input" class="cn-combobox__label">{{ label }}</label>
    <div class="cn-combobox__control">
      <input
        :id="ids.input"
        class="cn-combobox__input"
        type="text"
        role="combobox"
        autocomplete="off"
        aria-autocomplete="list"
        :aria-expanded="isOpen"
        :aria-controls="ids.list"
        :aria-activedescendant="activeId"
        :aria-describedby="hint ? ids.hint : undefined"
        :placeholder="placeholder"
        :disabled="disabled"
        :value="query"
        @input="onInput"
        @keydown="onKeydown"
        @blur="close()"
        @click="!isOpen && open()"
      />
      <button
        type="button"
        class="cn-combobox__toggle"
        tabindex="-1"
        aria-label="Show options"
        :aria-expanded="isOpen"
        :aria-controls="ids.list"
        :disabled="disabled"
        @mousedown.prevent
        @click="toggle"
      >
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
          <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <div v-show="isOpen" class="cn-combobox__popup">
        <ul :id="ids.list" role="listbox" :aria-label="label" class="cn-combobox__list">
          <li
            v-for="(option, index) in filtered"
            :id="`${uid}-opt-${index}`"
            :key="option.value"
            ref="optionEls"
            role="option"
            class="cn-combobox__option"
            :class="{ 'is-active': index === activeIndex }"
            :aria-selected="option.value === modelValue"
            @mousedown.prevent
            @mousemove="activeIndex !== index && (activeIndex = index)"
            @click="commit(option)"
          >
            <span class="cn-combobox__option-label">
              {{ highlight(option.label).before }}<mark v-if="highlight(option.label).match">{{ highlight(option.label).match }}</mark>{{ highlight(option.label).after }}
            </span>
            <span v-if="option.description" class="cn-combobox__option-description">{{ option.description }}</span>
            <svg v-if="option.value === modelValue" class="cn-combobox__check" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path d="M3 8.5l3 3 7-7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </li>
        </ul>
        <p v-if="filtered.length === 0" class="cn-combobox__empty">{{ emptyText }} for “{{ query.trim() }}”</p>
      </div>
    </div>
    <p v-if="hint" :id="ids.hint" class="cn-combobox__hint">{{ hint }}</p>
    <div role="status" aria-live="polite" class="cn-visually-hidden">{{ statusMessage }}</div>
  </div>
</template>

<style>
:host { display: block; }
.cn-visually-hidden {
  position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
.cn-combobox { display: grid; gap: var(--cn-space-1); font-family: var(--cn-font-sans); color: var(--cn-color-text); }
.cn-combobox__label { font-size: var(--cn-text-sm); font-weight: 600; }
.cn-combobox__hint { margin: 0; font-size: var(--cn-text-xs); color: var(--cn-color-text-muted); }
.cn-combobox__control { position: relative; }
.cn-combobox__input {
  box-sizing: border-box; width: 100%;
  height: var(--cn-control-height-md);
  padding: 0 2.5rem 0 var(--cn-space-3);
  border: 1px solid var(--cn-color-border-strong);
  border-radius: var(--cn-radius-md);
  background: var(--cn-color-surface); color: var(--cn-color-text);
  font: var(--cn-text-sm) var(--cn-font-sans);
}
.cn-combobox__input::placeholder { color: var(--cn-color-text-muted); }
.cn-combobox__input:focus-visible { outline: 2px solid var(--cn-color-focus); outline-offset: 1px; }
.cn-combobox.is-disabled .cn-combobox__input { opacity: 0.55; cursor: not-allowed; }
.cn-combobox__toggle {
  position: absolute; top: 0; right: 0; bottom: 0; width: 2.5rem;
  display: grid; place-items: center;
  border: 0; background: transparent; color: var(--cn-color-text-muted); cursor: pointer;
}
.cn-combobox__toggle svg { transition: transform var(--cn-duration-fast) var(--cn-ease); }
.cn-combobox.is-open .cn-combobox__toggle svg { transform: rotate(180deg); }
.cn-combobox__popup {
  position: absolute; z-index: 20; top: calc(100% + 4px); left: 0; right: 0;
  border: 1px solid var(--cn-color-border);
  border-radius: var(--cn-radius-md);
  background: var(--cn-color-surface);
  box-shadow: var(--cn-shadow-overlay);
  overflow: hidden;
}
.cn-combobox__list { list-style: none; margin: 0; padding: var(--cn-space-1); max-height: 16rem; overflow-y: auto; }
.cn-combobox__option {
  display: grid; grid-template-columns: 1fr auto; align-items: center; column-gap: var(--cn-space-2);
  padding: var(--cn-space-2) var(--cn-space-3);
  border-radius: var(--cn-radius-sm);
  font-size: var(--cn-text-sm); cursor: pointer;
}
.cn-combobox__option.is-active { background: var(--cn-color-accent-subtle); }
.cn-combobox__option[aria-selected="true"] { font-weight: 600; }
.cn-combobox__option-description {
  grid-column: 1; font-size: var(--cn-text-xs); color: var(--cn-color-text-muted); font-family: var(--cn-font-mono);
}
.cn-combobox__check { grid-column: 2; grid-row: 1 / span 2; color: var(--cn-color-accent); }
.cn-combobox__option mark { background: transparent; color: inherit; font-weight: 700; text-decoration: underline; text-underline-offset: 2px; }
.cn-combobox__empty { margin: 0; padding: var(--cn-space-3); font-size: var(--cn-text-sm); color: var(--cn-color-text-muted); }
</style>
