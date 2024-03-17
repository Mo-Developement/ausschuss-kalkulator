<script>
export default {
  name: 'DataBar',
  props: {
    max: Number,
    current: Number,
    decimals: {
      default: 0,
      type: Number
    }
  },
  computed: {
    width() {
      // return (this.current / this.max * 100) + '%'
      return this.max !== 0
        ? (this.current / this.max * 100) + '%'
        : '0%'
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
      {{ current.toFixed(this.decimals) }}
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
  width: 100%;
}

.databar {
  background-color: grey;
  height: 100%;
  width: v-bind('width');
}
</style>
