<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';

/** Static */
const router = useRouter();

// 常用模板（主要展示）
const featuredTemplate = {
  name: '期货资金模板',
  template: 'MorningSessionReview',
  post: 'http://u.thsi.cn/imgsrc/share/91e968bc5bbf41be79974b34737e6428.png',
  featured: true,
};

// 其他模板（折叠展示）
const otherTemplates = [
  {
    name: '涨停复盘',
    template: 'LimitReview',
    post: 'https://u.thsi.cn/imgsrc/share/4863015c04d4f4a920650d2553b46e1d.png',
  },
  {
    name: '业绩预增',
    template: 'PerformanceForecast',
    post: 'https://u.thsi.cn/imgsrc/share/d071d657714f1c42f7f46032bf141f36.png',
  },
  {
    name: '简单模板',
    template: 'SimpleTemplate',
    post: 'https://u.thsi.cn/imgsrc/share/d071d657714f1c42f7f46032bf141f36.png',
  },
  {
    name: '海报相框模板',
    template: 'ImageFrame',
    post: 'https://u.thsi.cn/imgsrc/share/d071d657714f1c42f7f46032bf141f36.png'
  }
];

// 折叠面板状态
const activeNames = ref<string[]>([]);
const STORAGE_KEY = 'home-collapse-state';

/** Lifecycle */
onMounted(() => {
  // 从localStorage恢复折叠状态
  const savedState = localStorage.getItem(STORAGE_KEY);
  if (savedState) {
    try {
      activeNames.value = JSON.parse(savedState);
    } catch (e) {
      activeNames.value = [];
    }
  }
});

/** Methods */
const handleClick = (template: string) => {
  router.push({
    name: 'About',
    query: {
      template,
    },
  });
};

// 保存折叠状态到localStorage
const handleCollapseChange = (val: string | string[]) => {
  const names = Array.isArray(val) ? val : [val];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
};
</script>

<template>
  <div class="home">
    <div class="home-title">自动化运营</div>

    <!-- 常用模板区域 -->
    <div class="home-section">
      <div class="home-section-header">
        <span class="home-section-title">常用模板</span>
      </div>
      <div class="home-container">
        <div class="home-container-template">
          <div class="home-container-template-badge">常用</div>
          <img
            class="home-container-template-post"
            :src="featuredTemplate.post"
            :alt="featuredTemplate.name"
            @click="handleClick(featuredTemplate.template)"
          />
          <div class="home-container-template-name">{{ featuredTemplate.name }}</div>
        </div>
      </div>
    </div>

    <!-- 其他模板区域（折叠） -->
    <div class="home-section home-section-collapse">
      <el-collapse
        v-model="activeNames"
        @change="handleCollapseChange"
      >
        <el-collapse-item name="other" title="其他模板">
          <div class="home-container">
            <div
              class="home-container-template"
              v-for="item in otherTemplates"
              :key="item.name"
            >
              <img
                class="home-container-template-post"
                :src="item.post"
                :alt="item.name"
                @click="handleClick(item.template)"
              />
              <div class="home-container-template-name">{{ item.name }}</div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<style scoped lang="less">
.home {
  width: 100%;
  height: 100%;
  padding: 32px 48px;
  overflow-y: auto;

  &-title {
    font-family: MiSans-Bold;
    font-size: 50px;
    color: #000;
    letter-spacing: 0;
    text-align: justify;
    line-height: 66px;
    font-weight: 700;
    margin-bottom: 36px;
  }

  &-section {
    margin-bottom: 40px;

    &-header {
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 2px solid #e4e7ed;
    }

    &-title {
      font-family: MiSans-Bold;
      font-size: 28px;
      color: #303133;
      font-weight: 600;
    }

    &-collapse {
      margin-top: 48px;

      :deep(.el-collapse) {
        border: none;
      }

      :deep(.el-collapse-item__header) {
        font-family: MiSans-Bold;
        font-size: 24px;
        color: #606266;
        background-color: #f5f7fa;
        padding: 16px 20px;
        border-radius: 8px;
        border: none;
        margin-bottom: 8px;

        &:hover {
          background-color: #ecf0f5;
        }
      }

      :deep(.el-collapse-item__wrap) {
        border: none;
        background-color: transparent;
      }

      :deep(.el-collapse-item__content) {
        padding: 24px 0;
      }
    }
  }

  &-container {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 40px;

    &-template {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;

      &-badge {
        position: absolute;
        top: 12px;
        right: 12px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
        padding: 6px 14px;
        border-radius: 20px;
        font-family: MiSans-Bold;
        font-size: 14px;
        font-weight: 600;
        z-index: 10;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
      }

      &-post {
        width: 295px;
        height: 520px;
        margin-bottom: 18px;
        object-fit: cover;
        border-radius: 8px;
        box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.12);
        transition: all 0.3s ease-in-out;

        &:hover {
          cursor: pointer;
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0px 8px 24px 0px rgba(0, 0, 0, 0.18);
        }
      }

      &-name {
        font-family: MiSans-Bold;
        font-size: 24px;
        color: #000;
        letter-spacing: 0;
        text-align: center;
      }
    }
  }
}
</style>
