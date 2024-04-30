<script>
import InputNumber from "primevue/inputnumber"
import SelectButton from "primevue/selectbutton"
import Tag from "primevue/tag"

import { pattAufloesungEnum } from "@/store/enums.js"
import { useState } from "@/store/index.js"

export default {
  name: "BaseConfig",
  props: {
    ohneAg: Boolean
  },
  setup() {
    const { startConfig } = useState()
    return { pattAufloesungEnum, startConfig }
  },
  components: { InputNumber, SelectButton, Tag }
}
</script>

<template>
<form>
  <div class="stacked-input">
    <div>
      <label for="groesseHauptorgan">Größe Hauptorgan</label>
      <Tag v-show="ohneAg" severity="info" value="Schritt 1a" />
    </div>
    <InputNumber :disabled="!ohneAg" v-model="startConfig.sitzeHauptorgan" inputId="groesseHauptorgan" :min="0" buttonLayout="stacked" showButtons />
  </div>

  <div class="stacked-input">
    <div>
      <label for="groesseAusschuss">Ausschussgröße</label>
      <Tag v-show="ohneAg" severity="info" value="Schritt 2a" />
    </div>
    <InputNumber :disabled="!ohneAg" v-model="startConfig.sitzeAusschuss" inputId="groesseAusschuss" :min="0" buttonLayout="stacked" showButtons />
  </div>

  <div class="stacked-input">
    <div>
      <span id="pattAufloesung">Pattauflösung</span>
      <Tag severity="info" :value="ohneAg ? 'Schritt 2c' : 'Schritt 3b'" />
    </div>
    <SelectButton v-if="ohneAg" aria-labelledby="pattAufloesung"
      v-model="startConfig.pattAufloesung['ohneAG']" :options="Object.values(pattAufloesungEnum)"
      optionLabel="display" optionValue="value" :allow-empty="false"
    />
    <SelectButton v-if="!ohneAg" aria-labelledby="pattAufloesung"
      v-model="startConfig.pattAufloesung['mitAG']" :options="Object.values(pattAufloesungEnum)"
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

.stacked-input > :first-child {
  display: flex;
  align-items: baseline;
}

.stacked-input > :first-child > :first-child {
  display: inline-block;
  margin: .5rem .5rem .5rem 0;
}
</style>
