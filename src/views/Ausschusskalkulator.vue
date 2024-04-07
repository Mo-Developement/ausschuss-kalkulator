<script>
import Button from 'primevue/button'
import Toolbar from 'primevue/toolbar'

import BaseConfig from "../components/BaseConfig.vue"
import Parteien from "../components/Parteien.vue"

import { useState } from "../store/index.js"

export default {
  name: "AusschussKalkulator",
  components: { BaseConfig, Button, Parteien, Toolbar },
  setup() {
    const { clear, loadDefaults } = useState()
    return { clear, loadDefaults }
  },
  mounted() {
    this.loadDefaults()
  }
}
</script>

<template>
  <BaseConfig />

  <div style="overflow-x: auto; padding-bottom: 10px; margin: 24px 0;">
    <Parteien />
  </div>

  <Toolbar>
    <template #end>
      <Button type="reset" label="Beispiel laden" icon="pi pi-refresh" outlined @click="loadDefaults()" />
      <Button label="Eingabe leeren" icon="pi pi-trash" severity="danger" outlined @click="clear()" />
    </template>
  </Toolbar>
</template>
