<script>
import FileUpload from "primevue/fileupload"
import Toast from "primevue/toast"

import router from "@/router.js"
import { useState } from "@/store/index.js"

export default {
  name: "StartSeite",
  setup() {
    const { loadFromJson} = useState()
    return { loadFromJson }
  },
  methods: {
    async uploadInput(event) {
      const file = event.files[0]
      const reader = new FileReader()

      reader.addEventListener("load", () => {
        try {
          this.loadFromJson(reader.result)
          router.push("/kalkulator")
        } catch (e) {
          console.error(e)
          this.$toast.add({ severity: 'error', summary: 'Fehler', detail: 'Datei konnte nicht gelesen werden - fehlerhaftes Format', life: 3000 })
        }
      }, false)

      if (file) {
        reader.readAsText(file)
      }
    }
  },
  components: { FileUpload, Toast }
}
</script>

<template>
<Toast />
<h1>Ausschusskalkulator</h1>

<div class="upload">
  <FileUpload mode="basic" :auto="true" accept="application/json" chooseLabel="hochladen" customUpload @uploader="uploadInput" />
</div>
</template>

<style scoped>
.upload {
  display: flex;
  justify-content: center;
}
</style>
