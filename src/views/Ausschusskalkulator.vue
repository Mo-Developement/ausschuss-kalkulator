<script>
import Button from "primevue/button"
import TabMenu from "primevue/tabmenu"
import Toolbar from "primevue/toolbar"

import BaseConfig from "../components/BaseConfig.vue"
import Parteien from "../components/Parteien.vue"

import { agTabs } from "@/store/enums.js"
import { useState } from "@/store/index.js"

export default {
  name: "AusschussKalkulator",
  components: { BaseConfig, Button, Parteien, TabMenu, Toolbar },
  setup() {
    const { clear, loadDefaults } = useState()
    return { clear, loadDefaults, agTabs }
  },
  data() {
    return {
      activeTab: 0
    }
  },
  computed: {
    ohneAg() {
      return this.activeTab === 0
    }
  },
  mounted() {
    this.loadDefaults()
  }
}
</script>

<template>
  <BaseConfig :ohneAg="ohneAg" />

  <TabMenu v-model:activeIndex="activeTab" :model="agTabs" style="width: max-content;" />

  <div style="overflow-x: auto; padding-bottom: 10px;">
    <Parteien :ohneAg="ohneAg" />
  </div>

  <Toolbar>
    <template #end>
      <Button type="reset" label="Beispiel laden" icon="pi pi-refresh" outlined @click="loadDefaults()" />
      <Button label="Eingabe leeren" icon="pi pi-trash" severity="danger" outlined @click="clear()" />
    </template>
  </Toolbar>
</template>
