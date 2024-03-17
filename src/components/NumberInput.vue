<script>
export default {
  name: 'NumberInput',
  props: {
    description: String,
    input: Number
  },
  emits: ['update:input']
}
</script>

<template>
  <label for="">{{ description }}</label>
  <input
    type="number"
    v-bind:value="input"
    @input="$emit('update:input', $event.target.value)"
  />
</template>
