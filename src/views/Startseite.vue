<script>
import FileUpload from "primevue/fileupload"
import Toast from "primevue/toast"

import router from "@/router.js"
import { useState } from "@/store/index.js"
import { useState as usePrototypeState } from "@/store/prototypIndex.js"

export default {
  name: "StartSeite",
  setup() {
    const { loadFromJson} = useState()
    const { loadFromJson: loadPrototypFromJson } = usePrototypeState()
    return { loadFromJson, loadPrototypFromJson }
  },
  data() {
    return {
      version: process.env.PROJECT_VERSION,
      offlineNotice: process.env.VUE_APP_BUILD_MODE === "offline" ? " (offline)" : ""
    }
  },
  methods: {
    async uploadInput(event) {
      const file = event.files[0]
      const reader = new FileReader()

      reader.addEventListener("load", () => {
        try {
          this.loadFromJson(reader.result)
          this.loadPrototypFromJson(reader.result)
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
<h1>Ausschusskalkulator <span class="version">v. {{ version }}{{ offlineNotice }}</span></h1>

<p>
  Dies ist eine Re-Implementierung des HföD-Auschusskalkulators als Webanwendung. Einzige Voraussetzung zur Nutzung ist ein
  moderner Browser auf einem beliebigen Endgerät.
</p>

<p>
  Wie beim Original, werden alle Berechnungen lokal auf Ihrem Computer getätigt und keine Daten über das Internet versendet.<br>
  Ein Download der Anwendung ist nicht notwendig. Sollte dies dennoch (bspw. zu Archivierungszwecken) gewünscht sein, steht auf
  der <RouterLink :to="'/about'">Über-Seite</RouterLink> - neben den Lizenzinformationen - ein Link bereit.
</p>

<p>
  Genauere Informationen zum Original sowie die Bedienungsanleitung sind
  <a href="https://www.verwaltungsinformatiker.de/de/werkzeugkasten.html" target="_blank">hier</a> zu finden.
</p>

<h2>Nutzung</h2>

<p>
  Falls Sie diese Anwendung bereits verwendet haben, können Sie mithilfe der folgenden Schaltfläche die json-Datei
  mit Ihren Eingaben laden und werden im Anschluss weitergeleitet.<br>
</p>

<div class="upload">
  <FileUpload mode="basic" :auto="true" accept="application/json" chooseLabel="Eingaben laden" customUpload @uploader="uploadInput" />
</div>

<h2>Tipps</h2>

<ul>
  <li>
    In den Kalkulatoren sowie den Lizenzhinweisen können Sie durch Drücken und anschließendes horizontales Ziehen der linken
    Maustaste die Ansicht nach links bzw. rechts verschieben, sofern die Bildschirmbreite nicht mehr zur Darstellung ausreicht.
  </li>
  <li>
    In den Kalkulatoren können Sie mit dem Knopf rechts oben ein Beispiel laden oder Ihre Eingaben löschen.
  </li>
  <li>
    Zur augenfreundlicheren Benutzung bei dunklen Lichtverhältnissen ist rechts oben im Fenster ein sog. "Darkmode" verfügbar.
  </li>
</ul>
</template>

<style scoped>
.version {
  color: var(--surface-400);
  margin-left: 1rem;
  font-size: smaller;
}

.upload {
  display: flex;
  justify-content: center;
}
</style>
