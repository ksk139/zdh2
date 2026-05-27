<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import type { TemplateName } from '@/types/template';
import FormVue, { type CurrForm } from './form.vue';
import PreviewVue from './preview.vue';

/** Ref */
const form = ref<CurrForm>();
const previewVue = ref<InstanceType<typeof PreviewVue>>();

/** Computed */
const template = computed(() => {
  const route = useRoute();
  const { template } = route.query as { template: TemplateName };
  return template;
});

/** Methods */
function handleFormChange(value: CurrForm) {
  form.value = value;
}

function handleDownload() {
  if (!previewVue.value) {
    ElMessage.error('缺少可以截图的内容！');
    return;
  }
  previewVue.value.handleDownload();
  ElMessage.success('下载成功！');
}
</script>

<template>
  <div class="about">
    <div class="about-form">
      <FormVue
        v-if="template"
        :template="template"
        @change="handleFormChange"
        @download="handleDownload"
      ></FormVue>
    </div>

    <div class="about-preview">
      <PreviewVue
        ref="previewVue"
        v-if="template"
        :template="template"
        :data="form"
      ></PreviewVue>
    </div>
  </div>
</template>

<style scoped lang="less">
.about {
  width: 100%;
  height: 100%;
  display: flex;

  &-form {
    width: 500px;
    height: 100%;
    border-right: 1px solid #ccc;
    box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.3);
    z-index: 1;
  }

  &-preview {
    width: 0;
    flex: 1;
    height: 100%;
  }
}
</style>
