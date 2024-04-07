<script>
import InputSwitch from 'primevue/inputswitch'

import Ausschusskalkulator from "./components/Ausschusskalkulator.vue"

export default {
  name: "app",
  components: { Ausschusskalkulator, InputSwitch },
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
};
</script>

<template>
<div id="theme-switcher">
  <i class="pi pi-sun"></i>
  <InputSwitch v-model="darkMode" v-tooltip.left="'Dark Mode'" aria-label="Dark Mode" />
  <i class="pi pi-moon"></i>
</div>
<Ausschusskalkulator />
</template>

<style scoped>
#theme-switcher {
  display: flex;
  align-items: center;
  justify-content: end;
  gap: 0.5rem;
}
</style>
