<script>
import SplitButton from "primevue/splitbutton"
import TabMenu from "primevue/tabmenu"

import BaseConfig from "../components/BaseConfig.vue"
import Parteien from "../components/Parteien.vue"

import { agTabs } from "@/store/enums.js"
import { useState } from "@/store/index.js"

export default {
  name: "AusschussKalkulator",
  components: { BaseConfig, Parteien, SplitButton, TabMenu },
  setup() {
    const { clear, loadDefaults } = useState()
    return { clear, loadDefaults, agTabs }
  },
  data() {
    return {
      activeTab: 0,

      buttonActions: [
        {
          label: "Eingaben löschen",
          icon: "pi pi-times",
          command: () => this.clear()
        }
      ]
    }
  },
  computed: {
    ohneAg() {
      return this.activeTab === 0
    }
  }
}
</script>

<template>
  <div class="toolbar">
    <BaseConfig :ohneAg="ohneAg" />
    <SplitButton label="Beispiel laden" @click="loadDefaults" severity="secondary" :model="buttonActions" :menuButtonProps="{'aria-label': 'mehr Aktionen'}" />
  </div>

  <TabMenu v-model:activeIndex="activeTab" :model="agTabs" style="width: max-content; margin-top: 12px;" />
  
  <div v-drag-scroller.onlyX style="overflow-x: auto; padding-bottom: 10px;">
    <Parteien :ohneAg="ohneAg" />
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
}
</style>
