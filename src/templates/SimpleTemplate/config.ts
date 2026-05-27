import { TemplateConfig } from "@/types/template";
import { SimpleTemplateData } from "./type";
import { SimpleTemplateForm } from "./SimpleTemplateForm.vue";

export interface SimpleTemplateConfig
  extends TemplateConfig<SimpleTemplateData, SimpleTemplateForm> {};

const config: SimpleTemplateConfig = {
  BASE_FORM_DISABLED: ['subTitle', 'title', 'annotation', 'fileList', 'description', 'dataSource', 'producer'],
  // BASE_FORM_DEFAULT: {
  //   title: 'xx模板',
  //   producer: '@同花顺',
  // },
  // SHEET_HANDLE() {
  //   return Array.from({length: 10}, (v, i) => ({name: 'xx', price: 123}));
  // },
} as const;

export default config;

