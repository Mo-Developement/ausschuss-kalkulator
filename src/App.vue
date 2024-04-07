<script>
import InputSwitch from 'primevue/inputswitch'

export default {
  name: "app",
  components: { InputSwitch },
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
<div id="top">
  <div id="navigation">
    <RouterLink to="/">Start</RouterLink>
    <span> - </span>
    <RouterLink to="/kalkulator">Ausschusskalkulator</RouterLink>
  </div>

  <div id="theme-switcher">
    <i class="pi pi-sun"></i>
    <InputSwitch v-model="darkMode" v-tooltip.left="'Dark Mode'" aria-label="Dark Mode" />
    <i class="pi pi-moon"></i>
  </div>
</div>

<main>
  <RouterView />
</main>
</template>

<style scoped>
#theme-switcher {
  display: flex;
  align-items: center;
  justify-content: end;
  gap: 0.5rem;
}

#top {
  display: flex;
  justify-content: space-between;
}
</style>
