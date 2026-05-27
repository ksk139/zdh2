<!-- 模板内容 -->
<script setup lang="ts">
import { computed } from 'vue';
import { type Form } from '@/views/About/form.vue';
import { type PerformanceForecastItem } from './type';
import themeSetup from './theme';

/** Props */
const props = defineProps({
  data: {
    type: Object as () => Form<'PerformanceForecast'>,
    default: () => ({}),
  },
});

/** Static */
const tableHeadLabel = ['上市公司', '业绩预增', '类型', '股价涨跌幅', '行业'];

/** Computed */
const formatData = computed(() => {
  const MAX_LENGTH = 25;
  const parseData = props.data.parseData || [];
  return parseData
    .sort(
      (a: PerformanceForecastItem, b: PerformanceForecastItem) =>
        b.performanceIncrease - a.performanceIncrease
    )
    .slice(0, MAX_LENGTH)
    .map((item: PerformanceForecastItem) => {
      return {
        ...item,
        performanceIncrease: `${item.performanceIncrease.toFixed(2)}%`,
        limitRate: `${item.limitRate >= 0 ? '+' : ''}${item.limitRate.toFixed(
          2
        )}%`,
      };
    });
});

const maxStockNameLength = computed(() => {
  return formatData.value.reduce(
    (max, item) => Math.max(max, item.stockName.length),
    0
  );
});

const titleCharArr = computed(() => {
  const titleTemp = props.data.title || '';
  // 找到【业绩预增】的索引范围
  const keyword = '业绩预增';
  const keywordIndex = titleTemp.indexOf(keyword);
  const keywordIndexes = Array.from(
    { length: keyword.length },
    (_, index) => keywordIndex + index
  );
  // 找到【(一)】序号所在的索引
  const orderStartIndex = titleTemp.indexOf('(');
  const orderEndIndex = titleTemp.indexOf(')');
  const orderIndexes = Array.from(
    { length: orderEndIndex - orderStartIndex + 1 },
    (_, index) => orderStartIndex + index
  );
  // 将字符串拆分为数组
  const arr = titleTemp.split('');
  // 返回标签
  return arr.map((item, i) => {
    const highlightClassName =
      keywordIndex !== -1 && keywordIndexes.includes(i)
        ? 'performance-forecast-title-highlight'
        : '';
    const orderClassName =
      orderStartIndex !== -1 && orderIndexes.includes(i)
        ? 'performance-forecast-title-order'
        : '';
    return {
      char: item,
      // highlight与order互斥，所以这里直接用或逻辑
      class: highlightClassName || orderClassName,
    };
  });
});

const isOrderTitle = computed(() => {
  return titleCharArr.value.map((d) => d.char).includes('(');
});
</script>

<template>
  <div class="performance-forecast" :class="themeSetup(data.theme) || ''">
    <div class="performance-forecast-watermark"></div>
    <div class="performance-forecast-subtitle">{{ data.subTitle }}</div>
    <div
      class="performance-forecast-title"
      :class="{
        'performance-forecast-title-smaller': isOrderTitle,
      }"
    >
      <span
        v-for="(item, index) in titleCharArr"
        :key="index"
        :class="item.class"
      >
        {{ item.char }}
      </span>
    </div>
    <div class="performance-forecast-table">
      <div
        class="performance-forecast-table-row performance-forecast-table-head"
      >
        <div
          class="performance-forecast-table-head-item"
          v-for="(item, index) in tableHeadLabel"
          :key="index"
        >
          {{ item }}
        </div>
      </div>
      <div
        class="performance-forecast-table-row"
        v-for="item in formatData"
        :key="item.stockName"
      >
        <div class="performance-forecast-table-row-item">
          <div
            class="performance-forecast-table-row-item-name"
            :style="{ width: `${maxStockNameLength * 14}px` }"
          >
            <span
              v-for="(char, index) in item.stockName.split('')"
              :key="index"
              >{{ char }}</span
            >
          </div>
        </div>
        <div
          class="performance-forecast-table-row-item performance-forecast-table-row-item-performanceincrease"
        >
          {{ item.performanceIncrease }}
        </div>
        <div class="performance-forecast-table-row-item">
          {{ item.limitType }}
        </div>
        <div
          :class="{
            'performance-forecast-table-row-item-positive':
              parseFloat(item.limitRate) >= 0,
            'performance-forecast-table-row-item-negative':
              parseFloat(item.limitRate) < 0,
          }"
          class="performance-forecast-table-row-item performance-forecast-table-row-item-limitrate"
        >
          {{ item.limitRate }}
        </div>
        <div
          class="performance-forecast-table-row-item performance-forecast-table-row-item-industry"
        >
          {{ item.industry }}
        </div>
      </div>
    </div>
    <div class="performance-forecast-annotation">{{ data.annotation }}</div>
    <div class="performance-forecast-sign">
      <div class="performance-forecast-sign-text">
        <div>
          图片由AI生成
        </div>
        <div class="performance-forecast-sign-text-datasource">
          数据来源：{{ data.dataSource }}
        </div>
        <div class="performance-forecast-sign-text-producer">
          可视模型：{{ data.producer }}
        </div>
      </div>
      <div class="performance-forecast-sign-logo"></div>
    </div>
  </div>
