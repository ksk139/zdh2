<script setup lang="ts">
import { themeMap } from "./theme/index";
import type { UploadProps, UploadFile } from 'element-plus';
import * as XLSX from 'xlsx';
import { fetchAndProcessCapitalData } from '@/utils/capitalDataProcessor';
import { ElMessage } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';

export type MorningSessionReviewForm = {
  /** 主题 */
  theme: keyof typeof themeMap;
  /** 上传的Excel文件 */
  excelData: any[];
};

export type MorningSessionReviewFormExport = {
  theme: MorningSessionReviewForm["theme"];
  excelData: MorningSessionReviewForm['excelData'];
};

/** Props */
const props = defineProps({
  default: {
    type: Object as () => MorningSessionReviewForm,
    default: () => ({}),
  },
});

/** Emits */
const emits = defineEmits<{
  (e: "change", value: MorningSessionReviewFormExport): void;
}>();

/** Static */
const themeOption = [
  {
    label: "红色主题",
    value: "red",
  },
  {
    label: "紫色主题",
    value: "purple",
  },
  {
    label: "棕色主题",
    value: "brown",
  },
  {
    label: "绿色主题",
    value: "green",
  },
  {
    label: "蓝色主题",
    value: "blue",
  },
  {
    label: "深蓝主题",
    value: "darkblue",
  },
];

/** Ref */
const form = ref<MorningSessionReviewForm>({
  theme: props.default?.theme || 'red',
  excelData: props.default?.excelData || []
});

const loading = ref(false);

// 缓存获取的数据
const cachedData = ref<{
  inflowTop20: any[];
  outflowTop20: any[];
}>({
  inflowTop20: [],
  outflowTop20: []
});

// 判断当前主题是流入还是流出
const isInflowTheme = computed(() => {
  return ['red', 'purple', 'brown'].includes(form.value.theme);
});

/** 自动获取数据 */
const handleAutoFetch = async () => {
  loading.value = true;
  try {
    const { inflowTop20, outflowTop20 } = await fetchAndProcessCapitalData();

    // 缓存数据
    cachedData.value = { inflowTop20, outflowTop20 };

    // 根据主题选择数据
    const data = isInflowTheme.value ? inflowTop20 : outflowTop20;

    if (data.length === 0) {
      ElMessage.warning('未获取到数据，请稍后重试');
      return;
    }

    form.value.excelData = data;
    ElMessage.success(`成功获取${data.length}条${isInflowTheme.value ? '资金流入' : '资金流出'}数据`);
  } catch (error: any) {
    console.error('获取数据失败:', error);
    ElMessage.error(error.message || '获取数据失败，请检查网络连接');
  } finally {
    loading.value = false;
  }
};

/** Method */
const handleFileUpload: UploadProps['onChange'] = (uploadFile: UploadFile) => {
  const file = uploadFile.raw;
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target?.result as ArrayBuffer);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log('Excel解析结果:', jsonData);
    console.log('第一行数据示例:', jsonData[0]);
    
    form.value.excelData = jsonData;
  };
  reader.readAsArrayBuffer(file);
};

const handleThemeChanged = (val: string) => {
  console.log('主题已切换至:', val);

  // 如果有缓存数据，根据主题切换数据
  if (cachedData.value.inflowTop20.length > 0 || cachedData.value.outflowTop20.length > 0) {
    const isInflow = ['red', 'purple', 'brown'].includes(val);
    const data = isInflow ? cachedData.value.inflowTop20 : cachedData.value.outflowTop20;

    if (data.length > 0) {
      form.value.excelData = data;
      ElMessage.success(`已切换为${isInflow ? '资金流入' : '资金流出'}前20数据`);
    }
  }
};

/** Watch */
watch(
  () => props.default,
  (val) => {
    const result = val;
    form.value = result;
  }
);

watch(
  () => form.value,
  (val) => {
    emits("change", val);
  },
  {
    deep: true,
  }
);

/** Lifecycle */
onMounted(() => {
  // 进入页面时自动获取数据
  handleAutoFetch();
});
</script>

<template>
  <div class="morning-session-review-form">
    <ElForm :model="form" label-position="top">
      <ElFormItem label="选择主题">
        <ElSelect v-model="form.theme" @change="handleThemeChanged" placeholder="请选择主题">
          <ElOption
            v-for="item in themeOption"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>
      
      <ElFormItem label="数据来源">
        <div v-if="loading" class="loading-status">
          <ElIcon class="is-loading"><Loading /></ElIcon>
          <span>正在获取数据...</span>
        </div>
        <div v-else class="data-source-info">
          <span v-if="form.excelData.length > 0" class="data-count">
            已加载 {{ form.excelData.length }} 条数据
          </span>
          <ElUpload
            :auto-upload="false"
            :show-file-list="true"
            :limit="1"
            accept=".xlsx,.xls"
            @change="handleFileUpload"
            class="inline-upload"
          >
            <ElButton type="primary" size="small">上传Excel替换</ElButton>
          </ElUpload>
        </div>
      </ElFormItem>
    </ElForm>
  </div>
</template>

<style lang="less" scoped>
.morning-session-review-form {
    width: 100%;
    height: 100%;

    .loading-status {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #409eff;
      font-size: 14px;

      .is-loading {
        animation: rotating 2s linear infinite;
      }
    }

    .data-source-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;

      .data-count {
        color: #67c23a;
        font-size: 14px;
      }

      .inline-upload {
        display: inline-block;
      }
    }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>