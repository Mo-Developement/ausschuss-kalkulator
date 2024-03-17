<script>
export default {
  name: 'SelectInput',
  props: {
    type: Object,
    description: String,
    input: String
  },
  data() {
    return {
        selected: ""
    }
  },
  emits: ['update:input'],
  watch: {
    // select the dropdown option at load, if model has a default value set
    input(newValue) {
      this.selected = newValue
    }
  }
}
</script>

<template>
  <label for="">{{ description }}</label>
  <select v-model="selected" @change="$emit('update:input', $event.target.value)">
    <option disabled value="">
      --- Pattauflösungsmethode auswählen ---
    </option>
    <option v-for="t in type" v-bind:value="t.value" v-bind:key="t.value">
      {{ t.display }}
    </option>
  </select>
</template>
