<script setup lang="ts">
import { Form } from '@/views/About/form.vue';

const props = defineProps({
  data: {
    type: Object as () => Form<'SimpleTemplate'>,
    default: () => ({}),
  },
});


const dataFormat = props.data.parseData;

console.log('dataFormat', dataFormat, props.data);


</script>
<template>
  <div>11223333</div>
</template>