</template>

<style scoped lang="less">
.performance-forecast {
  width: 590px;
  height: 1040px;
  position: relative;
  background: #eeeeee;
  padding: 67.5px 45px 150px;
  background-image: var(--bg-image);
  background-size: 100%;
  background-position: center;
  overflow: hidden;

  &-watermark {
    position: absolute;
    inset: 0;
    background-image: url('@/assets/images/watermark-light.svg');
    background-size: 100% auto;
    background-position: center top;
    opacity: 0.3;
    z-index: 999;
    pointer-events: none;
  }

  &-subtitle {
    font-family: MiSans-Bold;
    font-size: 36px;
    color: #000000;
    letter-spacing: 0;
    text-align: justify;
  }

  &-title {
    font-family: MiSans-Bold;
    font-size: 50px;
    color: #000000;
    letter-spacing: 0;
    text-align: justify;
    margin-bottom: 10px;
    &-smaller {
      font-size: 48px;
    }

    :deep(&-highlight) {
      color: var(--title-highlight-text-color);
    }
    :deep(&-order) {
      font-size: 36px;
    }
  }

  &-table {
    margin-bottom: 16px;
    &-head {
      height: 50px !important;
      background: linear-gradient(
        180deg,
        var(--table-head-color) 0%,
        var(--table-head-sub-color) 74%
      );

      &-item {
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: MiSans-Semibold;
        font-size: 16px;
        color: #ffffff;
        letter-spacing: 0;
        text-align: justify;
      }
    }
    &-row {
      width: 100%;
      height: 25px;
      display: grid;
      grid-template-columns: 100px 132px 68px 116px 68px;
      padding: 0px 8px;

      &:nth-child(2n) {
        background-color: #fff;
      }
      &:nth-child(2n + 1) {
        background-color: #f7f5f5;
      }

      &-item {
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: MiSans-Medium;
        font-size: 14px;
        color: #000000;
        letter-spacing: 0;
        text-align: justify;

        &-name {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        &-performanceincrease {
          color: #e03114;
        }
        &-positive {
          color: #e90e0e;
        }
        &-negative {
          color: #1d9d00;
        }
        &-limitrate {
          font-family: MiSans-Regular;
        }
        &-industry {
          font-family: MiSans-Normal;
          color: #5a5959;
        }
      }
    }
  }

  &-annotation {
    font-family: MiSans-Light;
    font-size: 12px;
    color: #55504c;
    letter-spacing: 0;
    text-align: justify;
  }

  &-sign {
    position: absolute;
    width: calc(100% - 90px);
    bottom: 85px;
    left: 45px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    &-text {
      font-family: MiSans-Medium;
      font-size: 12px;
      color: #787b80;
      letter-spacing: 0;
      text-align: justify;
      opacity: 0.8;
    }
    &-logo {
      width: 40px;
      height: 40px;
      background-color: #5d6671;
      -webkit-mask-image: url('@/assets/images/logo.svg');
      mask-image: url('@/assets/images/logo.svg');
    }
  }
}
</style>
