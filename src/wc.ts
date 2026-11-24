/**
 * Entry point for the Web Component build.
    
  This compiles the exact same Vue components in custom-element mode -> Basically this wraps vue components and 
  registers it as a standard Custom Element.
 * (its configured in vite.wc.config.ts), bundling each component's styles
 * straight into its shadow root -> That means you can drop them into any plain HTML page—like Django templates or HTMX partials—without needing Vue!!!!

 * props map to attributes (modelValue -> model-value). Array props accept JSON.
 * events -> dispatched as CustomEvents; the payload is in `event.detail[0]`.
 * remember: HTML serializes attributes differently so we need vue camelCase props to be translated into HTML kebab-case attributes.
 */

import { defineCustomElement } from 'vue'
import CnBadge from './components/CnBadge.vue'
import CnButton from './components/CnButton.vue'
import CnCombobox from './components/CnCombobox.vue'
import CnDataTable from './components/CnDataTable.vue'
import CnDialog from './components/CnDialog.vue'
import CnTabs from './components/CnTabs.vue'

export const elements = {
  'cn-badge': defineCustomElement(CnBadge),
  'cn-button': defineCustomElement(CnButton),
  'cn-combobox': defineCustomElement(CnCombobox),
  'cn-data-table': defineCustomElement(CnDataTable),
  'cn-dialog': defineCustomElement(CnDialog),
  'cn-tabs': defineCustomElement(CnTabs),
}

export function register() {
  for (const [tag, ctor] of Object.entries(elements)) {
    if (!customElements.get(tag)) customElements.define(tag, ctor)
  }
}

register()
