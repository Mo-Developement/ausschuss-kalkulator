<script>
export default {
  name: 'DataBar',
  props: {
    max: Number,
    current: Number,
    decimals: {
      default: 0,
      type: Number
    },
    colour: String
  },
  computed: {
    width() {
      // return (this.current / this.max * 100) + '%'
      return this.max !== 0
        ? (this.current / this.max * 100) + '%'
        : '0%'
    },
    computedColour() {
      let computedColour = 'var(--gray-500)'
      switch (this.colour) {
        case 'green': computedColour = 'var(--green-500)'; break;
        case 'yellow': computedColour = 'var(--yellow-400)'; break;
      }
      return computedColour
    }
  }
}
</script>

<template>
  <div class="container">
    <div class="wrapper">
      <div class="databar"></div>
    </div>
    <span>
      {{ current.toFixed(this.decimals).replace(/\./g, ',') }}
    </span>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: space-between;
  column-gap: 10px;
}

.wrapper {
  width: 5rem;
}

.databar {
  background-color: v-bind('computedColour');
  /* border-radius: var(--border-radius); */
  height: 100%;
  width: v-bind('width');
}
</style>
