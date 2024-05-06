<script>
import SplitButton from "primevue/splitbutton"

import PrototypParteien from "../components/PrototypParteien.vue"

import { useState } from "@/store/prototypIndex.js"

export default {
  name: "PrototypKalkulator",
  setup() {
    const { clear, loadDefaults } = useState()
    return {
      buttonActions: [
        {
          label: "Eingaben löschen",
          icon: "pi pi-times",
          command: () => clear()
        }
      ],
      loadDefaults
    }
  },
  components: { PrototypParteien, SplitButton }
}
</script>

<template>
  <div class="toolbar">
    <SplitButton label="Beispiel laden" @click="loadDefaults" severity="secondary" :model="buttonActions" :menuButtonProps="{'aria-label': 'mehr Aktionen'}" />
  </div>

  <div v-drag-scroller.onlyX class="editor">
    <PrototypParteien />
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  justify-content: end;
  margin-bottom: 24px;
}
</style>
