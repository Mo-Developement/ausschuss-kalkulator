<script>
import Ausschusskalkulator from "./components/Ausschusskalkulator.vue";

export default {
  name: "app",
  components: { Ausschusskalkulator },
  data() {
    return {
      darkMode: false,
    }
  },
};
</script>

<template>
  <div id="app" :class="this.darkMode ? 'dark' : ''">
    <input type="checkbox" role="switch" class='theme-switch' v-model="darkMode" />
    <Ausschusskalkulator />
  </div>
</template>

<style>
@import url("assets/css/theme-colours.css");

#app {
  background-color: var(--app-background-color);
}

body {
  margin: 0;
}

* {
  font-family: sans-serif;
}
</style>
