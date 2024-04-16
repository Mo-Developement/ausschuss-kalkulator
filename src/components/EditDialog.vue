<script>
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'

import { formatAG } from '@/utils/formatter.js'

export default {
  name: 'EditDialog',
  props: {
    isVisible: Boolean,
    isNew: Boolean
  },
  setup() {
    const ags = Array.from({ length: 4 }, (_, i) => ({ name: `${formatAG(i+1)}`, code: i + 1}))
    return { ags }
  },
  data() {
    return {
      visible: false,
      partei: null
    }
  },
  emits: [ "update:isVisible", "updateItem" ],
  methods: {
    setData(partei) {
      this.partei = partei
    },
    close() {
      this.visible = false
      this.$emit("update:isVisible", false)
    },
    save() {
      this.$emit("updateItem", Object.assign({}, this.partei))
      this.close()
    }
  },
  watch: {
    isVisible(newValue) {
      this.visible = newValue
    }
  },
  components: {
    Button, Dialog, Dropdown, InputNumber, InputText
  }
}
</script>

<template>
<Dialog v-model:visible="visible" modal :header="isNew ? 'Partei erstellen' : 'Partei bearbeiten'" @hide="close">
  <form class="input">
    <label for="name">Parteiname</label>
    <InputText id="name" v-model="partei.name" autocomplete="off" />
    <label for="sitze-hauptorgan">Sitze im Hauptorgan</label>
    <InputNumber id="sitze-hauptorgan" v-model="partei.sitzeHauptorgan" :min="0" show-buttons />
    <label for="stimmen">Stimmen</label>
    <InputNumber id="stimmen" v-model="partei.stimmen" :min="0" show-buttons />
    <span id="ag">Ausschussgemeinschaft</span>
    <Dropdown v-model="partei.ag" :options="ags" optionLabel="name" optionValue="code" show-clear aria-labelledby="ag" />
  </form>
  <div class="buttons">
    <Button type="button" severity="secondary" @click="close">Abbrechen</Button>
    <Button type="button" @click="save">{{ isNew ? "Erstellen" : "Speichern" }}</Button>
  </div>
</Dialog>
</template>

<style scoped>
.input {
  display: grid;
  grid-template-columns: auto auto;
  gap: 1rem;
  align-items: center;
  margin-bottom: 24px;
}

.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
</style>
