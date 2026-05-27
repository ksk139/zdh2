<script setup lang="ts">
import { Form } from "@/views/About/form.vue";
import { MorningSessionReviewData, MorningSessionReviewItem } from "./type";
import themeSetup from "./theme";
import { formatNumberWithUnit } from "@/utils/math";
import { getTitleByTheme } from "./config";

/** Props */
const props = defineProps({
  data: {
    type: Object as () => Form<"MorningSessionReview">,
    default: () => ({}),
  },
});

/** Static */
const tableHeadLabel = [
  "期货品种",
  "数据涨幅",
  "资金流向",
  "沉淀资金",
  "所属板块",
];
const formatData = ref();
/** Computed */
const formatDataFunc = (data: any[]) => {
  const MAX_LENGTH = 25;
  return data?.slice(0, MAX_LENGTH)
    .map((item: any) => {
        // 处理数据涨幅：如果已经包含%，直接使用；否则转换为数值并添加%
        let limitRateValue = item['数据涨幅'] || item.limitRate || 0;
        let formattedLimitRate: string;
        if (typeof limitRateValue === 'string' && limitRateValue.includes('%')) {
            formattedLimitRate = limitRateValue;
        } else {
            const numValue = typeof limitRateValue === 'string' ? parseFloat(limitRateValue) : limitRateValue;
            // 如果数值在-1到1之间且不为0，很可能是百分比被转换为小数，需要乘以100
            let displayValue = numValue;
            if (Math.abs(numValue) < 1 && numValue !== 0) {
                displayValue = numValue * 100;
            }
            formattedLimitRate = isNaN(displayValue) ? '0.00%' : `${displayValue.toFixed(2)}%`;
        }
        
        return {
            stockName: item['期货品种'] || item.stockName || '',
            limitRate: formattedLimitRate,
            mainFundsFlow: formatNumberWithUnit(item['资金流向'] || item.mainFundsFlow || 0),
            lowerFundsFlow: formatNumberWithUnit(item['沉淀资金'] || item.lowerFundsFlow || 0),
            industry: item['所属板块'] || item.industry || ''
        }
    }) || [];
};

const maxStockNameLength = computed(() => {
  return formatData.value.reduce(
    (max: number, item: any) => Math.max(max, item.stockName.length),
    0
  );
});

const titleCharArr = computed(() => {
  // 根据当前主题动态生成标题
  const titleTemp = getTitleByTheme(props.data.theme || 'red');
  // 找到【期货资金】的索引范围
  const keyword = titleTemp.includes('流入') ? "期货资金流入" : titleTemp.includes('流出') ? "期货资金流出" : "期货资金流向";
  const keywordIndex = titleTemp.indexOf(keyword);
  const keywordIndexes = Array.from(
    { length: keyword.length },
    (_, index) => keywordIndex + index
  );
  // 找到【(一)】序号所在的索引 TODO
  const arr = titleTemp.split("");
  // 返回标签
  return arr.map((item, i) => {
    const highlightClassName =
      keywordIndex !== -1 && keywordIndexes.includes(i)
        ? "morning-session-review-title-highlight"
        : "";
    // 处理【(一)】标记 TODO
    return {
      char: item,
      class: highlightClassName,
    };
  });
});

/** Watch */
watch(
  () => props.data.excelData,
  () => {
    console.log('接收到的Excel数据:', props.data.excelData);
    const formatted = formatDataFunc(props.data.excelData || []);
    console.log('格式化后的数据:', formatted);
    formatData.value = formatted;
  },
  {
    immediate: true,
  }
);
</script>

