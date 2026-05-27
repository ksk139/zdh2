<script setup lang="ts">
import { ref } from 'vue';
import { debounce } from '@/utils/event';
import { themeMap } from './theme/index';
import type { UploadFile, UploadUserFile } from 'element-plus';

/** Type */
export type LimitReviewForm = {
  // 是否渲染为长图
  isLong: boolean;
  // 二维码图片base64
  qrCode: string;
  // 图片源文件
  qrCodeFile?: UploadUserFile[];
  // 涨停个数
  total: number;
  // 总晋级率
  totalPromotionRate: number;
  // 总炸板率
  totalBlastRate: number;
  // 总竞价涨幅
  totalBidIncrease: number;
  // 主题
  theme: keyof typeof themeMap;
};

export interface LimitReviewFormFormat {
  label: string;
  value: number;
  unit: string;
}

export interface LimitReviewFormExport {
  stat: LimitReviewFormFormat[];
  isLong: LimitReviewForm['isLong'];
  theme: LimitReviewForm['theme'];
  qrCode: LimitReviewForm['qrCode'];
}

/** Props */
const props = defineProps({
  default: {
    type: Object as () => LimitReviewForm,
    default: () => ({}),
  },
});

/** Emits */
const emits = defineEmits<{
  (e: 'change', value: LimitReviewFormExport): void;
}>();

/** Static */
const config: {
  prop: keyof Pick<
    LimitReviewForm,
    'total' | 'totalBidIncrease' | 'totalBlastRate' | 'totalPromotionRate'
  >;
  label: string;
}[] = [
  {
    prop: 'total',
    label: '涨停个数',
  },
  {
    prop: 'totalPromotionRate',
    label: '总晋级率',
  },
  {
    prop: 'totalBlastRate',
    label: '总炸板率',
  },
  {
    prop: 'totalBidIncrease',
    label: '总竞价涨幅',
  },
];

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
    label: '绿色主题',
    value: 'green',
  },
  {
    label: '黄色主题',
    value: 'yellow',
  },
  {
    label: '灰色主题',
    value: 'gray',
  },
  {
    label: '浅蓝色主题',
    value: 'lightblue',
  },
];

/** Ref */
const form = ref({}) as Ref<LimitReviewForm>;

/** Watch */
// 由于default是异步读取的，所以通过watch赋值
watch(
  () => props.default,
  (val) => {
    const result = val;

    const isLong = localStorage.getItem('limit-review-is-long');
    if (isLong) {
      result.isLong = JSON.parse(isLong);
    }

    const qrCode = localStorage.getItem('limit-review-qrcode');
    if (qrCode) {
      result.qrCode = JSON.parse(qrCode);
      result.qrCodeFile = [
        {
          name: '二维码',
          url: result.qrCode,
        },
      ];
    }

    form.value = result;
  }
);

// 500ms防抖，然后触发change事件,避免input等组件导致的频繁触发
const debouncedChange = debounce((value: LimitReviewForm) => {
  const format = config.map(({ prop, label }) => ({
    label,
    value: value[prop] as number,
    unit: prop === 'total' ? '只' : '%',
  }));
  const result = {
    stat: format,
    theme: value.theme,
    isLong: value.isLong,
    qrCode: value.qrCode,
  };
  emits('change', result);
}, 500);

watch(
  () => form.value,
  (val) => {
    debouncedChange(val);
  },
  {
    deep: true,
  }
);

/** Methods */
const handleUploadChange = (file: UploadFile) => {
  if (!file.raw) {
    ElMessage.error('文件读取失败');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    form.value.qrCode = e.target?.result as string;

    // 客户端缓存
    localStorage.setItem(
      'limit-review-qrcode',
      JSON.stringify(form.value.qrCode)
    );
  };
  reader.readAsDataURL(file.raw);
};

const handleUploadRemove = () => {
  form.value.qrCode = '';
  // 客户端缓存
  localStorage.removeItem('limit-review-qrcode');
};

const handleSwitchChange = (value: string | number | boolean) => {
  // 客户端缓存
  localStorage.setItem('limit-review-is-long', JSON.stringify(value));
};
</script>

<template>
  <div class="limit-review-form">
    <ElForm :model="form" label-position="top">
      <ElFormItem label="渲染为长图">
        <ElSwitch v-model="form.isLong" @change="handleSwitchChange" />
      </ElFormItem>
      <ElFormItem v-if="form.isLong" label="二维码">
        <ElUpload
          drag
          :auto-upload="false"
          accept=".jpg,.jpeg,.png"
          :limit="1"
          list-type="picture-card"
          :class="{ 'limit-review-form-upload--has-image': form.qrCode }"
          v-model:file-list="form.qrCodeFile"
          @change="handleUploadChange"
          @remove="handleUploadRemove"
        >
          <ElIcon :size="30">
            <IEpUpload />
          </ElIcon>
          点击上传<br />或将图片拖到此处
        </ElUpload>
      </ElFormItem>
      <ElFormItem v-for="item in config" :key="item.prop" :label="item.label">
        <ElInput v-model="form[item.prop]" />
      </ElFormItem>
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
.limit-review-form {
  width: 100%;
  height: 100%;

  :deep(&-upload) {
    &--has-image {
      .el-upload--picture-card {
        display: none;
      }
    }
  }
}

:deep(.el-upload) {
  transition: none;
  &-dragger {
    width: 150px;
    height: 150px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #999;
    line-height: 20px;
  }

  &--picture-card {
    border: none;
  }
}
</style>
