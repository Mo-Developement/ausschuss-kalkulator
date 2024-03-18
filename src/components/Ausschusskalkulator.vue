<script>
import BaseConfig from "./BaseConfig.vue";
import Parteien from "./Parteien.vue"

import { addItem, clear, loadDefaults, startConfig } from "../store/index.js"

export default {
  name: "AusschussKalkulator",
  components: { BaseConfig, Parteien },
  data() {
    return { startConfig }
  },
  methods: {
    addItem, loadDefaults, clear
  },
  mounted() {
    this.loadDefaults()
  }
}
</script>

<template>
  <h1>Ausschusskalkulator</h1>

  <main>
    <BaseConfig />
    <Parteien />
  </main>

  <div>
    <button @click="clear()">Eingabe leeren</button>
    <button @click="loadDefaults()">Beispiel laden</button>
    <button @click="addItem()">neue Partei</button>
  </div>
</template>
