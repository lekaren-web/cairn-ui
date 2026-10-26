import type { App } from 'vue'
import CnBadge from './components/CnBadge.vue'
import CnButton from './components/CnButton.vue'
import CnCombobox from './components/CnCombobox.vue'
import CnDataTable from './components/CnDataTable.vue'
import CnDialog from './components/CnDialog.vue'
import CnTabs from './components/CnTabs.vue'

export { CnBadge, CnButton, CnCombobox, CnDataTable, CnDialog, CnTabs }
export type { BadgeTone } from './components/CnBadge.vue'
export type { ComboboxOption } from './components/CnCombobox.vue'
export type { TableColumn, TableRow, SortDirection } from './components/CnDataTable.vue'
export type { TabItem } from './components/CnTabs.vue'

/** Vue plugin: `app.use(Cairn)` registers every component globally. */
export default {
  install(app: App) {
    Object.entries({ CnBadge, CnButton, CnCombobox, CnDataTable, CnDialog, CnTabs }).forEach(([name, component]) =>
      app.component(name, component),
    )
  },
}
