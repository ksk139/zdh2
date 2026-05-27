import XLSX from 'xlsx';
import type { BaseForm } from '@/components/BaseForm/BaseForm.vue';
import type { LimitReviewData } from '@/templates/LimitReview/type';
import type {
  LimitReviewForm,
  LimitReviewFormExport,
} from '@/templates/LimitReview/LimitReviewForm.vue';
import type { PerformanceForecastData } from '@/templates/PerformanceForecast/type';
import type {
  PerformanceForecastForm,
  PerformanceForecastFormExport,
} from '@/templates/PerformanceForecast/PerformanceForecastForm.vue';
import type { SimpleTemplateData } from '@/templates/SimpleTemplate/type';
import type {
  SimpleTemplateForm,
  SimpleTemplateFormExport
} from '@/templates/SimpleTemplate/SimpleTemplateForm.vue';
import type { MorningSessionReviewData } from '@/templates/MorningSessionReview/type';
import type {
  MorningSessionReviewForm,
  MorningSessionReviewFormExport,
} from '@/templates/MorningSessionReview/MorningSessionReviewForm.vue';
import type { ImageFrameData } from '@/templates/ImageFrame/type';
import type {
  ImageFrameForm,
  ImageFrameFormExport
} from '@/templates/ImageFrame/ImageFrameForm.vue'; 

export interface TemplateConfig<S, T> {
  BASE_FORM_DISABLED: (keyof BaseForm<S>)[];
  BASE_FORM_DEFAULT?: BaseForm<S>;
  TEMPLATE_FORM_DEFAULT?: T;
  SHEET_HANDLE: (sheet: XLSX.WorkSheet) => S;
}

export interface TemplateConfigExport<S, T> {
  default: TemplateConfig<S, T>;
}

export type TemplateName = 'LimitReview' | 'PerformanceForecast' | 'SimpleTemplate' | 'MorningSessionReview' | 'ImageFrame';

export interface TemplateDataMap {
  LimitReview: LimitReviewData;

  PerformanceForecast: PerformanceForecastData;

  SimpleTemplate: SimpleTemplateData;

  MorningSessionReview: MorningSessionReviewData;

  ImageFrame: ImageFrameData;
}

export interface TemplateFormMap {
  LimitReview: LimitReviewForm;

  PerformanceForecast: PerformanceForecastForm;

  SimpleTemplate: SimpleTemplateForm;

  MorningSessionReview: MorningSessionReviewForm;

  ImageFrame: ImageFrameForm;
}

export interface TemplateFormExportMap {
  LimitReview: LimitReviewFormExport;

  PerformanceForecast: PerformanceForecastFormExport;

  SimpleTemplate: SimpleTemplateFormExport;

  MorningSessionReview: MorningSessionReviewFormExport

  ImageFrame: ImageFrameFormExport;

}
