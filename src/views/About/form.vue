<script setup lang="ts">
import type {
  TemplateConfigExport,
  TemplateName,
  TemplateDataMap,
  TemplateFormMap,
  TemplateFormExportMap,
} from '@/types/template';
import { ref, computed, onBeforeMount } from 'vue';
import BaseFormVue, { type BaseForm } from '@/components/BaseForm/BaseForm.vue';
import { getTemplateForm } from '@/templates';

/** Type */
export type TemplateDataType<T extends TemplateName> = TemplateDataMap[T];
export type TemplateFormType<T extends TemplateName> = TemplateFormMap[T];
export type TemplateFormExportType<T extends TemplateName> =
  TemplateFormExportMap[T];

export type CurrTemplateData = TemplateDataType<typeof props.template>;
export type CurrTemplateForm = TemplateFormType<typeof props.template>;
export type CurrTemplateFormExport = TemplateFormExportType<
  typeof props.template
>;

export type CurrBaseForm = BaseForm<CurrTemplateData>;
export type Form<T extends TemplateName> = BaseForm<TemplateDataType<T>> &
  TemplateFormExportType<T>;
export type CurrForm = Form<typeof props.template>;

/** Props */
const props = defineProps({
  template: {
    type: String as () => TemplateName,
    default: '',
  },
});

/** Emits */
const emits = defineEmits<{
  (e: 'change', value: CurrForm): void;
  (e: 'download'): void;
}>();

/** Ref */
const baseFormSheetHandler = ref<Function>();
const baseFormDisabled = ref<(keyof CurrBaseForm)[]>();
const baseFromDefault = ref() as Ref<CurrBaseForm>;
const templateFormDefault = ref() as Ref<CurrTemplateForm>;

const form = ref() as Ref<CurrForm>;

/** Computed */
const TemplateForm = computed(() => {
  return getTemplateForm(props.template);
});

/** LifeCycle */
onBeforeMount(() => {
  parseTemplateConfig();
});

/** Methods */
/**
 * 获取模板的INFO.ts文件并提取信息
 */
function parseTemplateConfig() {
  const configs = import.meta.glob('@/templates/*/config.ts');
  const pathReg = /(?<=templates\/).*(?=\/config.ts)/;
  const templateHandleMap: Record<string, string> = {};
  Object.keys(configs).forEach((path) => {
    const templateName = path.match(pathReg)?.[0];
    if (templateName) {
      templateHandleMap[templateName] = path;
    }
  });
  configs[templateHandleMap[props.template]]().then((res) => {
    const {
      BASE_FORM_DISABLED,
      BASE_FORM_DEFAULT,
      TEMPLATE_FORM_DEFAULT,
      SHEET_HANDLE,
    } = (res as TemplateConfigExport<CurrTemplateData, CurrTemplateForm>)
      .default;
    baseFormDisabled.value = BASE_FORM_DISABLED;
    baseFormSheetHandler.value = SHEET_HANDLE;
    baseFromDefault.value = BASE_FORM_DEFAULT as CurrBaseForm;
    templateFormDefault.value = TEMPLATE_FORM_DEFAULT as CurrTemplateForm;
  });
}

function handleDownload() {
  emits('download');
}

function handleFormChange(value: CurrBaseForm | CurrTemplateFormExport) {
  form.value = {
    ...form.value,
    ...value,
  };
  emits('change', form.value as CurrForm);
}
</script>

<template>
  <div class="form">
    <div class="form-base">
      <ElDivider content-position="left">基础表单</ElDivider>
      <BaseFormVue
        :disabled="baseFormDisabled"
        :sheet-handler="baseFormSheetHandler"
        :default="baseFromDefault"
        @change="handleFormChange"
      ></BaseFormVue>
    </div>

    <div class="form-template" v-if="TemplateForm">
      <ElDivider content-position="left">模板表单</ElDivider>
      <component
        :is="TemplateForm"
        :default="templateFormDefault"
        @change="handleFormChange"
      ></component>
    </div>
    <div class="form-submit">
      <ElButton type="primary" @click="handleDownload">下载图片</ElButton>
    </div>
  </div>
</template>

<style scoped lang="less">
.form {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  position: relative;
  padding: 20px 28px 100px;

  & :deep(.el-divider__text) {
    font-size: 18px;
  }

  &-submit {
    display: flex;
    align-items: center;
    position: fixed;
    left: 0px;
    bottom: 0px;
    width: 499px;
    padding: 20px 40px;
    background: #fff;
    z-index: 999;
    // 上阴影
    box-shadow: 0 -2px 10px 0 rgba(0, 0, 0, 0.1);

    & :deep(.el-button) {
      width: 120px;
      height: 40px;
      margin-left: auto;
    }
  }
}
</style>
