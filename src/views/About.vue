<script>
import ScrollPanel from "primevue/scrollpanel"

export default {
  name: "AboutUs",
  data() {
    const baseUrl = process.env.BASE_URL
    const offlineBuild = process.env.VUE_APP_BUILD_MODE === "offline"
    const filename = `ausschuss-kalkulator-${process.env.PROJECT_VERSION}.zip`
    const filepath = `${baseUrl}${filename}`
    return { baseUrl, offlineBuild, filename, filepath }
  },
  components: { ScrollPanel }
}
</script>

<template>
<p>
  Dieses Projekt wurde gebaut mit <a href="https://vuejs.org/" target="_blank">Vue.js</a> und
  <a href="https://primevue.org/" target="_blank">PrimeVue</a> gebaut. Danke an die Entwickler für die tolle Arbeit!
</p>

<h2>Lizenz</h2>

<pre>
Copyright (c) 2024 Moritz Reinel

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see https://www.gnu.org/licenses/.
</pre>

<p>
  Diese Software wird unter den Bedingungen der <i>GNU General Public License v3.0 or later</i> bereitgestellt.<br>
  Eine Kopie der Lizenz ist unter <a :href="`${baseUrl}LICENSE.txt`" target="_blank">LICENSE.txt</a> zu finden.
  Der Quelltext steht im <a href="https://github.com/Mo-Developement/ausschuss-kalkulator" target="_blank">github-Repository</a> bereit.
</p>

<p>
  Weitere Lizenzbedingungen sowie Copyright-Hinweise, die Teile der Software betreffen, können im Folgenden eingesehen werden:
</p>

<ScrollPanel style="width: 100%; height: 200px">
  <pre>
  </pre>
</ScrollPanel>

<template v-if="!offlineBuild">
  <h2>Offline-Download</h2>
  
  <a :href="filepath" download>{{ filename }}</a>
  
  <p>
    Nach Entpacken des heruntergeladenen zip-Archivs kann durch den Aufruf der <i>index.html</i>-Datei die Anwendung im Browser gestartet werden.
  </p>
</template>
</template>
