<script setup lang="ts">
export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

withDefaults(defineProps<{ tone?: BadgeTone }>(), { tone: 'neutral' })
</script>

<template>
  <span class="cn-badge" :class="`cn-badge--${tone}`"><slot /></span>
</template>

<style>
:host { display: inline-block; }
.cn-badge {
  display: inline-flex; align-items: center;
  padding: 0.125rem var(--cn-space-2);
  border-radius: 999px;
  font: 600 var(--cn-text-xs) / 1.4 var(--cn-font-sans);
  white-space: nowrap;
}
.cn-badge--neutral { background: var(--cn-color-neutral-bg); color: var(--cn-color-neutral-fg); }
.cn-badge--info { background: var(--cn-color-info-bg); color: var(--cn-color-info-fg); }
.cn-badge--success { background: var(--cn-color-success-bg); color: var(--cn-color-success-fg); }
.cn-badge--warning { background: var(--cn-color-warning-bg); color: var(--cn-color-warning-fg); }
.cn-badge--danger { background: var(--cn-color-danger-bg); color: var(--cn-color-danger-fg); }
</style>
