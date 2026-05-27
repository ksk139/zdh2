<script setup lang="ts">
import * as htmlToImage from 'html-to-image';
import { ref, computed } from 'vue';
import type { TemplateName } from '@/types/template';
import { type CurrForm } from './form.vue';
import { getTemplate } from '@/templates';

/** Props */
// @ts-ignore 已声明“props”，但从未读取其值。ts(6133)
const props = defineProps({
  template: {
    type: String as () => TemplateName,
    default: '',
  },
  data: {
    type: Object as () => CurrForm,
    default: () => ({}),
  },
});

/** Ref */
const templateRef = ref();

/** Computed */
const templateVue = computed(() => {
  return getTemplate(props.template);
});

/** Methods */
function handleDownload() {
  if (!templateRef.value) {
    ElMessage.error('缺少可以截图的内容！');
    return;
  }
  const templateDom = templateRef.value.$el;
  /** 
   * pixelRatio: 采集图像的像素比例。默认为使用设备的实际像素比。
   * @see https://github.com/bubkoo/html-to-image?tab=readme-ov-file#pixelratio
   */
  htmlToImage.toPng(templateDom, { pixelRatio: 2 }).then((dataUrl) => {
    const link = document.createElement('a');
    link.download = `${props.template}.png`;
    link.href = dataUrl;
    link.click();
  });
}
defineExpose({
  handleDownload,
});
</script>

<template>
  <div class="preview">
    <component ref="templateRef" :is="templateVue" :data="data"></component>
  </div>
</template>

<style scoped lang="less">
.preview {
  width: 100%;
  height: 100%;
  padding: 32px 24px;
  background-color: #ffffff;
  overflow: auto;
  display: flex;
  justify-content: center;
}
</style>
