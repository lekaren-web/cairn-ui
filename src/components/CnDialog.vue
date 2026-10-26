<script setup lang="ts">
import { onMounted, ref, useId, watch } from 'vue'
import { deepActiveElement } from '../utils/parse'

const props = withDefaults(
  defineProps<{
    open?: boolean
    title: string
    description?: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { open: false, size: 'md' },
)

const emit = defineEmits<{ 'update:open': [open: boolean]; close: [] }>()

const uid = useId()
const titleId = `${uid}-title`
const descriptionId = `${uid}-description`
const dialogEl = ref<HTMLDialogElement>()
let returnFocusTo: HTMLElement | null = null

// The native <dialog> with showModal() gives us the top layer, a real focus trap
// (everything outside becomes inert), and Escape handling for free. We only add
// focus restoration and backdrop-click dismissal on top.
function show() {
  const dialog = dialogEl.value
  if (!dialog || dialog.open) return
  returnFocusTo = deepActiveElement()
  dialog.showModal()
}

function requestClose() {
  dialogEl.value?.close()
}

function onClose() {
  emit('update:open', false)
  emit('close')
  returnFocusTo?.focus()
  returnFocusTo = null
}

function onBackdropClick(event: MouseEvent) {
  if (event.target === dialogEl.value) requestClose()
}

watch(
  () => props.open,
  (open) => (open ? show() : requestClose()),
  { flush: 'post' },
)
onMounted(() => {
  if (props.open) show()
})
</script>

<template>
  <dialog
    ref="dialogEl"
    class="cn-dialog"
    :class="`cn-dialog--${size}`"
    :aria-labelledby="titleId"
    :aria-describedby="description ? descriptionId : undefined"
    @close="onClose"
    @click="onBackdropClick"
  >
    <div class="cn-dialog__panel">
      <header class="cn-dialog__header">
        <h2 :id="titleId" class="cn-dialog__title">{{ title }}</h2>
        <button type="button" class="cn-dialog__close" aria-label="Close dialog" @click="requestClose">
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" fill="none" />
          </svg>
        </button>
      </header>
      <p v-if="description" :id="descriptionId" class="cn-dialog__description">{{ description }}</p>
      <div class="cn-dialog__body"><slot /></div>
      <footer class="cn-dialog__footer"><slot name="footer" /></footer>
    </div>
  </dialog>
</template>

<style>
.cn-dialog {
  padding: 0;
  border: 1px solid var(--cn-color-border);
  border-radius: var(--cn-radius-lg);
  background: var(--cn-color-surface);
  color: var(--cn-color-text);
  box-shadow: var(--cn-shadow-overlay);
  width: min(100% - 2rem, 32rem);
  max-height: min(100% - 2rem, 40rem);
  font-family: var(--cn-font-sans);
}
.cn-dialog--sm { width: min(100% - 2rem, 24rem); }
.cn-dialog--lg { width: min(100% - 2rem, 48rem); }
.cn-dialog::backdrop { background: rgb(10 16 22 / 0.45); }
.cn-dialog[open] { animation: cn-dialog-in var(--cn-duration-medium) var(--cn-ease); }
@keyframes cn-dialog-in { from { opacity: 0; transform: translateY(8px) scale(0.98); } }

.cn-dialog__panel { display: grid; gap: var(--cn-space-3); padding: var(--cn-space-6); }
.cn-dialog__header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--cn-space-4); }
.cn-dialog__title { margin: 0; font-size: var(--cn-text-lg); line-height: 1.3; }
.cn-dialog__description { margin: 0; color: var(--cn-color-text-muted); font-size: var(--cn-text-sm); }
.cn-dialog__body { font-size: var(--cn-text-sm); line-height: 1.55; }
.cn-dialog__footer { display: flex; justify-content: flex-end; gap: var(--cn-space-2); }
.cn-dialog__close {
  display: grid; place-items: center; flex: none;
  width: 2rem; height: 2rem; margin: -0.25rem -0.5rem 0 0;
  border: 0; border-radius: var(--cn-radius-sm);
  background: transparent; color: var(--cn-color-text-muted); cursor: pointer;
}
.cn-dialog__close:hover { background: var(--cn-color-surface-sunken); color: var(--cn-color-text); }
.cn-dialog__close:focus-visible { outline: 2px solid var(--cn-color-focus); outline-offset: 2px; }
</style>
