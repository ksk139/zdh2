<script setup lang="ts">
import * as XLSX from 'xlsx';
import { ref, computed, watch } from 'vue';
import type {
  UploadFile,
  UploadUserFile,
  ElUpload,
  UploadRawFile,
} from 'element-plus';
import { debounce } from '@/utils/event';
import { type CurrBaseForm } from '@/views/About/form.vue';
import { isEmptyFunction } from '@/utils/function';

/** Type */
export type BaseForm<T> = {
  // 标题
  title?: string;
  // 副标题
  subTitle?: string;
  // 描述
  description?: string;
  // 注解
  annotation?: string;
  // 数据来源
  dataSource?: string;
  // 视觉模型
  producer?: string;
  // 解析后的数据
  parseData?: T;
  // 文件列表
  fileList?: UploadUserFile[];
};

/** Props */
const props = defineProps({
  disabled: {
    type: Array as PropType<(keyof CurrBaseForm)[]>,
    default: () => [],
  },
  default: {
    type: Object as PropType<CurrBaseForm>,
    default: () => ({}),
  },
  sheetHandler: {
    type: Function,
    default: () => {},
  },
});

/** Emits */
const emits = defineEmits<{
  (e: 'change', value: CurrBaseForm): void;
}>();

/** Static */
const config: { prop: keyof CurrBaseForm; label: string }[] = [
  {
    prop: 'title',
    label: '标题',
  },
  {
    prop: 'subTitle',
    label: '副标题',
  },
  {
    prop: 'description',
    label: '描述',
  },
  {
    prop: 'annotation',
    label: '注解',
  },
  {
    prop: 'dataSource',
    label: '数据来源',
  },
  {
    prop: 'producer',
    label: '视觉模型',
  },
];

/** Ref */
const form = ref<CurrBaseForm>({ ...props.default });

/** Computed */
const inputItems = computed(() =>
  config.filter((item) => !props.disabled.includes(item.prop))
);
const hasSheetHandler = computed(() => {
  return !isEmptyFunction(props.sheetHandler);
})

/** Watch */
watch(
  () => props.default,
  (val) => {
    form.value = val;
  }
);

watch(
  () => props.default.fileList,
  (val) => {
    // @FIXME: 这里会触发俩次change事件
    // 参数导致的fileList变化，需要手动触发change事件
    handlePropsFileListChange(val || []);
  },
  {
    deep: true,
  }
);

// 500ms防抖，然后触发change事件,避免input等组件导致的频繁触发
const debouncedChange = debounce((val: CurrBaseForm) => {
  emits('change', val);
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
async function handlePropsFileListChange(fileList: UploadUserFile[]) {
  if (!fileList.length) {
    return;
  }
  // 根据路径获取文件
  const response = await fetch(fileList[0].url as string);
  const blob = await response.blob();
  const file = new File([blob], 'test.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  doUploadChange(file as UploadRawFile);
}

function handleUploadPreview(file: UploadFile) {
  // 点击下载示例文件
  const link = document.createElement('a');
  link.href = file.url as string;
  link.download = file.name;
  link.click();
}

function handleUploadChange(file: UploadFile) {
  if (!form.value.fileList) {
    form.value.fileList = [];
  }
  form.value.fileList.push(file);
  if (!file.raw) {
    ElMessage.error('文件读取失败');
    return;
  }
  doUploadChange(file.raw);
}

function doUploadChange(file: UploadRawFile) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    const data = e.target?.result;
    const workbook = XLSX.read(data, { type: 'binary' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet);
    form.value.parseData = await props.sheetHandler(json);
  };
  reader.readAsBinaryString(file);
}

function handleUploadExceed() {
  ElMessage.warning('最多只能上传一个文件');
}

function handleUploadRemove(file: UploadFile) {
  const fileList = form.value.fileList as UploadUserFile[];
  fileList.splice(fileList.indexOf(file), 1);
  form.value.parseData = undefined;
}
</script>

<template>
  <div class="base-form">
    <ElForm :model="form" label-position="top">
      <!-- 基础信息 -->
      <ElFormItem
        v-for="item in inputItems"
        :key="item.prop"
        :prop="item.prop"
        :label="item.label"
      >
        <ElInput
          clearable
          v-model="(form[item.prop] as string)"
          :placeholder="`请输入${item.label}`"
        />
      </ElFormItem>

      <!-- 数据输入 -->
      <ElFormItem label="表格数据" v-if="hasSheetHandler">
        <div class="base-form-upload">
          <!-- @hack:ElUpload上的disabled属性会同时禁用文件列表的删除按钮，这里通过加一个蒙层来实现上传的禁用 -->
          <div
            v-if="form.fileList && form.fileList.length"
            class="base-form-upload-disabled-hack"
            @click="handleUploadExceed"
          ></div>
          <ElUpload
            drag
            :auto-upload="false"
            accept=".xlsx"
            :limit="1"
            v-model:file-list="form.fileList"
            :on-preview="handleUploadPreview"
            @change="handleUploadChange"
            @remove="handleUploadRemove"
          >
            <template v-if="form.fileList && form.fileList.length">
              <ElIcon :size="30" color="rgb(39,195,70)">
                <IEpSuccessFilled />
              </ElIcon>
              上传成功<br />
            </template>
            <template v-else>
              <ElIcon :size="30">
                <IEpUpload />
              </ElIcon>
              点击上传<br />或将文件拖到此处
            </template>
          </ElUpload>
        </div>
      </ElFormItem>
    </ElForm>
  </div>
</template>

<style scoped lang="less">
.base-form {
  width: 100%;
  height: auto;

  &-upload {
    position: relative;

    &-disabled-hack {
      position: absolute;
      top: 0;
      left: 0;
      width: 200px;
      height: 150px;
      cursor: not-allowed;
      z-index: 1;
    }
    :deep(.el-upload-dragger) {
      width: 200px;
      height: 150px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #999;
      line-height: 20px;
    }
  }
}
</style>
