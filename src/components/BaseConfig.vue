<script>
import NumberInput from "./NumberInput.vue";
import SelectInput from "./SelectInput.vue";

import { pattAufloesungEnum } from '../store/enums.js'
import { startConfig } from "../store/index.js"

export default {
  name: "BaseConfig",
  components: { NumberInput, SelectInput },
  data() {
    return { startConfig, pattAufloesungEnum }
  },
  emits: ['update:config']
}
</script>

<template>
<form>
  <NumberInput description="Größe Hauptorgan" v-model:input="startConfig.sitzeHauptorgan" />
  <NumberInput description="Ausschussgröße" v-model:input="startConfig.sitzeAusschuss" />
  <SelectInput description="Pattauflösung" v-bind:type="pattAufloesungEnum" v-model:input="startConfig.pattAufloesung" />
</form>
</template>

<style scoped>
form {
  display: grid;
  grid-template-columns: 300px 200px;
}
</style>
