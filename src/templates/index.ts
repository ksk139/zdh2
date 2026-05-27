import ImageFrameVue from './ImageFrame/ImageFrame.vue';
import ImageFrameFormVue from './ImageFrame/ImageFrameForm.vue';
import LimitReviewVue from './LimitReview/LimitReview.vue';
import LimitReviewFormVue from './LimitReview/LimitReviewForm.vue';
import MorningSessionReviewVue from './MorningSessionReview/MorningSessionReview.vue';
import MorningSessionReviewFormView from './MorningSessionReview/MorningSessionReviewForm.vue';
import PerformanceForecastVue from './PerformanceForecast/PerformanceForecast.vue';
import PerformanceForecastFormVue from './PerformanceForecast/PerformanceForecastForm.vue';
import SimpleTemplateVue from './SimpleTemplate/SimpleTemplate.vue';
import SimpleTemplateFormVue from './SimpleTemplate/SimpleTemplateForm.vue';

const templates = {
  LimitReview: LimitReviewVue,
  PerformanceForecast: PerformanceForecastVue,
  SimpleTemplate: SimpleTemplateVue,
  MorningSessionReview: MorningSessionReviewVue,
  ImageFrame: ImageFrameVue,
};
const templateForms = {
  LimitReview: LimitReviewFormVue,
  PerformanceForecast: PerformanceForecastFormVue,
  SimpleTemplate: SimpleTemplateFormVue,
  MorningSessionReview: MorningSessionReviewFormView,
  ImageFrame: ImageFrameFormVue,
};

export function getTemplate(name: keyof typeof templates) {
  return templates[name];
}

export function getTemplateForm(name: keyof typeof templateForms) {
  return templateForms[name];
}
