<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    /** Keeps the button focusable and announces the busy state instead of disabling it. */
    loading?: boolean
    loadingLabel?: string
  }>(),
  { variant: 'primary', size: 'md', type: 'button', disabled: false, loading: false, loadingLabel: 'Loading' },
)

const blocked = computed(() => props.disabled || props.loading)

// No `click` emit is declared on purpose: the consumer's listener falls through to the
// native <button> (Vue) or bubbles out of the shadow root (Web Component). This guard is
// registered first, so stopping the event here swallows clicks while loading in both builds.
function guard(event: MouseEvent) {
  if (!blocked.value) return
  event.preventDefault()
  event.stopImmediatePropagation()
}
</script>

<template>
  <button
    :type="type"
    class="cn-button"
    :class="[`cn-button--${variant}`, `cn-button--${size}`, { 'is-loading': loading }]"
    :disabled="disabled"
    :aria-disabled="loading || undefined"
    :aria-busy="loading || undefined"
    @click="guard"
  >
    <span v-if="loading" class="cn-button__spinner" aria-hidden="true"></span>
    <span class="cn-button__label"><slot /></span>
    <span v-if="loading" class="cn-visually-hidden">, {{ loadingLabel }}</span>
  </button>
</template>

<style>
:host { display: inline-block; }
.cn-visually-hidden {
  position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
.cn-button {
  position: relative;
  display: inline-flex; align-items: center; justify-content: center; gap: var(--cn-space-2);
  height: var(--cn-control-height-md);
  padding: 0 var(--cn-space-4);
  border: 1px solid transparent;
  border-radius: var(--cn-radius-md);
  font: 600 var(--cn-text-sm) / 1 var(--cn-font-sans);
  cursor: pointer;
  transition: background-color var(--cn-duration-fast) var(--cn-ease),
    border-color var(--cn-duration-fast) var(--cn-ease);
}
.cn-button--sm { height: var(--cn-control-height-sm); padding: 0 var(--cn-space-3); font-size: var(--cn-text-xs); }
.cn-button:focus-visible { outline: 2px solid var(--cn-color-focus); outline-offset: 2px; }

.cn-button--primary { background: var(--cn-color-accent); color: var(--cn-color-on-accent); }
.cn-button--primary:hover:not(:disabled, .is-loading) { background: var(--cn-color-accent-hover); }
.cn-button--secondary { background: var(--cn-color-surface); color: var(--cn-color-text); border-color: var(--cn-color-border-strong); }
.cn-button--secondary:hover:not(:disabled, .is-loading) { background: var(--cn-color-surface-sunken); }
.cn-button--ghost { background: transparent; color: var(--cn-color-accent); }
.cn-button--ghost:hover:not(:disabled, .is-loading) { background: var(--cn-color-accent-subtle); }
.cn-button--danger { background: var(--cn-color-danger); color: var(--cn-color-on-accent); }
.cn-button--danger:hover:not(:disabled, .is-loading) { background: var(--cn-color-danger-hover); }

.cn-button:disabled { opacity: 0.5; cursor: not-allowed; }
.cn-button.is-loading { cursor: progress; }
.cn-button.is-loading .cn-button__label { opacity: 0.75; }

.cn-button__spinner {
  width: 0.9em; height: 0.9em;
  border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%;
  animation: cn-spin 700ms linear infinite;
}
@keyframes cn-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .cn-button__spinner { animation-duration: 2.5s; }
}
</style>
