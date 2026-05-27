<script setup lang="ts">
import { ref } from 'vue';
import { themeMap } from './theme/index';

/** Type */
export type PerformanceForecastForm = {
  // 主题
  theme: keyof typeof themeMap;
};

export type PerformanceForecastFormExport = {
  theme: PerformanceForecastForm['theme'];
};

/** Props */
const props = defineProps({
  default: {
    type: Object as () => PerformanceForecastForm,
    default: () => ({}),
  },
});

/** Emits */
const emits = defineEmits<{
  (e: 'change', value: PerformanceForecastFormExport): void;
}>();

/** Static */
const themeOption = [
  {
    label: '红色主题',
    value: 'red',
  },
  {
    label: '蓝色主题',
    value: 'blue',
  },
  {
    label: '黄色主题',
    value: 'yellow',
  },
];

/** Ref */
const form = ref<PerformanceForecastForm>(props.default);

/** Watch */
watch(
  () => props.default,
  (val) => {
    form.value = val;
  }
);

watch(
  () => form.value,
  (val) => {
    emits('change', val);
  },
  {
    deep: true,
  }
);
</script>

<template>
  <div class="performance-forecast-form">
    <ElForm :model="form" label-position="top">
      <ElFormItem label="选择主题">
        <ElSelect v-model="form.theme" placeholder="请选择主题">
          <ElOption
            v-for="item in themeOption"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>
    </ElForm>
  </div>
</template>

<style scoped lang="less">
.performance-forecast-form {
  width: 100%;
  height: 100%;
}
</style>