<template>
  <div class="morning-session-review" :class="themeSetup(props.data.theme) || ''">
    <div class="morning-session-review-watermark"></div>
    <div class="morning-session-review-logo">
      <div class="morning-session-review-logo-top_logo"></div>
      <div class="morning-session-review-logo-top_split"></div>
    </div>
    <div class="morning-session-review-subtitle">{{ data.subTitle }}</div>
    <div
      class="morning-session-review-title"
      :class="{
        'morning-session-review-title-smaller': false,
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
    <div class="morning-session-review-table">
      <div
        class="morning-session-review-table-row morning-session-review-table-head"
      >
        <div
          class="morning-session-review-table-head-item"
          :class="{
            'morning-session-review-table-head-item-stockname': item === '期货品种',
            'morning-session-review-table-head-item-industry': item === '所属板块'
          }"
          v-for="(item, index) in tableHeadLabel"
          :key="index"
        >
          {{ item }}
        </div>
      </div>
      <div
        class="morning-session-review-table-row"
        v-for="item in formatData"
        :key="item.stockName"
      >
        <div class="morning-session-review-table-row-item">
          <div
            class="morning-session-review-table-row-item-stockname"
            :style="{ width: `${maxStockNameLength * 16}px` }"
          >
            <span
              v-for="(char, index) in item.stockName.split('')"
              :key="index"
              >{{ char }}</span
            >
          </div>
        </div>
        <div class="morning-session-review-table-row-item morning-session-review-table-row-item-limitrate">
            {{ item.limitRate }}
        </div>
        <div
          class="morning-session-review-table-row-item"
          :class="{
            'morning-session-review-table-row-item-positive':
              parseFloat(item.mainFundsFlow) >= 0,
            'morning-session-review-table-row-item-negative':
              parseFloat(item.mainFundsFlow) < 0,
          }"
        >
          <div class="morning-session-review-table-row-item-mainfundsflow">
            {{ item.mainFundsFlow }}
          </div>
        </div>
        <div class="morning-session-review-table-row-item">
          <div class="morning-session-review-table-row-item-lowerfundsflow">
            {{ item.lowerFundsFlow }}
          </div>
        </div>
        <div class="morning-session-review-table-row-item morning-session-review-table-row-item-industry">
            {{ item.industry }}
        </div>
      </div>
    </div>
    <div class="morning-session-review-sign">
      <div class="morning-session-review-sign-text">
        <div>
          以上品种仅为信息整理，不作为投资建议
        </div>
        <div class="morning-session-review-annotation">{{ data.annotation }}</div>
        <div class="morning-session-review-sign-text-datasource">
          数据来源：{{ data.dataSource }}
        </div>
        <div class="morning-session-review-sign-text-producer">
          可视模型：{{ data.producer }}
        </div>
      </div>
      <div class="morning-session-review-sign-logo"></div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.morning-session-review {
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
    background-image: url("@/assets/images/watermark-light.svg");
    background-size: 100% auto;
    background-position: center top;
    opacity: 0.3;
    z-index: 999;
    pointer-events: none;
  }

  &-logo {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    margin-bottom: 10px;
    &-top_logo {
      height: 21px;
      width: 150px;
      background-image: var(--top-logo);
      background-size: contain;
      background-repeat: no-repeat;
      background-position: left center;
      margin-bottom: 8px;
    }
    &-top_split {
      width: 100%;
      height: 8px;
      background-image: var(--top-split);
      background-size: 100% auto;
      background-repeat: no-repeat;
      background-position: center top;
    }
  }

  &-subtitle {
    font-family: MiSans-Bold;
    font-size: 60px;
    line-height: 65px;
    color: #ffffff;
    letter-spacing: 0;
    text-align: justify;
  }

  &-title {
    font-family: MiSans-Bold;
    font-size: 60px;
    line-height: 65px;
    color: #ffffff;
    letter-spacing: 0;
    // text-align: justify;
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
      height: 32px !important;
      background: linear-gradient(
        180deg,
        var(--table-head-color) 0%,
        var(--table-head-sub-color) 74%
      );

      &-item {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: nowrap;
        font-family: MiSans-Regular;
        font-size: 13px;
        color: #000000;
        letter-spacing: 0;
        text-align: justify;

        &-stockname {
          justify-content: left;
          padding-left: 2px;
        }

        &-industry {
          justify-content: right;
        }
      }
    }
    &-row {
      width: 100%;
      height: 30px;
      display: grid;
      grid-template-columns: 90px 68px 120px 110px 96px;
      padding: 0px 8px;

      &:nth-child(2n) {
        background-color: transparent;
      }
      &:nth-child(2n + 1) {
        background-color: #ffffff10;
      }

      &-item {
        display: flex;
        align-items: center;
        justify-content: right;
        font-family: MiSans-Medium;
        font-size: 15px;
        color: #ffffff;
        letter-spacing: 0;
        padding-right: 25px;
        text-align: justify;

        &-stockname {
          width: 100%;
          height: 100%;
          font-size: 16px;
          padding-right: 0px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        &-lowerfundsflow {
          font-family: MiSans-Regular;
        }

        &-limitrate {
          padding-right: 10px;
          font-family: MiSans-Regular;
        }
        &-industry {
          padding-right: 0px;
          font-size: 14px;
          font-family: MiSans;
          color: #AFAFAF;
          opacity: 0.9;
        }

        &-positive {
          color: var(--table-row-item-positive-color);
        }
        &-negative {
          color: var(--table-row-item-negative-color);
        }
      }
    }
  }

  // &-annotation {
  //   font-size: 12px;
  //   color: #F9F6F6;
  //   letter-spacing: 0;
  //   text-align: justify;
  //   opacity: 0.8;
  //   font-family: MiSans-Medium;
  // }

  &-sign {
    position: absolute;
    width: calc(100% - 90px);
    bottom: 60px;
    left: 45px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    &-text {
      font-family: MiSans-Medium;
      font-size: 12px;
      color: #F9F6F6;
      letter-spacing: 0;
      text-align: justify;
      opacity: 0.8;
    }
    &-logo {
      width: 40px;
      height: 40px;
      background-color: var(--logo-background-color);
      -webkit-mask-image: url("@/assets/images/logo.svg");
      mask-image: url("@/assets/images/logo.svg");
      -webkit-mask-size: contain;
      mask-size: contain;
      -webkit-mask-repeat: no-repeat;
      mask-repeat: no-repeat;
      -webkit-mask-position: center;
      mask-position: center;
    }
  }
}
</style>