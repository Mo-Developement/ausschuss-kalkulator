<script>
import InputNumber from 'primevue/inputnumber'
import SelectButton from 'primevue/selectbutton'

import { pattAufloesungEnum } from '../store/enums.js'
import { useState } from "../store/index.js"

export default {
  name: "BaseConfig",
  components: { InputNumber, SelectButton },
  setup() {
    const { startConfig } = useState()
    return { pattAufloesungEnum, startConfig }
  },
}
</script>

<template>
<form>
  <div class="stacked-input">
    <label for="groesseHauptorgan">Größe Hauptorgan</label>
    <InputNumber v-model="startConfig.sitzeHauptorgan" inputId="groesseHauptorgan" :min="0" buttonLayout="stacked" showButtons />
  </div>

  <div class="stacked-input">
    <label for="groesseAusschuss">Ausschussgröße</label>
    <InputNumber v-model="startConfig.sitzeAusschuss" inputId="groesseAusschuss" :min="0" buttonLayout="stacked" showButtons />
  </div>

  <div class="stacked-input">
    <span id="pattAufloesung">Pattauflösung</span>
    <SelectButton aria-labelledby="pattAufloesung"
      v-model="startConfig.pattAufloesung" :options="Object.values(pattAufloesungEnum)"
      optionLabel="display" optionValue="value" :allow-empty="false"
    />
  </div>
</form>
</template>

<style scoped>
form {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.stacked-input {
  display: flex;
  flex-direction: column;
  gap: .5rem;
}
</style>
