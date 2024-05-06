<script>
import Button from 'primevue/button'
import Menubar from 'primevue/menubar'

import { routes } from "@/router.js"

import { useState } from "@/store/index.js"
import { useState as usePrototypeState } from "@/store/prototypIndex.js"
import { download } from "@/utils/downloader.js"

export default {
  name: "app",
  created() {
    const { clear } = useState()
    clear()
    const { clear: clearPrototype } = usePrototypeState()
    clearPrototype()
  },
  setup() {
    const { prepareForJson } = useState()
    const { prepareForJson: preparePrototypeForJson } = usePrototypeState()
    return { prepareForJson, preparePrototypeForJson, routes }
  },
  data() {
    return {
      darkMode: false,
    }
  },
  watch: {
    darkMode(newValue, oldValue) {
      this.$primevue.changeTheme(
        `aura-${oldValue === true ? 'dark' : 'light'}-cyan`,
        `aura-${newValue === true ? 'dark' : 'light'}-cyan`,
        'theme-link', () => {}
      )
    }
  },
  methods: {
    async downloadInput() {
      const obj = this.prepareForJson()
      const obj2 = this.preparePrototypeForJson()
      download(obj, obj2)
    }
  },
  components: { Button, Menubar }
}
</script>

<template>
<Menubar :model="routes" :breakpoint="'750px'">
  <template #item="{ item, props }">
    <RouterLink v-slot="{ href, navigate }" :to="item.path" custom>
      <a :href="href" v-bind="props.action" @click="navigate">
        <span :class="item.icon" />
        <span>{{ item.name }}</span>
      </a>
    </RouterLink>
  </template>

  <template #end>
    <div class="end">
      <Button icon="pi pi-save" @click="downloadInput" v-tooltip.left="'Eingaben herunterladen'" aria-label="Eingaben herunterladen" />
      <Button icon="pi pi-moon" @click="darkMode = !darkMode" severity="secondary" :outlined="!darkMode"
        v-tooltip.left="'zu ' + (darkMode ? 'hellem' : 'dunklem') + ' Design wechseln'" aria-label="helles/dunkles Design wechseln"
      />
    </div>
  </template>
</Menubar>

<main>
  <RouterView />
</main>
</template>

<style scoped>
.p-menuitem-link {
  gap: 0.5rem;
}

.end {
  display: flex;
  gap: 1rem;
}

main {
  margin-top: 24px;
}
</style>
