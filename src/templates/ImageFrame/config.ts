import { TemplateConfig } from "@/types/template";
import { ImageFrameData } from "./type";
import { ImageFrameForm } from "./ImageFrameForm.vue";

export interface ImageFrameTemplateConfig
  extends TemplateConfig<ImageFrameData, ImageFrameForm> {};

const config: ImageFrameTemplateConfig = {
  BASE_FORM_DISABLED: ['subTitle', 'title', 'annotation', 'fileList', 'description', 'dataSource', 'producer'],
  SHEET_HANDLE: () => {}
} as const;

export default config;

