/**
 * Web Component entry. The same SFCs are compiled in custom-element mode
 * (see vite.wc.config.ts), so styles are injected into each shadow root and
 * the components work in any HTML page: Django templates, HTMX partials, etc.
 *
 * Props map to attributes (modelValue -> model-value). Array props accept JSON.
 * Events are dispatched as CustomEvents; the payload is in `event.detail[0]`.
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
