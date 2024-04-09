<script>
import InputSwitch from 'primevue/inputswitch'
import Menubar from 'primevue/menubar'

import { routes } from "@/router.js"

export default {
  name: "app",
  components: { InputSwitch, Menubar },
  setup() {
    return { routes }
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
  }
}
</script>

<template>
<Menubar :model="routes">
  <template #item="{ item, props }">
    <RouterLink v-slot="{ href, navigate }" :to="item.path" custom>
      <a :href="href" v-bind="props.action" @click="navigate">
        <span :class="item.icon" />
        <span>{{ item.name }}</span>
      </a>
    </RouterLink>
  </template>

  <template #end>
    <div id="theme-switcher">
      <i class="pi pi-sun"></i>
      <InputSwitch v-model="darkMode" v-tooltip.left="'Dark Mode'" aria-label="Dark Mode" />
      <i class="pi pi-moon"></i>
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

#theme-switcher {
  display: flex;
  align-items: center;
  justify-content: end;
  gap: 0.5rem;
}

main {
  margin-top: 24px;
}
</style>
