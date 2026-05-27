<script setup lang="ts">
import { debounce } from '@/utils/event';
import { UploadFile, UploadUserFile } from 'element-plus';

export type ImageFrameForm = {
  /** 待处理的图片 */
  image: string;
  /** 底部主标题 */
  footerTitle: string;
  /** 底部副标题 */
  footerSubtitle: string;
  /** 底部标题渐变文字 */
  footerLabel: string;
  /** 底部标题渐变色 */
  footerLabelColor: string[];
  imageFile: UploadUserFile;
};

export interface ImageFrameFormExport {
  image: ImageFrameForm['image'];
  footerTitle: ImageFrameForm['footerTitle'];
  footerSubtitle: ImageFrameForm['footerSubtitle'];
  footerLabel: ImageFrameForm['footerLabel'];
  footerLabelColor: ImageFrameForm['footerLabelColor'];
  imageFile: ImageFrameForm['imageFile'];
};

/** Props */
const props = defineProps({
  default: {
    type: Object as () => ImageFrameForm,
    default: () => ({
      footerTitle: '上同花顺搜',
      footerSubtitle: '获取全部原图',
      footerLabel: '“图说数据”',
      footerLabelColor: ['#ccc', '#ccc']
    }),
  },
});

/** Emits */
const emit = defineEmits<{
  (e: 'change', value: ImageFrameFormExport): void;
}>();

/** Ref */
const form = ref<ImageFrameForm>(props.default);

/** Methods */
const handleUploadChange = (file: UploadFile) => {
  if (!file.raw) {
    ElMessage.error('文件读取失败');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    form.value.image = e.target?.result as string;

  }
  reader.readAsDataURL(file.raw);
}

const handleUploadRemove = () => {
  form.value.image = '';
}

/** Watch */
watch(
  () => props.default,
  (val) => {
    const result = val;
    if (result.image) {
      result.imageFile = {
        name: '图片',
        url: result.image
      }
    }

    form.value = result;
  }
)

// 500ms防抖，然后触发change事件,避免input等组件导致的频繁触发
const debouncedChange = debounce((value: ImageFrameForm) => {
  const result = {
    ...value,
    image: value.image,
  };
  emit('change', result);
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
</script>
<template>
  <ElForm :model="form">
    <ElFormItem label="上传图片">
      <ElUpload
        :auto-upload="false"
        accept=".jpg,.jpeg,.png"
        :limit="1"
        list-type="picture-card"
        v-model="form.imageFile"
        @change="handleUploadChange"
        @remove="handleUploadRemove"
      >
        <ElIcon :size="30">
          <IEpUpload />
        </ElIcon>
        点击上传图片
      </ElUpload>
    </ElFormItem>
    <ElFormItem label="底部主标题">
      <ElInput v-model="form.footerTitle" placeholder="请输入底部主标题" />
    </ElFormItem>
    <ElFormItem label="底部渐变色文字内容">
      <ElInput v-model="form.footerLabel" placeholder="请输入渐变色文字内容" />
    </ElFormItem>
    <ElFormItem label="底部副标题">
      <ElInput v-model="form.footerSubtitle" placeholder="请输入底部副标题" />
    </ElFormItem>
    <ElFormItem label="标题颜色渐变">
      <div style="display: flex; gap: 10px;">
        <ElColorPicker 
          v-model="form.footerLabelColor[0]" 
          show-alpha
          :pre-colors="['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff']"
        />
        <ElColorPicker
          v-model="form.footerLabelColor[1]"
          show-alpha
          :pre-colors="['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff']"
        />
      </div>
    </ElFormItem>
  </ElForm>
</template>
